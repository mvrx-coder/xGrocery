@echo off
chcp 65001 > nul
echo ===== xGrocery - Lista de Compras =====
echo.

cd /d %~dp0

start "xGrocery Backend" cmd /k "py -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8062"

cd xgrocery-client
start "xGrocery Frontend" cmd /k "npm run dev"

echo.
echo Backend:  http://localhost:8062
echo Frontend: http://localhost:5178
echo.
echo Para acessar de outros dispositivos da rede, use o IP da maquina
echo (ex: http://192.168.x.x:5178).
