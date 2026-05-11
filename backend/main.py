from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, categories, items, settings
from .seed import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="xGrocery", version="0.1.0", lifespan=lifespan)

# CORS:
#   - HTTP local (dev na LAN: localhost / 127.0.0.1 / 192.168.x.x / 10.x / 172.x)
#   - HTTPS público (prod via Cloudflare Tunnel — mesmo se servido na mesma
#     origem pelo reverse proxy, deixar aberto não custa nada e cobre testes
#     diretos pelo hostname *.trycloudflare.com / domínio próprio).
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=(
        r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.\d+\.\d+\.\d+)(:\d+)?"
        r"|https://[A-Za-z0-9.\-]+(\.[A-Za-z]{2,})+"
    ),
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


@app.get("/")
def root():
    return {"app": "xGrocery", "version": "0.1.0"}
