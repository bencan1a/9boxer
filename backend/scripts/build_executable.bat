@echo off
REM Build script for Windows

echo Building 9-Box Backend Executable...

REM Kill any running ninebox.exe processes to avoid file locks
echo Checking for running ninebox.exe processes...
tasklist /FI "IMAGENAME eq ninebox.exe" 2>nul | find /I "ninebox.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo Killing running ninebox.exe processes...
    taskkill /F /IM ninebox.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo Done.
) else (
    echo No running ninebox.exe processes found.
)

cd /d "%~dp0\.."

REM Check for root venv (one level up from backend\)
set VENV_PATH=..\.venv
if not exist "%VENV_PATH%" (
    echo Virtual environment not found at root.
    echo Please create it first:
    echo   cd \path\to\9boxer
    echo   python -m venv .venv
    echo   .venv\Scripts\activate
    echo   pip install -e .[dev]
    exit /b 1
)

echo Activating virtual environment from root...
call %VENV_PATH%\Scripts\activate.bat

echo Installing dependencies from root...
python -m pip install --upgrade pip
cd ..
pip install -e .
cd backend

echo Installing PyInstaller...
pip install pyinstaller

echo Cleaning previous builds...
REM Use PowerShell for robust cleanup with retries
powershell -Command "$ErrorActionPreference = 'SilentlyContinue'; if (Test-Path 'build') { Remove-Item -Path 'build' -Recurse -Force; Start-Sleep -Milliseconds 500 }; if (Test-Path 'dist') { Remove-Item -Path 'dist' -Recurse -Force; Start-Sleep -Milliseconds 500 }"
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Could not clean all files. Attempting to continue...
    echo If build fails, close all apps, restart your computer, and try again.
)

echo Building with PyInstaller...
REM Use --noconfirm to skip the delete prompt since we already cleaned above
pyinstaller --noconfirm build_config\ninebox.spec

echo Testing executable...
if exist "dist\ninebox\ninebox.exe" (
    echo Build complete: dist\ninebox\ninebox.exe
    dir dist\ninebox\ninebox.exe
) else (
    echo Build failed - executable not found
    exit /b 1
)

echo.
echo Build successful!
echo   Executable: %CD%\dist\ninebox\ninebox.exe
echo   To run: cd dist\ninebox and run ninebox.exe
