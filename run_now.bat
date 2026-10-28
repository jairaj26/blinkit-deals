@echo off
title Blinkit Deal Sniper - Live Run
cd /d "%~dp0"
echo ========================================================
echo   ⚡ Blinkit 80%+ Deal Sniper (Live Scan)
echo ========================================================
echo.
python blinkit_telegram_sniper.py --now
echo.
pause
