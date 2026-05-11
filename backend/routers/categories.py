from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import Category, Item, User
from ..schemas import CategoryCreate, CategoryOut, CategoryPatch

router = APIRouter(prefix="/api/categories", tags=["categories"])


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
    nome = body.nome.strip()
    if not nome:
        raise HTTPException(400, "Nome obrigatório")
    if db.query(Category).filter(Category.nome == nome).first():
        raise HTTPException(409, "Categoria já existe")

    category = Category(
        nome=nome,
        cor=body.cor,
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
        category.nome = body.nome.strip()
    if body.cor is not None:
        category.cor = body.cor
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
