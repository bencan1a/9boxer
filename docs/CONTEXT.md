# Project Documentation Context

**Generated**: 2025-12-02T02:36:46.030889+00:00
**Source SHA**: ca8e2abe87d89e8acd590f22d109c9e27b941973
**Max Size**: 150,000 characters

This file provides comprehensive context about the project for AI agents and developers.

## Project Facts

```json
{
  "project_name": "python-template",
  "description": "A well-configured Python project template optimized for GitHub Copilot",
  "python_version": ">=3.10",
  "primary_tools": {
    "package_manager": "pip",
    "testing": "pytest",
    "linting": "ruff",
    "formatting": "ruff + black",
    "type_checking": "mypy",
    "security": "bandit",
    "documentation": "sphinx + pdoc3"
  },
  "folder_structure": {
    "src/": "Source code",
    "tests/": "Test files",
    "docs/": "Permanent documentation",
    "docs/_generated/": "Auto-generated documentation",
    "agent-tmp/": "Temporary agent workspace (gitignored)",
    "agent-plans/": "Ephemeral plan documents",
    "agent-projects/": "Active agent project folders",
    "tools/": "Build and automation scripts",
    ".github/": "GitHub configuration and workflows"
  },
  "quality_standards": {
    "test_coverage": ">80%",
    "type_coverage": "100% (all functions must have type annotations)",
    "formatting": "ruff format compliant",
    "linting": "ruff check compliant",
    "security": "bandit compliant"
  },
  "documentation_strategy": {
    "source_of_truth": "docs/",
    "generated_docs": "docs/_generated/",
    "temporary_workspace": "agent-tmp/",
    "ephemeral_plans": "agent-plans/",
    "main_context": "docs/CONTEXT.md",
    "automation": "GitHub Actions + tools/build_context.py"
  }
}
```

## API Documentation

API documentation is available in `docs/_generated/api/`:


## Project README

See the main README.md for project overview and quick start:
```
# Python Template 🐍

A comprehensive Python project template optimized for GitHub Copilot and modern development practices.

[![CI](https://github.com/bencan1a/python-template/workflows/CI/badge.svg)](https://github.com/bencan1a/python-template/actions)
[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/downloads/)
[![Code style: ruff](https://img.shields.io/badge/code%20style-ruff-000000.svg)](https://github.com/astral-sh/ruff)
[![Type checked: mypy](https://img.shields.io/badge/type%20checked-mypy-blue)](http://mypy-lang.org/)
[![Security: bandit](https://img.shields.io/badge/security-bandit-yellow.svg)](https://github.com/PyCQA/bandit)

## ✨ Features

This template includes everything you need to start a professional Python project:

- 🏗️ **Modern Project Structure**: Standard `src/` layout following Python best practices
- 🛠️ **Development Container**: Pre-configured devcontainer with all necessary tools
- 🔍 **Code Quality Tools**: Ruff, Black, mypy, and Bandit pre-installed and configured
- 🧪 **Testing Setup**: pytest with coverage reporting and example tests
- 🤖 **GitHub Actions**: CI/CD workflows for validation, PR checks, and nightly regression
- 📝 **Documentation Ready**: Structured for easy documentation generation
- 🎯 **Custom Agent Profiles**: Specialized GitHub Copilot agent configurations
- ⚙️ **Editor Configuration**: .editorconfig and .gitattributes for consistency
- 📋 **Pull Request Template**: Comprehensive PR template for quality reviews

## 🚀 Quick Start

> **⚠️ Important:** This project uses a Python virtual environment for dependency isolation. See [AGENTS.md](AGENTS.md) for complete development workflow guidance.

### Prerequisites

- Python 3.10 or higher
- pip or uv package manager
- Git

### Installation

1. **Use this template**: Click "Use this template" button on GitHub

2. **Clone your new repository**:
   ```bash
   git clone https://github.com/yourusername/your-project-name.git
   cd your-proj
...[truncated]
```
