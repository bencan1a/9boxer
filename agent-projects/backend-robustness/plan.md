# Backend Robustness: Graceful Port Conflict and Crash Recovery

```yaml
status: done
owner: Claude Code
created: 2025-12-22
completed: 2025-12-26
summary:
  - Implement dynamic port selection for backend to handle port conflicts
  - Add connection monitoring and automatic recovery from backend crashes
  - Improve error messages and user experience during failures
completion_notes: |
  Backend robustness improvements fully implemented and tested.
```

## Problem Statement

**Current Issues:**
1. **Port Conflicts:** Backend fails if port 38000 is already in use, resulting in 30-second timeout and generic error message
2. **Backend Crashes:** Frontend immediately quits with harsh error dialog when backend crashes, potentially losing user context
3. **No Recovery:** No retry mechanisms or automatic reconnection exist

**User Impact:**
- Poor first-run experience when port 38000 is occupied
- Data loss risk when backend crashes during active work
- No guidance for troubleshooting connection issues

## Solution Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Spawn Backend Process                                    │
│     ├─ Try PORT env var (default 38000)                       │
│     └─ Backend detects conflict → picks free port            │
│                                                               │
│  2. Parse Backend Stdout                                     │
│     ├─ Capture: {"port": 8001, "status": "ready"}           │
│     └─ Timeout after 5 seconds                               │
│                                                               │
│  3. Notify Renderer via IPC                                  │
│     └─ Send: backend:port-ready event with port number       │
│                                                               │
│  4. Monitor Backend Health                                   │
│     ├─ Periodic /health checks (every 30s)                   │
│     ├─ On failure: Attempt restart (1 retry)                 │
│     └─ Notify renderer of connection status                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process (React)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Wait for backend:port-ready event                        │
│  2. Initialize API client with dynamic port                  │
│  3. Show ConnectionStatus component                          │
│     ├─ Green: Connected                                      │
│     ├─ Yellow: Reconnecting (with retry count)               │
│     └─ Red: Disconnected (manual retry button)               │
│  4. API requests with retry logic                            │
│     └─ Exponential backoff: 0s, 2s, 4s                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI/Uvicorn)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. get_free_port() - Find available port                    │
│  2. Try binding to requested port                            │
│  3. On conflict: Fall back to free port                      │
│  4. Output JSON to stdout: {"port": X, "status": "ready"}    │
│  5. Start uvicorn server                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Backend Dynamic Port Selection

**File:** `backend/src/ninebox/main.py`

**Objectives:**
- Detect port conflicts before binding
- Fall back to free port if requested port unavailable
- Communicate actual port to frontend via stdout JSON

**Implementation Details:**
```python
import socket
import json
import sys

def get_free_port() -> int:
    """Find and return a free port number."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port

def is_port_in_use(port: int) -> bool:
    """Check if a port is already in use."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(("127.0.0.1", port))
    sock.close()
    return result == 0

def main():
    requested_port = int(os.getenv("PORT", "8000"))

    # Check if requested port is available
    if is_port_in_use(requested_port):
        logger.warning(f"Port {requested_port} is in use, finding alternative...")
        port = get_free_port()
        logger.info(f"Using alternative port: {port}")
    else:
        port = requested_port
        logger.info(f"Using requested port: {port}")

    # Output port info to stdout for Electron to capture
    print(json.dumps({"port": port, "status": "ready"}), flush=True)

    # Start server
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
```

**Testing:**
- Unit test: `test_get_free_port()` returns valid port
- Unit test: `test_is_port_in_use()` detects occupied ports
- Integration test: Start two backend instances, verify second uses different port

---

### Phase 2: Frontend Port Discovery (Electron Main)

**File:** `frontend/electron/main/index.ts`

**Objectives:**
- Parse backend stdout to capture actual port
- Pass port to renderer via IPC
- Update health check to use dynamic port
- Improve error messages

**Implementation Details:**
```typescript
interface BackendStartupMessage {
  port: number;
  status: "ready";
}

async function startBackend(): Promise<number> {
  return new Promise((resolve, reject) => {
    const backendPath = getBackendPath();
    let backendPort: number | null = null;

    backendProcess = spawn(backendPath, [], {
      env: {
        ...process.env,
        APP_DATA_DIR: appDataDir,
        PORT: "8000", // Request port 38000, backend may use alternative
      },
    });

    // Capture stdout for port discovery
    backendProcess.stdout?.on("data", (data) => {
      const output = data.toString();
      console.log("Backend:", output);

      // Parse JSON startup message
      try {
        const match = output.match(/\{.*"port".*"status".*\}/);
        if (match) {
          const message: BackendStartupMessage = JSON.parse(match[0]);
          backendPort = message.port;
          console.log(`✅ Backend ready on port ${backendPort}`);
          resolve(backendPort);
        }
      } catch (e) {
        // Not a JSON message, continue
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (backendPort === null) {
        reject(new Error("Backend did not report port within 5 seconds"));
      }
    }, 5000);

    // Error handling
    backendProcess.on("error", (error) => {
      reject(new Error(`Backend failed to start: ${error.message}`));
    });

    backendProcess.on("exit", (code) => {
      if (code !== 0 && backendPort === null) {
        reject(new Error(`Backend exited with code ${code} before startup`));
      }
    });
  });
}

app.on("ready", async () => {
  try {
    createSplashScreen();

    const backendPort = await startBackend();
    BACKEND_PORT = backendPort; // Update global
    BACKEND_URL = `http://localhost:${backendPort}`;

    const ready = await waitForBackend();
    if (!ready) {
      throw new Error("Backend health check failed");
    }

    await createWindow();
    closeSplashScreen();
  } catch (error) {
    closeSplashScreen();
    dialog.showErrorBox(
      "Startup Failed",
      `Failed to start backend:\n\n${error.message}\n\nPlease ensure no other instance is running.`
    );
    app.quit();
  }
});
```

**IPC Handler:**
```typescript
ipcMain.handle("backend:getPort", () => {
  return BACKEND_PORT;
});

ipcMain.handle("backend:getUrl", () => {
  return BACKEND_URL;
});
```

**Testing:**
- Integration test: Spawn backend with port conflict, verify alternative port used
- Integration test: Verify IPC returns correct port to renderer
- E2E test: Playwright test with port 38000 occupied

---

### Phase 3: Dynamic API Client (Frontend Renderer)

**Files:**
- `frontend/src/config.ts`
- `frontend/electron/preload/index.ts`
- `frontend/src/services/api.ts`

**Objectives:**
- Make API_BASE_URL dynamic based on discovered port
- Initialize API client after receiving port from main process
- Add port display in dev mode

**Implementation Details:**

**Preload Bridge:**
```typescript
// frontend/electron/preload/index.ts
const api = {
  backend: {
    getPort: (): Promise<number> => ipcRenderer.invoke("backend:getPort"),
    getUrl: (): Promise<string> => ipcRenderer.invoke("backend:getUrl"),
  },
};

contextBridge.exposeInMainWorld("electron", api);
```

**Config:**
```typescript
// frontend/src/config.ts
let API_BASE_URL = "http://localhost:38000"; // Default fallback

export async function initializeConfig(): Promise<void> {
  if (import.meta.env.MODE === "electron") {
    try {
      API_BASE_URL = await window.electron.backend.getUrl();
      console.log(`API initialized with base URL: ${API_BASE_URL}`);
    } catch (error) {
      console.error("Failed to get backend URL, using default:", error);
    }
  }
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
```

**API Client:**
```typescript
// frontend/src/services/api.ts
class ApiClient {
  private client: AxiosInstance;
  private initialized = false;

  constructor() {
    // Initialize with default, will be updated
    this.client = axios.create({
      baseURL: "http://localhost:38000",
      timeout: 30000,
    });
  }

  async initialize(): Promise<void> {
    const baseURL = await getApiBaseUrl();
    this.client = axios.create({
      baseURL,
      timeout: 30000,
    });
    this.initialized = true;
  }

  // All methods check initialization
  async getEmployees(): Promise<Employee[]> {
    if (!this.initialized) {
      throw new Error("API client not initialized");
    }
    const response = await this.client.get("/api/employees");
    return response.data;
  }
}
```

**App Initialization:**
```typescript
// frontend/src/App.tsx
function App() {
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeConfig();
      await apiClient.initialize();
      setApiReady(true);
    }
    init();
  }, []);

  if (!apiReady) {
    return <LoadingScreen message="Connecting to backend..." />;
  }

  return <MainApp />;
}
```

**Testing:**
- Unit test: Verify config initialization with mock IPC
- Integration test: E2E test with dynamic port
- Dev mode: Display port in footer/status bar

---

### Phase 4: Connection Monitoring & Recovery

**Files:**
- `frontend/electron/main/index.ts` (periodic health checks, restart logic)
- `frontend/src/services/api.ts` (retry logic)
- `frontend/src/components/ConnectionStatus.tsx` (new component)
- `frontend/src/hooks/useConnectionStatus.ts` (new hook)

**Objectives:**
- Periodic health checks after startup
- Automatic backend restart on crash (1 attempt)
- API request retry with exponential backoff
- Visual connection status indicator

**Implementation Details:**

**Periodic Health Checks (Electron Main):**
```typescript
let healthCheckInterval: NodeJS.Timeout | null = null;
let connectionStatus: "connected" | "reconnecting" | "disconnected" = "connected";

function startHealthMonitoring(): void {
  healthCheckInterval = setInterval(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      if (response.status === 200 && connectionStatus !== "connected") {
        connectionStatus = "connected";
        broadcastConnectionStatus("connected");
      }
    } catch (error) {
      if (connectionStatus === "connected") {
        console.warn("Backend health check failed, attempting restart...");
        connectionStatus = "reconnecting";
        broadcastConnectionStatus("reconnecting");
        await attemptBackendRestart();
      }
    }
  }, 30000); // Every 30 seconds
}

async function attemptBackendRestart(): Promise<boolean> {
  try {
    // Kill existing process if still running
    if (backendProcess && !backendProcess.killed) {
      backendProcess.kill();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Attempt restart
    const backendPort = await startBackend();
    BACKEND_PORT = backendPort;
    BACKEND_URL = `http://localhost:${backendPort}`;

    const ready = await waitForBackend();
    if (ready) {
      connectionStatus = "connected";
      broadcastConnectionStatus("connected", backendPort);
      return true;
    }
  } catch (error) {
    console.error("Backend restart failed:", error);
  }

  connectionStatus = "disconnected";
  broadcastConnectionStatus("disconnected");
  return false;
}

function broadcastConnectionStatus(status: string, port?: number): void {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("backend:connection-status", { status, port });
  });
}

// Enhanced exit handler
backendProcess.on("exit", async (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Backend crashed with code ${code}`);
    connectionStatus = "reconnecting";
    broadcastConnectionStatus("reconnecting");

    const restarted = await attemptBackendRestart();
    if (!restarted) {
      const choice = dialog.showMessageBoxSync({
        type: "error",
        title: "Backend Disconnected",
        message: "The backend process has stopped unexpectedly.",
        detail: "Your session data has been saved. You can retry or close the application.",
        buttons: ["Retry", "Close"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) {
        // Retry
        await attemptBackendRestart();
      } else {
        app.quit();
      }
    }
  }
});
```

**API Retry Logic:**
```typescript
// frontend/src/services/api.ts
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Only retry on connection errors, not 4xx/5xx
      if (axios.isAxiosError(error) && !error.response) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error; // Don't retry on HTTP errors
      }
    }
  }

  throw lastError!;
}

// Apply to all API methods
async getEmployees(): Promise<Employee[]> {
  return withRetry(async () => {
    const response = await this.client.get("/api/employees");
    return response.data;
  });
}
```

**Connection Status Component:**
```tsx
// frontend/src/components/ConnectionStatus.tsx
import React, { useState, useEffect } from "react";
import { Chip } from "@mui/material";
import { Circle as CircleIcon } from "@mui/icons-material";

type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleStatusChange = (
      _event: any,
      data: { status: ConnectionStatus; port?: number }
    ) => {
      setStatus(data.status);
      if (data.status === "reconnecting") {
        setRetryCount((prev) => prev + 1);
      } else if (data.status === "connected") {
        setRetryCount(0);
      }
    };

    window.electron.backend.onConnectionStatusChange(handleStatusChange);

    return () => {
      // Cleanup listener
    };
  }, []);

  const statusConfig = {
    connected: { color: "success", icon: "🟢", label: "Connected" },
    reconnecting: { color: "warning", icon: "🟡", label: `Reconnecting... (${retryCount})` },
    disconnected: { color: "error", icon: "🔴", label: "Disconnected" },
  };

  const config = statusConfig[status];

  return (
    <Chip
      icon={<span>{config.icon}</span>}
      label={config.label}
      color={config.color as any}
      size="small"
      sx={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}
    />
  );
}
```

**Testing:**
- Integration test: Kill backend process, verify restart
- Integration test: Verify retry logic with temporary network error
- E2E test: Simulate backend crash, verify UI shows reconnecting state
- Manual test: `taskkill /F /IM ninebox.exe` while app running

---

### Phase 5: Error Messages & UX Improvements

**Files:**
- `frontend/electron/main/index.ts` (error dialogs)
- `frontend/src/components/ErrorBoundary.tsx` (enhanced)

**Objectives:**
- Specific error messages for different failure scenarios
- User-friendly guidance for troubleshooting
- Graceful shutdown with session preservation

**Implementation Details:**

**Error Messages Matrix:**

| Scenario | Error Title | Error Message | Action |
|----------|-------------|---------------|--------|
| Port conflict (before start) | "Port In Use" | "Port 38000 is already in use by another application. Trying alternate port..." | Auto-retry with free port |
| Backend crash (during runtime) | "Backend Disconnected" | "The backend process has stopped unexpectedly. Your session data has been saved. You can retry or close the application." | Retry/Close buttons |
| Health check failure (startup) | "Backend Not Responding" | "The backend started but is not responding to health checks. This may indicate a configuration issue." | Show logs, Quit button |
| Spawn failure | "Backend Failed to Start" | "The backend executable could not be started. Please check that the application is properly installed." | Show error details, Quit button |
| Restart failure | "Restart Failed" | "Unable to restart the backend after ${retryCount} attempts. Please restart the application manually." | Close button |

**Enhanced Error Dialogs:**
```typescript
function showErrorDialog(scenario: ErrorScenario, error?: Error): void {
  const scenarios = {
    portConflict: {
      title: "Port In Use",
      message: "Port 38000 is already in use by another application.",
      detail: "The backend will try to use an alternate port automatically.",
      type: "info",
      buttons: ["OK"],
    },
    backendCrash: {
      title: "Backend Disconnected",
      message: "The backend process has stopped unexpectedly.",
      detail: "Your session data has been saved. You can retry or close the application.",
      type: "error",
      buttons: ["Retry", "Close"],
    },
    healthCheckFailure: {
      title: "Backend Not Responding",
      message: "The backend started but is not responding to health checks.",
      detail: "This may indicate a configuration issue. Check the logs for details.",
      type: "error",
      buttons: ["Show Logs", "Quit"],
    },
    spawnFailure: {
      title: "Backend Failed to Start",
      message: "The backend executable could not be started.",
      detail: `Error: ${error?.message}\n\nPlease check that the application is properly installed.`,
      type: "error",
      buttons: ["Quit"],
    },
  };

  const config = scenarios[scenario];
  return dialog.showMessageBox({
    type: config.type,
    title: config.title,
    message: config.message,
    detail: config.detail,
    buttons: config.buttons,
  });
}
```

**Graceful Shutdown:**
```typescript
async function gracefulShutdown(): Promise<void> {
  console.log("Performing graceful shutdown...");

  // Give backend time to save session
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill("SIGTERM"); // Polite kill
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Force kill if still running
    if (!backendProcess.killed) {
      backendProcess.kill("SIGKILL");
    }
  }

  // Stop health monitoring
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
}

app.on("before-quit", async (event) => {
  event.preventDefault();
  await gracefulShutdown();
  app.exit(0);
});
```

**Testing:**
- Manual test: Verify each error scenario shows correct message
- Manual test: Verify session data preserved after crash
- UX test: Validate error messages are clear and actionable

---

## Testing Strategy

### Unit Tests
- `test_get_free_port()` - Returns valid port in range 1024-65535
- `test_is_port_in_use()` - Detects occupied ports correctly
- `test_retry_logic()` - Exponential backoff with correct delays
- `test_connection_status_transitions()` - State machine correctness

### Integration Tests
- **Port Conflict Scenario:** Start two backend instances, verify second uses different port
- **Health Check Monitoring:** Verify periodic health checks run every 30 seconds
- **Backend Restart:** Kill backend process, verify automatic restart
- **IPC Communication:** Verify port discovery and status broadcasts work

### E2E Tests (Playwright)
- **Port Conflict on Startup:** Occupy port 38000, launch app, verify alternative port used
- **Backend Crash During Operation:**
  1. Launch app
  2. Upload data and interact with UI
  3. Kill backend process (`taskkill /F /IM ninebox.exe`)
  4. Verify "Reconnecting..." UI appears
  5. Verify backend restarts automatically
  6. Verify data persisted after reconnection
- **Multiple Restart Attempts:** Crash backend repeatedly, verify retry limit

### Manual Testing Checklist
- [ ] Start app with port 38000 occupied (e.g., run `python -m http.server 38000`)
- [ ] Verify app starts on alternate port and functions normally
- [ ] Kill backend process mid-session: `taskkill /F /IM ninebox.exe` (Windows) or `kill -9 <pid>` (Linux/macOS)
- [ ] Verify "Reconnecting..." status appears
- [ ] Verify backend restarts and app recovers
- [ ] Upload data, crash backend, verify data preserved after restart
- [ ] Test error dialogs for each failure scenario
- [ ] Verify graceful shutdown saves session data

---

## Acceptance Criteria

### Must Have
- [x] Backend detects port conflicts and falls back to free port
- [x] Frontend receives actual port from backend via stdout parsing
- [x] API client initializes with dynamic port
- [x] Periodic health checks run after startup (30s interval)
- [x] Backend automatically restarts once on crash
- [x] API requests retry on connection errors (3 attempts, exponential backoff)
- [x] Connection status indicator visible in UI (Green/Yellow/Red)
- [x] Error messages specific to failure scenarios
- [x] Session data preserved through crashes

### Nice to Have
- [ ] Port number displayed in dev mode (footer/status bar)
- [ ] "Show Logs" button in error dialogs opens log file
- [ ] Health check interval configurable via environment variable
- [ ] Telemetry/metrics for crash frequency
- [ ] User preference: "Always use port X" option

### Out of Scope
- Load balancing across multiple backend instances
- Backend clustering/high availability
- Network proxy support
- Custom DNS resolution

---

## Risks & Mitigation

### Risk: Port discovery timeout
**Impact:** App hangs during startup if backend never reports port
**Mitigation:** 5-second timeout with clear error message, fallback to default port

### Risk: Multiple restart attempts drain resources
**Impact:** Memory/CPU spike if backend repeatedly crashes
**Mitigation:** Limit to 1 automatic restart, then require manual user action

### Risk: Port changes during session (backend restart)
**Impact:** Frontend API requests fail if port changes
**Mitigation:** Broadcast port change via IPC, reinitialize API client

### Risk: Race condition in stdout parsing
**Impact:** Port message missed if backend outputs other logs first
**Mitigation:** Use JSON format with regex matching, only parse first valid message

### Risk: Backend hangs instead of crashing
**Impact:** Health check never fails, app appears frozen
**Mitigation:** 5-second timeout on health checks, show "Not Responding" error

---

## Rollout Plan

### Phase 1: Backend Port Selection (Low Risk)
- Deploy backend changes first
- Fully backward compatible (still works with hardcoded port 38000)
- Rollback: Revert to previous main.py

### Phase 2: Frontend Port Discovery (Medium Risk)
- Deploy Electron main process changes
- Requires backend from Phase 1
- Rollback: Revert to hardcoded port 38000

### Phase 3: API Client & Monitoring (Medium Risk)
- Deploy renderer and API client changes
- Requires Phases 1-2
- Rollback: Disable health monitoring, use default port

### Phase 4: Testing & Validation (Low Risk)
- No production impact
- Identify edge cases before release

### Phase 5: Release (High Impact)
- Full release to users
- Monitor crash reports and telemetry
- Hotfix ready if issues detected

---

## Success Metrics

### Quantitative
- **Port conflict failures:** Reduce from 100% to 0%
- **Backend crash recovery rate:** Target >90% automatic recovery
- **Mean time to recovery (MTTR):** <5 seconds from crash to restored connection
- **User-initiated restarts:** Reduce by 80% (fewer "app won't start" issues)

### Qualitative
- Users no longer report "Port 38000 in use" errors
- Improved first-run experience
- Reduced support tickets for connection issues
- Positive feedback on reconnection UX

---

## Future Enhancements

### V2: Advanced Monitoring
- Persistent connection status log
- Health check history visualization
- Backend performance metrics (CPU, memory, response times)

### V3: Multi-Backend Support
- Run multiple backend instances for load balancing
- Client-side load balancing with round-robin
- Backend pool management

### V4: Cloud Backend Option
- Allow users to connect to remote backend
- Hybrid mode: Local backend with cloud backup
- Multi-user collaboration

---

## References

### Existing Implementations
- E2E test port selection: `backend/tests/e2e/test_frozen.py:42-48`
- Playwright port detection: `frontend/playwright/global-setup.ts:50-56`

### Documentation
- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [FastAPI Uvicorn Configuration](https://www.uvicorn.org/settings/)
- [Axios Retry Patterns](https://github.com/softonic/axios-retry)

### Related Files
- `frontend/electron/main/index.ts` - Main process, backend lifecycle
- `backend/src/ninebox/main.py` - Backend entry point
- `frontend/src/services/api.ts` - API client
- `frontend/src/config.ts` - Configuration management

---

## Agent Assignment

This project is broken into 5 parallelizable chunks:

| Agent | Focus Area | Key Files | Dependencies |
|-------|------------|-----------|--------------|
| **Agent 1** | Backend Port Selection | `backend/src/ninebox/main.py` | None |
| **Agent 2** | Electron Port Discovery | `frontend/electron/main/index.ts` | Agent 1 |
| **Agent 3** | Dynamic API Client | `frontend/src/config.ts`, `frontend/src/services/api.ts`, `frontend/electron/preload/index.ts` | Agent 2 |
| **Agent 4** | Connection Monitoring | `frontend/electron/main/index.ts`, `frontend/src/components/ConnectionStatus.tsx`, `frontend/src/hooks/useConnectionStatus.ts` | Agent 2, Agent 3 |
| **Agent 5** | Error Messages & UX | `frontend/electron/main/index.ts`, `frontend/src/components/ErrorBoundary.tsx` | Agent 2 |

**Agents 1, 2, 3 are sequential (must complete in order).**
**Agents 4 and 5 can run in parallel after Agent 3 completes.**

For initial parallel execution, **launch Agents 1-3 in sequence, then Agents 4-5 in parallel.**

---

## Changelog

### 2025-12-22 - Initial Plan
- Created comprehensive plan for backend robustness
- Defined 5-phase implementation strategy
- Established acceptance criteria and success metrics
