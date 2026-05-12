from contextlib import asynccontextmanager
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import auth, categories, items, settings
from .seed import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="xGrocery", version="0.1.0", lifespan=lifespan)

LOCAL_ORIGIN_REGEX = (
    r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|"
    r"172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?"
)
PUBLIC_ORIGIN_REGEX = os.environ.get("XGROCERY_PUBLIC_ORIGIN_REGEX", "").strip()
ALLOW_ORIGIN_REGEX = (
    f"{LOCAL_ORIGIN_REGEX}|{PUBLIC_ORIGIN_REGEX}"
    if PUBLIC_ORIGIN_REGEX
    else LOCAL_ORIGIN_REGEX
)

# CORS local por padrão. Para hostname público direto no backend, definir
# XGROCERY_PUBLIC_ORIGIN_REGEX com o domínio permitido.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ALLOW_ORIGIN_REGEX,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(items.router)
app.include_router(settings.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Em produção, o build do frontend (xgrocery-client/dist) é servido
# pelo próprio FastAPI — single process, sem nginx separado.
# Em dev local (Vite rodando à parte), o diretório dist não existe e a
# raiz cai no fallback JSON.
DIST_PATH = Path(__file__).resolve().parent.parent / "xgrocery-client" / "dist"

if DIST_PATH.is_dir():
    # StaticFiles com html=True serve index.html em "/" e os assets do build.
    # Como o xGrocery é single-page sem rotas adicionais no client, isso basta.
    app.mount("/", StaticFiles(directory=DIST_PATH, html=True), name="frontend")
else:

    @app.get("/")
    def root():
        return {"app": "xGrocery", "version": "0.1.0", "mode": "api-only"}
