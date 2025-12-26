@echo off
REM Development Process Cleanup Script for 9Boxer
REM Kills all lingering dev processes (backend, frontend, servers)
REM Safe to run anytime - only kills 9Boxer-related processes

echo.
echo ========================================
echo 9Boxer Development Process Cleanup
echo ========================================
echo.

REM Kill ninebox.exe (backend executable)
echo [1/5] Checking for ninebox.exe processes...
tasklist /FI "IMAGENAME eq ninebox.exe" 2>nul | find /I /N "ninebox.exe">nul
if "%ERRORLEVEL%"=="0" (
    echo   ^> Found ninebox.exe processes, killing...
    taskkill /F /IM ninebox.exe >nul 2>&1
    echo   ^> ninebox.exe processes terminated
) else (
    echo   ^> No ninebox.exe processes found
)

REM Kill processes using port 38000 (backend port)
echo.
echo [2/5] Checking for processes on port 38000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :38000 ^| findstr LISTENING') do (
    echo   ^> Found process %%a using port 38000, killing...
    taskkill /F /PID %%a >nul 2>&1
)
echo   ^> Port 38000 cleanup complete

REM Kill processes using port 5173 (Vite dev server)
echo.
echo [3/5] Checking for processes on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo   ^> Found process %%a using port 5173, killing...
    taskkill /F /PID %%a >nul 2>&1
)
echo   ^> Port 5173 cleanup complete

REM Kill uvicorn processes (Python dev server)
echo.
echo [4/5] Checking for uvicorn processes...
tasklist /FI "WINDOWTITLE eq *uvicorn*" 2>nul | find /I /N "python.exe">nul
if "%ERRORLEVEL%"=="0" (
    echo   ^> Found uvicorn processes, attempting cleanup...
    REM Kill Python processes with "uvicorn" in command line
    wmic process where "name='python.exe' and commandline like '%%uvicorn%%'" delete >nul 2>&1
    echo   ^> Uvicorn processes terminated
) else (
    echo   ^> No uvicorn processes found
)

REM Kill npm processes running Vite (more targeted than killing all npm)
echo.
echo [5/5] Checking for npm/Vite processes...
wmic process where "name='node.exe' and commandline like '%%vite%%'" get processid 2>nul | findstr /r "[0-9]" >nul
if "%ERRORLEVEL%"=="0" (
    echo   ^> Found Vite processes, killing...
    wmic process where "name='node.exe' and commandline like '%%vite%%'" delete >nul 2>&1
    echo   ^> Vite processes terminated
) else (
    echo   ^> No Vite processes found
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo All 9Boxer development processes have been cleaned up.
echo You can now start a fresh debug session.
echo.

REM Don't exit immediately so user can see results
timeout /t 3 >nul
