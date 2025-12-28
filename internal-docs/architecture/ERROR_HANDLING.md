# Error Handling Patterns

**Purpose:** Agent-optimized error handling patterns for 9Boxer application
**Last Updated:** 2025-12-27
**Context:** Standalone desktop app (Electron + FastAPI), no network exposure, local-only

---

## Quick Rules

- **API routes MUST raise HTTPException** with appropriate status code (400/404/500)
- **Services MUST raise ValueError** for business logic errors (caught by API layer)
- **Frontend MUST use extractErrorMessage()** to normalize all errors
- **NEVER use bare `except:`** - Always specify exception type
- **NEVER fail silently** - Log errors and inform user
- **ALWAYS log errors with context** (employee_id, session_id, filename, operation)
- **Connection loss MUST show reconnection UI** (not crash)
- **Validation errors MUST use Pydantic models** (automatic validation)

---

## Pattern Catalog

### Pattern: API Endpoint Error Handling (#api-endpoint)

**When:** Implementing new API route in `backend/src/ninebox/api/`
**Scenario:** Employee not found, validation failure, session not found

**Template:**
```python
from fastapi import APIRouter, HTTPException, status

@router.get("/employees/{employee_id}")
async def get_employee(
    employee_id: int,
    session_mgr: SessionManager = Depends(get_session_manager),
) -> Employee:
    """Get single employee by ID."""
    session = session_mgr.get_session(LOCAL_USER_ID)

    # Session validation
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Employee lookup
    employee = next(
        (e for e in session.current_employees if e.employee_id == employee_id),
        None
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found",
        )

    return employee
```

**Don't:**
```python
# ❌ WRONG: Returning None instead of raising exception
@router.get("/employees/{employee_id}")
async def get_employee(employee_id: int) -> Employee | None:
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        return None  # Frontend gets confusing null response
    # ...

# ❌ WRONG: Generic error message
if not employee:
    raise HTTPException(status_code=404, detail="Not found")  # Unhelpful!

# ❌ WRONG: Bare except catching everything
try:
    employee = get_employee_from_db(employee_id)
except:  # Don't do this!
    raise HTTPException(status_code=500, detail="Error")
```

---

### Pattern: Service Layer Error Handling (#service-layer)

**When:** Implementing business logic in `backend/src/ninebox/services/`
**Scenario:** File parsing failures, validation errors, database constraints

**Template:**
```python
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ExcelParser:
    def parse(self, file_path: str | Path) -> ParsingResult:
        """Parse Excel file and return employees.

        Raises:
            ValueError: If file cannot be read or no valid data found.
        """
        logger.info(f"Parsing Excel file: {file_path}")

        # Validate required columns exist
        required_columns = ["Employee ID", "Worker", "Business Title"]
        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            error_msg = f"Missing required columns: {missing}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        # Parse employees with error tracking
        employees = []
        failed_rows = 0

        for idx, row in df.iterrows():
            try:
                emp = self._parse_employee_row(row)
                employees.append(emp)
            except Exception as e:
                failed_rows += 1
                warning_msg = f"Failed to parse row {idx}: {e}"
                logger.warning(warning_msg)
                self.warnings.append(warning_msg)
                continue  # Skip invalid rows, continue processing

        if not employees:
            error_msg = f"No valid employees found. Total rows: {total_rows}, Failed: {failed_rows}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        logger.info(f"Parsing complete: {len(employees)}/{total_rows} employees")
        return ParsingResult(employees=employees, metadata=metadata)
```

**Don't:**
```python
# ❌ WRONG: No error context
def parse(self, file_path: str) -> list[Employee]:
    try:
        df = pd.read_excel(file_path)
    except Exception as e:
        raise ValueError("Parsing failed")  # Lost the original error!

# ❌ WRONG: Failing on first invalid row
for idx, row in df.iterrows():
    emp = self._parse_employee_row(row)  # Crashes on first bad row
    employees.append(emp)

# ❌ WRONG: Silent failure
try:
    employee = self._parse_employee_row(row)
    employees.append(employee)
except Exception:
    pass  # Silently skip - user doesn't know what failed!
```

---

### Pattern: API Layer Wrapping Service Errors (#api-service-integration)

**When:** API endpoint calls service layer
**Scenario:** Converting service ValueError to HTTPException

**Template:**
```python
from fastapi import APIRouter, HTTPException, UploadFile, status
from ninebox.services.excel_parser import ExcelParser

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Upload Excel file and create session."""
    # Validate file type
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an Excel file (.xlsx or .xls)",
        )

    # Save file (with cleanup on error)
    permanent_path = uploads_dir / f"{session_id}_{file.filename}"
    try:
        with permanent_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {e!s}",
        ) from e

    # Parse Excel file (service layer)
    parser = ExcelParser()
    try:
        result = parser.parse(str(permanent_path))
        employees = result.employees
        logger.info(f"Parsed {len(employees)} employees from '{file.filename}'")
    except Exception as e:
        # Clean up permanent file on error
        permanent_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse Excel file: {e!s}",
        ) from e

    return {"employee_count": len(employees), "filename": file.filename}
```

**Don't:**
```python
# ❌ WRONG: Not cleaning up resources on error
try:
    result = parser.parse(str(permanent_path))
except Exception as e:
    raise HTTPException(...)
    # permanent_path file is left on disk!

# ❌ WRONG: Losing original error context
except ValueError as e:
    raise HTTPException(status_code=400, detail="Parsing failed")  # Lost details!

# ❌ WRONG: Not using 'from e' for exception chaining
except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))  # Missing 'from e'
```

---

### Pattern: Pydantic Validation (#validation)

**When:** Creating API request/response models
**Scenario:** Employee updates, move requests, filter parameters

**Template:**
```python
from pydantic import BaseModel, field_validator

class UpdateEmployeeRequest(BaseModel):
    """Request to update employee fields."""

    performance: str | None = None  # "LOW", "MEDIUM", "HIGH"
    potential: str | None = None
    flags: list[str] | None = None

    @field_validator("flags")
    @classmethod
    def validate_flags(cls, v: list[str] | None) -> list[str] | None:
        """Validate flags are from allowed list.

        Raises:
            ValueError: If any flag is not in the allowed list
        """
        if v is None:
            return None

        allowed_flags = {
            "promotion_ready", "flagged_for_discussion", "flight_risk",
            "new_hire", "succession_candidate", "pip",
            "high_retention_priority", "ready_for_lateral_move",
        }

        invalid_flags = [flag for flag in v if flag not in allowed_flags]
        if invalid_flags:
            raise ValueError(
                f"Invalid flags: {', '.join(invalid_flags)}. "
                f"Allowed flags: {', '.join(sorted(allowed_flags))}"
            )

        return v

# Usage in endpoint
@router.patch("/employees/{employee_id}")
async def update_employee(
    employee_id: int,
    request: UpdateEmployeeRequest,  # Pydantic validates automatically
) -> Employee:
    """Update employee fields."""
    # If validation fails, FastAPI automatically returns 422 Unprocessable Entity
    # with detailed error messages
    ...
```

**Don't:**
```python
# ❌ WRONG: Manual validation instead of Pydantic
@router.patch("/employees/{employee_id}")
async def update_employee(
    employee_id: int,
    flags: list[str] | None = None,
):
    # Manual validation - error-prone and verbose
    if flags:
        for flag in flags:
            if flag not in ALLOWED_FLAGS:
                raise HTTPException(status_code=400, detail=f"Invalid flag: {flag}")
```

---

### Pattern: Frontend Error Normalization (#frontend-errors)

**When:** Calling backend API from frontend
**Scenario:** Handling axios errors, network failures, HTTP errors

**Template:**
```typescript
// frontend/src/types/errors.ts
import type { AxiosError } from "axios";

export function extractErrorMessage(error: unknown): string {
  // Axios error with backend response
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (detail) return detail;

    // HTTP status error
    if (error.response?.status) {
      return `Request failed with status ${error.response.status}`;
    }

    // Network error
    if (error.request) {
      return "Network error: Unable to reach server";
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Unknown error type
  return String(error);
}

// frontend/src/store/sessionStore.ts
import { extractErrorMessage } from "../types/errors";

uploadFile: async (file: File) => {
  set({ isLoading: true, error: null });
  try {
    const response = await apiClient.upload(file);
    set({ sessionId: response.session_id, isLoading: false });
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    logger.error("Failed to upload file", error);
    set({ isLoading: false, error: errorMessage });
    throw error;  // Re-throw for caller to handle
  }
}
```

**Don't:**
```typescript
// ❌ WRONG: Generic error message
catch (error) {
  set({ error: 'Something went wrong' });  // Unhelpful!
}

// ❌ WRONG: Not handling different error types
catch (error) {
  set({ error: error.message });  // Crashes if error is not Error instance
}

// ❌ WRONG: Swallowing errors
catch (error) {
  console.error(error);
  // Not setting error state - user doesn't see error!
}
```

---

### Pattern: Optimistic Update with Rollback (#optimistic-updates)

**When:** Implementing drag-and-drop or immediate UI updates
**Scenario:** Employee movement, field updates

**Template:**
```typescript
// frontend/src/store/sessionStore.ts
moveEmployee: async (employeeId: number, performance: string, potential: string) => {
  // Capture previous state for rollback
  const previousEmployees = get().employees;

  // Optimistic update (immediate UI feedback)
  set({
    employees: previousEmployees.map((emp) =>
      emp.employee_id === employeeId
        ? { ...emp, performance, potential, grid_position: calculatePosition(performance, potential) }
        : emp
    ),
  });

  try {
    // Call backend
    await apiClient.moveEmployee(employeeId, { performance, potential });

    // Success - reload to get server state
    await get().loadEmployees();
  } catch (error: unknown) {
    // Rollback on error
    const errorMessage = extractErrorMessage(error);
    logger.error("Failed to move employee", error);
    set({
      employees: previousEmployees,  // Restore previous state
      error: errorMessage,
    });
  }
}
```

**Don't:**
```typescript
// ❌ WRONG: No rollback on error
moveEmployee: async (employeeId: number, performance: string, potential: string) => {
  // Update UI
  set({ employees: updatedEmployees });

  // Call backend
  await apiClient.moveEmployee(employeeId, { performance, potential });
  // If this fails, UI shows incorrect state!
}

// ❌ WRONG: Not reloading after success
try {
  await apiClient.moveEmployee(employeeId, { performance, potential });
  // Success - but UI might be out of sync with server
} catch (error) {
  // Rollback
}
```

---

### Pattern: Retry with Exponential Backoff (#retry-logic)

**When:** Network operations that may fail transiently
**Scenario:** API calls, health checks

**Template:**
```typescript
// frontend/src/services/api.ts
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Only retry on connection errors (no response), not on HTTP errors (4xx/5xx)
      const isAxiosError = axios.isAxiosError(error);
      const hasResponse = isAxiosError && error.response !== undefined;

      if (hasResponse) {
        // Don't retry on HTTP errors (client/server errors)
        throw error;
      }

      // This is a connection error - retry with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      const isLastAttempt = attempt === maxRetries - 1;

      if (!isLastAttempt) {
        console.log(`[API Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`[API Retry] All ${maxRetries} attempts failed`);
      }
    }
  }

  throw lastError!;
}

// Usage
export const apiClient = {
  getEmployees: () => withRetry(async () => {
    const response = await client.get<EmployeesResponse>("/api/employees");
    return response.data;
  }),
};
```

**Don't:**
```typescript
// ❌ WRONG: Retrying on HTTP errors (400/404/500)
if (hasResponse) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  continue;  // Retry will get same 404 error!
}

// ❌ WRONG: No exponential backoff
const delay = 1000;  // Always wait 1s - doesn't back off

// ❌ WRONG: Infinite retries
while (true) {
  try {
    return await operation();
  } catch (error) {
    await sleep(1000);  // Never gives up!
  }
}
```

---

### Pattern: Logging Errors with Context (#logging)

**When:** Any error occurs in backend
**Scenario:** Parsing failures, API errors, validation failures

**Template:**
```python
import logging

logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_file(file: UploadFile, session_mgr: SessionManager):
    """Upload Excel file and create session."""
    logger.info(f"Uploading file: {file.filename}")

    try:
        result = parser.parse(str(permanent_path))

        # Log parsing metadata
        logger.info(
            f"Parsed Excel file '{file.filename}': "
            f"sheet='{result.metadata.sheet_name}', "
            f"parsed={result.metadata.parsed_rows}/{result.metadata.total_rows}, "
            f"failed={result.metadata.failed_rows}"
        )

        if result.metadata.defaulted_fields:
            logger.info(f"Defaulted fields: {result.metadata.defaulted_fields}")

        if result.metadata.warnings:
            logger.warning(f"Parsing warnings: {result.metadata.warnings[:3]}...")

    except Exception as e:
        # Log error with context
        logger.error(
            f"Failed to parse Excel file '{file.filename}': {e}",
            exc_info=True  # Include stack trace
        )
        permanent_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse Excel file: {e!s}",
        ) from e
```

**Don't:**
```python
# ❌ WRONG: No context in log message
except Exception as e:
    logger.error(f"Error: {e}")  # Which file? Which operation?

# ❌ WRONG: Not using exc_info for stack trace
except Exception as e:
    logger.error(str(e))  # Lost stack trace!

# ❌ WRONG: Logging at wrong level
except ValueError as e:
    logger.info(f"Validation failed: {e}")  # Should be ERROR or WARNING
```

---

## HTTP Status Code Decision Matrix

| Error Type | Status Code | Use When | Example |
|------------|-------------|----------|---------|
| **Validation error** | 400 Bad Request | Invalid input data, missing required fields, malformed request | File not .xlsx, invalid flag value |
| **Not found** | 404 Not Found | Resource doesn't exist (employee, session) | Employee ID 123 not in session |
| **Unprocessable entity** | 422 Unprocessable Entity | Pydantic validation failure (automatic) | Invalid enum value, type mismatch |
| **Server error** | 500 Internal Server Error | Unexpected backend error, database failure | Database locked, file permission error |

**Note:** 401 Unauthorized and 403 Forbidden are not used (no authentication in local desktop app).

---

## Retry vs No Retry Decision Matrix

| Error Type | Retry? | Max Attempts | Rationale |
|------------|--------|--------------|-----------|
| **Network timeout** | ✅ Yes | 3 | Transient failure, may recover |
| **Connection refused** | ✅ Yes | 3 | Backend may be starting up |
| **500 Internal Server Error** | ❌ No | 0 | Server error unlikely to resolve |
| **400 Bad Request** | ❌ No | 0 | Invalid input won't fix itself |
| **404 Not Found** | ❌ No | 0 | Resource missing, retry won't help |
| **422 Validation Error** | ❌ No | 0 | Client must fix validation |

---

## Logging Requirements Checklist

When logging errors, ALWAYS include:

- [ ] **Operation context** (what was being attempted)
- [ ] **Resource identifiers** (employee_id, session_id, filename)
- [ ] **Error message** (user-friendly description)
- [ ] **Stack trace** (for ERROR level, use `exc_info=True`)
- [ ] **Timestamp** (automatic with logger)
- [ ] **Log level** (ERROR for failures, WARNING for handled issues)

**Don't log:**
- ❌ Sensitive data (N/A for local app, but avoid as practice)
- ❌ Duplicate errors (log once, not in every layer)
- ❌ Full request bodies (may be large)

**Example:**
```python
logger.error(
    f"Failed to move employee {employee_id} to position ({performance}, {potential}): {e}",
    exc_info=True,
    extra={
        "employee_id": employee_id,
        "session_id": session.session_id,
        "operation": "move_employee",
    }
)
```

---

## Common Mistakes (Anti-Patterns)

### ❌ Bare Except

```python
# WRONG
try:
    result = parse_file(file_path)
except:  # Catches KeyboardInterrupt, SystemExit, etc.!
    logger.error("Parsing failed")
```

**Fix:**
```python
# CORRECT
try:
    result = parse_file(file_path)
except ValueError as e:
    logger.error(f"Parsing failed: {e}", exc_info=True)
    raise
```

### ❌ Silent Failures

```python
# WRONG
try:
    employee = update_employee(employee_id, data)
except Exception:
    pass  # User doesn't know it failed!
```

**Fix:**
```python
# CORRECT
try:
    employee = update_employee(employee_id, data)
except Exception as e:
    logger.error(f"Failed to update employee {employee_id}: {e}")
    raise HTTPException(status_code=500, detail=f"Update failed: {e!s}")
```

### ❌ Losing Error Context

```python
# WRONG
try:
    result = parser.parse(file_path)
except Exception:
    raise ValueError("Parsing failed")  # Lost original exception!
```

**Fix:**
```python
# CORRECT
try:
    result = parser.parse(file_path)
except Exception as e:
    raise ValueError(f"Parsing failed: {e}") from e  # Chain exceptions
```

### ❌ Generic Error Messages

```python
# WRONG
if not employee:
    raise HTTPException(status_code=404, detail="Not found")
```

**Fix:**
```python
# CORRECT
if not employee:
    raise HTTPException(
        status_code=404,
        detail=f"Employee {employee_id} not found in session"
    )
```

### ❌ Not Cleaning Up Resources

```python
# WRONG
permanent_path = save_file(file)
try:
    result = parser.parse(permanent_path)
except Exception as e:
    raise HTTPException(...)  # File left on disk!
```

**Fix:**
```python
# CORRECT
permanent_path = save_file(file)
try:
    result = parser.parse(permanent_path)
except Exception as e:
    permanent_path.unlink(missing_ok=True)  # Clean up
    raise HTTPException(...) from e
```

---

## Testing Error Handling

### Pattern: Testing API Error Responses

```python
# backend/tests/unit/api/test_employees.py
import pytest
from fastapi.testclient import TestClient

def test_get_employee_when_no_session_then_returns_404(client: TestClient):
    """Test employee lookup without active session."""
    response = client.get("/api/employees/123")

    assert response.status_code == 404
    assert "No active session" in response.json()["detail"]

def test_get_employee_when_not_found_then_returns_404(
    client: TestClient,
    sample_session
):
    """Test employee lookup with non-existent ID."""
    response = client.get("/api/employees/99999")

    assert response.status_code == 404
    assert "Employee 99999 not found" in response.json()["detail"]
```

### Pattern: Testing Service Layer Exceptions

```python
# backend/tests/unit/services/test_excel_parser.py
import pytest
from ninebox.services.excel_parser import ExcelParser

def test_parse_when_missing_columns_then_raises_value_error():
    """Test parsing fails with missing required columns."""
    parser = ExcelParser()

    with pytest.raises(ValueError, match="Missing required columns"):
        parser.parse("tests/fixtures/invalid_no_columns.xlsx")

def test_parse_when_no_valid_employees_then_raises_value_error():
    """Test parsing fails when all rows are invalid."""
    parser = ExcelParser()

    with pytest.raises(ValueError, match="No valid employees found"):
        parser.parse("tests/fixtures/invalid_all_bad_rows.xlsx")
```

### Pattern: Testing Frontend Error Handling

```typescript
// frontend/src/store/__tests__/sessionStore.test.ts
import { describe, it, expect, vi } from 'vitest';
import { useSessionStore } from '../sessionStore';
import { apiClient } from '../../services/api';

describe('sessionStore', () => {
  it('sets error state when upload fails', async () => {
    // Mock API failure
    vi.spyOn(apiClient, 'upload').mockRejectedValue(
      new Error('File must be an Excel file')
    );

    const store = useSessionStore.getState();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await expect(store.uploadFile(file)).rejects.toThrow();

    expect(store.error).toBe('File must be an Excel file');
    expect(store.isLoading).toBe(false);
  });
});
```

---

## Related Patterns

- **[SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)** - Overall architecture and data flow
- **[SECURITY_MODEL.md](SECURITY_MODEL.md)** - Input validation and security patterns
- **[OBSERVABILITY.md](OBSERVABILITY.md)** - Logging configuration and debugging (future)
- **[TESTING.md](../testing/)** - Comprehensive testing guides and templates

---

## Tags for Search

`#api-endpoint` `#service-layer` `#validation` `#frontend-errors` `#optimistic-updates` `#retry-logic` `#logging` `#http-status-codes` `#error-messages` `#exception-handling`
