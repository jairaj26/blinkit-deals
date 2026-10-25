@echo off
title Blinkit Deal Hunter - Live Run
cd /d "%~dp0blinkit-bot"
echo ========================================================
echo   ⚡ Blinkit 80%+ Clearance Deal Hunter (Live Scan)
echo ========================================================
echo.
node src/runner.js
echo.
echo ========================================================
echo Scan complete! Press any key to close this window.
pause >nul
