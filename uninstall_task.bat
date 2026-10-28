@echo off
title Blinkit Deal Sniper - Remove Task
cd /d "%~dp0"
echo ========================================================
echo   ⚡ Removing Blinkit Deal Sniper Scheduled Task...
echo ========================================================
echo.
python blinkit_telegram_sniper.py --remove-task
echo.
pause
