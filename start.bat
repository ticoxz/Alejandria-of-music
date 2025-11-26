@echo off
echo Iniciando SpotDown Web App...

:: Iniciar Backend
start "SpotDown Backend" cmd /k "cd api && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Iniciar Frontend
start "SpotDown Frontend" cmd /k "cd web && npm run dev"

echo.
echo ========================================================
echo  SpotDown se esta ejecutando!
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:8000
echo ========================================================
echo.
pause
