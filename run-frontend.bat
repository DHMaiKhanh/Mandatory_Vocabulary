@echo off
REM Khoi dong frontend React (Vite) tai http://localhost:5180
cd /d "%~dp0frontend"
echo ============================================
echo   VocabMaster - Frontend (React + Vite)
echo   http://localhost:5180
echo ============================================
if not exist node_modules (
  echo Cai dat dependencies lan dau...
  call npm install
)
call npm run dev
pause
