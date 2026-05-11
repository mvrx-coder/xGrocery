from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class LoginRequest(BaseModel):
    name: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserOut


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    cor: str
    ordem_exibicao: int


class CategoryCreate(BaseModel):
    nome: str
    cor: str
    ordem_exibicao: int = 0


class CategoryPatch(BaseModel):
    nome: Optional[str] = None
    cor: Optional[str] = None
    ordem_exibicao: Optional[int] = None


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    categoria_id: int
    ativo: bool
    quantidade: Optional[int] = None
    updated_at: datetime


class ItemCreate(BaseModel):
    nome: str
    categoria_id: int
    ativo: bool = True
    quantidade: Optional[int] = None


class ItemPatch(BaseModel):
    nome: Optional[str] = None
    categoria_id: Optional[int] = None
    ativo: Optional[bool] = None
    quantidade: Optional[int] = None


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    paleta: str
    estilo_diferenciacao: str


class SettingsPatch(BaseModel):
    paleta: Optional[str] = None
    estilo_diferenciacao: Optional[str] = None
