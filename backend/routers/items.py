import os
import time
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..auth import get_current_user, get_image_user
from ..db import PHOTOS_DIR, get_db
from ..models import Category, Item, User
from ..schemas import ItemCreate, ItemOut, ItemPatch

router = APIRouter(prefix="/api/items", tags=["items"])

# O cliente já reduz a foto (~1280px, JPEG) antes de enviar; os limites só
# barram envio fora do padrão. Corpo cru (image/jpeg) dispensa python-multipart.
MAX_PHOTO_BYTES = 3 * 1024 * 1024
MAX_MINI_BYTES = 300 * 1024
JPEG_MAGIC = b"\xff\xd8\xff"


def _photo_path(item_id: int, mini: bool = False) -> Path:
    return PHOTOS_DIR / (f"{item_id}_mini.jpg" if mini else f"{item_id}.jpg")


def _remove_photo_files(item_id: int) -> None:
    for mini in (False, True):
        _photo_path(item_id, mini).unlink(missing_ok=True)


def _get_item(db: Session, item_id: int) -> Item:
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item não encontrado")
    return item


def _clean_name(nome: str) -> str:
    cleaned = nome.strip()
    if not cleaned:
        raise HTTPException(400, "Nome obrigatório")
    return cleaned


def _normalize_quantity(quantidade: int | None) -> int | None:
    if quantidade is None or quantidade <= 1:
        return None
    return quantidade


@router.get("", response_model=List[ItemOut])
def list_items(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return db.query(Item).order_by(Item.nome).all()


@router.post("", response_model=ItemOut)
def create_item(
    body: ItemCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    if not db.query(Category).filter(Category.id == body.categoria_id).first():
        raise HTTPException(400, "Categoria inexistente")

    nome = _clean_name(body.nome)
    quantidade = _normalize_quantity(body.quantidade) if body.ativo else None

    item = Item(
        nome=nome,
        categoria_id=body.categoria_id,
        ativo=body.ativo,
        quantidade=quantidade,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ItemOut)
def patch_item(
    item_id: int,
    body: ItemPatch,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item não encontrado")

    if body.nome is not None:
        item.nome = _clean_name(body.nome)
    if body.categoria_id is not None:
        if not db.query(Category).filter(Category.id == body.categoria_id).first():
            raise HTTPException(400, "Categoria inexistente")
        item.categoria_id = body.categoria_id
    if "quantidade" in body.model_fields_set:
        item.quantidade = _normalize_quantity(body.quantidade)
    if body.ativo is not None:
        item.ativo = body.ativo
        if body.ativo is False:
            # Regra: desativar zera quantidade (não confia no cliente).
            item.quantidade = None

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(404, "Item não encontrado")
    db.delete(item)
    db.commit()
    _remove_photo_files(item_id)
    return {"ok": True}


@router.put("/{item_id}/foto", response_model=ItemOut)
async def upload_photo(
    item_id: int,
    request: Request,
    mini: bool = False,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Grava a foto (corpo cru JPEG). Ordem do cliente: foto cheia, depois a
    miniatura. A cheia gera nova versão e apaga a miniatura antiga — enquanto
    a nova não chega, o GET da miniatura cai na foto cheia."""
    item = _get_item(db, item_id)
    if mini and item.foto_versao is None:
        raise HTTPException(400, "Envie a foto antes da miniatura")

    body = await request.body()
    limit = MAX_MINI_BYTES if mini else MAX_PHOTO_BYTES
    if len(body) > limit:
        raise HTTPException(413, "Foto grande demais")
    if not body.startswith(JPEG_MAGIC):
        raise HTTPException(400, "A foto precisa ser JPEG")

    target = _photo_path(item_id, mini)
    tmp = target.with_suffix(".tmp")
    tmp.write_bytes(body)
    os.replace(tmp, target)

    if not mini:
        _photo_path(item_id, mini=True).unlink(missing_ok=True)
        item.foto_versao = int(time.time() * 1000)
        db.commit()
        db.refresh(item)
    return item


@router.get("/{item_id}/foto")
def get_photo(
    item_id: int,
    mini: bool = False,
    db: Session = Depends(get_db),
    _user: User = Depends(get_image_user),
):
    item = _get_item(db, item_id)
    path = _photo_path(item_id, mini)
    if mini and not path.is_file():
        path = _photo_path(item_id)
    if item.foto_versao is None or not path.is_file():
        raise HTTPException(404, "Item sem foto")
    # A URL carrega ?v=<foto_versao>: trocar a foto muda a URL, então o
    # navegador pode guardar esta resposta para sempre.
    return FileResponse(
        path,
        media_type="image/jpeg",
        headers={"Cache-Control": "private, max-age=31536000, immutable"},
    )


@router.delete("/{item_id}/foto", response_model=ItemOut)
def delete_photo(
    item_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    item = _get_item(db, item_id)
    item.foto_versao = None
    db.commit()
    db.refresh(item)
    _remove_photo_files(item_id)
    return item
