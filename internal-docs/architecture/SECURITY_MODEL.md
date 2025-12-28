# Security Model

**Agent-Optimized Reference** | **Last Updated:** 2025-12-27

## Quick Rules

- **Renderer MUST be sandboxed** (`sandbox: true`)
- **Context isolation MUST be enabled** (`contextIsolation: true`)
- **Backend MUST bind to 127.0.0.1 only** (never 0.0.0.0)
- **IPC handlers MUST validate all inputs** (no trusting renderer)
- **File paths MUST use path.join/resolve** (no string concatenation)
- **NEVER expose require() or Node APIs to renderer**
- **NEVER use eval() or new Function() in renderer**
- **NEVER trust user input without validation** (Pydantic schemas required)

## Security Boundaries

| Process | Trust Level | Allowed Operations | Restrictions |
|---------|-------------|-------------------|--------------|
| **Renderer** (Frontend) | **Untrusted** | HTTP requests, UI rendering, DOM manipulation | No Node.js, no file system, no IPC (except contextBridge) |
| **Preload** (Bridge) | **Boundary** | Expose safe APIs via contextBridge, forward IPC calls | Input validation required, no sensitive data exposure |
| **Main** (Electron) | **Trusted** | Full Node.js, file system, process management, IPC handling | Validate all IPC messages, sanitize file paths |
| **Backend** (FastAPI) | **Isolated Subprocess** | Database, file I/O, Excel parsing, business logic | Localhost only (127.0.0.1), no network exposure |

**Communication Flow:**
```
Renderer (file://) → HTTP (localhost:38000) → Backend (FastAPI)
Renderer → contextBridge → Preload → IPC → Main → File System
```

**Critical Insight:** Backend is **NOT** accessible via IPC - only HTTP. This isolates the attack surface.

## Threat Model Matrix

### In-Scope Threats (MUST mitigate)

| Threat | Attack Vector | Current Mitigation | Validation Required |
|--------|---------------|-------------------|---------------------|
| **Malicious Excel upload** | XSS via cell formulas, path traversal via filenames | Pandas/openpyxl parsing (no macros), filename sanitization | Validate structure, sanitize strings, size limits (50MB) |
| **Context isolation bypass** | Renderer accessing Node.js APIs | `sandbox: true`, `contextIsolation: true`, minimal contextBridge API | Audit preload script regularly |
| **Path traversal** | File dialog manipulation, file read/write | `path.join()` + validation, dialog filters | Check paths are within allowed directories |
| **SQL injection** | Malicious employee data | Pydantic validation, no raw SQL queries | All API inputs use Pydantic schemas |
| **IPC message tampering** | Malicious renderer sending crafted IPC messages | Input validation in IPC handlers | Type checking, allowlist validation |

### Out-of-Scope Threats (won't fix - deployment model)

| Threat | Rationale |
|--------|-----------|
| **Network attacks** | Backend not network-exposed (localhost only, 127.0.0.1) |
| **Multi-user attacks** | Single-user desktop app, no shared sessions |
| **Privilege escalation** | No privileged operations, runs as user |
| **CSRF/XSS in traditional sense** | No web deployment, file:// protocol + localhost backend |

## Pattern Catalog

### Pattern: IPC Handler with Input Validation (#ipc)

**When:** Adding new IPC handler in main process
**Scenario:** Opening file dialog for Excel import

```typescript
// ✅ CORRECT: Validate input, use safe APIs
ipcMain.handle('dialog:openFile', async () => {
  if (!mainWindow) {
    return null; // Fail safely
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  // Return only the file path (string), not the full result object
  return result.filePaths[0];
});
```

**Don't:**
```typescript
// ❌ WRONG: No validation, direct file system access
ipcMain.handle('file:read', async (event, filepath: string) => {
  // Path traversal risk! No validation of filepath
  return fs.readFileSync(filepath, 'utf8');
});

// ❌ WRONG: Accepting arbitrary parameters from renderer
ipcMain.handle('dialog:openFile', async (event, options: any) => {
  // Trusting renderer to provide safe options - dangerous!
  return dialog.showOpenDialog(options);
});
```

**Exploit Example:**
```typescript
// Attacker in renderer process
window.electronAPI.readFile('../../../../../../etc/passwd');
// Without validation, this reads sensitive files outside app directory
```

### Pattern: Preload Script Safe API (#ipc #contextBridge)

**When:** Exposing functionality to renderer
**Scenario:** Backend connection status monitoring

```typescript
// ✅ CORRECT: Safe API via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  // Read-only platform info (safe)
  platform: process.platform,
  version: process.versions.electron,

  // File dialog (controlled by main process)
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),

  // Backend status listener (callback pattern)
  backend: {
    onConnectionStatusChange: (
      callback: (data: { status: string; port?: number }) => void
    ) => {
      const listener = (_event: any, data: any) => callback(data);
      ipcRenderer.on('backend:connection-status', listener);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener('backend:connection-status', listener);
      };
    },
  },
});
```

**Don't:**
```typescript
// ❌ WRONG: Exposing ipcRenderer directly
contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: ipcRenderer, // Renderer can call ANY IPC handler!
});

// ❌ WRONG: Exposing require
contextBridge.exposeInMainWorld('electronAPI', {
  require: require, // Renderer gets full Node.js access!
});

// ❌ WRONG: Exposing fs directly
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => fs.readFileSync(path), // No validation!
});
```

**Exploit Example:**
```typescript
// If ipcRenderer is exposed:
window.electronAPI.ipcRenderer.send('some-privileged-operation', { malicious: 'payload' });

// If require is exposed:
const { exec } = window.electronAPI.require('child_process');
exec('rm -rf /'); // Full system compromise!
```

### Pattern: API Input Validation (#database #api)

**When:** Creating new API endpoint
**Scenario:** Updating employee fields

```python
# ✅ CORRECT: Pydantic validation
from pydantic import BaseModel, field_validator

class UpdateEmployeeRequest(BaseModel):
    performance: str | None = None
    potential: str | None = None
    notes: str | None = None
    flags: list[str] | None = None

    @field_validator("flags")
    @classmethod
    def validate_flags(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return None

        allowed_flags = {
            "promotion_ready",
            "flagged_for_discussion",
            "flight_risk",
            # ... other allowed flags
        }

        invalid_flags = [flag for flag in v if flag not in allowed_flags]
        if invalid_flags:
            raise ValueError(f"Invalid flags: {', '.join(invalid_flags)}")

        return v

@router.patch("/employees/{employee_id}")
async def update_employee(
    employee_id: int,
    updates: UpdateEmployeeRequest,  # Pydantic auto-validates
) -> dict:
    # Input is already validated by Pydantic
    update_data = updates.model_dump(exclude_unset=True)
    # ... business logic
```

**Don't:**
```python
# ❌ WRONG: No validation, SQL injection risk
@router.patch("/employees/{employee_id}")
async def update_employee(employee_id: int, name: str, notes: str):
    # Direct SQL with user input - SQL injection!
    db.execute(f"UPDATE employees SET name='{name}', notes='{notes}' WHERE id={employee_id}")

# ❌ WRONG: No allowlist for flags
@router.patch("/employees/{employee_id}")
async def update_employee(employee_id: int, flags: list[str]):
    # Accepting arbitrary flags without validation
    employee.flags = flags  # Attacker can set any flags!
```

**Exploit Example:**
```python
# SQL injection via notes field
notes = "'; DROP TABLE employees; --"
# Without validation: UPDATE employees SET notes=''; DROP TABLE employees; --' WHERE id=1
```

### Pattern: Safe File Path Handling (#filesystem)

**When:** Working with file paths in main process
**Scenario:** Reading uploaded Excel file

```typescript
// ✅ CORRECT: Use path.join and validate
import path from 'path';
import { app } from 'electron';

ipcMain.handle('file:readFile', async (event, filePath: string) => {
  // Validate input exists
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path');
  }

  // Get user data directory (trusted boundary)
  const userDataPath = app.getPath('userData');

  // Resolve path to absolute (prevents ../ tricks)
  const resolvedPath = path.resolve(filePath);

  // Verify path is within allowed directory
  if (!resolvedPath.startsWith(userDataPath) && !resolvedPath.startsWith(path.resolve('/tmp'))) {
    throw new Error('Access denied: path outside allowed directories');
  }

  // Check file exists before reading
  if (!fs.existsSync(resolvedPath)) {
    throw new Error('File not found');
  }

  // Safe to read
  const buffer = await fs.promises.readFile(resolvedPath);
  return Array.from(buffer); // Convert to array for IPC transfer
});
```

**Don't:**
```typescript
// ❌ WRONG: String concatenation, no validation
ipcMain.handle('file:readFile', async (event, filename: string) => {
  // Path traversal risk!
  const filePath = `/tmp/${filename}`;
  return fs.readFileSync(filePath);
});

// ❌ WRONG: Trusting user path without validation
ipcMain.handle('file:readFile', async (event, filePath: string) => {
  // No validation - can read ANY file!
  return fs.readFileSync(filePath);
});
```

**Exploit Example:**
```typescript
// Path traversal attack
window.electronAPI.readFile('../../../../../../etc/passwd');
// Without validation: reads /etc/passwd

window.electronAPI.readFile('../../../sensitive-config.json');
// Without validation: reads files outside app directory
```

### Pattern: Excel File Validation (#file-upload)

**When:** Processing uploaded Excel files
**Scenario:** Parsing employee data from Excel

```python
# ✅ CORRECT: Validate structure and sanitize
import pandas as pd
from pathlib import Path

class ExcelParser:
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    REQUIRED_COLUMNS = ["Employee ID", "Worker", "Business Title", "Job Level - Primary Position"]

    def parse(self, file_path: str | Path) -> ParsingResult:
        # Validate file size
        file_size = Path(file_path).stat().st_size
        if file_size > self.MAX_FILE_SIZE:
            raise ValueError(f"File too large: {file_size / 1024 / 1024:.1f}MB (max: 50MB)")

        # Use pandas/openpyxl (does NOT execute macros)
        df = pd.read_excel(file_path, sheet_name=1)

        # Validate required columns exist
        missing = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        # Sanitize data (strip whitespace, handle NaN)
        for col in df.columns:
            if df[col].dtype == 'object':  # String columns
                df[col] = df[col].apply(lambda x: str(x).strip() if pd.notna(x) else '')

        # Parse employees with validation
        employees = []
        for _, row in df.iterrows():
            emp = self._parse_employee_row(row)  # Validates each field
            employees.append(emp)

        return ParsingResult(employees=employees, metadata=metadata)
```

**Don't:**
```python
# ❌ WRONG: No size limit, no validation
def parse(self, file_path: str) -> list[Employee]:
    # No size check - can upload 5GB file and crash app
    df = pd.read_excel(file_path)

    # No column validation - crashes if columns missing
    employees = [Employee(**row) for row in df.to_dict('records')]

    return employees

# ❌ WRONG: Using openpyxl with macros enabled
from openpyxl import load_workbook
wb = load_workbook(file_path, keep_vba=True)  # Executes macros!
```

**Exploit Example:**
```excel
// Excel cell with formula injection
=cmd|' /C calc'!A1
// Could execute commands if formulas are evaluated

// Excel file with embedded macro (VBA)
Sub Auto_Open()
    Shell "rm -rf /"  // If macros enabled, runs on open
End Sub
```

### Pattern: Backend Port Binding (#network #backend)

**When:** Starting FastAPI backend
**Scenario:** Binding to localhost only

```python
# ✅ CORRECT: Bind to 127.0.0.1 only (localhost)
import uvicorn
from fastapi import FastAPI

app = FastAPI()

if __name__ == "__main__":
    # CRITICAL: host="127.0.0.1" prevents network access
    uvicorn.run(app, host="127.0.0.1", port=38000)
```

**Don't:**
```python
# ❌ WRONG: Bind to all interfaces (0.0.0.0)
if __name__ == "__main__":
    # Network accessible! Anyone on network can access backend
    uvicorn.run(app, host="0.0.0.0", port=38000)

# ❌ WRONG: Omitting host (defaults to 127.0.0.1 but not explicit)
if __name__ == "__main__":
    # Implicit localhost - better to be explicit
    uvicorn.run(app, port=38000)
```

**Exploit Example:**
```bash
# If backend binds to 0.0.0.0:
curl http://victim-machine:38000/api/employees
# Attacker on same network can access all employee data

# If backend binds to 127.0.0.1:
curl http://victim-machine:38000/api/employees
# Connection refused - only accessible from localhost
```

### Pattern: CORS Configuration (#backend #api)

**When:** Configuring FastAPI CORS middleware
**Scenario:** Desktop app with file:// frontend

```python
# ✅ CORRECT: Permissive CORS for desktop app (acceptable)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Safe for desktop app (localhost-only backend)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Comment explaining why this is safe:
# CORS Configuration for Desktop Application
# Allow all origins is acceptable because:
# 1. Backend only runs on localhost (127.0.0.1:38000)
# 2. Frontend is bundled Electron app (file:// or localhost)
# 3. Not exposed to external network
# 4. Desktop app deployment model (single-user, local-only)
# WARNING: If backend becomes network-accessible, restrict origins to:
# ["http://localhost:3000", "http://localhost:5173"]
```

**Don't (if backend were network-exposed):**
```python
# ❌ WRONG: Permissive CORS with network-exposed backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # DANGEROUS if backend on 0.0.0.0!
)
# If backend is network-accessible, any website can make requests

# ✅ CORRECT (for web deployment):
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trusted-domain.com"],  # Explicit allowlist
    allow_credentials=True,
)
```

## Security Checklist (for Code Review)

When reviewing new features, verify:

### IPC Security
- [ ] Renderer is sandboxed (`webPreferences.sandbox: true`)
- [ ] Context isolation enabled (`webPreferences.contextIsolation: true`)
- [ ] No Node.js APIs exposed to renderer (only contextBridge APIs)
- [ ] All IPC handlers validate input types and values
- [ ] No sensitive data in IPC messages (use HTTP for data transfer)
- [ ] IPC callbacks return cleanup functions (prevent memory leaks)

### Backend Security
- [ ] Backend binds to 127.0.0.1 (not 0.0.0.0)
- [ ] API endpoints use Pydantic validation
- [ ] No raw SQL queries (use ORM or parameterized queries)
- [ ] File uploads validate file type and size (50MB limit)
- [ ] CORS configured appropriately for deployment model
- [ ] No shell command execution (or `shell=False` if required)

### File System Security
- [ ] File paths use `path.join()` or `path.resolve()`
- [ ] Paths validated to be within allowed directories
- [ ] File dialog filters restrict file types
- [ ] No user input in file paths without validation
- [ ] File existence checked before operations

### Input Validation
- [ ] All API inputs use Pydantic schemas
- [ ] Enum values validated against allowlists
- [ ] String inputs sanitized (strip whitespace, check length)
- [ ] File uploads checked for size, format, structure
- [ ] No `eval()` or `new Function()` on user input

## Decision Tree: Is This Safe?

```
START: Implementing new feature

Q: Does it involve IPC (main ↔ renderer)?
  YES → Use contextBridge pattern (#ipc)
      → Validate all inputs in IPC handler
      → Read SECURITY_MODEL.md IPC patterns
  NO ↓

Q: Does it involve file system operations?
  YES → Use path.join/resolve (#filesystem)
      → Validate paths are within allowed dirs
      → Read SECURITY_MODEL.md file path patterns
  NO ↓

Q: Does it involve backend API?
  YES → Use Pydantic validation (#api #database)
      → Validate all inputs against schema
      → Read SECURITY_MODEL.md API patterns
  NO ↓

Q: Does it involve file uploads?
  YES → Validate size, format, structure (#file-upload)
      → Use pandas/openpyxl (no macros)
      → Read SECURITY_MODEL.md file upload patterns
  NO ↓

PROCEED: Follow general security rules
```

## Common Vulnerabilities with Exploits

### Vulnerability: Path Traversal

**Pattern:**
```typescript
// ❌ VULNERABLE
const filePath = `/uploads/${userFilename}`;
fs.readFile(filePath);
```

**Exploit:**
```typescript
userFilename = "../../../../../../etc/passwd";
// Reads: /etc/passwd
```

**Fix:**
```typescript
// ✅ SAFE
const uploadDir = app.getPath('userData');
const filePath = path.resolve(uploadDir, userFilename);
if (!filePath.startsWith(uploadDir)) {
  throw new Error('Path traversal detected');
}
```

### Vulnerability: SQL Injection

**Pattern:**
```python
# ❌ VULNERABLE
name = request.query_params.get('name')
db.execute(f"SELECT * FROM employees WHERE name='{name}'")
```

**Exploit:**
```python
name = "'; DROP TABLE employees; --"
# Executes: SELECT * FROM employees WHERE name=''; DROP TABLE employees; --'
```

**Fix:**
```python
# ✅ SAFE (use Pydantic + ORM)
class EmployeeQuery(BaseModel):
    name: str

@router.get("/employees")
async def search(query: EmployeeQuery):
    # Pydantic validates, ORM parameterizes
    return session.query(Employee).filter(Employee.name == query.name).all()
```

### Vulnerability: Context Isolation Bypass

**Pattern:**
```typescript
// ❌ VULNERABLE
contextBridge.exposeInMainWorld('electron', {
  require: require,  // Exposed to renderer!
});
```

**Exploit:**
```typescript
// In renderer process
const { exec } = window.electron.require('child_process');
exec('rm -rf /');  // Full system compromise
```

**Fix:**
```typescript
// ✅ SAFE
contextBridge.exposeInMainWorld('electron', {
  // Only expose specific, validated functions
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
});
```

### Vulnerability: XSS via Excel Formula

**Pattern:**
```python
# ❌ VULNERABLE
df = pd.read_excel(file_path)
employee_name = df.iloc[0]['name']  # Could contain formula
display_html(f"<h1>{employee_name}</h1>")  # XSS if formula executed
```

**Exploit:**
```excel
// Excel cell A1
=HYPERLINK("javascript:alert('XSS')","Click me")
// If rendered as HTML, executes JavaScript
```

**Fix:**
```python
# ✅ SAFE
df = pd.read_excel(file_path)
employee_name = str(df.iloc[0]['name']).strip()  # Convert to string
# Sanitize in frontend (React escapes by default)
```

## Security Testing Guidance

### Manual Testing Checklist

Before deploying security-sensitive features:

1. **Path Traversal Testing**
   - [ ] Try `../../../etc/passwd` in file paths
   - [ ] Try absolute paths (`/etc/passwd`)
   - [ ] Try Windows paths (`C:\Windows\System32`)
   - [ ] Verify error handling (should reject gracefully)

2. **IPC Security Testing**
   - [ ] Open DevTools and try calling IPC handlers directly
   - [ ] Send malformed payloads to IPC handlers
   - [ ] Verify renderer cannot access Node.js APIs
   - [ ] Check for memory leaks (listeners cleaned up)

3. **API Input Validation Testing**
   - [ ] Send invalid enum values (`performance: "INVALID"`)
   - [ ] Send oversized strings (1MB notes field)
   - [ ] Send SQL injection payloads (`name: "'; DROP TABLE--"`)
   - [ ] Send type mismatches (`employee_id: "not-a-number"`)

4. **File Upload Testing**
   - [ ] Upload oversized file (>50MB)
   - [ ] Upload file with wrong extension (.txt renamed to .xlsx)
   - [ ] Upload corrupted Excel file
   - [ ] Upload Excel with macros (should not execute)

### Automated Security Tests

```python
# backend/tests/security/test_input_validation.py
import pytest
from fastapi.testclient import TestClient

def test_sql_injection_prevention(client: TestClient):
    """Verify SQL injection is prevented."""
    # Attempt SQL injection via employee name
    malicious_name = "'; DROP TABLE employees; --"

    response = client.patch(
        "/api/employees/1",
        json={"notes": malicious_name}
    )

    # Should succeed (validated and escaped)
    assert response.status_code == 200

    # Verify employees table still exists
    response = client.get("/api/employees")
    assert response.status_code == 200

def test_path_traversal_prevention():
    """Verify path traversal is prevented."""
    from ninebox.utils.paths import validate_path

    # Attempt path traversal
    with pytest.raises(ValueError, match="Path traversal"):
        validate_path("../../etc/passwd")

    with pytest.raises(ValueError, match="Path traversal"):
        validate_path("/etc/passwd")
```

## Related Patterns

- See [ERROR_HANDLING.md](ERROR_HANDLING.md) for validation error handling
- See [GUIDELINES.md](GUIDELINES.md) for Electron security architecture
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for process boundaries
- See [backend/src/ninebox/models/](backend/src/ninebox/models/) for Pydantic schemas

## Configuration Reference

### Electron Security Configuration

**File:** `frontend/electron/main/index.ts`

```typescript
const windowOptions = {
  webPreferences: {
    nodeIntegration: false,      // CRITICAL: No Node.js in renderer
    contextIsolation: true,       // CRITICAL: Isolate renderer context
    sandbox: true,                // CRITICAL: Sandbox renderer process
    preload: path.join(__dirname, '../preload/index.js'),
  },
};

// Configure Content Security Policy (CSP)
// Environment-aware: strict in production, permissive in development for Vite HMR
mainWindow.webContents.session.webRequest.onHeadersReceived(
  (details, callback) => {
    const isDev = getIsDev();
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            "default-src 'self'",                                    // Only same-origin resources
            isDev
              ? "script-src 'self' 'unsafe-inline'"                 // Dev: Allow Vite HMR inline scripts
              : "script-src 'self'",                                // Prod: Strict (verified: no inline scripts)
            "style-src 'self' 'unsafe-inline'",                     // Inline styles for Material-UI
            "img-src 'self' data: blob:",                           // Images from same origin, data URIs, blobs
            "font-src 'self' data:",                                // Fonts from same origin, data URIs
            "connect-src 'self' http://localhost:38000 ws://localhost:*", // Backend API + Vite HMR
            "base-uri 'self'",                                      // Restrict base URL
            "form-action 'self'",                                   // Restrict form submissions
          ].join('; '),
        ],
      },
    });
  }
);

// Note: Production build (vite build) generates NO inline scripts.
// All JavaScript is in external files (verified in frontend/dist/index.html).
```

### Backend Security Configuration

**File:** `backend/src/ninebox/main.py`

```python
# Bind to localhost only (127.0.0.1)
uvicorn.run(app, host="127.0.0.1", port=38000)

# CORS for desktop app (permissive but safe due to localhost binding)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Safe for localhost-only backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Success Criteria

Security implementation is correct when:

- ✅ Renderer has NO access to Node.js APIs (verify in DevTools console)
- ✅ Backend ONLY accessible from localhost (test from another machine)
- ✅ Path traversal attacks fail gracefully (test with `../../../etc/passwd`)
- ✅ SQL injection attempts are sanitized (test with `'; DROP TABLE--`)
- ✅ File uploads validate size/format (test with oversized/malformed files)
- ✅ IPC handlers validate all inputs (test with malformed payloads)
- ✅ No sensitive data in logs (grep logs for passwords, tokens)

---

**Generated by:** Claude Code (Agent-Optimized Architecture Documentation)
**Date:** 2025-12-27
**Focus:** Security boundaries, threat models, and exploit prevention patterns for AI agents
