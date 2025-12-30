# Project Documentation Context

**Generated**: 2025-12-30T00:33:21.674318+00:00
**Source SHA**: c30a80b2bff1855abd9db9d0177d909d7d5b57e3
**Max Size**: 150,000 characters

This file provides comprehensive context about the project for AI agents and developers.

## Project Facts

```json
{
  "project_name": "9Boxer",
  "description": "A standalone desktop application for visualizing and managing employee performance using the 9-box talent grid methodology",
  "deployment_model": "Standalone Electron desktop application with embedded FastAPI backend",
  "architecture": {
    "type": "Electron desktop application",
    "frontend": "React 18 + TypeScript + Vite + Material-UI",
    "desktop_wrapper": "Electron 35",
    "backend": "FastAPI (Python 3.10+) bundled with PyInstaller",
    "database": "SQLite (stored in user's app data directory)",
    "communication": "HTTP over localhost:38000"
  },
  "technology_stack": {
    "frontend": {
      "framework": "React 18 + TypeScript",
      "build_tool": "Vite",
      "ui_library": "Material-UI (MUI)",
      "state_management": "Zustand",
      "http_client": "Axios"
    },
    "backend": {
      "framework": "FastAPI",
      "python_version": ">=3.10",
      "bundler": "PyInstaller",
      "database": "SQLite",
      "excel_processing": "openpyxl",
      "server": "Uvicorn (embedded)"
    },
    "desktop": {
      "runtime": "Electron 35",
      "packager": "Electron Builder",
      "platforms": ["Windows (NSIS)", "macOS (DMG)", "Linux (AppImage)"]
    }
  },
  "monorepo_structure": {
    "root_venv": ".venv/ (Python backend dependencies + quality tools)",
    "backend": "backend/ (FastAPI source, tests, PyInstaller config)",
    "frontend": "frontend/ (React + Electron wrapper)",
    "package_manager": {
      "backend": "pip (pyproject.toml at root)",
      "frontend": "npm (package.json in frontend/)"
    }
  },
  "backend_bundling": {
    "tool": "PyInstaller",
    "config": "backend/build_config/ninebox.spec",
    "entry_point": "backend/src/ninebox/main.py",
    "output": "backend/dist/ninebox/ninebox.exe (Windows) or ninebox (Linux/macOS)",
    "size": "~225MB (includes all dependencies)",
    "build_scripts": {
      "windows": "backend/scripts/build_executable.bat",
      "linux_mac": "backend/scripts/build_executable.sh"
    }
  },
  "electron_integration": {
    "main_process": "frontend/electron/main/index.ts",
    "preload_script": "frontend/electron/preload/index.ts",
    "splash_screen": "frontend/electron/renderer/splash.html",
    "backend_lifecycle": "Spawned as subprocess in main process",
    "startup_sequence": [
      "Show splash screen",
      "Spawn backend executable from resources",
      "Wait for backend health check (localhost:38000/health)",
      "Create main window and load React app",
      "Close splash when ready"
    ],
    "backend_path": {
      "production": "resources/backend/ninebox.exe",
      "development": "../backend/dist/ninebox/ninebox.exe"
    }
  },
  "build_process": {
    "backend_build": {
      "step": 1,
      "command": "backend/scripts/build_executable.{sh,bat}",
      "output": "backend/dist/ninebox/"
    },
    "frontend_build": {
      "step": 2,
      "command": "npm run electron:build",
      "steps": [
        "Validate backend executable exists",
        "Build React app with Vite",
        "Compile Electron TypeScript",
        "Package with Electron Builder"
      ],
      "output": "frontend/release/ (platform-specific installers)"
    }
  },
  "deployment": {
    "primary": "Standalone desktop executable (Electron)",
    "legacy": "Docker-based web deployment (dormant, not actively maintained)",
    "distribution": {
      "windows": "NSIS installer (.exe, ~300MB)",
      "macos": "DMG installer (.dmg, ~300MB)",
      "linux": "AppImage (.AppImage, ~300MB)"
    },
    "user_data": {
      "windows": "C:\\Users\\{user}\\AppData\\Roaming\\9Boxer\\",
      "macos": "~/Library/Application Support/9Boxer/",
      "linux": "~/.config/9Boxer/"
    }
  },
  "development_vs_production": {
    "development": {
      "frontend": "Vite dev server (http://localhost:5173) with hot reload",
      "backend": "Pre-built executable from backend/dist/ninebox/",
      "electron": "Loads Vite dev server",
      "devtools": "Enabled",
      "logs": "Backend stdout/stderr to console"
    },
    "production": {
      "frontend": "Bundled in resources/app/dist/",
      "backend": "Bundled in resources/backend/",
      "electron": "Loads via file:// protocol",
      "devtools": "Disabled",
      "logs": "Backend logs to {userData}/backend.log",
      "database": "{userData}/ninebox.db"
    }
  },
  "quality_tools": {
    "backend": {
      "testing": "pytest",
      "linting": "ruff",
      "formatting": "ruff format",
      "type_checking": ["mypy", "pyright"],
      "security": "bandit"
    },
    "frontend": {
      "testing": {
        "unit": "Vitest + React Testing Library",
        "e2e": "Cypress"
      },
      "linting": "ESLint",
      "formatting": "Prettier",
      "type_checking": "TypeScript"
    }
  },
  "quality_standards": {
    "test_coverage": ">80%",
    "type_coverage": "100% (all functions must have type annotations)",
    "formatting": "ruff format + Prettier compliant",
    "linting": "ruff check + ESLint compliant",
    "security": "bandit compliant"
  },
  "folder_structure": {
    "root_venv": ".venv/ (Python dependencies for backend + quality tools)",
    "backend": "backend/ (FastAPI source, tests, build config)",
    "frontend": "frontend/ (React + Electron, node_modules)",
    "docs": "docs/ (Permanent documentation)",
    "docs_generated": "docs/_generated/ (Auto-generated documentation)",
    "agent_tmp": "agent-tmp/ (Temporary agent workspace, gitignored)",
    "agent_projects": "agent-projects/ (Active agent project folders)",
    "tools": "tools/ (Build and automation scripts)"
  },
  "documentation_strategy": {
    "source_of_truth": "docs/",
    "generated_docs": "docs/_generated/",
    "temporary_workspace": "agent-tmp/",
    "ephemeral_plans": "agent-projects/",
    "main_context": "docs/CONTEXT.md",
    "automation": "GitHub Actions + tools/build_context.py"
  },
  "platform_considerations": {
    "primary_development_platform": "Windows",
    "windows_reserved_names": {
      "forbidden_filenames": ["CON", "PRN", "AUX", "NUL", "COM1-COM9", "LPT1-LPT9"],
      "note": "These names are reserved by Windows (case-insensitive, with or without extensions)",
      "common_issue": "Using 'nul' as a filename creates phantom files that cannot be deleted via normal methods",
      "fix": "Use PowerShell with device path: del \"\\\\.\\C:\\full\\path\\to\\nul\" or Remove-Item -Path \"\\\\?\\C:\\full\\path\\to\\nul\" -Force",
      "prevention": {
        "python": "Use os.devnull instead of 'nul' string literal",
        "bash": "Use proper redirect syntax (>nul, 2>nul) not quoted 'nul' filenames",
        "cross_platform": "Use os.devnull for platform-agnostic null device access"
      }
    }
  },
  "key_architectural_decisions": {
    "standalone_executable": "No Python installation required for end users",
    "cross_platform": "Same codebase for Windows, macOS, Linux",
    "offline": "No server required, everything runs locally",
    "file_system_access": "Native dialogs for better UX",
    "minimal_changes": "Reuses existing React/FastAPI code",
    "backend_as_subprocess": "Clean separation with HTTP communication"
  },
  "security_model": {
    "context_isolation": "Enabled (renderer can't access Node.js directly)",
    "sandbox": "Enabled for renderer process",
    "preload_script": "Only exposes specific, safe APIs via contextBridge",
    "nodeIntegration": "Disabled (renderer runs like a web page)",
    "cors": "Open (safe because localhost-only)"
  },
  "file_operations": {
    "electron_mode": "Native file dialog + file system access via IPC",
    "web_fallback": "HTML file input (legacy, for web deployment)",
    "ipc_handlers": [
      "dialog:openFile - Native Excel file picker",
      "dialog:saveFile - Native save dialog",
      "file:readFile - Read file from filesystem",
      "app:openUserGuide - Open USER_GUIDE.html in browser"
    ]
  },
  "architecture_documentation": {
    "location": "internal-docs/architecture/",
    "format": "Agent-optimized (scannable tables, pattern catalogs, decision matrices)",
    "quick_reference": "internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md",
    "core_documents": {
      "error_handling": {
        "file": "ERROR_HANDLING.md",
        "purpose": "Error handling patterns, HTTP status codes, logging requirements",
        "when_to_use": "Implementing API endpoints, service layer logic, frontend errors",
        "key_sections": ["Quick Rules", "Pattern Catalog", "HTTP Status Matrix", "Logging Checklist"],
        "pattern_tags": ["#api-endpoint", "#service-layer", "#validation", "#frontend-errors", "#optimistic-update", "#retry"]
      },
      "security_model": {
        "file": "SECURITY_MODEL.md",
        "purpose": "Security boundaries, threat model, IPC patterns, input validation",
        "when_to_use": "Adding IPC handlers, file access, input validation, security reviews",
        "key_sections": ["Security Boundaries Table", "Threat Model Matrix", "Pattern Catalog", "Security Checklist"],
        "pattern_tags": ["#ipc", "#filesystem", "#input-validation", "#sql-injection"]
      },
      "performance": {
        "file": "PERFORMANCE.md",
        "purpose": "Performance targets, scale constraints, optimization patterns",
        "when_to_use": "Optimizing code, understanding scale limits, performance reviews",
        "key_sections": ["Performance Targets", "Scale Constraints", "Accepted Trade-offs", "Decision Matrix"],
        "pattern_tags": ["#database", "#rendering", "#frontend", "#backend", "#startup"]
      },
      "migrations": {
        "file": "MIGRATIONS.md",
        "purpose": "Database schema evolution patterns and testing",
        "when_to_use": "Changing database schema, adding columns/tables, data migrations",
        "key_sections": ["Pattern Catalog", "Testing Checklist", "Failure Recovery", "Version Compatibility"],
        "pattern_tags": ["#add-column", "#rename-column", "#data-migration", "#change-column-type", "#add-index"]
      },
      "observability": {
        "file": "OBSERVABILITY.md",
        "purpose": "Logging patterns, debugging tools, log file locations",
        "when_to_use": "Adding logging, debugging issues, understanding log locations",
        "key_sections": ["Log Levels Matrix", "Debugging Tools", "Common Scenarios", "Logging Checklist"],
        "pattern_tags": ["#error", "#debug", "#performance", "#memory", "#startup"]
      }
    },
    "architecture_decision_records": {
      "location": "internal-docs/architecture/decisions/",
      "index": "decisions/README.md",
      "format": "Agent-optimized (decision matrices, not narrative prose)",
      "adrs": {
        "001": "electron-desktop-architecture.md - Why Electron over Tauri/native",
        "002": "pyinstaller-backend-bundling.md - Why PyInstaller over Docker",
        "003": "http-ipc-communication.md - Why HTTP over Electron IPC",
        "004": "zustand-state-management.md - Why Zustand over Redux",
        "005": "sqlite-embedded-database.md - Why SQLite over PostgreSQL"
      }
    },
    "agent_optimized_format": {
      "quick_rules": "ALWAYS/NEVER statements for immediate guidance",
      "pattern_catalogs": "Copy-paste ready code with When/Template/Don't format",
      "decision_matrices": "If/then tables for quick decisions",
      "anti_patterns": "Explicitly shown with ❌ to prevent mistakes",
      "pattern_tags": "Searchable tags like #api-endpoint, #ipc for quick lookup",
      "contextual_triggers": "When implementing X, use pattern Y guidance"
    },
    "usage_guidance": {
      "before_implementation": "ALWAYS consult relevant architecture docs before coding",
      "during_code_review": "Use checklists and anti-patterns sections",
      "when_debugging": "Check Common Scenarios and Debugging Tools sections",
      "understanding_decisions": "Read ADRs to understand past architectural choices"
    }
  },
  "agent_onboarding": {
    "primary_guides": {
      "github_agent": "GITHUB_AGENT.md (streamlined onboarding for GitHub Agent/Copilot)",
      "claude_code": "CLAUDE.md (detailed technical guidance with platform constraints)",
      "general_agents": "AGENTS.md (development workflow and best practices)",
      "copilot_workspace": ".github/copilot-instructions.md (GitHub Copilot Workspace config)",
      "architecture_reference": "internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md (agent-optimized architecture docs index)"
    },
    "critical_first_steps": [
      "Activate Python virtual environment: . .venv/bin/activate",
      "Run existing tests to establish baseline: pytest",
      "Understand monorepo structure (Python backend + Node.js frontend)",
      "Review platform constraints (Windows development)",
      "Check docs/facts.json for source of truth (highest authority)"
    ],
    "common_pitfalls": {
      "forgot_venv_activation": {
        "symptom": "Module not found errors in Python",
        "solution": "Always activate venv first: . .venv/bin/activate"
      },
      "windows_file_operations": {
        "symptom": "Phantom files, path mangling, or file operation failures",
        "solution": "Use git commands or View/Edit/Create tools, never rm/touch/cp/mv in Bash"
      },
      "wrong_build_order": {
        "symptom": "Electron app won't start or backend not found",
        "solution": "Build backend FIRST with PyInstaller, then frontend with Electron Builder"
      },
      "missing_type_annotations": {
        "symptom": "Type checking errors from mypy/pyright",
        "solution": "Add type hints to ALL function parameters and returns"
      },
      "testing_in_web_mode_only": {
        "symptom": "Features work in browser but not in Electron",
        "solution": "Always test in Electron app: npm run electron:dev"
      }
    },
    "documentation_hierarchy": {
      "highest_authority": "internal-docs/facts.json (this file)",
      "architecture_docs": "internal-docs/architecture/ (agent-optimized patterns and decisions)",
      "permanent_docs": "internal-docs/ directory",
      "active_plans": "agent-projects/ (hints only, <21 days old)",
      "auto_generated": "internal-docs/_generated/ (regenerated automatically)"
    },
    "quick_commands": {
      "activate_venv": ". .venv/bin/activate",
      "run_all_tests": "pytest",
      "run_fast_tests": "pytest backend/tests/unit",
      "quality_check": "make check-all",
      "auto_fix": "make fix",
      "build_backend": "cd backend && ./scripts/build_executable.sh",
      "run_electron": "cd frontend && npm run electron:dev",
      "frontend_tests": "cd frontend && npm test",
      "e2e_tests": "cd frontend && npm run test:e2e:pw"
    }
  }
}
```

## Active Plans

There are 3 active plan(s):

### rich-sample-data-generator
- Owner: claude
- Created: 2025-12-28
- Summary:
  - Create comprehensive sample dataset generator (200-300 employees)
  - Include complete management chains (6 levels), 3-year performance history
  - Add detectable bias patterns for intelligence statistics validation
  - Integrate with app UI (empty state + File menu)
  - Support all 28 Excel schema columns

### self-managing-docs-system
- Owner: Development Team
- Created: 2025-12-26
- Summary:
  - Build self-managing documentation system with automated screenshot updates
  - Componentize key React components (NineBoxGrid, AppBar, IntelligencePanel) for Storybook
  - Implement AI-powered documentation audits and change detection
  - Achieve 40-46% Storybook screenshot coverage (vs 19% current)
  - -

### big-movers-feature
- Owner: Claude
- Created: 2025-12-21
- Summary:
  - Add "big mover" detection for employees who moved significantly between positions
  - Display badge on employee tiles for big movers
  - Add filtering capability to show only big movers
  - Ensure dynamic updates when employees are moved via drag-and-drop

## API Documentation

API documentation is available in `internal-docs/_generated/api/`:


## Project README

See the main README.md for project overview and quick start:
```
# 9Boxer

A standalone desktop application for visualizing and managing employee performance using the 9-box talent grid methodology.

**Built with Electron**, 9Boxer runs entirely on your local machine with no server or cloud dependencies required. Everything is bundled into a single installer for Windows, macOS, and Linux.

## Features

### Core Functionality
- **Interactive 9-Box Grid**: Drag-and-drop interface for positioning employees
- **Excel Integration**: Upload and export Excel files with employee data
- **Real-time Updates**: Instant visual feedback for all changes
- **Change Tracking**: Complete history of all employee movements
- **Advanced Filtering**: Filter by level, manager, job profile, and more
- **Employee Exclusion**: Temporarily hide employees from view
- **Statistics Dashboard**: Visual analytics and distribution charts
- **Native File Dialogs**: OS-native file pickers for better UX
- **Offline First**: Works completely offline, no internet required

### Technical Stack
- **Desktop**: Electron 35 (cross-platform desktop wrapper)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI
- **Backend**: FastAPI (Python 3.10+) bundled with PyInstaller
- **State Management**: Zustand
- **Database**: SQLite (stored in user's app data directory)
- **Excel Processing**: openpyxl
- **Communication**: HTTP over localhost (backend runs as subprocess)

## Quick Start

### Download and Install (End Users)

**Download the latest release for your platform:**

- **Windows**: Download and run `9Boxer-Setup-1.0.0.exe`
- **macOS**: Download and open `9Boxer-1.0.0.dmg`, drag to Applications
- **Linux**: Download `9Boxer-1.0.0.AppImage`, make executable, and run

No Python or Node.js installation required! Everything is bundled in the installer.

### Development Setup (Developers)

**Prerequisites:**
- Python 3.10+ (for backend development)
- Node.js 18+ (for frontend development)
- Git

**Option 1: Run Electron App in Development Mode (Recommended for Full Testi
...[truncated]
```
