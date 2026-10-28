@echo off
title Blinkit Deal Sniper - Install Task
cd /d "%~dp0"
echo ========================================================
echo   ⚡ Registering Blinkit Deal Sniper in Windows Task Scheduler...
echo ========================================================
echo.
python blinkit_telegram_sniper.py --install-task
echo.
pause
