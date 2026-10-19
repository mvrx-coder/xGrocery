import os
import time
import uuid
from typing import Dict, Optional, Tuple

from fastapi import Cookie, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .db import get_db
from .models import User

SESSION_TTL_SECONDS = int(
    os.environ.get("XGROCERY_SESSION_TTL_SECONDS", str(60 * 60 * 24 * 30))
)

# Sessões em memória: token UUID -> (user_id, expires_at).
# Reinício do servidor invalida sessões; usuários relogam rapidamente.
SESSIONS: Dict[str, Tuple[int, float]] = {}


def create_session(user_id: int) -> str:
    token = uuid.uuid4().hex
    SESSIONS[token] = (user_id, time.time() + SESSION_TTL_SECONDS)
    return token


def destroy_session(token: str) -> None:
    SESSIONS.pop(token, None)


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Token ausente")
    return _user_for_token(authorization[7:], db)


def get_image_user(
    authorization: Optional[str] = Header(default=None),
    xgrocery_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    # <img> não manda header Authorization: o cliente espelha o token num
    # cookie (ver api.ts). Cookie em vez de ?token= para o token não ir parar
    # no access log do uvicorn nem nos logs da Cloudflare.
    if authorization and authorization.startswith("Bearer "):
        return _user_for_token(authorization[7:], db)
    if not xgrocery_token:
        raise HTTPException(401, "Token ausente")
    return _user_for_token(xgrocery_token, db)


def _user_for_token(token: str, db: Session) -> User:
    session = SESSIONS.get(token)
    if not session:
        raise HTTPException(401, "Token inválido")
    user_id, expires_at = session
    if expires_at < time.time():
        destroy_session(token)
        raise HTTPException(401, "Token expirado")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "Usuário não encontrado")
    return user
