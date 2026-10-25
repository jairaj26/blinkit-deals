@echo off
title Blinkit Deal Hunter - Setup Wizard
cd /d "%~dp0"
echo ========================================================
echo   ⚡ Starting Blinkit Deal Hunter Modern Setup Wizard...
echo ========================================================
echo.

:: 1. Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js was not detected on your PC.
    echo [*] Installing Node.js LTS automatically via Windows winget...
    echo     (This may take 1-2 minutes on first run)
    winget install OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo.
        echo [X] Automatic installation could not be completed.
        echo Please download and install Node.js manually from: https://nodejs.org
        echo After installing, double-click setup.bat again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Node.js installed successfully!
)

:: 2. Check dependencies
cd /d "%~dp0blinkit-bot"
if not exist node_modules (
    echo [*] Installing required packages (first-time setup, takes ~15 seconds)...
    call npm install --omit=dev --silent
    echo [OK] Packages installed!
)

:: 3. Launch Web Setup Wizard
echo.
echo [*] Opening the Setup Wizard in your default web browser...
echo.
node src/setup-wizard.js
