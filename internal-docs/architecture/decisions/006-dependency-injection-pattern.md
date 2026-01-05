# ADR-006: Dependency Injection Pattern for Database Access

**Status:** ✅ Accepted
**Date:** 2026-01-05
**Tags:** #backend #architecture #testing #patterns

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Use Dependency Injection (DI) instead of global singletons for database and service access | Global `db_manager` singleton breaks test isolation, violates SOLID principles, and creates hidden dependencies | Improved testability, explicit dependencies, follows SOLID principles (especially DIP) |

## When to Reference This ADR

- When creating new API endpoints or services
- When refactoring existing code that uses `db_manager` global
- When writing tests that need to mock database operations
- When adding new repository or service classes
- When experiencing test flakiness due to shared state

## Problem Statement

The current codebase uses a global singleton `db_manager` for database access, which creates several issues:

### Current Anti-Pattern

```python
# backend/database.py
db_manager = DatabaseManager()  # Global singleton

# backend/api/session.py
from backend.database import db_manager  # Import global

@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    return db_manager.get_session(session_id)  # Hidden dependency
```

### Issues with Global Singleton

1. **Breaks Test Isolation**: Global state persists between tests, causing flaky tests
2. **Violates Dependency Inversion Principle**: High-level modules depend on low-level implementation details
3. **Tight Coupling**: Impossible to swap database implementations
4. **Hidden Dependencies**: Functions appear to have no database dependency but access it via global
5. **Difficult Mocking**: Cannot easily mock database for unit tests

## Decision

**Adopt Dependency Injection pattern using FastAPI's `Depends()` mechanism for all database and service access.**

### Implementation Pattern

```python
# backend/dependencies.py
"""Dependency injection providers for the application."""

from backend.database import DatabaseManager
from backend.repositories.session_repository import SessionRepository
from backend.repositories.employee_repository import EmployeeRepository

# Database connection lifecycle
def get_db_manager() -> DatabaseManager:
    """
    Provide database manager instance.

    In future, this can be enhanced to support connection pooling,
    transaction management, or multiple database connections.
    """
    return DatabaseManager()

# Repository factories
def get_session_repository(
    db: DatabaseManager = Depends(get_db_manager)
) -> SessionRepository:
    """Provide session repository with injected database."""
    return SessionRepository(db)

def get_employee_repository(
    db: DatabaseManager = Depends(get_db_manager)
) -> EmployeeRepository:
    """Provide employee repository with injected database."""
    return EmployeeRepository(db)

# Service factories
def get_session_service(
    session_repo: SessionRepository = Depends(get_session_repository),
    employee_repo: EmployeeRepository = Depends(get_employee_repository)
) -> SessionService:
    """Provide session service with injected repositories."""
    return SessionService(session_repo, employee_repo)
```

### Usage in API Layer

```python
# backend/api/session.py
from fastapi import APIRouter, Depends
from backend.dependencies import get_session_service
from backend.services.session_service import SessionService

router = APIRouter()

@router.get("/sessions/{session_id}")
def get_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service)
):
    """
    Get session by ID.

    Dependencies are explicitly declared and automatically injected by FastAPI.
    """
    return session_service.get_session(session_id)

@router.post("/sessions")
def create_session(
    data: SessionCreate,
    session_service: SessionService = Depends(get_session_service)
):
    """Create new session with injected service."""
    return session_service.create_session(data)
```

### Usage in Service Layer

```python
# backend/services/session_service.py
class SessionService:
    """
    Session business logic service.

    Dependencies are explicitly declared in constructor,
    making them visible and testable.
    """

    def __init__(
        self,
        session_repo: SessionRepository,
        employee_repo: EmployeeRepository
    ):
        self.session_repo = session_repo
        self.employee_repo = employee_repo

    def get_session(self, session_id: str) -> Session:
        """Get session with explicit repository dependency."""
        session = self.session_repo.find_by_id(session_id)
        if not session:
            raise NotFoundError("Session", session_id)
        return session
```

### Testing with DI

```python
# tests/test_session_api.py
import pytest
from unittest.mock import Mock
from backend.services.session_service import SessionService

def test_get_session_success():
    """Test with mocked dependencies - no database needed."""
    # Arrange
    mock_repo = Mock()
    mock_repo.find_by_id.return_value = Session(id="sess-1", name="Test")
    service = SessionService(session_repo=mock_repo, employee_repo=Mock())

    # Act
    result = service.get_session("sess-1")

    # Assert
    assert result.id == "sess-1"
    mock_repo.find_by_id.assert_called_once_with("sess-1")

def test_get_session_api_endpoint(client, monkeypatch):
    """Test API endpoint with dependency override."""
    # Arrange
    mock_service = Mock()
    mock_service.get_session.return_value = Session(id="sess-1", name="Test")

    # Override dependency
    def override_session_service():
        return mock_service

    app.dependency_overrides[get_session_service] = override_session_service

    # Act
    response = client.get("/sessions/sess-1")

    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == "sess-1"
```

## Key Constraints and Rules

### Mandatory Rules

1. **No Global Instances**: Never create global instances of DatabaseManager, repositories, or services
2. **Explicit Dependencies**: All dependencies must be declared in constructor or function parameters
3. **Use FastAPI Depends**: Always use `Depends()` for dependency injection in API routes
4. **Test Overrides**: Use `app.dependency_overrides` for testing, never mock global state

### Architecture Layers

```
┌─────────────────────────────────────────────┐
│ API Layer (FastAPI Routes)                 │
│ - Uses Depends() to inject services        │
│ - No direct database or repository access  │
└─────────────────┬───────────────────────────┘
                  │ Depends()
                  ▼
┌─────────────────────────────────────────────┐
│ Service Layer (Business Logic)             │
│ - Receives dependencies via constructor    │
│ - No database access, uses repositories    │
└─────────────────┬───────────────────────────┘
                  │ Constructor injection
                  ▼
┌─────────────────────────────────────────────┐
│ Repository Layer (Data Access)             │
│ - Receives DatabaseManager via constructor │
│ - Encapsulates all SQL and queries         │
└─────────────────┬───────────────────────────┘
                  │ Constructor injection
                  ▼
┌─────────────────────────────────────────────┐
│ Database Layer (DatabaseManager)           │
│ - Connection management                     │
│ - Transaction handling                      │
└─────────────────────────────────────────────┘
```

## Benefits

- ✅ **Test Isolation**: Each test gets fresh dependencies, no shared state
- ✅ **Explicit Dependencies**: Clear what each component needs
- ✅ **SOLID Compliance**: Follows Dependency Inversion Principle
- ✅ **Easy Mocking**: Replace dependencies with mocks for unit tests
- ✅ **Flexible Architecture**: Can swap implementations without changing callers
- ✅ **FastAPI Integration**: Leverages framework's built-in DI system

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Simple global access** | Explicit dependencies, testability | FastAPI `Depends()` makes it ergonomic |
| **Less boilerplate in simple cases** | Clear architecture, SOLID principles | Dependency factories reduce repetition |
| **Slightly more verbose** | Self-documenting code | IDE autocomplete helps with parameters |

## Migration Strategy

### Phase 1: Create Dependency Providers (Week 1)

1. Create `backend/dependencies.py` with dependency factories
2. Define `get_db_manager()`, `get_*_repository()`, `get_*_service()` functions
3. No breaking changes yet - parallel infrastructure

### Phase 2: Migrate API Layer (Week 2)

1. Update one API router at a time (e.g., `session.py`)
2. Add `Depends()` parameters to route handlers
3. Remove `from backend.database import db_manager` imports
4. Test each router thoroughly before moving to next

### Phase 3: Migrate Service Layer (Week 3)

1. Refactor services to accept dependencies in constructor
2. Update service instantiation to use dependency factories
3. Remove any remaining global singleton usage

### Phase 4: Remove Global Singleton (Week 4)

1. Delete `db_manager = DatabaseManager()` global instance
2. Update all tests to use dependency overrides
3. Verify no remaining imports of global `db_manager`

## Related Decisions

- See [ADR-007](007-repository-pattern.md) for data access layer pattern
- See [ADR-008](008-single-responsibility-principle.md) for service design guidelines
- See [GUIDELINES.md](../GUIDELINES.md#dependency-injection) for detailed examples

## References

- [FastAPI Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [Testing with Dependency Injection](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
- [Martin Fowler - Inversion of Control](https://martinfowler.com/bliki/InversionOfControl.html)

## Related GitHub Issues

- #234: Refactor global singleton database manager to use dependency injection
