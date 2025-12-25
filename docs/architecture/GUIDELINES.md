# 9Boxer Architectural Guidelines

**Last Updated**: 2025-12-25  
**Version**: 1.0  
**Authority**: This document is authoritative for architectural decisions. However, **docs/facts.json is the ultimate source of truth** for factual information about the architecture.

## Purpose

This document provides architectural guidelines for all developers and agents working on the 9Boxer application. It helps prevent architectural drift and ensures consistency across changes made by multiple contributors.

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Design Principles](#design-principles)
3. [Technology Stack Guidelines](#technology-stack-guidelines)
4. [Code Organization](#code-organization)
5. [Quality Standards](#quality-standards)
6. [Security Requirements](#security-requirements)
7. [Performance Guidelines](#performance-guidelines)
8. [Testing Strategy](#testing-strategy)
9. [Documentation Requirements](#documentation-requirements)
10. [Common Patterns](#common-patterns)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Core Architecture

### System Overview

9Boxer is a **standalone desktop application** (NOT a web application) with the following architecture:

```
┌─────────────────────────────────────────┐
│         Electron Application            │
│  ┌───────────────────────────────────┐  │
│  │   React Frontend (TypeScript)     │  │
│  │   - Material-UI Components        │  │
│  │   - Zustand State Management      │  │
│  │   - Axios HTTP Client             │  │
│  └───────────────┬───────────────────┘  │
│                  │ HTTP (localhost:8000) │
│  ┌───────────────▼───────────────────┐  │
│  │   FastAPI Backend (Python)        │  │
│  │   - SQLite Database               │  │
│  │   - PyInstaller Bundled           │  │
│  │   - Runs as Subprocess            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Key Characteristics**:
- Frontend and backend are separate processes
- Communication via HTTP over localhost
- Backend bundled as standalone executable (PyInstaller)
- No external dependencies required at runtime
- All data stored locally in SQLite

### Build Flow

**CRITICAL**: Backend MUST be built before frontend:

```
1. Backend Build → backend/dist/ninebox/ninebox.exe
   Tool: PyInstaller
   Command: backend/scripts/build_executable.{sh,bat}

2. Frontend Build → frontend/release/
   Tool: Electron Builder
   Command: npm run electron:build
   Includes: React app + Electron + Backend executable
```

## Design Principles

### 1. Standalone First
- **Everything runs locally** - no server deployment
- **Offline capable** - works without internet connection
- **Self-contained** - all dependencies bundled
- **No installation prerequisites** - except the installer itself

### 2. Clean Separation of Concerns
- **Frontend**: UI, user interaction, presentation logic
- **Backend**: Business logic, data access, file processing
- **Electron**: Desktop integration, IPC, process management
- **Each layer has clear boundaries** - no mixing of responsibilities

### 3. Type Safety Everywhere
- **Python**: 100% type annotation coverage on all functions
- **TypeScript**: Strict mode enabled, no `any` types
- **Runtime validation**: Use Pydantic models for API contracts
- **Type checking**: Both mypy and pyright must pass

### 4. Test-Driven Quality
- **Unit tests**: Cover individual functions/components
- **Integration tests**: Cover API endpoints and workflows
- **E2E tests**: Cover user scenarios in Electron
- **Coverage threshold**: >80% for backend, aim for >70% frontend

### 5. Security by Default
- **Context isolation** enabled in Electron
- **No nodeIntegration** in renderer process
- **Input validation** on all API endpoints
- **SQL injection prevention** via SQLAlchemy ORM
- **No secrets in code** - use environment variables

### 6. Performance Conscious
- **Fast startup** - show splash screen within 2 seconds
- **Responsive UI** - use async operations for heavy tasks
- **Efficient queries** - optimize database access
- **Reasonable memory** - monitor bundle size (~300MB is acceptable)

## Technology Stack Guidelines

### Python Backend (FastAPI)

**Framework**: FastAPI 0.100+
**Python Version**: 3.10+

**Required Patterns**:
```python
# ✅ GOOD: Type annotations on all functions
from typing import Optional, Any

def process_employee(
    employee_id: str,
    department: Optional[str] = None
) -> dict[str, Any]:
    """Process employee data."""
    pass

# ❌ BAD: Missing type annotations
def process_employee(employee_id, department=None):
    pass
```

**Dependency Injection**:
```python
# ✅ GOOD: Use FastAPI dependency injection
from fastapi import Depends
from typing import Annotated
from collections.abc import Generator

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/employees/{id}")
async def get_employee(
    id: str,
    db: Annotated[Session, Depends(get_db)]
) -> Employee:
    return db.query(Employee).filter_by(id=id).first()
```

**Error Handling**:
```python
# ✅ GOOD: Structured error handling
from fastapi import HTTPException

@app.post("/employees")
async def create_employee(employee: EmployeeCreate) -> Employee:
    try:
        return service.create_employee(employee)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### React Frontend (TypeScript)

**Framework**: React 18+
**State Management**: Zustand (NOT Redux)
**UI Library**: Material-UI (MUI) v5+

**Component Patterns**:
```typescript
// ✅ GOOD: Typed functional components
import { FC } from 'react';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (id: string) => void;
}

export const EmployeeCard: FC<EmployeeCardProps> = ({ employee, onEdit }) => {
  return <Card>...</Card>;
};

// ❌ BAD: Untyped components
export const EmployeeCard = ({ employee, onEdit }) => {
  return <Card>...</Card>;
};
```

**State Management**:
```typescript
// ✅ GOOD: Zustand store with types
import { create } from 'zustand';

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  fetchEmployees: () => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  loading: false,
  fetchEmployees: async () => {
    set({ loading: true });
    const employees = await api.getEmployees();
    set({ employees, loading: false });
  },
  updateEmployee: async (id, data) => {
    await api.updateEmployee(id, data);
    await get().fetchEmployees();
  }
}));
```

**API Calls**:
```typescript
// ✅ GOOD: Centralized API service
// src/services/api.ts
class ApiService {
  private baseUrl = 'http://localhost:8000';

  async getEmployees(): Promise<Employee[]> {
    const response = await axios.get(`${this.baseUrl}/employees`);
    return response.data;
  }
}

export const api = new ApiService();
```

### Electron Integration

**Security Configuration**:
```typescript
// ✅ GOOD: Secure Electron configuration
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,      // Required
    nodeIntegration: false,       // Required
    sandbox: true,                // Required
    preload: path.join(__dirname, 'preload.js')
  }
});
```

**IPC Communication**:
```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// ✅ GOOD: Expose only specific, safe APIs
contextBridge.exposeInMainWorld('electron', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data: string) => ipcRenderer.invoke('dialog:saveFile', data)
});

// ❌ BAD: Exposing entire ipcRenderer
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer  // Dangerous!
});
```

## Code Organization

### Monorepo Structure

```
9boxer/
├── .venv/                    # Python virtual environment (backend + tools)
├── backend/
│   ├── src/ninebox/          # Backend source code
│   ├── tests/                # Backend tests
│   └── build_config/         # PyInstaller configuration
├── frontend/
│   ├── src/                  # React source code
│   ├── electron/             # Electron main/preload/renderer
│   └── node_modules/         # Node.js dependencies
├── docs/                     # Permanent documentation
│   ├── facts.json            # SOURCE OF TRUTH
│   └── architecture/         # Architectural documentation
├── agent-tmp/                # Temporary agent workspace (gitignored)
├── agent-projects/           # Active agent projects
└── tools/                    # Build and automation scripts
```

### Backend Structure

```
backend/src/ninebox/
├── main.py                   # Application entry point
├── api/
│   ├── routes/               # API route handlers
│   ├── models/               # Pydantic request/response models
│   └── dependencies.py       # FastAPI dependencies
├── core/
│   ├── config.py             # Configuration management
│   ├── database.py           # Database connection
│   └── security.py           # Security utilities
├── services/                 # Business logic layer
├── repositories/             # Data access layer
└── models/                   # SQLAlchemy models
```

### Frontend Structure

```
frontend/src/
├── App.tsx                   # Root component
├── components/               # Reusable components
├── pages/                    # Page components
├── services/                 # API and external services
├── stores/                   # Zustand stores
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
└── utils/                    # Utility functions
```

## Quality Standards

### Code Quality Gates

All code must pass these checks before commit:

```bash
# Backend
ruff format .           # Formatting
ruff check .            # Linting
mypy backend/src/       # Type checking (mypy)
pyright                 # Type checking (pyright)
bandit -r backend/src/  # Security scanning
pytest --cov=backend/src --cov-fail-under=80  # Tests with coverage

# Frontend
npm run format          # Prettier
npm run lint            # ESLint
npm run type-check      # TypeScript
npm test                # Vitest
```

**Convenience command**:
```bash
make check-all          # Runs all backend checks
```

### Type Annotation Requirements

**Python - MANDATORY**:
- ALL function parameters must be typed
- ALL function returns must be typed
- Use modern typing: `list[str]`, `dict[str, int]`, not `List[str]`, `Dict[str, int]`
- Use `Optional[T]` for nullable values
- Use `Any` only when absolutely necessary (document why)

**TypeScript - MANDATORY**:
- Strict mode enabled
- No `any` types (use `unknown` if type is truly unknown)
- Define interfaces for all data structures
- Use generics where appropriate

### Testing Standards

**Unit Tests**:
- Test individual functions in isolation
- Mock external dependencies
- Cover happy path and error cases
- Fast execution (< 100ms per test)

**Integration Tests**:
- Test API endpoints end-to-end
- Use real database (or test database)
- Verify request/response contracts
- Test authentication/authorization

**E2E Tests**:
- Test complete user workflows
- Run in actual Electron environment
- Verify UI interactions
- Test file system operations

## Security Requirements

### Input Validation

**Backend**:
```python
# ✅ GOOD: Pydantic validation
from pydantic import BaseModel, Field, validator

class EmployeeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
    performance: int = Field(..., ge=1, le=9)

    @validator('email')
    def email_must_be_lowercase(cls, v: str) -> str:
        return v.lower()
```

**Frontend**:
```typescript
// ✅ GOOD: Input validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
}
```

### SQL Injection Prevention

```python
# ✅ GOOD: Use SQLAlchemy ORM
employee = db.query(Employee).filter_by(id=employee_id).first()

# ❌ BAD: Raw SQL with string interpolation
db.execute(f"SELECT * FROM employees WHERE id = '{employee_id}'")

# ✅ ACCEPTABLE: Raw SQL with parameters
db.execute("SELECT * FROM employees WHERE id = :id", {"id": employee_id})
```

### Authentication and Authorization

```python
# ✅ GOOD: Use dependency injection for auth
from fastapi import Depends, HTTPException, status

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    # Validate token and return user
    return user

@app.get("/profile")
async def get_profile(user: User = Depends(get_current_user)) -> Profile:
    return user.profile
```

## Performance Guidelines

### Database Access

```python
# ✅ GOOD: Eager loading relationships
employees = db.query(Employee).options(
    joinedload(Employee.department),
    joinedload(Employee.manager)
).all()

# ❌ BAD: N+1 query problem
employees = db.query(Employee).all()
for emp in employees:
    dept = emp.department  # Triggers separate query each time
```

### Frontend Performance

```typescript
// ✅ GOOD: Memoization for expensive computations
import { useMemo } from 'react';

const sortedEmployees = useMemo(() => {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
}, [employees]);

// ✅ GOOD: Debouncing user input
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((query: string) => {
  fetchEmployees(query);
}, 300);
```

### Bundle Size

- Keep backend executable < 250MB
- Keep Electron installer < 350MB
- Lazy load large dependencies where possible
- Monitor bundle size in CI/CD

## Testing Strategy

### Test Organization

```
backend/tests/
├── unit/                     # Fast, isolated tests
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/              # API endpoint tests
│   └── api/
└── fixtures/                 # Shared test data

frontend/tests/
├── unit/                     # Component tests
│   └── components/
├── integration/              # Store/service tests
│   ├── stores/
│   └── services/
└── e2e/                      # Playwright tests
    └── scenarios/
```

### Test Naming Convention

```python
# ✅ GOOD: Descriptive test names
def test_create_employee_with_valid_data_returns_employee():
    pass

def test_create_employee_with_duplicate_email_raises_value_error():
    pass

# ❌ BAD: Vague test names
def test_create_employee():
    pass
```

## Documentation Requirements

### Code Documentation

**Python**:
```python
# ✅ GOOD: Google-style docstrings
def calculate_performance_score(
    potential: int,
    performance: int
) -> float:
    """Calculate overall performance score.

    Args:
        potential: Employee potential rating (1-3)
        performance: Employee performance rating (1-3)

    Returns:
        Calculated performance score (0.0-10.0)

    Raises:
        ValueError: If ratings are out of valid range
    """
    if not (1 <= potential <= 3 and 1 <= performance <= 3):
        raise ValueError("Ratings must be between 1 and 3")
    return (potential + performance) * 1.5
```

**TypeScript**:
```typescript
// ✅ GOOD: JSDoc comments
/**
 * Calculate the 9-box grid position
 * @param performance - Performance rating (1-3)
 * @param potential - Potential rating (1-3)
 * @returns Grid position (1-9)
 * @throws {Error} If ratings are invalid
 */
function calculateGridPosition(performance: number, potential: number): number {
  if (performance < 1 || performance > 3 || potential < 1 || potential > 3) {
    throw new Error('Invalid ratings');
  }
  return (potential - 1) * 3 + performance;
}
```

### Architectural Decisions

Use Architecture Decision Records (ADRs) for significant decisions:

```markdown
# ADR-001: Use Zustand for State Management

## Status
Accepted

## Context
We need a state management solution for React that is:
- Simple to understand and use
- TypeScript-friendly
- Lightweight (bundle size)
- No boilerplate

## Decision
Use Zustand instead of Redux.

## Consequences
- Simpler code with less boilerplate
- Better TypeScript integration
- Smaller bundle size
- Team needs to learn Zustand patterns
```

## Common Patterns

### Backend Service Pattern

```python
# services/employee_service.py
from typing import Optional

class EmployeeService:
    def __init__(self, repository: EmployeeRepository):
        self.repository = repository

    def create_employee(self, data: EmployeeCreate) -> Employee:
        """Create a new employee."""
        if self.repository.find_by_email(data.email):
            raise ValueError("Employee with this email already exists")
        return self.repository.create(data)

    def get_employee(self, id: str) -> Optional[Employee]:
        """Get employee by ID."""
        return self.repository.find_by_id(id)
```

### Frontend Hook Pattern

```typescript
// hooks/useEmployees.ts
import { useState, useEffect } from 'react';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoading(true);
        const data = await api.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  return { employees, loading, error };
}
```

## Anti-Patterns to Avoid

### Backend Anti-Patterns

❌ **Missing Type Annotations**
```python
# BAD
def process_data(data):
    return data.transform()
```

❌ **Direct Database Access in Routes**
```python
# BAD
@app.get("/employees")
async def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()  # Should use service layer
```

❌ **Hardcoded Configuration**
```python
# BAD
DATABASE_URL = "sqlite:///./data.db"  # Should use config
```

❌ **Catching All Exceptions Silently**
```python
# BAD
try:
    result = risky_operation()
except:  # Too broad, no logging
    pass
```

### Frontend Anti-Patterns

❌ **Prop Drilling**
```typescript
// BAD: Passing props through multiple levels
<Parent employee={employee}>
  <Child employee={employee}>
    <GrandChild employee={employee} />
  </Child>
</Parent>

// GOOD: Use Zustand store
const employee = useEmployeeStore(state => state.currentEmployee);
```

❌ **Using `any` Type**
```typescript
// BAD
function process(data: any) {
  return data.value;
}

// GOOD
interface Data {
  value: string;
}

function process(data: Data): string {
  return data.value;
}
```

❌ **Direct API Calls in Components**
```typescript
// BAD
function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/employees')
      .then(res => setEmployees(res.data));
  }, []);

  return <div>...</div>;
}

// GOOD
function EmployeeList() {
  const { employees, loading } = useEmployees();  // Custom hook
  return <div>...</div>;
}
```

### Electron Anti-Patterns

❌ **Disabling Security Features**
```typescript
// BAD
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,       // Dangerous!
    contextIsolation: false,     // Dangerous!
  }
});
```

❌ **Not Handling Backend Lifecycle**
```typescript
// BAD: Not cleaning up backend process
app.on('quit', () => {
  // Missing: kill backend process
});

// GOOD
let backendProcess: ChildProcess;

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
```

## Continuous Improvement

### Proposing Changes to Guidelines

If you identify a pattern that should be documented or a guideline that needs updating:

1. Create an issue labeled `architectural-guideline`
2. Provide rationale and examples
3. Link to code that demonstrates the pattern
4. Get review from architectural review board
5. Update this document via PR

### Metrics to Track

- Test coverage trends
- Type coverage (mypy/pyright reports)
- Bundle size over time
- Build time trends
- Quality gate pass rate

## References

- **Source of Truth**: [docs/facts.json](../facts.json)
- **Agent Profiles**: [.github/agents/](../../.github/agents/)
- **Architectural Review Board**: [.github/agents/architecture-review-board.md](../../.github/agents/architecture-review-board.md)
- **Development Workflow**: [AGENTS.md](../../AGENTS.md)
- **Quick Reference**: [docs/QUICK_REFERENCE.md](../QUICK_REFERENCE.md)

---

**Remember**: These guidelines exist to help maintain a consistent, high-quality codebase. When in doubt, refer to **docs/facts.json** as the ultimate source of truth, and consult with the architectural review board for guidance.
