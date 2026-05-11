from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import Category, Item, User
from ..schemas import ItemCreate, ItemOut, ItemPatch

router = APIRouter(prefix="/api/items", tags=["items"])


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

    quantidade = body.quantidade if body.ativo else None

    item = Item(
        nome=body.nome.strip(),
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
        item.nome = body.nome.strip()
    if body.categoria_id is not None:
        if not db.query(Category).filter(Category.id == body.categoria_id).first():
            raise HTTPException(400, "Categoria inexistente")
        item.categoria_id = body.categoria_id
    if body.quantidade is not None:
        item.quantidade = body.quantidade if body.quantidade > 0 else None
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
    return {"ok": True}
