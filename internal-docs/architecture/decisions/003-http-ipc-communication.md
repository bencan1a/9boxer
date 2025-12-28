# ADR-003: HTTP Backend Communication

**Status:** ✅ Accepted
**Date:** 2024-Q4 (Initial implementation)
**Tags:** #backend #frontend #communication #electron #ipc

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Use HTTP (localhost:38000) for backend-frontend communication instead of Electron IPC | Need to communicate between React frontend and Python backend | RESTful API design, familiar patterns, backend can be tested independently, easier debugging |

## When to Reference This ADR

- Before adding new IPC channels between main and renderer processes
- When considering direct Electron IPC for backend communication
- When debugging communication issues between frontend and backend
- When evaluating performance of communication layer
- When adding new API endpoints

## Alternatives Comparison

| Option | Pros | Cons | Performance | Decision |
|--------|------|------|-------------|----------|
| **HTTP (localhost)** | RESTful, testable, language-agnostic, standard tooling | Slightly slower than IPC | ⭐⭐⭐⭐ (~5-10ms per call) | ✅ Chosen |
| Electron IPC → Main → Backend | Native Electron pattern | Complex proxy layer, hard to test, tight coupling | ⭐⭐⭐⭐⭐ (~2-5ms per call) | ❌ Rejected |
| WebSockets | Real-time updates | Overhead for simple CRUD, no REST semantics | ⭐⭐⭐⭐ (~5-10ms, persistent connection) | ❌ Rejected |
| gRPC | High performance, typed | Complexity, harder debugging, less familiar | ⭐⭐⭐⭐⭐ (~2-5ms per call) | ❌ Rejected |
| Unix Sockets | Fast local communication | Platform-specific, Windows support limited | ⭐⭐⭐⭐⭐ (~1-3ms per call) | ❌ Rejected |

## Decision Criteria Matrix

| Criterion | Weight | Winner | Rationale |
|-----------|--------|--------|-----------|
| **Simplicity** | High | HTTP | Standard REST patterns, no custom protocol |
| **Testability** | High | HTTP | Can test backend independently with curl/Postman |
| **Debugging** | High | HTTP | Browser DevTools Network tab, standard tools |
| **Familiarity** | High | HTTP | Team knows REST, no learning curve |
| **Performance** | Low | IPC/gRPC | But 5-10ms latency acceptable for UI operations |
| **Type Safety** | Medium | gRPC | But TypeScript + OpenAPI provides adequate typing |

**Final Score:** HTTP wins 4/5 high-weighted criteria

## Implementation Details

### Key Constraints

- **Localhost only**: Backend MUST bind to `127.0.0.1`, never `0.0.0.0` (security)
- **Dynamic port discovery**: Backend finds available port (38000 or next), reports to Electron
- **Health checks**: Electron polls `/health` endpoint to verify backend is alive
- **No authentication**: Not needed for localhost-only communication
- **CORS disabled**: Not needed since backend and frontend are same origin (both localhost)

### Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Electron App                                                │
│                                                             │
│  ┌──────────────────┐          ┌──────────────────┐       │
│  │ Renderer Process │  HTTP    │ Backend Process  │       │
│  │ (React + Vite)   │ ───────→ │ (FastAPI)        │       │
│  │                  │ ←─────── │ localhost:38000  │       │
│  │ axios requests   │   JSON   │                  │       │
│  └──────────────────┘          └──────────────────┘       │
│                                                             │
│  Example Request:                                          │
│  GET http://localhost:38000/api/employees                  │
│  Accept: application/json                                  │
│                                                             │
│  Example Response:                                         │
│  200 OK                                                    │
│  Content-Type: application/json                            │
│  {"employees": [...]}                                      │
└─────────────────────────────────────────────────────────────┘
```

### Backend Configuration

**Port Discovery:** `backend/src/ninebox/main.py`
```python
import socket
import json

def find_available_port(start: int = 38000, max_attempts: int = 10) -> int:
    """Find an available port starting from the given port."""
    for port in range(start, start + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("No available ports found")

# Find port and start server
port = find_available_port(start=38000)

# Print JSON message for Electron to parse (on stdout)
print(json.dumps({"port": port, "status": "ready"}), flush=True)

# Start Uvicorn (FastAPI server)
uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
```

**API Routes:** `backend/src/ninebox/api/`
```python
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api")

@router.get("/employees")
async def get_employees() -> EmployeesResponse:
    """Get all employees in current session."""
    employees = employee_service.get_all()
    return EmployeesResponse(employees=employees)

@router.post("/employees/{employee_id}/move")
async def move_employee(employee_id: int, position: MoveRequest) -> MoveResponse:
    """Move employee to new grid position."""
    employee = employee_service.move(employee_id, position.performance, position.potential)
    change = create_change_event(employee)
    return MoveResponse(employee=employee, change=change)
```

### Frontend Configuration

**API Client:** `frontend/src/services/api.ts`
```typescript
import axios from 'axios';

class APIClient {
  private baseURL: string = '';

  async initialize(): Promise<void> {
    // Get backend URL from Electron main process
    if (window.electronAPI) {
      this.baseURL = await window.electronAPI.getBackendUrl();
    } else {
      // Development fallback
      this.baseURL = 'http://localhost:38000';
    }
  }

  async getEmployees(): Promise<EmployeesResponse> {
    const response = await axios.get(`${this.baseURL}/api/employees`);
    return response.data;
  }

  async moveEmployee(
    employeeId: number,
    performance: string,
    potential: string
  ): Promise<MoveResponse> {
    const response = await axios.post(
      `${this.baseURL}/api/employees/${employeeId}/move`,
      { performance, potential }
    );
    return response.data;
  }
}

export const apiClient = new APIClient();
```

**Health Monitoring:** `frontend/electron/main/index.ts`
```typescript
// Wait for backend to be ready
async function waitForBackend(maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 1000 });
      if (response.status === 200) return true;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// Periodic health checks
setInterval(async () => {
  try {
    await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    connectionStatus = 'connected';
  } catch {
    connectionStatus = 'reconnecting';
    attemptBackendRestart();
  }
}, 30000); // Every 30 seconds
```

### Related Files

- `backend/src/ninebox/main.py` - Backend entry point, port discovery
- `backend/src/ninebox/api/` - FastAPI route handlers
- `frontend/src/services/api.ts` - Frontend API client
- `frontend/electron/main/index.ts` - Backend subprocess management, health checks
- `frontend/src/store/sessionStore.ts` - Zustand store calling API client

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Slightly slower (~5-10ms)** | Standard REST patterns, easier debugging | Acceptable latency for UI operations |
| **Network stack overhead** | Language-agnostic, testable independently | Use HTTP/1.1 keepalive, reuse connections |
| **No type safety across boundary** | Simpler architecture | Use TypeScript types + OpenAPI schema |
| **Port conflicts possible** | No complex IPC proxy layer | Dynamic port discovery, retry logic |

## Why Not Electron IPC?

**Rejected Approach:**
```
Renderer ──IPC──> Main Process ──(translate)──> Backend Subprocess
```

**Problems with IPC approach:**
1. **Tight coupling**: Main process becomes proxy layer, knows all API routes
2. **Hard to test**: Can't test backend without Electron environment
3. **Type complexity**: Need to maintain types in 3 places (Renderer, Main, Backend)
4. **Error translation**: Main process must translate HTTP errors to IPC errors
5. **Debugging harder**: Can't use browser Network tab, need Electron DevTools

**HTTP approach is simpler:**
```
Renderer ──HTTP──> Backend Subprocess (no middleman)
```

## Performance Considerations

### Latency Comparison (local measurements)

| Operation | HTTP (localhost) | Theoretical IPC | Difference |
|-----------|------------------|-----------------|------------|
| Get employees (100 rows) | ~8ms | ~3ms | +5ms |
| Move employee | ~6ms | ~2ms | +4ms |
| Upload Excel (1MB) | ~150ms | ~140ms | +10ms |
| Export Excel (1MB) | ~200ms | ~190ms | +10ms |

**Verdict:** 5-10ms overhead is imperceptible to users (<16ms frame budget at 60fps)

### When to Optimize

**Don't optimize unless:**
- User-perceived latency >100ms (noticeable lag)
- Operations called >10 times/second (not our use case)
- Profiling shows HTTP as bottleneck (not observed)

**If optimization needed:**
1. **First**: Optimize backend logic (SQL queries, Excel parsing)
2. **Second**: Add caching layer (Redis, in-memory)
3. **Last resort**: Switch to WebSockets or gRPC (requires major refactor)

## Related Decisions

- See [ADR-001](001-electron-desktop-architecture.md) for Electron process model
- See [ADR-002](002-pyinstaller-backend-bundling.md) for backend bundling
- See [ADR-004](004-zustand-state-management.md) for frontend state management

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/api/ipc-main)
- [RESTful API Design](https://restfulapi.net/)
