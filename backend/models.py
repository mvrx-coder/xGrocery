from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from .db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False, unique=True)
    cor = Column(String, nullable=False)
    ordem_exibicao = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    categoria_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    ativo = Column(Boolean, default=False, nullable=False)
    quantidade = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True)
    paleta = Column(String, nullable=False, default="nocturne")
    estilo_diferenciacao = Column(String, nullable=False, default="elevated")
