# Project Documentation Context

**Generated**: 2025-12-05T02:38:49.035422+00:00
**Source SHA**: eac3bd2fb0c46fd9c7c811942e8a48867340c2d9
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
# 9-Box Performance Review System

A modern web application for visualizing and managing employee performance using the 9-box talent grid methodology.

## Features

### Core Functionality
- **Interactive 9-Box Grid**: Drag-and-drop interface for positioning employees
- **Excel Integration**: Upload and export Excel files with employee data
- **Real-time Updates**: Instant visual feedback for all changes
- **Change Tracking**: Complete history of all employee movements
- **Advanced Filtering**: Filter by level, manager, job profile, and more
- **Employee Exclusion**: Temporarily hide employees from view
- **Statistics Dashboard**: Visual analytics and distribution charts
- **Secure Authentication**: JWT-based authentication system

### Technical Stack
- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **State Management**: Zustand
- **Database**: SQLite
- **Excel Processing**: openpyxl
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose (recommended)
- OR: Python 3.10+, Node.js 18+

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd 9boxer
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env and change SECRET_KEY in production!
```

3. Build and run:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

5. Login with default credentials:
- Username: `bencan`
- Password: `password`

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
. venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -e '.[dev]'

# Run backend
cd src
python -m ninebox.main
```

Backend will run on http://localhost:8000

#### Frontend Setup

```bash
cd
...[truncated]
```
