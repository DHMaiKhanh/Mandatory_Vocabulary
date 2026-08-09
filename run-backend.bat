@echo off
REM Khoi dong backend Java (Spring Boot) tai http://localhost:8090
cd /d "%~dp0backend"
echo ============================================
echo   VocabMaster - Backend (Java Spring Boot)
echo   http://localhost:8090
echo ============================================
call mvn spring-boot:run
pause
