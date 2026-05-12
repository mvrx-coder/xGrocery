@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: ============================================================================
:: deploy.bat - Deploy xGrocery via Git + systemd
:: ============================================================================
:: Uso: duplo clique neste arquivo
::
:: Fluxo:
::   1. Verifica alteracoes locais
::   2. Commit + push para GitHub (se houver alteracoes)
::   3. Pull no servidor + npm build + pip install + restart systemd
::   4. Health check em /api/health
::
:: O banco vive em /opt/apps/xgrocery/x_db/ no servidor e fica fora do git.
:: Backend serve o frontend estatico de xgrocery-client/dist/ na mesma porta.
:: ============================================================================

echo.
echo ========================================
echo   xGrocery - Deploy
echo ========================================
echo.

set SERVER=marcusadm@192.168.1.235
set REMOTE_DIR=/opt/apps/xgrocery
set SERVICE=xgrocery-backend.service
set HEALTH_URL=http://127.0.0.1:8062/api/health

:: ============================================================================
:: FASE 1: Verificar estado local
:: ============================================================================

echo [1/4] Verificando estado local...
echo.

echo Ultimo commit local:
git log --oneline -1
echo.

for /f %%i in ('git status --porcelain 2^>nul ^| find /c /v ""') do set CHANGES=%%i

if "!CHANGES!"=="0" (
    echo Nenhuma alteracao local.
    echo.
    set SKIP_COMMIT=1
) else (
    echo Alteracoes detectadas:
    echo ----------------------------------------
    git status --short
    echo ----------------------------------------
    echo.
    set SKIP_COMMIT=0
)

:: ============================================================================
:: FASE 2: Commit e Push
:: ============================================================================

if "!SKIP_COMMIT!"=="0" (
    echo [2/4] Commit e Push
    echo.

    choice /C SN /M "Deseja fazer commit das alteracoes"
    if errorlevel 2 (
        echo.
        echo Deploy cancelado. Faca commit manualmente antes de rodar novamente.
        pause
        exit /b 0
    )

    echo.
    echo Tipos: feat, fix, refactor, chore, docs, style
    set /p MSG="Mensagem do commit (ex: fix: ajustar drawer de quantidade): "

    if "!MSG!"=="" (
        echo ERRO: Mensagem nao pode ser vazia.
        pause
        exit /b 1
    )

    echo.
    git add -A
    git commit -m "!MSG!"
    if errorlevel 1 (
        echo ERRO: Falha ao fazer commit.
        pause
        exit /b 1
    )
    echo.
) else (
    echo [2/4] Sem alteracoes locais - pulando commit
    echo.
)

echo Enviando para GitHub...
git push origin main
if errorlevel 1 (
    echo ERRO: Falha ao enviar para GitHub.
    pause
    exit /b 1
)
echo Push OK.
echo.

:: ============================================================================
:: FASE 3: Deploy no servidor
:: ============================================================================

echo [3/4] Atualizando servidor (vai pedir senha do sudo para restart)...
echo.

ssh -t -o ConnectTimeout=10 %SERVER% "set -e; cd %REMOTE_DIR% && echo '==> git pull...' && git pull --ff-only && echo '' && echo '==> pip install -r backend/requirements.txt...' && .venv/bin/pip install -q -r backend/requirements.txt && echo '' && echo '==> npm ci + build...' && cd xgrocery-client && npm ci --silent && npm run build && cd .. && echo '' && echo '==> restart %SERVICE%...' && sudo systemctl restart %SERVICE% && echo OK"

if errorlevel 1 (
    echo.
    echo ERRO: Falha no deploy do servidor.
    pause
    exit /b 1
)

echo.

:: ============================================================================
:: FASE 4: Health check
:: ============================================================================

echo [4/4] Health check...
echo.

ssh %SERVER% "for i in 1 2 3 4 5; do if curl -fsS --max-time 5 %HEALTH_URL% 2>/dev/null; then echo ''; echo 'Health OK!'; exit 0; fi; echo 'Tentativa '$i'/5...'; sleep 3; done; echo 'FALHOU'; exit 1"

if errorlevel 1 (
    echo.
    echo Health check FALHOU! Verificando logs...
    echo.
    ssh %SERVER% "journalctl -u %SERVICE% --no-pager -n 30"
    echo.
    pause
    exit /b 1
)

echo.

:: ============================================================================
:: Resultado
:: ============================================================================

echo Status do servico:
echo ----------------------------------------
ssh %SERVER% "systemctl status %SERVICE% --no-pager -n 3 | head -6"
echo ----------------------------------------

echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo ========================================
echo.
echo   LAN: http://192.168.1.235:8062
echo.
pause
