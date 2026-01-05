# ADR-007: Repository Pattern for Data Access Layer

**Status:** ✅ Accepted
**Date:** 2026-01-05
**Tags:** #backend #architecture #database #patterns

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Implement Repository Pattern to separate data access from business logic | Service layer currently contains direct SQL queries, violating separation of concerns | Clean architecture, testable services, reusable queries, schema change isolation |

## When to Reference This ADR

- When adding new database queries or data access logic
- When creating new services that need database access
- When refactoring services that contain SQL queries
- When experiencing difficulty testing business logic due to database coupling
- When schema changes require updates across multiple services

## Problem Statement

The current codebase mixes business logic with data access, making services difficult to test and maintain:

### Current Anti-Pattern

```python
# backend/services/session_manager.py
class SessionManager:
    def get_employees_in_box(self, box_id: str):
        # Business logic directly accessing database
        cursor = self.db_manager.connection.cursor()
        cursor.execute("""
            SELECT * FROM employees
            WHERE session_id = ? AND box_id = ?
        """, (self.session_id, box_id))
        return cursor.fetchall()  # Returns raw tuples, not domain objects

    def calculate_distribution(self):
        # SQL embedded in business logic
        conn = self.db_manager.connection
        query = """
            SELECT box_id, COUNT(*) as count
            FROM employees
            WHERE session_id = ?
            GROUP BY box_id
        """
        results = conn.execute(query, (self.session_id,)).fetchall()
        # ... business logic continues with raw SQL results
```

### Issues with Current Approach

1. **Tight Coupling**: Services directly depend on database schema
2. **Poor Testability**: Cannot test business logic without database
3. **Duplicate Queries**: Same queries repeated across services
4. **Schema Changes Cascade**: Database changes break multiple services
5. **Mixed Concerns**: Business logic intertwined with data access
6. **No Query Reusability**: Cannot reuse common queries

## Decision

**Implement Repository Pattern with clear separation between data access and business logic.**

### Repository Layer Architecture

```python
# backend/repositories/base_repository.py
"""Base repository with common CRUD operations."""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')

class BaseRepository(Generic[T], ABC):
    """
    Abstract base repository defining common operations.

    All concrete repositories should inherit from this base.
    """

    def __init__(self, db: DatabaseManager):
        self.db = db

    @abstractmethod
    def find_by_id(self, id: str) -> Optional[T]:
        """Find entity by ID."""
        pass

    @abstractmethod
    def find_all(self) -> List[T]:
        """Find all entities."""
        pass

    @abstractmethod
    def save(self, entity: T) -> T:
        """Save entity (insert or update)."""
        pass

    @abstractmethod
    def delete(self, id: str) -> bool:
        """Delete entity by ID."""
        pass

# backend/repositories/employee_repository.py
"""Employee data access repository."""

from typing import List, Optional, Dict
from backend.models.employee import Employee
from backend.repositories.base_repository import BaseRepository

class EmployeeRepository(BaseRepository[Employee]):
    """
    Repository for employee data access.

    Encapsulates all SQL queries related to employees.
    """

    def find_by_id(self, employee_id: str) -> Optional[Employee]:
        """Find employee by ID."""
        cursor = self.db.connection.cursor()
        cursor.execute(
            "SELECT * FROM employees WHERE id = ?",
            (employee_id,)
        )
        row = cursor.fetchone()
        return self._map_to_employee(row) if row else None

    def find_by_session(self, session_id: str) -> List[Employee]:
        """Find all employees in a session."""
        cursor = self.db.connection.cursor()
        cursor.execute(
            "SELECT * FROM employees WHERE session_id = ? ORDER BY name",
            (session_id,)
        )
        return [self._map_to_employee(row) for row in cursor.fetchall()]

    def find_by_session_and_box(
        self,
        session_id: str,
        box_id: str
    ) -> List[Employee]:
        """
        Find employees in specific box within a session.

        Domain-specific query encapsulated in repository.
        """
        cursor = self.db.connection.cursor()
        cursor.execute("""
            SELECT * FROM employees
            WHERE session_id = ? AND box_id = ?
            ORDER BY name
        """, (session_id, box_id))
        return [self._map_to_employee(row) for row in cursor.fetchall()]

    def get_box_distribution(self, session_id: str) -> Dict[str, int]:
        """
        Get count of employees per box in a session.

        Analytics query encapsulated and reusable.
        """
        cursor = self.db.connection.cursor()
        cursor.execute("""
            SELECT box_id, COUNT(*) as count
            FROM employees
            WHERE session_id = ?
            GROUP BY box_id
        """, (session_id,))
        return {row['box_id']: row['count'] for row in cursor.fetchall()}

    def save(self, employee: Employee) -> Employee:
        """Save employee (insert or update)."""
        cursor = self.db.connection.cursor()

        if self.find_by_id(employee.id):
            # Update existing
            cursor.execute("""
                UPDATE employees
                SET name = ?, box_id = ?, performance = ?, potential = ?
                WHERE id = ?
            """, (
                employee.name,
                employee.box_id,
                employee.performance,
                employee.potential,
                employee.id
            ))
        else:
            # Insert new
            cursor.execute("""
                INSERT INTO employees (id, session_id, name, box_id, performance, potential)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                employee.id,
                employee.session_id,
                employee.name,
                employee.box_id,
                employee.performance,
                employee.potential
            ))

        self.db.connection.commit()
        return employee

    def delete(self, employee_id: str) -> bool:
        """Delete employee by ID."""
        cursor = self.db.connection.cursor()
        cursor.execute("DELETE FROM employees WHERE id = ?", (employee_id,))
        self.db.connection.commit()
        return cursor.rowcount > 0

    def _map_to_employee(self, row) -> Employee:
        """
        Map database row to Employee domain object.

        Encapsulates mapping logic, isolating schema changes.
        """
        return Employee(
            id=row['id'],
            session_id=row['session_id'],
            name=row['name'],
            box_id=row['box_id'],
            performance=row['performance'],
            potential=row['potential']
        )
```

### Usage in Service Layer

```python
# backend/services/session_service.py
"""Session business logic service - no SQL!"""

class SessionService:
    """
    Pure business logic - delegates all data access to repositories.
    """

    def __init__(
        self,
        employee_repo: EmployeeRepository,
        event_service: EventService
    ):
        self.employee_repo = employee_repo
        self.event_service = event_service

    def get_employees_in_box(
        self,
        session_id: str,
        box_id: str
    ) -> List[Employee]:
        """
        Get employees in a box.

        Pure business logic - repository handles data access.
        """
        # Data access delegated to repository
        employees = self.employee_repo.find_by_session_and_box(
            session_id,
            box_id
        )

        # Business logic: track the view event
        self.event_service.track_event(
            session_id=session_id,
            event_type=EventType.BOX_VIEWED,
            data={'box_id': box_id, 'count': len(employees)}
        )

        return employees

    def calculate_box_distribution(self, session_id: str) -> Dict[str, int]:
        """
        Calculate employee distribution across boxes.

        Repository provides the query, service adds business logic.
        """
        distribution = self.employee_repo.get_box_distribution(session_id)

        # Business logic: validate distribution
        total = sum(distribution.values())
        if total == 0:
            raise BusinessRuleError(
                "empty_session",
                "Cannot calculate distribution for empty session"
            )

        return distribution
```

### Testing with Repository Pattern

```python
# tests/unit/test_session_service.py
"""Unit tests for session service - no database needed!"""

import pytest
from unittest.mock import Mock
from backend.services.session_service import SessionService

def test_get_employees_in_box():
    """Test business logic without database."""
    # Arrange
    mock_repo = Mock()
    mock_repo.find_by_session_and_box.return_value = [
        Employee(id="emp-1", name="Alice"),
        Employee(id="emp-2", name="Bob")
    ]
    mock_event_service = Mock()

    service = SessionService(
        employee_repo=mock_repo,
        event_service=mock_event_service
    )

    # Act
    employees = service.get_employees_in_box("sess-1", "top_right")

    # Assert
    assert len(employees) == 2
    mock_repo.find_by_session_and_box.assert_called_once_with(
        "sess-1", "top_right"
    )
    mock_event_service.track_event.assert_called_once()

# tests/integration/test_employee_repository.py
"""Integration tests for repository - tests data access only."""

def test_find_by_session_and_box(test_db):
    """Test repository query against real database."""
    # Arrange
    repo = EmployeeRepository(test_db)
    # ... seed test data

    # Act
    employees = repo.find_by_session_and_box("sess-1", "top_right")

    # Assert
    assert len(employees) == 2
    assert all(e.box_id == "top_right" for e in employees)
```

## Key Constraints and Rules

### Mandatory Rules

1. **No SQL in Services**: Service layer must never contain SQL queries
2. **Repository Encapsulation**: All database access goes through repositories
3. **Domain Objects**: Repositories return domain objects, never raw tuples/dicts
4. **Single Responsibility**: Each repository manages one aggregate root
5. **Dependency Injection**: Repositories injected via DI, never instantiated directly

### Repository Responsibilities

**Repositories SHOULD:**
- ✅ Execute SQL queries and return domain objects
- ✅ Encapsulate data mapping logic
- ✅ Provide query methods for common access patterns
- ✅ Handle database-specific error translation
- ✅ Manage transactions for multi-step operations

**Repositories SHOULD NOT:**
- ❌ Contain business logic or validation rules
- ❌ Call other repositories (except for joins)
- ❌ Know about HTTP, API, or presentation concerns
- ❌ Make decisions based on business rules

### Architecture Layers

```
┌─────────────────────────────────────────────┐
│ API Layer (FastAPI Routes)                 │
│ - HTTP request/response handling            │
│ - No business logic or database access      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Service Layer (Business Logic)             │
│ - Pure business logic                       │
│ - Uses repositories for data access         │
│ - No SQL queries                            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Repository Layer (Data Access)             │ ← THIS ADR
│ - All SQL queries                           │
│ - Data mapping (DB ↔ Domain)               │
│ - Query encapsulation                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Database Layer (SQLite)                     │
│ - Connection management                     │
│ - Transaction handling                      │
└─────────────────────────────────────────────┘
```

## Benefits

- ✅ **Separation of Concerns**: Business logic separate from data access
- ✅ **Testability**: Mock repositories to test services without database
- ✅ **Reusability**: Common queries defined once, used everywhere
- ✅ **Maintainability**: Schema changes isolated to repositories
- ✅ **Clear Architecture**: Three-tier pattern (API → Service → Repository)
- ✅ **Domain-Driven**: Works with domain objects, not raw database records

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Direct database access in services** | Testable, maintainable services | Repositories provide clean abstraction |
| **Fewer lines of code (initially)** | Long-term maintainability | Base repository reduces boilerplate |
| **One less layer to understand** | Clear separation of concerns | Well-documented pattern |

## Repository Design Patterns

### Pattern 1: Aggregate Root Repository

Each repository manages one aggregate root (e.g., Session, Employee):

```python
class SessionRepository:
    """Manages Session aggregate root."""

    def find_with_employees(self, session_id: str) -> Session:
        """Load session with all related employees (aggregate)."""
        session = self.find_by_id(session_id)
        session.employees = self.employee_repo.find_by_session(session_id)
        return session
```

### Pattern 2: Query Object Pattern

For complex queries, use query objects:

```python
class EmployeeQuery:
    """Encapsulates complex employee queries."""

    def __init__(self, repo: EmployeeRepository):
        self.repo = repo

    def find_high_performers(self, session_id: str, threshold: float):
        """Complex query encapsulated in query object."""
        # Implementation...
```

### Pattern 3: Specification Pattern

For dynamic queries with multiple filters:

```python
class EmployeeSpecification:
    """Specification for employee queries."""

    def __init__(self):
        self.filters = []

    def by_box(self, box_id: str):
        self.filters.append(("box_id", box_id))
        return self

    def by_performance_above(self, threshold: float):
        self.filters.append(("performance", ">", threshold))
        return self

    def build_query(self) -> str:
        # Build SQL from specifications
        pass
```

## Migration Strategy

### Phase 1: Create Repository Infrastructure (Week 1)

1. Create `backend/repositories/` directory
2. Implement `BaseRepository` abstract class
3. Create first repository (e.g., `EmployeeRepository`)
4. Add repository integration tests

### Phase 2: Migrate Services Incrementally (Weeks 2-3)

1. Start with one service (e.g., `SessionService`)
2. Extract all SQL to appropriate repository
3. Update service to use repository via DI
4. Update tests to mock repository
5. Repeat for each service

### Phase 3: Remove Direct Database Access (Week 4)

1. Search for remaining SQL in service layer
2. Move to repositories or delete if duplicate
3. Update all service tests to use mocks
4. Add linting rule to prevent SQL in services

## Related Decisions

- See [ADR-006](006-dependency-injection-pattern.md) for DI pattern
- See [ADR-008](008-single-responsibility-principle.md) for service design
- See [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md#data-layer) for overall architecture

## References

- [Martin Fowler - Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Domain-Driven Design - Repositories](https://www.domainlanguage.com/ddd/reference/)
- [Repository Pattern in Python](https://www.cosmicpython.com/book/chapter_02_repository.html)

## Related GitHub Issues

- #241: Implement repository pattern to remove direct SQL from service layer
