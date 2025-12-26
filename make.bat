@echo off
REM Windows batch file equivalent of Makefile
REM Usage: make.bat [target]

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="install" goto install
if "%1"=="install-dev" goto install-dev
if "%1"=="test" goto test
if "%1"=="test-verbose" goto test-verbose
if "%1"=="coverage" goto coverage
if "%1"=="lint" goto lint
if "%1"=="format" goto format
if "%1"=="format-check" goto format-check
if "%1"=="type-check" goto type-check
if "%1"=="security" goto security
if "%1"=="security-report" goto security-report
if "%1"=="check-yaml" goto check-yaml
if "%1"=="check-all" goto check-all
if "%1"=="fix" goto fix
if "%1"=="clean" goto clean
if "%1"=="dev" goto dev
if "%1"=="build-backend" goto build-backend
if "%1"=="build-frontend" goto build-frontend
if "%1"=="build-electron" goto build-electron
if "%1"=="build-all" goto build-all
if "%1"=="build" goto build
if "%1"=="build-python" goto build-python
if "%1"=="publish-test" goto publish-test
if "%1"=="publish" goto publish
if "%1"=="docker-dev" goto docker-dev
if "%1"=="docker-prod" goto docker-prod
if "%1"=="docker-rebuild" goto docker-rebuild
if "%1"=="docker-rebuild-prod" goto docker-rebuild-prod
if "%1"=="docker-logs" goto docker-logs
if "%1"=="docker-logs-frontend" goto docker-logs-frontend
if "%1"=="docker-logs-backend" goto docker-logs-backend
if "%1"=="docker-down" goto docker-down
if "%1"=="docker-clean" goto docker-clean

echo Unknown target: %1
echo Run "make.bat help" to see available targets
exit /b 1

:help
echo Usage: make.bat [target]
echo.
echo Available targets:
echo   help                    Show this help message
echo   install                 Install the package
echo   install-dev             Install the package with development dependencies
echo   test                    Run tests
echo   test-verbose            Run tests with verbose output
echo   coverage                Run tests with coverage report
echo   lint                    Run linting checks
echo   format                  Format code
echo   format-check            Check code formatting without making changes
echo   type-check              Run type checking
echo   security                Run security checks
echo   security-report         Run security checks and generate JSON report
echo   check-yaml              Check YAML file syntax
echo   check-all               Run all checks (format, lint, type, security, test)
echo   fix                     Fix auto-fixable issues
echo   clean                   Clean up generated files
echo   dev                     Set up development environment
echo   build-backend           Build backend executable with PyInstaller
echo   build-frontend          Build frontend (Vite + Electron compilation)
echo   build-electron          Build complete Electron installer
echo   build-all               Build everything (backend + frontend + installer)
echo   build                   Alias for build-all
echo   build-python            Build Python distribution packages
echo   publish-test            Publish to TestPyPI
echo   publish                 Publish to PyPI
echo   docker-dev              Start services in development mode
echo   docker-prod             Start services in production mode
echo   docker-rebuild          Rebuild and restart containers
echo   docker-rebuild-prod     Rebuild production containers
echo   docker-logs             Show container logs
echo   docker-logs-frontend    Show frontend container logs
echo   docker-logs-backend     Show backend container logs
echo   docker-down             Stop all containers
echo   docker-clean            Stop containers and remove volumes
goto end

:install
pip install uv
uv pip install --system -e .
goto end

:install-dev
pip install uv
uv pip install --system -e ".[dev]"
pre-commit install
goto end

:test
pytest
goto end

:test-verbose
pytest -v
goto end

:coverage
pytest --cov=backend/src --cov-report=html --cov-report=term
goto end

:lint
ruff check .
goto end

:format
ruff format .
goto end

:format-check
ruff format --check .
goto end

:type-check
mypy backend/src/ .github/scripts/
goto end

:security
bandit -r backend/src/ .github/scripts/ -s B404,B603,B607
goto end

:security-report
bandit -r backend/src/ .github/scripts/ -f json -o bandit-report.json -s B404,B603,B607
if errorlevel 1 (
    echo Warning: Some security issues found, but continuing...
)
bandit -r backend/src/ .github/scripts/ -s B404,B603,B607
echo Security report generated: bandit-report.json
goto end

:check-yaml
python -c "import yaml; import sys; from pathlib import Path; [yaml.safe_load(f.read_text()) for f in Path('.github/workflows').glob('*.yml')]"
goto end

:check-all
echo Running format check...
ruff format --check .
if errorlevel 1 goto check-failed
echo.
echo Running lint check...
ruff check .
if errorlevel 1 goto check-failed
echo.
echo Running type check...
mypy backend/src/ .github/scripts/
if errorlevel 1 goto check-failed
echo.
echo Running security check...
bandit -r backend/src/ .github/scripts/ -s B404,B603,B607
if errorlevel 1 goto check-failed
echo.
echo Running tests...
pytest
if errorlevel 1 goto check-failed
echo.
echo All checks passed!
goto end

:check-failed
echo.
echo Some checks failed!
exit /b 1

:fix
ruff check --fix .
ruff format .
goto end

:clean
echo Cleaning up generated files...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
for /d /r . %%d in (*.egg-info) do @if exist "%%d" rd /s /q "%%d"
for /d /r . %%d in (.pytest_cache) do @if exist "%%d" rd /s /q "%%d"
for /d /r . %%d in (.mypy_cache) do @if exist "%%d" rd /s /q "%%d"
for /d /r . %%d in (.ruff_cache) do @if exist "%%d" rd /s /q "%%d"
for /d /r . %%d in (htmlcov) do @if exist "%%d" rd /s /q "%%d"
del /s /q *.pyc 2>nul
del /s /q *.pyo 2>nul
del /s /q .coverage 2>nul
del /s /q coverage.xml 2>nul
if exist backend\build rd /s /q backend\build
if exist backend\dist rd /s /q backend\dist
if exist frontend\dist rd /s /q frontend\dist
if exist frontend\dist-electron rd /s /q frontend\dist-electron
if exist frontend\release rd /s /q frontend\release
echo Cleanup complete!
goto end

:dev
echo Setting up development environment...
pip install uv
uv pip install --system -e ".[dev]"
pre-commit install
echo.
echo Development environment ready!
goto end

:build-backend
echo Building backend executable...
cd backend
if exist scripts\build_executable.bat (
    call scripts\build_executable.bat
) else if exist scripts\build_executable.sh (
    bash scripts\build_executable.sh
) else (
    echo Error: Build script not found!
    exit /b 1
)
cd ..
echo.
echo Backend executable built: backend\dist\ninebox\ninebox.exe
goto end

:build-frontend
echo Building frontend...
cd frontend
call npm run build
call npx tsc -p electron/tsconfig.json
cd ..
echo.
echo Frontend built: frontend\dist\ and frontend\dist-electron\
goto end

:build-electron
echo Building Electron installer...
if not exist backend\dist\ninebox\ninebox.exe (
    if not exist backend\dist\ninebox\ninebox (
        echo Backend not built! Run "make.bat build-backend" first.
        exit /b 1
    )
)
cd frontend
call npm run build
call npx tsc -p electron/tsconfig.json
call npx electron-builder --win --x64
cd ..
echo.
echo Electron installer built: frontend\release\
goto end

:build-all
echo Building complete application...
call %0 build-backend
if errorlevel 1 goto build-failed
call %0 build-electron
if errorlevel 1 goto build-failed
echo.
echo Build complete!
echo    Backend: backend\dist\ninebox\
echo    Installer: frontend\release\
goto end

:build-failed
echo.
echo Build failed!
exit /b 1

:build
call %0 build-all
goto end

:build-python
python -m build
goto end

:publish-test
python -m twine upload --repository testpypi dist/*
goto end

:publish
python -m twine upload dist/*
goto end

:docker-dev
echo Starting development environment with hot reloading...
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
echo.
echo Development server running at http://localhost:5173
echo    Frontend changes will hot-reload automatically!
echo    Backend API at http://localhost:38000
echo    (Production build still at http://localhost:3000)
goto end

:docker-prod
echo Starting production environment...
docker compose up -d
echo.
echo Production server running at http://localhost:3000
echo    Backend API at http://localhost:38000
goto end

:docker-rebuild
echo Rebuilding containers...
docker compose -f docker-compose.yml -f docker-compose.dev.yml build
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
echo.
echo Containers rebuilt and restarted
goto end

:docker-rebuild-prod
echo Rebuilding production containers...
docker compose build
docker compose up -d
echo.
echo Production containers rebuilt and restarted
goto end

:docker-logs
docker compose logs -f
goto end

:docker-logs-frontend
docker compose logs -f frontend
goto end

:docker-logs-backend
docker compose logs -f backend
goto end

:docker-down
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
echo Containers stopped
goto end

:docker-clean
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
echo Containers stopped and volumes removed
goto end

:end
exit /b 0
