from typing import List
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import Category, Item, User
from ..schemas import CategoryCreate, CategoryOut, CategoryPatch

router = APIRouter(prefix="/api/categories", tags=["categories"])


HEX_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


def _clean_name(nome: str) -> str:
    cleaned = nome.strip()
    if not cleaned:
        raise HTTPException(400, "Nome obrigatório")
    return cleaned


def _validate_color(cor: str) -> str:
    cleaned = cor.strip()
    if not HEX_COLOR_RE.fullmatch(cleaned):
        raise HTTPException(400, "Cor inválida")
    return cleaned


def _category_name_exists(db: Session, nome: str, exclude_id: int | None = None) -> bool:
    query = db.query(Category).filter(Category.nome.ilike(nome))
    if exclude_id is not None:
        query = query.filter(Category.id != exclude_id)
    return query.first() is not None


@router.get("", response_model=List[CategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return (
        db.query(Category)
        .order_by(Category.ordem_exibicao, Category.nome)
        .all()
    )


@router.post("", response_model=CategoryOut)
def create_category(
    body: CategoryCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    nome = _clean_name(body.nome)
    cor = _validate_color(body.cor)
    if _category_name_exists(db, nome):
        raise HTTPException(409, "Categoria já existe")

    category = Category(
        nome=nome,
        cor=cor,
        ordem_exibicao=body.ordem_exibicao,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
def patch_category(
    category_id: int,
    body: CategoryPatch,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(404, "Categoria não encontrada")

    if body.nome is not None:
        nome = _clean_name(body.nome)
        if _category_name_exists(db, nome, exclude_id=category_id):
            raise HTTPException(409, "Categoria já existe")
        category.nome = nome
    if body.cor is not None:
        category.cor = _validate_color(body.cor)
    if body.ordem_exibicao is not None:
        category.ordem_exibicao = body.ordem_exibicao

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(404, "Categoria não encontrada")

    if db.query(Item).filter(Item.categoria_id == category_id).count() > 0:
        raise HTTPException(409, "Categoria possui itens vinculados")

    db.delete(category)
    db.commit()
    return {"ok": True}
