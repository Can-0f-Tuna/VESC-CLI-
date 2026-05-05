@echo off
echo VESC CLI Installer
echo =================
echo.

:: Check if running as admin (optional but helpful)
net session >nul 2>&1
if %errorlevel% == 0 (
    echo [Administrator mode detected]
) else (
    echo [User mode - will install to user directory]
)
echo.

:: Run PowerShell installer
powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1" -DevBuild

if %errorlevel% neq 0 (
    echo.
    echo Installation failed with error code %errorlevel%
    pause
    exit /b %errorlevel%
)

echo.
echo Press any key to exit...
pause >nul
