# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
