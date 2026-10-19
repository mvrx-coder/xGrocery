#!/usr/bin/env python3
"""
xGrocery - snapshot para o backup puxado pelo NAS (mesmo desenho do backup B
do xFinance: x_finan/infra/backup/xfinance_snapshot.py).

Gera um .tar.gz com:
  - xGroceryDB.db: copia consistente pela Online Backup API do SQLite (so LE
    a origem), validada com PRAGMA integrity_check;
  - fotos/: as fotos dos itens (JPEG), como estao no disco.

Monta o pacote num arquivo temporario e so entao o entrega - para um arquivo
(--out, rename atomico) ou para stdout (--stream, para o NAS capturar via ssh
sem precisar de python do lado de la). A linha "SNAPSHOT_BYTES=<n>" vai para
stderr antes do fluxo, para o NAS conferir truncamento. Sai com codigo != 0 e
nenhum byte em stdout se a verificacao falhar.

Somente stdlib.

Runtime no servidor (fora da arvore git do app, para nao conflitar com
git pull): /home/marcusadm/xgrocery-backup/xgrocery_snapshot.py
Fonte de verdade: x_grocery/ops/backup/xgrocery_snapshot.py (este arquivo).
"""
import argparse
import os
import sqlite3
import sys
import tarfile
import tempfile

DATA_DIR = os.environ.get("XGROCERY_DATA_DIR", "/opt/apps/xgrocery/x_db")
DB_PATH = os.path.join(DATA_DIR, "xGroceryDB.db")
PHOTOS_DIR = os.path.join(DATA_DIR, "fotos")


def log(*a):
    print(*a, file=sys.stderr)


def snapshot_db(dst_path: str) -> int:
    src = sqlite3.connect(DB_PATH, timeout=15.0)
    try:
        src.execute("PRAGMA busy_timeout=10000")
        dst = sqlite3.connect(dst_path)
        try:
            src.backup(dst)
        finally:
            dst.close()
    finally:
        src.close()

    v = sqlite3.connect(dst_path)
    try:
        integ = v.execute("PRAGMA integrity_check").fetchone()[0]
        nitems = v.execute("SELECT count(*) FROM items").fetchone()[0]
    finally:
        v.close()
    if integ != "ok" or nitems <= 0:
        raise RuntimeError(f"integridade falhou: check={integ!r} itens={nitems}")
    return nitems


def build_archive(tar_path: str, work_dir: str) -> tuple[int, int]:
    db_copy = os.path.join(work_dir, "xGroceryDB.db")
    nitems = snapshot_db(db_copy)
    nphotos = 0
    with tarfile.open(tar_path, "w:gz") as tar:
        tar.add(db_copy, arcname="xGroceryDB.db")
        if os.path.isdir(PHOTOS_DIR):
            tar.add(PHOTOS_DIR, arcname="fotos", recursive=False)
            for name in sorted(os.listdir(PHOTOS_DIR)):
                if name.endswith(".jpg"):
                    tar.add(os.path.join(PHOTOS_DIR, name), arcname=f"fotos/{name}")
                    nphotos += 1
    return nitems, nphotos


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", help="grava o pacote verificado neste caminho (rename atomico)")
    ap.add_argument("--stream", action="store_true", help="escreve os bytes .tar.gz em stdout")
    args = ap.parse_args()

    if not os.path.exists(DB_PATH):
        log(f"ERRO: banco nao encontrado: {DB_PATH}")
        return 2
    if not args.out and not args.stream:
        log("nada a fazer: use --out CAMINHO ou --stream")
        return 3

    with tempfile.TemporaryDirectory(prefix="xg_snap_") as work:
        tar_path = os.path.join(work, "pacote.tar.gz")
        nitems, nphotos = build_archive(tar_path, work)
        size = os.path.getsize(tar_path)
        log(f"OK snapshot: {nitems} itens, {nphotos} fotos, {size} bytes")

        if args.stream:
            log(f"SNAPSHOT_BYTES={size}")
            with open(tar_path, "rb") as f:
                chunk = f.read(1024 * 1024)
                while chunk:
                    sys.stdout.buffer.write(chunk)
                    chunk = f.read(1024 * 1024)
            sys.stdout.buffer.flush()
        else:
            tmp_out = args.out + ".part"
            with open(tar_path, "rb") as src, open(tmp_out, "wb") as dst:
                dst.write(src.read())
            os.replace(tmp_out, args.out)
            log(f"gravado em {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
