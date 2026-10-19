#!/bin/sh
# =============================================================================
# xGrocery - backup PULL iniciado pelo NAS (QNAP)
# =============================================================================
# Mesmo desenho do backup B do xFinance (x_finan/infra/backup/nas_pull_backup.sh):
# o NAS abre SSH no servidor com uma chave dedicada travada por forced-command;
# o servidor gera o pacote (banco validado + fotos) e so entao transmite. O NAS
# confere tamanho e integridade do gzip antes de publicar.
#
# Runtime (persistente): /share/MVRX_NAS/.xgrocery_pull/nas_pull_xgrocery.sh
# Fonte de verdade: x_grocery/ops/backup/nas_pull_xgrocery.sh (repo xGrocery).
# Rodado por cron 1x/dia (22:00). Ambiente: busybox sh (QTS).
# =============================================================================
set -u

SERVER="marcusadm@192.168.1.235"
KEY="/share/homes/Marcus_adm/.ssh/id_xgrocery_pull"
DEST="/share/MVRX_NAS/xGrocery_backup"        # so os pacotes
LOGDIR="/share/MVRX_NAS/.xgrocery_pull"       # logs fora da pasta de destino
KEEP=30
MIN_BYTES=5000   # sanidade: so o banco comprimido ja passa disso

TS=$(date +%y%m%d_%H%M)
TMP="$DEST/xGrocery_${TS}.tar.gz.part"
FINAL="$DEST/xGrocery_${TS}.tar.gz"
ERRF="$LOGDIR/last_pull.err"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*"; }

notify_fail() {
    if command -v log_tool >/dev/null 2>&1; then
        log_tool -t 2 -N "xGrocery Backup" -m "Pull backup FALHOU: $1" 2>/dev/null || true
    fi
}

mkdir -p "$DEST"

# 1. Puxa o pacote verificado. O 'x' e ignorado (forced-command no servidor).
ssh -i "$KEY" -o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new \
    "$SERVER" x > "$TMP" 2>"$ERRF"
RC=$?
if [ "$RC" -ne 0 ]; then
    log "ERRO: pull falhou (rc=$RC): $(cat "$ERRF" 2>/dev/null)"
    notify_fail "ssh/geracao rc=$RC"
    rm -f "$TMP"
    exit 1
fi

# 2. Sanidade de tamanho absoluto
SIZE=$(wc -c < "$TMP" 2>/dev/null || echo 0)
if [ "$SIZE" -lt "$MIN_BYTES" ]; then
    log "ERRO: arquivo pequeno demais ($SIZE bytes < $MIN_BYTES). Descartando."
    notify_fail "arquivo pequeno ($SIZE bytes)"
    rm -f "$TMP"
    exit 2
fi

# 3. Guarda contra truncamento: bytes recebidos == bytes anunciados pelo servidor
EXPECTED=$(grep '^SNAPSHOT_BYTES=' "$ERRF" 2>/dev/null | tail -1 | cut -d= -f2)
if [ -n "${EXPECTED:-}" ] && [ "$EXPECTED" -gt 0 ] 2>/dev/null; then
    if [ "$SIZE" -ne "$EXPECTED" ]; then
        log "ERRO: truncamento? recebido=$SIZE esperado=$EXPECTED. Descartando."
        notify_fail "truncamento recebido=$SIZE esperado=$EXPECTED"
        rm -f "$TMP"
        exit 3
    fi
fi

# 4. O gzip tem de abrir inteiro
if ! gzip -t "$TMP" 2>/dev/null; then
    log "ERRO: gzip corrompido. Descartando."
    notify_fail "gzip corrompido"
    rm -f "$TMP"
    exit 4
fi

# 5. Publica atomicamente
mv -f "$TMP" "$FINAL"
log "OK: $(basename "$FINAL") ($SIZE bytes) $(grep '^OK snapshot' "$ERRF" 2>/dev/null)"

# 6. Retencao: mantem os KEEP pacotes mais recentes
COUNT=$(ls -1 "$DEST"/xGrocery_*.tar.gz 2>/dev/null | wc -l)
if [ "$COUNT" -gt "$KEEP" ]; then
    ls -1t "$DEST"/xGrocery_*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r f; do
        rm -f "$f" && log "rotacao: removido $(basename "$f")"
    done
fi

exit 0
