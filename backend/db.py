import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Em dev: backend/xGroceryDB.db (default).
# Em prod (servidor): definir XGROCERY_DB_PATH para um path persistente
# fora do diretório de código (ex: /opt/apps/xgrocery/x_db/xGroceryDB.db),
# protegendo o banco contra git pull / redeploy.
DB_PATH = Path(
    os.environ.get(
        "XGROCERY_DB_PATH",
        str(Path(__file__).parent / "xGroceryDB.db"),
    )
)

# Fotos dos itens: pasta ao lado do banco, pelo mesmo motivo (fora do git,
# sobrevive a redeploy). Um arquivo por item: <id>.jpg e <id>_mini.jpg.
PHOTOS_DIR = Path(
    os.environ.get("XGROCERY_PHOTOS_DIR", str(DB_PATH.parent / "fotos"))
)

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
