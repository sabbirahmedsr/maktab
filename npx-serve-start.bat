@echo off
cd "E:\HTML\Maktab V2"
echo Starting the web server...
start "My Book App" http://localhost:3000
npx serve
timeout /t 5