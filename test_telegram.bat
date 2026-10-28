@echo off
title Blinkit Deal Sniper - Test Telegram
cd /d "%~dp0"
echo ========================================================
echo   ⚡ Sending Test Ping to Telegram Bot...
echo ========================================================
echo.
python blinkit_telegram_sniper.py --test-telegram
echo.
pause
