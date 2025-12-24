# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Developer-facing**: Migrated screenshot generation from Python to TypeScript
- Screenshot generation now shares helpers with E2E tests (zero duplication)
- Use `npm run screenshots:generate` (from frontend/) instead of `python tools/generate_docs_screenshots.py`
- Screenshots organized by workflow modules (quickstart, calibration, changes, etc.)

### Added
- GitHub Actions workflow for automated screenshot regeneration (`.github/workflows/screenshots.yml`)
- Weekly automated screenshot updates (Mondays at 2 AM UTC)
- 12 Playwright helper functions shared between E2E tests and screenshot generation
- TypeScript screenshot generation infrastructure in `frontend/playwright/screenshots/`
- 31 automated screenshot workflows with type-safe configuration
- 8 manual screenshots documented with detailed creation instructions (`MANUAL_SCREENSHOTS.md`)
- Comprehensive documentation in `frontend/playwright/screenshots/README.md` and tools/README.md
- Migration guide in `tools/README.md`

### Removed
- Python screenshot tool (`tools/generate_docs_screenshots.py`) - replaced by TypeScript implementation
- All screenshot generation now uses TypeScript workflow in `frontend/playwright/screenshots/`

## [0.1.0] - 2025-11-09

### Added
- Initial project template structure
- Development container configuration with Python 3.12
- GitHub Actions workflows:
  - CI workflow for lint, type check, security, and tests
  - PR workflow for pull request validation
  - Nightly regression workflow
- Code quality tools configuration:
  - Ruff for linting and formatting
  - mypy for type checking
  - Bandit for security scanning
  - Black as alternative formatter
- Testing infrastructure with pytest
  - Sample tests for calculator and greeter modules
  - Coverage reporting configuration
  - Parametrized test examples
- Custom GitHub Copilot agent profiles:
  - Architecture agent
  - Test agent
  - Debug agent
  - Documentation agent
- Project configuration files:
  - .gitattributes for consistent line endings
  - .editorconfig for editor consistency
  - .pre-commit-config.yaml for git hooks
  - pyproject.toml for project metadata and tool configuration
- Sample Python modules:
  - Calculator module with basic arithmetic operations
  - Greeter module with greeting functions
- Documentation:
  - Comprehensive README
  - Contributing guidelines
  - Pull request template
  - Agent profiles documentation
- Build and development tools:
  - Makefile with common commands
  - Requirements for development dependencies

### Changed
- Nothing yet

### Deprecated
- Nothing yet

### Removed
- Nothing yet

### Fixed
- Nothing yet

### Security
- Configured bandit for security scanning
- Pre-commit hooks to prevent common security issues

[Unreleased]: https://github.com/bencan1a/python-template/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/bencan1a/python-template/releases/tag/v0.1.0
