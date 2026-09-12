@echo off
title PixKart Cloud Sync and Drain
cd /d "D:\PixKart"

echo ===================================================
echo   PixKart: Cloud Buffer to PC MySQL Sync ^& Drain
echo ===================================================
echo.

npx tsx scripts/run-sync-and-drain.ts

echo.
echo Press any key to close this window...
pause >nul
