@echo off
REM Build script for Windows

echo Building 9-Box Backend Executable...

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
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

echo Building with PyInstaller...
pyinstaller build_config\ninebox.spec

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
