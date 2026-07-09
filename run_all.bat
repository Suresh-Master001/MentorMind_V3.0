@echo off
setlocal enabledelayedexpansion

REM ---------- Configuration ----------
set "ROOT_DIR=%~dp0"
set "FRONTEND_DIR=%ROOT_DIR%MentorMind_V3.0_C"
set "BACKEND_DIR=%ROOT_DIR%MentorMind_V3.0_S"
set "PORT=5001"
set "FRONTEND_URL=http://localhost:5173"

REM ---------- Frontend ----------
echo Starting frontend (Vite) at http://localhost:5173...
start "MentorMind Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

REM ---------- Backend ----------
echo Starting backend (Express) at http://localhost:5001...
start "MentorMind Backend" cmd /k "cd /d %BACKEND_DIR% && npm run dev"

echo.
echo ============================================
echo  MentorMind V3.0 - Starting both servers...
echo ============================================
echo.
echo Frontend: %FRONTEND_URL%
echo Backend : http://localhost:%PORT%/api/health
echo.
echo Close the terminal windows to stop the servers.
echo ============================================
echo.

endlocal