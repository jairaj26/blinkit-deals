@echo off
title Blinkit Deal Hunter - Uninstall
echo ========================================================
echo   ⚡ Removing Blinkit Deal Hunter Scheduled Task...
echo ========================================================
echo.
schtasks /delete /tn "BlinkitDealHunter" /f
if %errorlevel% equ 0 (
    echo.
    echo [OK] Blinkit Deal Hunter scheduled task was successfully removed!
    echo The bot will no longer run automatically in the background.
) else (
    echo.
    echo [!] Could not find scheduled task. It may have already been removed.
)
echo.
pause
