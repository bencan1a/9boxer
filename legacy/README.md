# Legacy Docker & Web Deployment Files

**Archived:** 2025-12-19
**Reason:** Project migrated from Docker-based web application to standalone Electron desktop application

---

## What's in This Directory

This directory contains configuration files from the project's previous incarnation as a Docker-based web application. These files are preserved for historical reference but are **not used in the current standalone Electron application**.

### Current Deployment Model

9Boxer is now distributed as a **standalone desktop application**:
- **Frontend:** Electron-wrapped React app
- **Backend:** PyInstaller-bundled FastAPI executable
- **Deployment:** Platform-specific installers (Windows .exe, macOS .dmg, Linux .AppImage)
- **Documentation:** See [BUILD.md](../BUILD.md) and [DEPLOYMENT.md](../DEPLOYMENT.md)

---

## Archived Files

### Docker Configuration (`docker/`)

- **Dockerfile.backend** - Backend container build configuration
- **Dockerfile.frontend** - Production frontend container with nginx
- **Dockerfile.frontend.dev** - Development frontend container with hot reload
- **nginx.conf** - Nginx reverse proxy configuration for web deployment

### Docker Compose Files

- **docker-compose.yml** - Production multi-container orchestration
- **docker-compose.dev.yml** - Development environment overrides with volume mounts
- **.env.example** - Environment variables for Docker deployment

### Initialization Scripts

- **init_user.py** - Backend script to create default user in Docker containers
  - Created default credentials: `bencan` / `password`
  - Used in Docker entrypoint, not needed for Electron app

### Build System

- **Makefile.docker** - Docker-related make targets extracted from main Makefile
  - `docker-dev`, `docker-prod`, `docker-rebuild`
  - `docker-logs`, `docker-down`, `docker-clean`

---

## Why These Files Were Archived

1. **Deployment Change:** Project moved from web server deployment to desktop application
2. **Simplicity:** Docker added complexity not needed for standalone executables
3. **User Experience:** Desktop app provides better UX than web deployment for this use case
4. **Distribution:** Installers easier to distribute than Docker images for end users

---

## Historical Context

### Original Architecture (Docker-based)
```
Docker Compose
├── Backend Container (FastAPI + Python 3.10)
│   ├── uvicorn server on port 8000
│   ├── SQLite database in Docker volume
│   └── Health checks via curl
├── Frontend Container (nginx + React build)
│   ├── nginx on port 80 (mapped to 3000)
│   ├── Static React files
│   └── Reverse proxy to backend
└── Docker Network (bridge)
```

### Current Architecture (Electron)
```
Electron App
├── Main Process (Node.js)
│   ├── Spawns backend subprocess (PyInstaller exe)
│   ├── Creates BrowserWindow
│   └── Manages IPC communication
├── Backend Subprocess (Embedded)
│   ├── FastAPI server on localhost:8000
│   ├── SQLite in user app data directory
│   └── Bundled with PyInstaller (~225MB)
└── Renderer Process (React)
    ├── Loaded in BrowserWindow
    ├── Communicates with backend via HTTP
    └── Built with Vite
```

---

## Can These Files Still Be Used?

**Yes, with caveats:**

The Docker configuration should still work for local development or web-based deployment, but:

⚠️ **Not actively maintained** - May have dependency conflicts or security issues
⚠️ **No CI/CD support** - GitHub Actions only test Electron builds
⚠️ **Documentation outdated** - Main docs focus on Electron deployment
⚠️ **Backend structure changed** - May need path adjustments for monorepo structure

If you need to run the Docker version:

1. Copy files back to project root
2. Update paths in Dockerfiles (`backend/pyproject.toml` → root `pyproject.toml`)
3. Update `docker-compose.yml` backend volumes and context
4. Run `docker compose up`

---

## Migration Timeline

- **2024-Q4:** Project started as Docker-based web application
- **2025-12-09:** Began Electron migration (see `agent-projects/electron-standalone/`)
- **2025-12:** Completed Electron migration, all features working
- **2025-12-19:** Archived Docker configuration files

---

## See Also

- [../BUILD.md](../BUILD.md) - How to build the Electron application
- [../DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide for standalone app
- [../README.md](../README.md) - Project overview
- [../agent-projects/electron-standalone/](../agent-projects/electron-standalone/) - Electron migration plan

---

## Questions?

If you need to restore web-based deployment or have questions about the legacy Docker setup, please open an issue on GitHub.
