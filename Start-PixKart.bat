@echo off
title PixKart Admin Portal
cd /d "D:\PixKart"

echo ===================================================
echo   Starting PixKart Local Server...
echo ===================================================

start "PixKart Server" cmd /c "npm run dev"

echo Waiting for server to initialize...
timeout /t 4 /nobreak >nul

echo Launching Admin Portal in browser...
start http://localhost:3000/Tanzar
