@echo off
setlocal

rem Starts backend + frontend in two separate Command Prompt windows.
rem Run this from CMD or double-click it.

set "ROOT=%~dp0"

start "SecureChain Backend" cmd /k "cd /d ""%ROOT%backend"" && npm.cmd run dev"
start "SecureChain Frontend" cmd /k "cd /d ""%ROOT%"" && python.exe -m http.server 5500 --bind 127.0.0.1"

echo.
echo Frontend: http://127.0.0.1:5500/
echo Backend : http://127.0.0.1:3000/api/health
echo.
echo If 5500 is busy, change the port in this file (search for "5500").

endlocal
