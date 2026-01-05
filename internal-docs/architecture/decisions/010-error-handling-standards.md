# ADR-010: Error Handling Standards Across Backend Layers

**Status:** ✅ Accepted
**Date:** 2026-01-05
**Tags:** #backend #architecture #error-handling #api

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Standardize error handling using exception hierarchy and middleware | Inconsistent mix of exceptions, None returns, error dicts across layers | Predictable error responses, better UX, easier debugging, consistent HTTP status codes |

## When to Reference This ADR

- When implementing new API endpoints
- When service methods need to indicate errors
- When writing error handling code
- When translating errors between layers
- When experiencing inconsistent error responses from API

## Problem Statement

Error handling is inconsistent across layers, making debugging difficult and providing poor user experience:

### Current Anti-Patterns

```python
# Pattern 1: Raising HTTPException directly (API layer)
@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    session = db_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# Pattern 2: Returning error dict (Service layer)
def update_employee(employee_id, data):
    if not employee_id:
        return {"error": "Employee ID required"}  # Inconsistent!
    # How does caller know this is an error?

# Pattern 3: Returning None (Service layer)
def find_employee(employee_id):
    employee = db.query(...)
    if not employee:
        return None  # Caller must check None!
    return employee

# Pattern 4: Raising custom exceptions (Database layer)
def save_session(session):
    try:
        # ... save logic
    except sqlite3.Error as e:
        raise DatabaseError(f"Failed to save: {e}")  # Different exception type

# Pattern 5: Silent failures (Validation)
def validate_employee(data):
    if 'name' not in data:
        return False  # No indication of what's wrong!
    return True
```

### Issues with Current Approach

1. **Unpredictable**: Callers don't know what to expect (exception? None? dict?)
2. **Poor Error Messages**: Generic messages don't help users or developers
3. **Lost Context**: Error details lost as they propagate up layers
4. **Inconsistent HTTP Status**: Same errors return different status codes
5. **Difficult Testing**: Hard to test error handling systematically

## Decision

**Implement standardized exception hierarchy with centralized error handling middleware.**

### Exception Hierarchy

```python
# backend/exceptions.py
"""Standardized application exceptions."""

class AppError(Exception):
    """
    Base exception for all application errors.

    All custom exceptions should inherit from this base.
    Provides consistent structure for error handling.
    """

    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = 500,
        details: dict = None
    ):
        """
        Initialize application error.

        Args:
            message: Human-readable error message
            code: Machine-readable error code (e.g., "NOT_FOUND")
            status_code: HTTP status code to return
            details: Additional context for debugging
        """
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> dict:
        """Convert exception to API response format."""
        return {
            "error": {
                "message": self.message,
                "code": self.code,
                **self.details
            }
        }

# Domain-specific exceptions

class NotFoundError(AppError):
    """Resource not found (404)."""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} with id '{identifier}' not found",
            code="NOT_FOUND",
            status_code=404,
            details={"resource": resource, "id": identifier}
        )

class ValidationError(AppError):
    """Validation failed (400)."""

    def __init__(self, field: str, reason: str):
        super().__init__(
            message=f"Validation failed for '{field}': {reason}",
            code="VALIDATION_ERROR",
            status_code=400,
            details={"field": field, "reason": reason}
        )

class BusinessRuleError(AppError):
    """Business rule violation (422)."""

    def __init__(self, rule: str, reason: str):
        super().__init__(
            message=f"Business rule '{rule}' violated: {reason}",
            code="BUSINESS_RULE_VIOLATION",
            status_code=422,
            details={"rule": rule, "reason": reason}
        )

class ConflictError(AppError):
    """Resource conflict (409)."""

    def __init__(self, resource: str, reason: str):
        super().__init__(
            message=f"Conflict with {resource}: {reason}",
            code="CONFLICT",
            status_code=409,
            details={"resource": resource, "reason": reason}
        )

class DatabaseError(AppError):
    """Database operation failed (500)."""

    def __init__(self, operation: str, detail: str):
        super().__init__(
            message=f"Database {operation} failed: {detail}",
            code="DATABASE_ERROR",
            status_code=500,
            details={"operation": operation, "detail": detail}
        )

class AuthorizationError(AppError):
    """Not authorized to perform action (403)."""

    def __init__(self, action: str, resource: str):
        super().__init__(
            message=f"Not authorized to {action} {resource}",
            code="FORBIDDEN",
            status_code=403,
            details={"action": action, "resource": resource}
        )

class RateLimitError(AppError):
    """Rate limit exceeded (429)."""

    def __init__(self, retry_after: int):
        super().__init__(
            message=f"Rate limit exceeded. Retry after {retry_after} seconds.",
            code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details={"retry_after": retry_after}
        )
```

### Error Handling Middleware

```python
# backend/middleware/error_handler.py
"""Centralized error handling middleware."""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from backend.exceptions import AppError
import logging

logger = logging.getLogger(__name__)

def setup_error_handlers(app):
    """Setup all error handlers for the application."""

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        """
        Handle all AppError exceptions consistently.

        Provides uniform error response format.
        """
        logger.warning(
            f"Application error: {exc.code}",
            extra={
                "code": exc.code,
                "path": request.url.path,
                "method": request.method,
                "details": exc.details
            }
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "message": exc.message,
                    "code": exc.code,
                    "path": str(request.url.path),
                    **exc.details
                }
            }
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        """
        Catch-all for unexpected errors.

        Logs full exception details but returns generic message to user.
        """
        logger.exception(
            "Unexpected error occurred",
            exc_info=exc,
            extra={
                "path": request.url.path,
                "method": request.method
            }
        )

        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "message": "An unexpected error occurred. Please try again later.",
                    "code": "INTERNAL_ERROR",
                    "path": str(request.url.path)
                }
            }
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        """
        Handle Python ValueError as validation error.

        Converts standard Python exceptions to API format.
        """
        logger.warning(f"ValueError: {str(exc)}")

        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "message": str(exc),
                    "code": "VALIDATION_ERROR",
                    "path": str(request.url.path)
                }
            }
        )
```

### Usage in Service Layer

```python
# backend/services/employee_service.py
"""Employee service with standardized error handling."""

from backend.exceptions import (
    NotFoundError,
    ValidationError,
    BusinessRuleError,
    ConflictError
)

class EmployeeService:
    """Employee business logic with consistent error handling."""

    def get_employee(self, employee_id: str) -> Employee:
        """
        Get employee by ID.

        Raises:
            NotFoundError: If employee doesn't exist
        """
        employee = self.employee_repo.find_by_id(employee_id)
        if not employee:
            raise NotFoundError("Employee", employee_id)
        return employee

    def create_employee(
        self,
        session_id: str,
        data: EmployeeCreate
    ) -> Employee:
        """
        Create new employee.

        Raises:
            ValidationError: If data is invalid
            ConflictError: If employee with same ID already exists
            BusinessRuleError: If business rules violated
        """
        # Validation
        if not data.name or not data.name.strip():
            raise ValidationError(
                field="name",
                reason="Name is required and cannot be empty"
            )

        # Check for conflicts
        existing = self.employee_repo.find_by_employee_id(data.employee_id)
        if existing:
            raise ConflictError(
                resource="Employee",
                reason=f"Employee with ID '{data.employee_id}' already exists"
            )

        # Business rule validation
        session = self.session_repo.find_by_id(session_id)
        if session.is_closed:
            raise BusinessRuleError(
                rule="closed_session",
                reason="Cannot add employees to closed session"
            )

        # Create employee
        employee = Employee(
            id=generate_id(),
            session_id=session_id,
            **data.dict()
        )

        self.employee_repo.save(employee)
        return employee

    def update_employee(
        self,
        employee_id: str,
        data: EmployeeUpdate
    ) -> Employee:
        """
        Update employee.

        Raises:
            NotFoundError: If employee doesn't exist
            ValidationError: If update data is invalid
            BusinessRuleError: If employee is locked
        """
        employee = self.get_employee(employee_id)

        # Validation
        if data.name is not None and not data.name.strip():
            raise ValidationError(
                field="name",
                reason="Name cannot be empty"
            )

        # Business rule validation
        if employee.is_locked:
            raise BusinessRuleError(
                rule="employee_locked",
                reason="Cannot update locked employee during calibration"
            )

        # Apply updates
        for field, value in data.dict(exclude_unset=True).items():
            setattr(employee, field, value)

        self.employee_repo.save(employee)
        return employee
```

### Usage in API Layer

```python
# backend/api/employees.py
"""Employee API endpoints - no error handling needed!"""

from fastapi import APIRouter, Depends, status
from backend.dependencies import get_employee_service

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str,
    service: EmployeeService = Depends(get_employee_service)
):
    """
    Get employee by ID.

    No try/catch needed - middleware handles exceptions.
    """
    # Service raises NotFoundError if not found
    # Middleware converts to 404 JSON response automatically
    return service.get_employee(employee_id)

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: EmployeeCreate,
    service: EmployeeService = Depends(get_employee_service)
):
    """
    Create new employee.

    Service raises ValidationError, ConflictError, or BusinessRuleError.
    Middleware converts to appropriate HTTP responses.
    """
    return service.create_employee(data.session_id, data)

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    data: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service)
):
    """
    Update employee.

    Service handles all error cases, middleware converts to HTTP.
    """
    return service.update_employee(employee_id, data)
```

### Error Response Format

All errors return consistent JSON structure:

```json
{
  "error": {
    "message": "Employee with id 'emp-123' not found",
    "code": "NOT_FOUND",
    "path": "/api/employees/emp-123",
    "resource": "Employee",
    "id": "emp-123"
  }
}
```

## Key Constraints and Rules

### Mandatory Rules

1. **Always Raise Exceptions**: Service layer must raise exceptions, never return None or error dicts
2. **Use Typed Exceptions**: Use specific exception types (NotFoundError, ValidationError, etc.)
3. **No HTTPException in Services**: Services must not know about HTTP
4. **Middleware Handles All**: API layer should not catch exceptions (let middleware handle)
5. **Consistent Format**: All errors follow same JSON structure

### Exception Selection Guide

| Situation | Exception | HTTP Status |
|-----------|-----------|-------------|
| Resource not found | `NotFoundError` | 404 |
| Invalid input data | `ValidationError` | 400 |
| Business rule violated | `BusinessRuleError` | 422 |
| Resource already exists | `ConflictError` | 409 |
| Not authorized | `AuthorizationError` | 403 |
| Database failure | `DatabaseError` | 500 |
| Rate limit hit | `RateLimitError` | 429 |

### Error Message Guidelines

**Good Error Messages:**
- ✅ "Employee with id 'emp-123' not found"
- ✅ "Validation failed for 'email': Must be valid email address"
- ✅ "Cannot add employees to closed session"

**Bad Error Messages:**
- ❌ "Error occurred"
- ❌ "Invalid input"
- ❌ "Operation failed"

**Error messages should:**
1. Be specific about what went wrong
2. Include relevant identifiers
3. Suggest how to fix (when appropriate)
4. Be user-friendly (not stack traces)

## Benefits

- ✅ **Consistent Format**: All errors follow same structure
- ✅ **Clear Semantics**: Exception type indicates error category
- ✅ **Proper HTTP Status**: Each error maps to correct status code
- ✅ **Better Debugging**: Full context preserved in error
- ✅ **Client-Friendly**: Predictable error format for frontend
- ✅ **Centralized Logging**: Middleware logs all errors consistently
- ✅ **No Boilerplate**: API layer needs no try/catch blocks

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Direct control in API** | Centralized, consistent handling | Middleware provides flexibility |
| **Simple None returns** | Explicit error semantics | Exceptions are idiomatic Python |
| **Catching exceptions in API** | Cleaner API code | Middleware handles gracefully |

## Testing Error Handling

```python
# tests/unit/test_employee_service.py
import pytest
from backend.exceptions import NotFoundError, ValidationError, BusinessRuleError

def test_get_employee_not_found():
    """Test NotFoundError is raised when employee doesn't exist."""
    mock_repo = Mock()
    mock_repo.find_by_id.return_value = None
    service = EmployeeService(employee_repo=mock_repo)

    with pytest.raises(NotFoundError) as exc_info:
        service.get_employee("nonexistent-id")

    assert exc_info.value.status_code == 404
    assert "nonexistent-id" in str(exc_info.value)

def test_create_employee_validation_error():
    """Test ValidationError for invalid data."""
    service = EmployeeService(employee_repo=Mock(), session_repo=Mock())

    invalid_data = EmployeeCreate(
        session_id="sess-1",
        name="",  # Empty name - invalid!
        employee_id="emp-1"
    )

    with pytest.raises(ValidationError) as exc_info:
        service.create_employee("sess-1", invalid_data)

    assert exc_info.value.status_code == 400
    assert exc_info.value.details["field"] == "name"

def test_update_locked_employee():
    """Test BusinessRuleError for locked employee."""
    mock_repo = Mock()
    locked_employee = Employee(id="emp-1", is_locked=True)
    mock_repo.find_by_id.return_value = locked_employee

    service = EmployeeService(employee_repo=mock_repo)

    with pytest.raises(BusinessRuleError) as exc_info:
        service.update_employee("emp-1", EmployeeUpdate(name="New Name"))

    assert exc_info.value.status_code == 422
    assert "locked" in str(exc_info.value).lower()

# tests/integration/test_employee_api.py
def test_api_error_format(client):
    """Test API error response format."""
    response = client.get("/employees/nonexistent-id")

    assert response.status_code == 404
    data = response.json()

    # Verify consistent error format
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert data["error"]["message"]
    assert data["error"]["path"] == "/employees/nonexistent-id"
```

## Exception Translation

### Database Layer → Service Layer

```python
# backend/repositories/employee_repository.py
from backend.exceptions import DatabaseError
import sqlite3

class EmployeeRepository:
    """Repository with database error translation."""

    def save(self, employee: Employee) -> Employee:
        """
        Save employee, translating database errors.

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            cursor = self.db.connection.cursor()
            cursor.execute(...)
            self.db.connection.commit()
            return employee
        except sqlite3.IntegrityError as e:
            raise DatabaseError(
                operation="save employee",
                detail=f"Integrity constraint violated: {e}"
            )
        except sqlite3.Error as e:
            raise DatabaseError(
                operation="save employee",
                detail=str(e)
            )
```

### External API → Service Layer

```python
# backend/services/external_api_service.py
import httpx
from backend.exceptions import AppError

class ExternalAPIService:
    """Service calling external APIs with error translation."""

    async def fetch_employee_data(self, employee_id: str):
        """
        Fetch data from external API.

        Raises:
            NotFoundError: If employee not found in external system
            AppError: If external API fails
        """
        try:
            response = await self.client.get(f"/employees/{employee_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise NotFoundError("Employee", employee_id)
            raise AppError(
                message=f"External API error: {e.response.status_code}",
                code="EXTERNAL_API_ERROR",
                status_code=502,
                details={"external_status": e.response.status_code}
            )
        except httpx.RequestError as e:
            raise AppError(
                message="Failed to connect to external API",
                code="EXTERNAL_API_UNAVAILABLE",
                status_code=503
            )
```

## Migration Strategy

### Phase 1: Create Exception Infrastructure (Week 1)

1. Create `backend/exceptions.py` with exception hierarchy
2. Create `backend/middleware/error_handler.py`
3. Register middleware in FastAPI app
4. Create tests for exception handling

### Phase 2: Migrate Service Layer (Week 2)

1. Update services to raise exceptions instead of returning None/dicts
2. Replace `return None` with `raise NotFoundError(...)`
3. Replace error dicts with `raise ValidationError(...)`
4. Update service tests to expect exceptions

### Phase 3: Update API Layer (Week 3)

1. Remove try/catch blocks from API endpoints
2. Remove manual HTTPException raises
3. Let middleware handle all errors
4. Update API integration tests

### Phase 4: Clean Up (Week 4)

1. Remove old error handling patterns
2. Add linting rules to prevent old patterns
3. Document error handling standards
4. Train team on new approach

## Related Decisions

- See [ADR-008](008-single-responsibility-principle.md) for service design
- See [GUIDELINES.md](../GUIDELINES.md#error-handling) for detailed examples

## References

- [FastAPI Exception Handling](https://fastapi.tiangolo.com/tutorial/handling-errors/)
- [REST API Error Handling Best Practices](https://www.rfc-editor.org/rfc/rfc7807)
- [Python Exception Hierarchy](https://docs.python.org/3/library/exceptions.html#exception-hierarchy)

## Related GitHub Issues

- #253: Standardize error handling across all backend layers
