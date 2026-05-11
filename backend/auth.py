import uuid
from typing import Dict, Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .db import get_db
from .models import User

PASSWORD = "Aa25101208"

# Sessões em memória — token UUID -> user_id.
# Reinício do servidor invalida sessões; usuários relogam (3 segundos, app de família).
SESSIONS: Dict[str, int] = {}


def create_session(user_id: int) -> str:
    token = uuid.uuid4().hex
    SESSIONS[token] = user_id
    return token


def destroy_session(token: str) -> None:
    SESSIONS.pop(token, None)


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Token ausente")
    token = authorization[7:]
    user_id = SESSIONS.get(token)
    if not user_id:
        raise HTTPException(401, "Token inválido")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "Usuário não encontrado")
    return user
