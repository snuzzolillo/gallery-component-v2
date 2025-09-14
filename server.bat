@echo off
setlocal

rem --- CONFIGURATION ---
rem Set the desired port for the development server here.
set DEV_PORT=3555

echo ============================================
echo  Starting development server...
echo  URL: http://localhost:%DEV_PORT%
echo ============================================
echo.

rem Cambia al directorio donde se encuentra este script .bat
cd /d "%~dp0"

rem Start the server. server.js will read the PORT environment variable.
set "PORT=%DEV_PORT%" && node server.js

echo.
echo [✔] Servidor detenido.
pause
endlocal