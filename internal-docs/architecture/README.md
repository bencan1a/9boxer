# Architecture Documentation

This directory contains system architecture documentation for the 9Boxer desktop application.

## Contents

- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) - Complete system design
- [GUIDELINES.md](GUIDELINES.md) - Architectural decisions and patterns

## Quick Reference

**9Boxer Architecture:**
- **Deployment**: Standalone Electron desktop app (Windows/macOS/Linux installers)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI in Electron renderer
- **Backend**: FastAPI (Python 3.10+) bundled with PyInstaller (~225MB executable)
- **Communication**: Backend subprocess, HTTP localhost:38000
- **Database**: SQLite in user app data directory
- **No external dependencies**: Everything bundled, no Python/Node.js installation required for end users

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for full details.
