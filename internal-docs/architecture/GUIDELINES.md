# Architectural Guidelines

This document explains the architectural decisions, design patterns, and principles that guide the 9Boxer codebase.

## Architectural Principles

### 1. Standalone Application

**Decision**: Deploy as standalone desktop application, not web application

**Rationale:**
- **No server dependency**: Users don't need to set up servers, databases, or hosting
- **Offline-first**: Application works without internet connection
- **Simpler deployment**: Single installer per platform, no IT department needed
- **Data privacy**: All data stays on user's machine, no cloud storage
- **Better UX**: Native file dialogs, OS integration, dedicated app window

**Implementation:**
- Electron wrapper for cross-platform compatibility
- Embedded backend (PyInstaller executable)
- SQLite database in user's app data directory
- No network calls except localhost

### 2. Embedded Backend

**Decision**: Bundle FastAPI backend as PyInstaller executable, run as subprocess

**Rationale:**
- **No Python installation**: End users don't need Python installed
- **Version control**: Backend Python version bundled, no version conflicts
- **Dependency isolation**: All Python packages included in executable
- **Simplified distribution**: Single backend file (~225MB)
- **Security**: Backend only listens on localhost, no network exposure

**Implementation:**
- PyInstaller bundles Python interpreter + dependencies + FastAPI app
- Electron main process spawns backend on app startup
- Backend runs on localhost:38000 (or alternative if port occupied)
- Backend killed when app closes (graceful shutdown with SIGTERM)

**Trade-offs:**
- Larger installer size (~300MB vs ~50MB for pure Electron)
- Slower startup (~3-5 seconds for backend initialization)
- No hot reload in production (must rebuild backend executable)

### 3. Security Model

**Decision**: Localhost-only backend with context-isolated renderer

**Rationale:**
- **No network exposure**: Backend never accepts external connections
- **Sandbox renderer**: Frontend runs in isolated Chromium renderer process
- **Minimal IPC surface**: Only safe APIs exposed via preload script
- **No direct database access**: Frontend always goes through backend HTTP API

**Implementation:**
- Backend binds to 127.0.0.1 (localhost only)
- Electron context isolation enabled
- Electron sandbox enabled for renderer
- Preload script uses contextBridge to expose safe APIs
- All file operations go through main process (IPC)

**Security Boundaries:**
```
┌─────────────────────────────────────────┐
│ Renderer Process (Sandboxed)           │
│  - React app                            │
│  - No Node.js access                    │
│  - No direct file system access         │
└─────────────┬───────────────────────────┘
              │ IPC (safe APIs only)
┌─────────────▼───────────────────────────┐
│ Main Process (Full privileges)         │
│  - Backend lifecycle management         │
│  - File dialogs                         │
│  - Window management                    │
└─────────────┬───────────────────────────┘
              │ HTTP (localhost:38000)
┌─────────────▼───────────────────────────┐
│ Backend Process (Subprocess)            │
│  - FastAPI app                          │
│  - Database access                      │
│  - Excel processing                     │
└─────────────────────────────────────────┘
```

## Design Patterns

### 1. Backend: Service Layer Pattern

**Pattern**: Separate business logic from API routes

**Structure:**
```
api/ (routers)    →  Define HTTP endpoints, request/response models
    ↓
services/         →  Implement business logic, orchestrate operations
    ↓
models/           →  SQLAlchemy ORM models, database schema
```

**Example:**
```python
# api/employees.py (router)
@router.get("/employees")
async def get_employees(
    db: Session = Depends(get_db),
    filter_params: FilterParams = Depends()
):
    return await employee_service.get_filtered_employees(db, filter_params)

# services/employee_service.py (business logic)
async def get_filtered_employees(db: Session, filters: FilterParams) -> list[Employee]:
    # Business logic: query building, filtering, sorting
    query = db.query(Employee)
    if filters.level:
        query = query.filter(Employee.level == filters.level)
    return query.all()
```

**Benefits:**
- **Testability**: Services can be tested without HTTP layer
- **Reusability**: Business logic shared across multiple endpoints
- **Separation of concerns**: API handles HTTP, services handle logic
- **Easier refactoring**: Change implementation without touching routes

### 2. Backend: FastAPI Dependency Injection

**Pattern**: Use FastAPI's DI system for database sessions, configuration

**Example:**
```python
# core/dependencies.py
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# api/employees.py (using dependency)
@router.get("/employees")
async def get_employees(db: Session = Depends(get_db)):
    # db is automatically injected and cleaned up
    return employee_service.get_all(db)
```

**Benefits:**
- **Automatic cleanup**: Database sessions closed automatically
- **Testability**: Easy to mock dependencies in tests
- **Type safety**: Dependencies are type-checked
- **Reusability**: Share dependencies across routes

### 3. Frontend: React Hooks + Context

**Pattern**: Use React hooks for component logic, Context API for shared state

**State Management Strategy:**
- **Zustand stores**: Global app state (employees, session, filters)
- **React Context**: Theme, i18n, auth
- **Component state**: Local UI state (form inputs, modals)

**Example:**
```typescript
// store/useEmployeeStore.ts (Zustand)
export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  setEmployees: (employees) => set({ employees }),
  updateEmployee: (id, data) => set((state) => ({
    employees: state.employees.map(e => e.id === id ? {...e, ...data} : e)
  }))
}))

// Component usage
function EmployeeGrid() {
  const employees = useEmployeeStore((state) => state.employees)
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee)

  // Component logic...
}
```

**Benefits:**
- **Simple API**: Zustand is minimal, no boilerplate
- **Performance**: Fine-grained subscriptions, only re-render when needed
- **DevTools**: Zustand DevTools for debugging
- **No Redux complexity**: Simpler than Redux for this use case

### 4. Frontend: Component Composition

**Pattern**: Build complex UIs from small, reusable components

**Component Hierarchy:**
```
App
├── AppLayout (layout wrapper)
│   ├── TopToolbar (global actions)
│   ├── NineBoxGrid (main grid)
│   │   ├── GridBox (single box)
│   │   │   └── EmployeeCard (draggable card)
│   │   └── GridBox (x9)
│   ├── FilterDrawer (left sidebar)
│   │   ├── FilterSection
│   │   └── FilterChip
│   └── RightPanel (details, changes, stats)
│       ├── DetailsTab
│       ├── ChangesTab
│       ├── StatisticsTab
│       └── IntelligenceTab
└── SettingsDialog (modal)
```

**Design System:**
- All components use design tokens from `theme/tokens.ts`
- MUI components customized via theme
- Consistent spacing, colors, typography

**Benefits:**
- **Reusability**: Small components used in multiple places
- **Testability**: Easy to test individual components
- **Maintainability**: Changes localized to specific components
- **Consistency**: Design system ensures visual consistency

## Technology Decisions

### Why Electron?

**Alternatives considered**: Tauri, NW.js, Qt, native apps

**Chose Electron because:**
- **Cross-platform**: Single codebase for Windows, macOS, Linux
- **Web technologies**: Leverage React, TypeScript, modern web tools
- **Rich ecosystem**: Mature libraries, extensive documentation
- **Developer experience**: Hot reload, DevTools, familiar workflow
- **Community**: Large community, many examples

**Trade-offs:**
- Larger bundle size (~300MB vs ~50MB for Tauri)
- Higher memory usage (~200-500MB)
- Not as fast as native apps

**Acceptable because:**
- Desktop app runs locally, bundle size downloaded once
- Target users have modern machines (4GB+ RAM)
- Developer productivity more important than 50MB size difference

### Why FastAPI?

**Alternatives considered**: Flask, Django, Node.js (Express)

**Chose FastAPI because:**
- **Type safety**: Pydantic models provide runtime validation + IDE support
- **Async**: Non-blocking I/O for better performance
- **Automatic docs**: Swagger UI and ReDoc generated from code
- **Modern Python**: Uses latest Python features (async/await, type hints)
- **Fast**: One of the fastest Python frameworks (Starlette + Pydantic)

**Trade-offs:**
- Requires Python 3.10+ (not a problem for bundled app)
- Async can be complex for simple CRUD operations

**Acceptable because:**
- Type safety catches bugs early (especially with mypy/pyright)
- Automatic docs save time (no manual API documentation)
- Performance is good enough for single-user desktop app

### Why SQLite?

**Alternatives considered**: PostgreSQL, MySQL, JSON files

**Chose SQLite because:**
- **Embedded**: No server to install or configure
- **Portable**: Single file, easy to backup
- **ACID**: Full transaction support, data integrity
- **Simple**: No user management, no network configuration
- **Fast**: Good performance for single-user workloads

**Trade-offs:**
- No concurrent writes (not a problem for single-user app)
- Limited to ~140 TB (not a problem for employee data)
- No built-in encryption (could add if needed)

**Acceptable because:**
- Desktop app is single-user (one user at a time)
- Employee data is small (~1-10,000 records)
- Local-only deployment (no multi-user requirements)

### Why PyInstaller?

**Alternatives considered**: Nuitka, cx_Freeze, py2exe

**Chose PyInstaller because:**
- **Mature**: Well-established, many users
- **Cross-platform**: Works on Windows, macOS, Linux
- **Good compatibility**: Handles most Python packages
- **Spec files**: Flexible configuration
- **Active development**: Regular updates

**Trade-offs:**
- Larger executables (~225MB with all dependencies)
- Slower startup (~2-3 seconds cold start)
- Some packages need manual configuration (hiddenimports)

**Acceptable because:**
- Desktop app startup time not critical (runs for hours)
- Executable size reasonable for desktop distribution
- Complexity worth it for "no Python installation" UX

### Why Zustand (not Redux)?

**Alternatives considered**: Redux, MobX, Jotai, Recoil

**Chose Zustand because:**
- **Simple API**: Less boilerplate than Redux
- **Performance**: Fine-grained subscriptions
- **Small bundle**: ~1KB minified
- **No context provider**: Works anywhere in component tree
- **TypeScript**: Excellent TypeScript support

**Trade-offs:**
- Less ecosystem than Redux (fewer devtools, middleware)
- Less prescriptive (more freedom = more decisions)

**Acceptable because:**
- This app doesn't need Redux's complexity
- State management is straightforward (CRUD operations)
- DevTools available and sufficient

## Code Organization

### Backend: Standard Python src/ Layout

**Structure:**
```
backend/
├── src/ninebox/          # Package root (importable as "ninebox")
│   ├── main.py           # Application entry point
│   ├── core/             # Core functionality (config, database)
│   ├── api/              # API endpoints (FastAPI routers)
│   ├── models/           # Database models (SQLAlchemy)
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── tests/                # Tests (separate from source)
│   ├── unit/             # Fast isolated tests
│   ├── integration/      # Multi-component tests
│   ├── e2e/              # Full frozen executable tests
│   └── performance/      # Benchmark tests
└── build_config/         # PyInstaller configuration
```

**Benefits:**
- Standard Python project layout (PEP 517/518)
- Easy to install in development: `pip install -e .`
- Tests separate from source code
- Clear separation of concerns (api, models, services)

### Frontend: Feature-Based Folders

**Structure:**
```
frontend/src/
├── components/           # Reusable UI components
│   ├── common/           # Generic components (Button, Modal, etc.)
│   ├── grid/             # Grid-specific components
│   ├── filters/          # Filter-specific components
│   └── statistics/       # Statistics-specific components
├── hooks/                # Custom React hooks
├── services/             # API client, utilities
├── store/                # Zustand stores
├── theme/                # MUI theme, design tokens
├── i18n/                 # Translations (en, es)
└── types/                # TypeScript type definitions
```

**Benefits:**
- Easy to find components by feature
- Related files grouped together
- Scales well as app grows

### Shared: Design Tokens

**Location**: `frontend/src/theme/tokens.ts`

**Purpose**: Centralize all design constants (colors, spacing, fonts)

**Usage:**
```typescript
// ❌ WRONG - Hardcoded values
<Box sx={{ padding: '16px', backgroundColor: '#f5f5f5' }} />

// ✅ CORRECT - Use design tokens
<Box sx={{
  padding: theme.tokens.spacing.md,
  backgroundColor: theme.tokens.colors.background.default
}} />
```

**Benefits:**
- Consistency across all components
- Easy to change theme (update tokens once)
- Light/dark mode support built-in
- Type-safe (TypeScript autocomplete)

## Constraints and Limitations

### Windows Development Environment

**Constraint**: Project developed on Windows with WSL/Git Bash

**Implications:**
- Bash scripts must handle Windows paths correctly
- Cannot use Unix-specific commands (e.g., `lsof` on Windows)
- File paths use forward slashes (cross-platform)
- Backend build scripts have .bat (Windows) and .sh (Unix) versions

**Best Practices:**
- Use `os.path` or `pathlib` in Python (cross-platform)
- Use forward slashes in JavaScript/TypeScript
- Test on Windows, macOS, Linux before release
- Avoid Windows reserved names (CON, PRN, AUX, NUL)

### Python 3.10+ Required (Development)

**Constraint**: Backend requires Python 3.10 or higher for development

**Rationale:**
- FastAPI uses modern type hints (PEP 604 union types: `str | None`)
- Pydantic 2.x requires Python 3.10+
- Structural pattern matching used in some code

**Implications:**
- Developers must have Python 3.10+ installed
- CI/CD tests on Python 3.10, 3.11, 3.12
- End users don't need Python (bundled in executable)

### Node.js 18+ Required (Development)

**Constraint**: Frontend requires Node.js 18 or higher for development

**Rationale:**
- Vite 5.x requires Node.js 18+
- Native fetch API used (Node.js 18+)
- ES modules preferred (better with Node.js 18+)

**Implications:**
- Developers must have Node.js 18+ installed
- End users don't need Node.js (bundled in Electron)

### Electron Native Modules

**Constraint**: Native Node.js modules require rebuild for Electron

**Rationale:**
- Electron uses custom V8 version
- Native modules compiled for Node.js won't work in Electron

**Implications:**
- Avoid native modules when possible
- If unavoidable, use `electron-rebuild` to rebuild for Electron
- Test thoroughly on all platforms

**Current stance:**
- No native modules currently used
- Prefer pure JavaScript/TypeScript libraries

## Extension Points

### Adding New API Endpoints

**Steps:**
1. Define Pydantic models in `models/`
2. Implement business logic in `services/`
3. Create router in `api/`
4. Register router in `main.py`
5. Write tests in `tests/unit/api/`

**Example:**
```python
# 1. models/report.py
class Report(BaseModel):
    id: int
    name: str
    data: dict

# 2. services/report_service.py
async def generate_report(db: Session, report_type: str) -> Report:
    # Business logic here
    pass

# 3. api/reports.py
router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/")
async def create_report(
    report_type: str,
    db: Session = Depends(get_db)
) -> Report:
    return await report_service.generate_report(db, report_type)

# 4. main.py
app.include_router(reports.router)
```

### Adding New UI Components

**Steps:**
1. Create component in `frontend/src/components/`
2. Use design tokens from `theme/tokens.ts`
3. Add `data-testid` for testing
4. Support light/dark mode
5. Add i18n for all strings
6. Include ARIA labels for accessibility
7. Write component test in `__tests__/`

**Example:**
```typescript
// components/NewFeature.tsx
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

export function NewFeature() {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Box
      data-testid="new-feature"
      sx={{
        padding: theme.tokens.spacing.md,
        backgroundColor: theme.tokens.colors.background.paper,
        borderRadius: theme.tokens.borderRadius.md
      }}
      aria-label={t('newFeature.label')}
    >
      <Typography variant="h6">
        {t('newFeature.title')}
      </Typography>
    </Box>
  )
}
```

### Adding New Translations

**Steps:**
1. Add strings to `frontend/src/i18n/locales/en.json`
2. Add translations to `frontend/src/i18n/locales/es.json`
3. Use in component: `const { t } = useTranslation()`
4. Reference: `{t('section.key')}`

**Example:**
```json
// locales/en.json
{
  "newFeature": {
    "title": "New Feature",
    "label": "Access new feature",
    "description": "This is a new feature"
  }
}

// locales/es.json
{
  "newFeature": {
    "title": "Nueva Función",
    "label": "Acceder a nueva función",
    "description": "Esta es una nueva función"
  }
}
```

### Adding New Tests

**Backend Tests:**
- **Unit tests**: `backend/tests/unit/` (fast, isolated)
- **Integration tests**: `backend/tests/integration/` (multi-component)
- **E2E tests**: `backend/tests/e2e/` (full frozen executable)
- **Performance tests**: `backend/tests/performance/` (benchmarks)

**Frontend Tests:**
- **Component tests**: `frontend/src/components/__tests__/` (Vitest + React Testing Library)
- **E2E tests**: `frontend/playwright/e2e/` (Playwright)

**Test Naming Convention:**
```python
# Backend: test_function_when_condition_then_expected
def test_get_employees_when_filtered_by_level_then_returns_matching_employees():
    pass

# Frontend: describe > it pattern
describe('EmployeeCard', () => {
  it('displays employee name when rendered', () => {
    // ...
  })
})
```

## Related Documentation

- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) - Complete system design
- [internal-docs/design-system/](../design-system/) - UI design patterns
- [internal-docs/testing/](../testing/) - Testing strategies
- [BUILD.md](../../BUILD.md) - Build instructions
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Deployment guide
