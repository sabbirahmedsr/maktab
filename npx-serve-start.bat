@echo off
REM Change directory to the location of this script, making it portable.
cd /d "%~dp0"
echo Starting the web server...
start "My Book App" http://localhost:3000
npx serve
timeout /t 5