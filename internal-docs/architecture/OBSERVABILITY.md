# Observability & Debugging

## Quick Rules
- ALWAYS log errors with ERROR level + context (employee_id, session_id, action)
- ALWAYS use `logger.error()` (backend) or `logger.error()` (frontend) for failures
- NEVER log sensitive data (N/A for local app, but avoid as best practice)
- Backend logs to: `{userData}/backend.log` (production) or console (dev)
- Frontend logs to: Browser DevTools console (both dev and production)
- Log rotation: Backend uses 10MB max file size (handled by Electron)
- DEBUG level for development (`import.meta.env.DEV`), INFO for production
- Use structured logging (include context objects, not just strings)

## Log Levels Decision Matrix

| Level | When to Use | Backend Example | Frontend Example |
|-------|-------------|-----------------|------------------|
| **DEBUG** | Development tracing, verbose details | `logger.debug("Loading 150 employees from DB")` | `logger.debug('User clicked button', { userId })` |
| **INFO** | Normal operations, milestones | `logger.info(f"Backend started in {duration:.2f}s")` | `logger.info('File uploaded', { filename })` |
| **WARNING** | Handled issues, degraded state | `logger.warning(f"Port {port} in use, trying alt")` | `logger.warn('Session expired, reloading')` |
| **ERROR** | Failures requiring attention | `logger.error(f"Failed to save: {e}", exc_info=True)` | `logger.error('API call failed', error)` |
| **CRITICAL** | App crash, unrecoverable | `logger.critical("DB corrupted, cannot start")` | N/A (use ERROR + crash dialog) |

## Log File Locations (OS-Specific)

| Platform | Backend Log | Frontend Log | Database |
|----------|-------------|--------------|----------|
| **Windows** | `C:\Users\{user}\AppData\Roaming\9Boxer\backend.log` | Browser DevTools (F12) | `C:\Users\{user}\AppData\Roaming\9Boxer\ninebox.db` |
| **macOS** | `~/Library/Application Support/9Boxer/backend.log` | Browser DevTools (Cmd+Opt+I) | `~/Library/Application Support/9Boxer/ninebox.db` |
| **Linux** | `~/.config/9Boxer/backend.log` | Browser DevTools (F12) | `~/.config/9Boxer/ninebox.db` |
| **Development** | Console output (stdout/stderr) | Browser DevTools | `~/.ninebox/ninebox.db` |

**How to access:**
- **Backend logs**: Help → Open Logs Folder (or IPC: `window.electron.showLogs()`)
- **Frontend logs**: F12 → Console tab
- **Electron main logs**: Electron writes to `{userData}/logs/main.log` (not backend.log)

## Debugging Tools Reference

| Tool | Use For | How to Access | When to Use |
|------|---------|---------------|-------------|
| **Chrome DevTools** | Frontend JS debugging, network calls | F12 or Ctrl+Shift+I | Frontend errors, API failures |
| **React DevTools** | Component state, props inspection | Chrome extension + F12 | UI rendering issues, state bugs |
| **Network Tab** | API request/response inspection | DevTools → Network tab | API errors, slow requests |
| **Backend Logs** | Backend errors, performance metrics | `{userData}/backend.log` | Backend crashes, logic errors |
| **Python Debugger (pdb)** | Backend debugging (dev only) | `import pdb; pdb.set_trace()` | Complex backend logic |
| **Electron DevTools** | Main process debugging | `--inspect` flag | Electron IPC, lifecycle issues |
| **Performance Tab** | Frontend performance profiling | DevTools → Performance → Record | Slow renders, memory leaks |
| **SQLite Browser** | Database inspection | `sqlite3 {userData}/ninebox.db` | Data integrity, query issues |

## Pattern Catalog

### Pattern: Backend Error Logging
**When:** Handling exceptions in backend API or services
**Scenario:** Employee creation fails due to database constraint

```python
import logging

logger = logging.getLogger(__name__)

async def create_employee(data: EmployeeCreate) -> Employee:
    try:
        employee = Employee(**data.dict())
        db.add(employee)
        await db.commit()
        logger.info(f"Created employee {employee.id}: {employee.name}")
        return employee
    except IntegrityError as e:
        logger.error(
            f"Failed to create employee: {data.name}",
            exc_info=True,  # Include stack trace
            extra={
                "employee_name": data.name,
                "session_id": get_current_session_id(),
                "error_type": type(e).__name__
            }
        )
        raise HTTPException(
            status_code=400,
            detail=f"Employee {data.name} already exists"
        )
```

**Don't:**
```python
# ❌ WRONG: No context, no stack trace
except IntegrityError:
    logger.error("Failed to create employee")

# ❌ WRONG: Silent failure
except Exception:
    pass  # Never silently catch exceptions!
```

### Pattern: Frontend Error Logging
**When:** Logging errors in React components or API calls
**Scenario:** API call fails during employee movement

```typescript
import { logger } from '@/utils/logger';

try {
  await apiClient.moveEmployee(employeeId, newPosition);
  logger.info('Employee moved successfully', { employeeId, newPosition });
} catch (error) {
  logger.error('[EmployeeMovement] API call failed', error, {
    employeeId,
    newPosition,
    timestamp: new Date().toISOString(),
    userAction: 'drag-drop'
  });

  // Normalize error for user display
  set({ error: extractErrorMessage(error) });
}
```

**Don't:**
```typescript
// ❌ WRONG: Generic console.log with no context
catch (error) {
  console.log("Error", error);
}

// ❌ WRONG: No error logging at all
catch (error) {
  set({ error: 'Something went wrong' });
}
```

### Pattern: Performance Logging
**When:** Tracking slow operations (>1s for user-facing, >100ms for critical path)
**Scenario:** Excel file upload and parsing

```python
import time
import logging

logger = logging.getLogger(__name__)

async def upload_excel(file: UploadFile):
    start_time = time.time()

    employees = await parse_excel(file)
    parse_duration = time.time() - start_time

    logger.info(
        f"Parsed Excel file: {len(employees)} employees in {parse_duration:.2f}s",
        extra={
            "file_name": file.filename,
            "file_size": file.size,
            "parse_duration": parse_duration,
            "employee_count": len(employees),
            "rows_per_second": len(employees) / parse_duration if parse_duration > 0 else 0
        }
    )

    # Log warning if slower than target
    if parse_duration > 5.0:
        logger.warning(
            f"Slow Excel parsing: {parse_duration:.2f}s for {len(employees)} employees (target: <5s)"
        )

    return employees
```

**Frontend performance logging:**
```typescript
// Grid render time tracking
useEffect(() => {
  performance.mark('grid-render-start');

  // ... render logic ...

  performance.mark('grid-render-end');
  performance.measure('grid-render', 'grid-render-start', 'grid-render-end');

  const measure = performance.getEntriesByName('grid-render')[0];
  logger.debug(`Grid rendered in ${measure.duration.toFixed(2)}ms`, {
    employeeCount: employees.length,
    renderTime: measure.duration
  });

  // Warn if slower than target
  if (measure.duration > 500) {
    logger.warn(`Slow grid render: ${measure.duration.toFixed(2)}ms (target: <500ms)`, {
      employeeCount: employees.length
    });
  }
}, [employees]);
```

### Pattern: Electron Main Process Logging
**When:** Logging in Electron main process (backend lifecycle, IPC handlers)
**Scenario:** Backend startup and health monitoring

```typescript
import log from 'electron-log';

// Configure electron-log (writes to userData/logs/main.log)
log.transports.file.level = 'info';
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB

const startBackend = async () => {
  const startTime = Date.now();

  try {
    log.info('Starting backend process', {
      executablePath: backendExecutablePath,
      requestedPort: BACKEND_PORT
    });

    const backendProcess = spawn(backendExecutablePath, []);
    const startupDuration = Date.now() - startTime;

    log.info(`Backend started in ${startupDuration}ms`, {
      pid: backendProcess.pid,
      port: BACKEND_PORT,
      startupTime: startupDuration
    });
  } catch (error) {
    log.error('Failed to start backend', {
      error: error instanceof Error ? error.message : String(error),
      executablePath: backendExecutablePath,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};
```

### Pattern: Structured Logging with Context
**When:** Adding context to logs for better debugging
**Scenario:** Intelligence calculation with diagnostic info

```python
logger = logging.getLogger(__name__)

@router.get("/intelligence")
async def get_intelligence():
    session = get_session(LOCAL_USER_ID)

    if not session:
        logger.error(
            "Intelligence: No session found",
            extra={
                "user_id": LOCAL_USER_ID,
                "active_sessions": list(session_mgr.sessions.keys()),
                "operation": "get_intelligence"
            }
        )
        raise HTTPException(status_code=404, detail="No active session")

    logger.info(
        "Intelligence: Processing request",
        extra={
            "user_id": LOCAL_USER_ID,
            "employee_count": len(session.current_employees),
            "session_id": session.session_id,
            "operation": "get_intelligence"
        }
    )

    # ... calculation logic ...
```

### Pattern: Debug Mode Logging
**When:** Adding verbose logging that should only appear in development
**Scenario:** Debugging Excel parsing logic

```python
# Backend (controlled by environment)
import os
import logging

if os.getenv('DEBUG_MODE'):
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

# Use DEBUG level for verbose tracing
logger.debug(f"Parsing row {row_idx}: {row_data}")
```

```typescript
// Frontend (controlled by Vite environment)
import { logger } from '@/utils/logger';

// logger.debug() only logs if import.meta.env.DEV is true
logger.debug('Parsing employee data', { row, index });
logger.debug('Filter state updated', { filters });
```

## Common Debugging Scenarios

| Symptom | Check First | Look For | Solution |
|---------|-------------|----------|----------|
| **Backend won't start** | `backend.log`, Electron console | Port conflict, missing executable, permission errors | Check port 38000, verify executable exists, check permissions |
| **Grid not loading** | Network tab (DevTools) | `/api/employees` API failures, 404/500 errors | Check backend connection, session state |
| **Drag-and-drop broken** | Console errors, React DevTools | Event listener errors, state updates | Check for React strict mode issues, verify event handlers |
| **Excel upload fails** | `backend.log`, Network tab | File size limit, parsing errors, validation failures | Check file format, validate Excel structure |
| **Memory leak** | Chrome DevTools → Memory | Unreleased event listeners, growing heap | Profile memory, check for cleanup in useEffect |
| **Slow rendering** | Performance tab | Long tasks, expensive re-renders | Use React.memo, check for unnecessary renders |
| **Backend crashes** | `backend.log`, `main.log` | Unhandled exceptions, stack traces | Check error logs, verify error handling |
| **Connection lost** | Network tab, `main.log` | Health check failures, process exits | Check backend process, restart attempts |

## Logging Checklist

When adding new logs, ALWAYS include:

**For Errors:**
- [ ] Error message (user-friendly, explains what failed)
- [ ] Stack trace (use `exc_info=True` in Python, pass error object in TS)
- [ ] Context (employee_id, session_id, user_action, file_name)
- [ ] Timestamp (automatic with logger, but include in extra context if needed)
- [ ] Operation name (for filtering logs, e.g., "create_employee", "upload_excel")

**For Performance:**
- [ ] Operation duration (in seconds or milliseconds)
- [ ] Resource count (employees, rows, API calls)
- [ ] Throughput metric (items/second, MB/s)
- [ ] Warning threshold comparison (actual vs target)

**Don't Log:**
- ❌ Sensitive data (passwords, tokens - N/A for local app but avoid as best practice)
- ❌ Full request bodies (may be large, log summary instead)
- ❌ Duplicate errors (log once per unique error, not in every layer)
- ❌ Excessive debug logs in production (use logger.debug for dev-only)

## Performance Logging Thresholds

| Operation | Target | Warning Threshold | Log Level |
|-----------|--------|-------------------|-----------|
| Backend startup | <5s | >10s | WARNING |
| Grid render | <500ms | >1s | WARNING |
| Excel parsing | <5s | >10s | WARNING |
| API request | <200ms | >1s | WARNING |
| Database query | <100ms | >500ms | WARNING |
| Employee drag-drop | <16ms (60fps) | >32ms | WARNING |

**Pattern:**
```python
if duration > WARNING_THRESHOLD:
    logger.warning(f"Slow operation: {operation} took {duration:.2f}s (target: <{target}s)")
else:
    logger.info(f"{operation} completed in {duration:.2f}s")
```

## Production Debugging Workflow

**For end users reporting issues:**

1. **Request logs from user:**
   - Ask user to open: Help → Open Logs Folder
   - Request `backend.log` and `main.log` files
   - Check for ERROR/CRITICAL level entries

2. **Analyze logs:**
   - Search for ERROR or CRITICAL entries
   - Check timestamps around reported issue
   - Look for patterns (repeated errors, performance degradation)

3. **Reproduce with debug logging:**
   - Enable debug mode: Set `DEBUG_MODE=true` env var
   - Ask user to reproduce issue
   - Collect new logs with verbose output

4. **Common log patterns:**
   - `"Port X is in use"` → Port conflict (resolved automatically)
   - `"Backend crashed with code X"` → Backend crash (check stack trace)
   - `"No session found"` → Session state issue (reload file)
   - `"Slow Excel parsing"` → Performance issue (check file size)

**Enable debug logging:**

```bash
# Set environment variable before launching app
export DEBUG_MODE=true  # Linux/macOS
set DEBUG_MODE=true     # Windows
```

```typescript
// Electron main process (index.ts)
if (process.env.DEBUG_MODE) {
  log.transports.file.level = 'debug';
  log.transports.console.level = 'debug';
}
```

```python
# Backend (main.py)
import os
if os.getenv('DEBUG_MODE'):
    logging.basicConfig(level=logging.DEBUG)
```

## Common Logging Mistakes

| Mistake | Why It's Bad | Fix |
|---------|--------------|-----|
| **No context in logs** | Can't identify which operation failed | Add `extra={}` with IDs, user actions |
| **Logging in loops** | Floods logs, hard to read | Log summary after loop completes |
| **Generic error messages** | "Error occurred" tells nothing | Include what failed and why |
| **No stack traces** | Can't debug exceptions | Use `exc_info=True` or pass error object |
| **Logging sensitive data** | Security/privacy risk | Sanitize data, log hashes/IDs only |
| **Too verbose in production** | Performance impact, noise | Use DEBUG level for verbose logs |
| **Not logging important milestones** | Can't track progress | Add INFO logs for key operations |
| **Duplicate logging** | Same error logged at multiple layers | Log once at appropriate layer |

**Example fixes:**

```python
# ❌ WRONG
logger.error("Error occurred")

# ✅ CORRECT
logger.error(
    f"Failed to create employee: {employee_name}",
    exc_info=True,
    extra={"employee_name": employee_name, "session_id": session_id}
)
```

## Decision Tree: What to Log and Where

```
START: Need to log something?
  ↓
  Is it an ERROR?
    YES → Use logger.error() + stack trace + context → LOG IT
    NO ↓

  Is it a performance metric (duration, count)?
    YES → Compare to threshold
      SLOW → logger.warning() with metric + target
      FAST → logger.info() or logger.debug() with metric
    NO ↓

  Is it a user action or milestone?
    YES → logger.info() with action + context → LOG IT
    NO ↓

  Is it verbose debugging info?
    YES → logger.debug() (dev-only) → LOG IT
    NO ↓

  Is it a warning (degraded state, non-fatal issue)?
    YES → logger.warning() with issue + impact → LOG IT
    NO ↓

  DON'T LOG IT (not useful)
```

## Tags for Quick Search

Use these tags in log messages for easier filtering:

- `#startup` - Backend/frontend initialization
- `#shutdown` - Graceful shutdown, cleanup
- `#upload` - File upload operations
- `#parsing` - Excel parsing
- `#api` - API request/response
- `#database` - Database operations
- `#performance` - Performance metrics
- `#health` - Health checks, connection monitoring
- `#error` - Error conditions
- `#warning` - Degraded state
- `#debug` - Development debugging

**Example:**
```python
logger.info("#startup Backend started in {duration:.2f}s", extra={"duration": duration})
logger.warning("#performance Slow parsing: {duration}s", extra={"duration": duration})
```

## Related Patterns
- See [ERROR_HANDLING.md](ERROR_HANDLING.md) for error handling patterns (to be created)
- See [PERFORMANCE.md](PERFORMANCE.md) for performance targets (to be created)
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for architecture overview
- See [GUIDELINES.md](GUIDELINES.md) for general development guidelines
