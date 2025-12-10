@echo off
REM Build script for Windows

echo Building 9-Box Backend Executable...

cd /d "%~dp0\.."

REM Check for venv
if not exist "venv" (
    echo Virtual environment not found. Run: python -m venv venv
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

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
