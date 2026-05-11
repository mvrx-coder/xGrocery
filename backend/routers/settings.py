from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import Settings, User
from ..schemas import SettingsOut, SettingsPatch

router = APIRouter(prefix="/api/settings", tags=["settings"])

VALID_PALETTES = {"nocturne", "ocean", "neon"}
VALID_STYLES = {"elevated", "border", "indicator"}


def _get_or_create(db: Session) -> Settings:
    settings = db.query(Settings).filter(Settings.id == 1).first()
    if not settings:
        settings = Settings(id=1, paleta="nocturne", estilo_diferenciacao="elevated")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return _get_or_create(db)


@router.patch("", response_model=SettingsOut)
def patch_settings(
    body: SettingsPatch,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    settings = _get_or_create(db)

    if body.paleta is not None:
        if body.paleta not in VALID_PALETTES:
            raise HTTPException(400, "Paleta inválida")
        settings.paleta = body.paleta
    if body.estilo_diferenciacao is not None:
        if body.estilo_diferenciacao not in VALID_STYLES:
            raise HTTPException(400, "Estilo inválido")
        settings.estilo_diferenciacao = body.estilo_diferenciacao

    db.commit()
    db.refresh(settings)
    return settings
