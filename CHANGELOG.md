# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9] - 2026-01-10

This release focuses on improving application security and reliability, particularly for macOS users. We've implemented code signing and notarization for macOS builds to ensure smooth installation without security warnings, along with numerous bug fixes that enhance the stability of the application across all platforms.

### What's New
- macOS builds are now code-signed and notarized by Apple, eliminating security warnings during installation
- Improved version tracking system to ensure you always know which version you're running

### Bug Fixes
- Fixed installation issues on macOS where the application would show security warnings or fail to open
- Resolved backend stability issues by updating core dependencies and removing incompatible libraries
- Fixed build process errors that could prevent the application from launching correctly on Windows

### Improvements
- Streamlined installation documentation for Windows and macOS with clearer step-by-step guidance
- Enhanced application security with proper executable signing on Windows

## [1.0.0] - 2026-01-10

9Boxer v1.0.0 marks our first stable release with significantly improved macOS installation experience through proper code signing and notarization. This update eliminates security warnings during installation and includes important dependency updates for better application stability.

### What's New
- macOS installation now fully code-signed and notarized, eliminating security warnings and providing a seamless installation experience
- Automated version tracking ensures you always know which version you're running

### Bug Fixes
- Resolved multiple installation and security verification issues on macOS that previously caused warnings or installation failures
- Fixed Windows executable signing to ensure smooth installation without security alerts
- Updated core dependencies to improve application stability and compatibility

### Improvements
- Streamlined installation documentation for both Windows and macOS with clearer step-by-step guidance
- Enhanced build reliability to prevent corrupted application packages

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
