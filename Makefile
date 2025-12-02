.PHONY: help install install-dev test lint format type-check security clean coverage

help:  ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install the package
	pip install -e .

install-dev:  ## Install the package with development dependencies
	pip install -e '.[dev]'
	pre-commit install

test:  ## Run tests
	pytest

test-verbose:  ## Run tests with verbose output
	pytest -v

coverage:  ## Run tests with coverage report
	pytest --cov=src --cov-report=html --cov-report=term

lint:  ## Run linting checks
	ruff check .

format:  ## Format code
	ruff format .

format-check:  ## Check code formatting without making changes
	ruff format --check .

type-check:  ## Run type checking
	mypy src/ .github/scripts/

security:  ## Run security checks
	bandit -r src/ .github/scripts/ -s B404,B603,B607

security-report:  ## Run security checks and generate JSON report
	bandit -r src/ .github/scripts/ -f json -o bandit-report.json -s B404,B603,B607 || true
	bandit -r src/ .github/scripts/ -s B404,B603,B607
	@echo "Security report generated: bandit-report.json"

check-yaml:  ## Check YAML file syntax
	python -c "import yaml; import sys; from pathlib import Path; [yaml.safe_load(f.read_text()) for f in Path('.github/workflows').glob('*.yml')]"

check-all:  ## Run all checks (format, lint, type, security, test)
	@echo "Running format check..."
	@ruff format --check .
	@echo "\nRunning lint check..."
	@ruff check .
	@echo "\nRunning type check..."
	@mypy src/ .github/scripts/
	@echo "\nRunning security check..."
	@bandit -r src/ .github/scripts/ -s B404,B603,B607
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

dev:  ## Set up development environment
	@echo "Setting up development environment..."
	pip install --upgrade pip
	pip install -e '.[dev]'
	pre-commit install
	@echo "\nDevelopment environment ready!"

build:  ## Build distribution packages
	python -m build

publish-test:  ## Publish to TestPyPI
	python -m twine upload --repository testpypi dist/*

publish:  ## Publish to PyPI
	python -m twine upload dist/*
