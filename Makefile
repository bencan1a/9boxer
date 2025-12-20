.PHONY: help install install-dev test lint format type-check security clean coverage build-backend build-frontend build-all build-electron docker-dev docker-prod docker-rebuild docker-logs docker-down

help:  ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install the package
	pip install uv
	uv pip install --system -e .

install-dev:  ## Install the package with development dependencies
	pip install uv
	uv pip install --system -e '.[dev]'
	pre-commit install

test:  ## Run tests
	pytest

test-verbose:  ## Run tests with verbose output
	pytest -v

test-parallel:  ## Run tests in parallel (requires pytest-xdist)
	pytest -n auto --dist=loadscope

coverage:  ## Run tests with coverage report
	pytest --cov=backend/src --cov-report=html --cov-report=term

lint:  ## Run linting checks
	ruff check .

format:  ## Format code
	ruff format .

format-check:  ## Check code formatting without making changes
	ruff format --check .

type-check:  ## Run type checking
	mypy backend/src/ .github/scripts/

security:  ## Run security checks
	bandit -r backend/src/ .github/scripts/ -s B404,B603,B607

security-report:  ## Run security checks and generate JSON report
	bandit -r backend/src/ .github/scripts/ -f json -o bandit-report.json -s B404,B603,B607 || true
	bandit -r backend/src/ .github/scripts/ -s B404,B603,B607
	@echo "Security report generated: bandit-report.json"

check-yaml:  ## Check YAML file syntax
	python -c "import yaml; import sys; from pathlib import Path; [yaml.safe_load(f.read_text(encoding='utf-8')) for f in Path('.github/workflows').glob('*.yml')]"

check-all:  ## Run all checks (format, lint, type, security, test)
	@echo "Running format check..."
	@ruff format --check .
	@echo "\nRunning lint check..."
	@ruff check .
	@echo "\nRunning type check..."
	@mypy backend/src/ .github/scripts/
	@echo "\nRunning security check..."
	@bandit -r backend/src/ .github/scripts/ -s B404,B603,B607
	@echo "\nRunning tests..."
	@pytest

fix:  ## Fix auto-fixable issues
	ruff check --fix .
	ruff format .

clean:  ## Clean up generated files
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name '*.pyc' -delete
	find . -type f -name '*.pyo' -delete
	find . -type d -name '*.egg-info' -exec rm -rf {} +
	find . -type d -name '.pytest_cache' -exec rm -rf {} +
	find . -type d -name '.mypy_cache' -exec rm -rf {} +
	find . -type d -name '.ruff_cache' -exec rm -rf {} +
	find . -type d -name 'htmlcov' -exec rm -rf {} +
	find . -type f -name '.coverage' -delete
	find . -type f -name 'coverage.xml' -delete
	rm -rf backend/build backend/dist
	rm -rf frontend/dist frontend/dist-electron frontend/release

dev:  ## Set up development environment
	@echo "Setting up development environment..."
	pip install uv
	uv pip install --system -e '.[dev]'
	pre-commit install
	@echo "\nDevelopment environment ready!"

# ============================================================================
# Electron App Build Commands
# ============================================================================

build-backend:  ## Build backend executable with PyInstaller
	@echo "Building backend executable..."
	cd backend && ./scripts/build_executable.sh
	@echo "✅ Backend executable built: backend/dist/ninebox/ninebox"

build-frontend:  ## Build frontend (Vite + Electron compilation)
	@echo "Building frontend..."
	cd frontend && npm run build
	cd frontend && npx tsc -p electron/tsconfig.json
	@echo "✅ Frontend built: frontend/dist/ and frontend/dist-electron/"

build-electron:  ## Build complete Electron installer (requires backend built first)
	@echo "Building Electron installer..."
	@if [ ! -f "backend/dist/ninebox/ninebox" ] && [ ! -f "backend/dist/ninebox/ninebox.exe" ]; then \
		echo "❌ Backend not built! Run 'make build-backend' first."; \
		exit 1; \
	fi
	cd frontend && npm run build
	cd frontend && npx tsc -p electron/tsconfig.json
	cd frontend && npx electron-builder --linux --x64
	@echo "✅ Electron installer built: frontend/release/"

build-all:  ## Build everything (backend + frontend + installer)
	@echo "Building complete application..."
	$(MAKE) build-backend
	$(MAKE) build-electron
	@echo ""
	@echo "✅ Build complete!"
	@echo "   Backend: backend/dist/ninebox/"
	@echo "   Installer: frontend/release/"

build:  ## Alias for build-all
	$(MAKE) build-all

# Legacy Python package build commands
build-python:  ## Build Python distribution packages
	python -m build

publish-test:  ## Publish to TestPyPI
	python -m twine upload --repository testpypi dist/*

publish:  ## Publish to PyPI
	python -m twine upload dist/*

# ============================================================================
# Legacy Docker Commands (Archived)
# ============================================================================
# Docker-based web deployment has been replaced by standalone Electron app.
# Docker commands have been archived to: legacy/Makefile.docker
# See BUILD.md for current build instructions.
