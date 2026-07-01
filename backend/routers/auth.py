from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_session, destroy_session
from ..db import get_db
from ..models import User
from ..schemas import LoginRequest, LoginResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    # App de família — entrada sem senha: basta escolher o nome.
    user = db.query(User).filter(User.name == body.name).first()
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    token = create_session(user.id)
    return LoginResponse(token=token, user=UserOut.model_validate(user))


@router.post("/logout")
def logout(authorization: Optional[str] = Header(default=None)):
    if authorization and authorization.startswith("Bearer "):
        destroy_session(authorization[7:])
    return {"ok": True}
