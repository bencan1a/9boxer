# Architecture Documentation

This directory contains system architecture documentation for the 9Boxer desktop application.

## Contents

### System Design
- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) - Complete system design
- [GUIDELINES.md](GUIDELINES.md) - Architectural decisions and patterns
- [SECURITY_MODEL.md](SECURITY_MODEL.md) - Security architecture

### Build & Deployment
- [build-process.md](build-process.md) - How to build desktop installers
- [deployment.md](deployment.md) - Distribution and installation guide

### Domain Documentation
- [SAMPLE_DATA_GENERATION.md](SAMPLE_DATA_GENERATION.md) - Sample data generation
- [ORG_HIERARCHY_SERVICE.md](ORG_HIERARCHY_SERVICE.md) - Organization hierarchy service
- [FILE_HANDLING.md](FILE_HANDLING.md) - File handling patterns
- [MIGRATIONS.md](MIGRATIONS.md) - Database migrations
- [OBSERVABILITY.md](OBSERVABILITY.md) - Observability and monitoring
- [ERROR_HANDLING.md](ERROR_HANDLING.md) - Error handling patterns
- [PERFORMANCE.md](PERFORMANCE.md) - Performance considerations

### Architecture Decision Records (ADRs)
- [decisions/](decisions/) - Architectural decision records

## Quick Reference

**9Boxer Architecture:**
- **Deployment**: Standalone Electron desktop app (Windows/macOS/Linux installers)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI in Electron renderer
- **Backend**: FastAPI (Python 3.10+) bundled with PyInstaller (~225MB executable)
- **Communication**: Backend subprocess, HTTP localhost:38000
- **Database**: SQLite in user app data directory
- **No external dependencies**: Everything bundled, no Python/Node.js installation required for end users

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for full details.
