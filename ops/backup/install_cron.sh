#!/bin/sh
# Instala o cron do backup do xGrocery no QNAP (mesmo molde do install_cron.sh
# do backup B do xFinance). DEVE rodar como admin/root do QTS (uid 0): o
# Marcus_adm (uid 507) nao recarrega o crontab do root nem reinicia o crond.
#
# Uso (numa sessao SSH no QNAP):
#   sudo sh /share/MVRX_NAS/.xgrocery_pull/install_cron.sh
CT=/etc/config/crontab
LINE='0 22 * * * /bin/sh /share/MVRX_NAS/.xgrocery_pull/nas_pull_xgrocery.sh >> /share/MVRX_NAS/.xgrocery_pull/pull.log 2>&1'

if [ "$(id -u)" != "0" ]; then
    echo "ERRO: precisa rodar como admin/root do QNAP (uid atual = $(id -u))."
    exit 1
fi

cp "$CT" "$CT.bak_xgrocery_$(date +%Y%m%d_%H%M%S)" && echo "[ok] backup do crontab"

if grep -q 'nas_pull_xgrocery.sh' "$CT"; then
    echo "[ok] cron ja existe (nada alterado)"
else
    printf '%s\n' "$LINE" >> "$CT" && echo "[ok] linha de cron adicionada"
fi

crontab "$CT" && echo "[ok] crontab recarregado"
/etc/init.d/crond.sh restart >/dev/null 2>&1 && echo "[ok] crond reiniciado"

echo "== confirmacao =="
if crontab -l | grep nas_pull_xgrocery.sh; then
    echo ">>> CRON INSTALADO OK (22:00) <<<"
else
    echo ">>> FALHOU: linha nao encontrada no crontab <<<"
    exit 2
fi
