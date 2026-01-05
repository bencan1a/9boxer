# ADR-008: Single Responsibility Principle for Service Classes

**Status:** ✅ Accepted
**Date:** 2026-01-05
**Tags:** #backend #architecture #solid #patterns

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Enforce Single Responsibility Principle (SRP) for all service classes | God classes like SessionManager (739 lines, 7 responsibilities) are difficult to test, maintain, and understand | Focused services averaging 150-250 lines, clear ownership, easier testing, reduced coupling |

## When to Reference This ADR

- When creating new service classes
- When a service class exceeds 300 lines
- When a class has more than 5 public methods
- When experiencing difficulty testing a service
- When multiple developers conflict on the same service file
- When refactoring existing large classes

## Problem Statement

Large service classes with multiple responsibilities create maintenance nightmares:

### Current Anti-Pattern: God Class

```python
# backend/services/session_manager.py (739 lines!)
class SessionManager:
    """
    Does EVERYTHING related to sessions.

    Responsibilities:
    1. Session lifecycle (load, save, close, reopen)
    2. Employee management (add, remove, update)
    3. Drag & drop operations
    4. Event tracking
    5. Calibration operations
    6. State validation
    7. Change notification
    """

    def __init__(self):
        self.db_manager = db_manager
        self.session = None
        self.session_id = None
        self.employees = {}
        self.employee_order = []
        self.events = []
        self.change_callbacks = []
        self.calibration_settings = {}
        # ... 15+ instance variables

    # Responsibility 1: Session lifecycle (100 lines)
    def load_session(self, session_id): ...
    def save_session(self): ...
    def close_session(self): ...
    def reopen_session(self, session_id): ...

    # Responsibility 2: Employee management (150 lines)
    def add_employee(self, employee_data): ...
    def remove_employee(self, employee_id): ...
    def update_employee(self, employee_id, data): ...
    def get_employee(self, employee_id): ...

    # Responsibility 3: Drag & drop (200 lines)
    def handle_drop(self, employee_id, new_box, ...): ...
    def swap_employees(self, emp1_id, emp2_id): ...
    def validate_move(self, employee_id, target_box): ...

    # ... 30+ more methods spanning 7 different concerns
```

### Issues with God Classes

1. **Difficult to Test**: Must mock/setup everything to test one feature
2. **High Coupling**: Changes to one feature risk breaking others
3. **Merge Conflicts**: Multiple developers editing same large file
4. **Unclear Ownership**: Who is responsible for maintaining this?
5. **Cognitive Overload**: Too much to understand at once
6. **Violation of SRP**: Multiple reasons to change

## Decision

**Adopt Single Responsibility Principle: each service class should have one clear reason to change.**

### Service Decomposition Strategy

Break large classes into focused services based on cohesive responsibilities:

```python
# backend/services/session_service.py (150 lines)
"""Session lifecycle management - ONE responsibility."""

class SessionService:
    """
    Manages session lifecycle: create, load, save, close.

    Single Responsibility: Session state management
    Single Reason to Change: How sessions are persisted/loaded
    """

    def __init__(
        self,
        session_repo: SessionRepository,
        event_service: EventService
    ):
        self.session_repo = session_repo
        self.event_service = event_service

    def create_session(self, name: str, created_by: str) -> Session:
        """Create new session."""
        session = Session(
            id=generate_id(),
            name=name,
            created_by=created_by,
            created_at=datetime.utcnow()
        )

        self.session_repo.save(session)

        self.event_service.track_event(
            session_id=session.id,
            event_type=EventType.SESSION_CREATED,
            data={'name': name}
        )

        return session

    def load_session(self, session_id: str) -> Session:
        """Load existing session."""
        session = self.session_repo.find_by_id(session_id)
        if not session:
            raise NotFoundError("Session", session_id)

        self.event_service.track_event(
            session_id=session_id,
            event_type=EventType.SESSION_OPENED,
            data={}
        )

        return session

    def save_session(self, session: Session) -> Session:
        """Save session changes."""
        session.updated_at = datetime.utcnow()
        return self.session_repo.save(session)

    def close_session(self, session_id: str) -> None:
        """Close session."""
        session = self.load_session(session_id)
        session.status = SessionStatus.CLOSED
        session.closed_at = datetime.utcnow()
        self.session_repo.save(session)

        self.event_service.track_event(
            session_id=session_id,
            event_type=EventType.SESSION_CLOSED,
            data={}
        )

# backend/services/employee_service.py (200 lines)
"""Employee CRUD operations - ONE responsibility."""

class EmployeeService:
    """
    Manages employee operations: create, update, delete.

    Single Responsibility: Employee data management
    Single Reason to Change: How employees are managed
    """

    def __init__(
        self,
        employee_repo: EmployeeRepository,
        event_service: EventService,
        validator: EmployeeValidator
    ):
        self.employee_repo = employee_repo
        self.event_service = event_service
        self.validator = validator

    def create_employee(
        self,
        session_id: str,
        data: EmployeeCreate
    ) -> Employee:
        """Create new employee in session."""
        # Validation
        self.validator.validate_create(data)

        employee = Employee(
            id=generate_id(),
            session_id=session_id,
            **data.dict()
        )

        # Persistence
        self.employee_repo.save(employee)

        # Event tracking
        self.event_service.track_event(
            session_id=session_id,
            event_type=EventType.EMPLOYEE_CREATED,
            data={'employee_id': employee.id}
        )

        return employee

    def update_employee(
        self,
        employee_id: str,
        data: EmployeeUpdate
    ) -> Employee:
        """Update existing employee."""
        employee = self.employee_repo.find_by_id(employee_id)
        if not employee:
            raise NotFoundError("Employee", employee_id)

        # Validation
        self.validator.validate_update(employee, data)

        # Apply updates
        for field, value in data.dict(exclude_unset=True).items():
            setattr(employee, field, value)

        # Persistence
        self.employee_repo.save(employee)

        # Event tracking
        self.event_service.track_event(
            session_id=employee.session_id,
            event_type=EventType.EMPLOYEE_UPDATED,
            data={'employee_id': employee_id, 'fields': list(data.dict().keys())}
        )

        return employee

    def delete_employee(self, employee_id: str) -> None:
        """Delete employee."""
        employee = self.employee_repo.find_by_id(employee_id)
        if not employee:
            raise NotFoundError("Employee", employee_id)

        session_id = employee.session_id
        self.employee_repo.delete(employee_id)

        self.event_service.track_event(
            session_id=session_id,
            event_type=EventType.EMPLOYEE_DELETED,
            data={'employee_id': employee_id}
        )

# backend/services/box_operation_service.py (250 lines)
"""Box operations (drag & drop) - ONE responsibility."""

class BoxOperationService:
    """
    Manages box operations: move, swap employees between boxes.

    Single Responsibility: Box operation business rules
    Single Reason to Change: How employees move between boxes
    """

    def __init__(
        self,
        employee_service: EmployeeService,
        event_service: EventService,
        validator: BoxOperationValidator
    ):
        self.employee_service = employee_service
        self.event_service = event_service
        self.validator = validator

    def move_employee(
        self,
        session_id: str,
        employee_id: str,
        target_box: str
    ) -> MoveResult:
        """
        Move employee to target box.

        Business rules:
        - Target box must be valid
        - Employee cannot already be in target box
        - Box capacity limits must be respected
        """
        # Load employee
        employee = self.employee_service.get_employee(employee_id)

        # Validate move
        self.validator.validate_move(employee, target_box)

        # Record previous state
        previous_box = employee.box_id

        # Perform move
        employee = self.employee_service.update_employee(
            employee_id,
            EmployeeUpdate(box_id=target_box)
        )

        # Track event
        self.event_service.track_event(
            session_id=session_id,
            event_type=EventType.EMPLOYEE_MOVED,
            data={
                'employee_id': employee_id,
                'from_box': previous_box,
                'to_box': target_box
            }
        )

        return MoveResult(
            employee=employee,
            previous_box=previous_box,
            new_box=target_box
        )

    def swap_employees(
        self,
        session_id: str,
        employee1_id: str,
        employee2_id: str
    ) -> SwapResult:
        """Swap two employees' positions."""
        # Implementation focuses solely on swap business rules
        pass

# backend/services/calibration_service.py (100 lines)
"""Calibration operations - ONE responsibility."""

class CalibrationService:
    """
    Manages calibration operations.

    Single Responsibility: Calibration algorithm and analysis
    Single Reason to Change: How calibration is performed
    """

    def __init__(
        self,
        employee_repo: EmployeeRepository,
        config: CalibrationConfig
    ):
        self.employee_repo = employee_repo
        self.config = config

    def run_calibration(self, session_id: str) -> CalibrationResult:
        """Run calibration algorithm."""
        # Focused solely on calibration logic
        pass
```

## Key Constraints and Rules

### Service Size Guidelines

| Metric | Threshold | Action if Exceeded |
|--------|-----------|-------------------|
| **Lines of Code** | 300 lines | Consider splitting responsibilities |
| **Public Methods** | 10 methods | Likely doing too much |
| **Dependencies** | 5 dependencies | High coupling, refactor |
| **Instance Variables** | 8 variables | Managing too much state |
| **Reasons to Change** | 1 reason | Core principle of SRP |

### Responsibility Identification

Ask these questions to identify distinct responsibilities:

1. **What does this class do?** If answer contains "and", it has multiple responsibilities
2. **Why would it change?** Each reason to change = distinct responsibility
3. **Can I describe it in one sentence?** Should be possible without conjunctions
4. **Would different developers own different methods?** Sign of multiple responsibilities

### Service Naming Conventions

Service names should clearly indicate single responsibility:

- ✅ **Good**: `SessionService`, `EmployeeService`, `CalibrationService`
- ✅ **Good**: `BoxOperationService`, `EventService`, `NotificationService`
- ❌ **Bad**: `SessionManager` (what aspect of sessions?)
- ❌ **Bad**: `DataService` (what data?)
- ❌ **Bad**: `UtilityService` (utilities are not a responsibility)

### Method Composition Guidelines

Use **Composed Method Pattern** for complex operations:

```python
# ✅ GOOD: Main method delegates to focused helper methods
def export_session(self, session_id: str) -> bytes:
    """Export session - clear high-level flow."""
    session_data = self._gather_data(session_id)
    workbook = self._create_workbook()
    self._add_employee_sheet(workbook, session_data.employees)
    self._add_metadata_sheet(workbook, session_data.session)
    return self._generate_file(workbook)

# Each helper method is focused (10-20 lines)
def _gather_data(self, session_id: str) -> SessionExportData:
    """Gather export data."""
    # Focused on data gathering only
    pass

def _create_workbook(self) -> Workbook:
    """Create and configure workbook."""
    # Focused on workbook setup only
    pass

# ❌ BAD: One massive method doing everything (169 lines)
def export_session_to_excel(self, session_id: str) -> bytes:
    # ... 169 lines of mixed concerns
    pass
```

## Benefits

- ✅ **Easier Testing**: Mock only what's needed for specific functionality
- ✅ **Clear Ownership**: Each service has clear purpose and owner
- ✅ **Reduced Coupling**: Services depend only on what they need
- ✅ **Better Readability**: Small, focused classes easier to understand
- ✅ **Parallel Development**: Multiple developers can work without conflicts
- ✅ **Flexible Composition**: Compose services to build features
- ✅ **Easier Maintenance**: Changes isolated to specific services

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Single large class** | Multiple focused classes | Service composition patterns |
| **All code in one file** | Better organization | Clear service boundaries |
| **Direct method calls** | Loosely coupled services | Dependency injection |
| **Simple (initially)** | Maintainable long-term | Well-documented patterns |

## Refactoring Strategy: Strangler Fig Pattern

Migrate large classes gradually without breaking system:

### Phase 1: Create New Services (Week 1)

```python
# Create new focused services alongside existing god class
class SessionService:  # New focused service
    pass

class SessionManager:  # Old god class (still exists)
    pass
```

### Phase 2: Delegate from Old to New (Week 2)

```python
class SessionManager:  # Becomes facade
    def __init__(self):
        self.session_service = SessionService(...)  # Delegate to new

    def load_session(self, session_id):
        # Delegate to new service
        return self.session_service.load_session(session_id)
```

### Phase 3: Update API Layer (Week 3)

```python
# Update API endpoints one by one
@router.get("/sessions/{session_id}")
def get_session(
    session_id: str,
    session_service: SessionService = Depends(get_session_service)  # New
):
    return session_service.load_session(session_id)
```

### Phase 4: Remove Old Class (Week 4)

```python
# Once all endpoints migrated, delete SessionManager
# ✅ System never broken during migration
```

## Testing with SRP Services

```python
# Unit test for SessionService (focused on session lifecycle only)
def test_create_session():
    """Test focused on session creation only."""
    # Arrange - minimal mocks
    mock_repo = Mock()
    mock_event_service = Mock()
    service = SessionService(mock_repo, mock_event_service)

    # Act
    session = service.create_session("Test Session", "user-1")

    # Assert - test only session creation
    assert session.name == "Test Session"
    mock_repo.save.assert_called_once()
    mock_event_service.track_event.assert_called_once()

# Unit test for BoxOperationService (focused on box operations only)
def test_move_employee():
    """Test focused on move logic only."""
    # Arrange - mock only what's needed for moves
    mock_employee_service = Mock()
    mock_validator = Mock()
    service = BoxOperationService(
        mock_employee_service,
        Mock(),  # event service
        mock_validator
    )

    # Act
    result = service.move_employee("sess-1", "emp-1", "top_right")

    # Assert - test only move logic
    mock_validator.validate_move.assert_called_once()
    assert result.new_box == "top_right"
```

## Service Composition Patterns

### Pattern 1: Service Orchestration

One service coordinates multiple services:

```python
class SessionWorkflowService:
    """Orchestrates complex workflows."""

    def __init__(
        self,
        session_service: SessionService,
        employee_service: EmployeeService,
        event_service: EventService
    ):
        self.session_service = session_service
        self.employee_service = employee_service
        self.event_service = event_service

    def import_session_from_excel(
        self,
        file_path: str,
        created_by: str
    ) -> Session:
        """Orchestrate multi-step import workflow."""
        # 1. Create session
        session = self.session_service.create_session(
            name=f"Imported from {file_path}",
            created_by=created_by
        )

        # 2. Parse employees
        employees_data = self._parse_excel(file_path)

        # 3. Create employees
        for emp_data in employees_data:
            self.employee_service.create_employee(session.id, emp_data)

        # 4. Track import event
        self.event_service.track_event(
            session_id=session.id,
            event_type=EventType.SESSION_IMPORTED,
            data={'file': file_path, 'count': len(employees_data)}
        )

        return session
```

### Pattern 2: Service Facade

Simplify complex subsystem access:

```python
class SessionFacade:
    """Simplified interface to session subsystem."""

    def __init__(
        self,
        session_service: SessionService,
        employee_service: EmployeeService,
        box_service: BoxOperationService
    ):
        # Multiple services composed into simple interface
        self.session_service = session_service
        self.employee_service = employee_service
        self.box_service = box_service

    def get_complete_session(self, session_id: str) -> CompleteSession:
        """Get session with all related data."""
        session = self.session_service.load_session(session_id)
        employees = self.employee_service.get_all_employees(session_id)
        distribution = self.box_service.calculate_distribution(session_id)

        return CompleteSession(
            session=session,
            employees=employees,
            distribution=distribution
        )
```

## Related Decisions

- See [ADR-006](006-dependency-injection-pattern.md) for injecting services
- See [ADR-007](007-repository-pattern.md) for repository responsibilities
- See [GUIDELINES.md](../GUIDELINES.md#solid-principles) for SOLID guidelines

## References

- [Martin Fowler - Single Responsibility Principle](https://martinfowler.com/bliki/SingleResponsibilityPrinciple.html)
- [Robert C. Martin - SRP](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)
- [Refactoring - Composed Method](https://refactoring.guru/smells/long-method)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)

## Related GitHub Issues

- #237: Split SessionManager god class into focused services
- #256: Refactor complex export method into smaller focused methods
