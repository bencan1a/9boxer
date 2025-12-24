# Agent 2: Integration Guide for Agent 3, 4, and 5

## Overview

Agent 2 has successfully implemented port discovery in the Electron main process. The backend's actual port is now captured from stdout JSON and made available to the renderer process via IPC.

## Key Changes Summary

### Global Variables (Main Process)
```typescript
// frontend/electron/main/index.ts
let BACKEND_PORT = 8000; // Updated dynamically after port discovery
let BACKEND_URL = `http://localhost:${BACKEND_PORT}`; // Updated dynamically
```

### IPC Handlers (Main Process)
```typescript
// Available for renderer to call via ipcRenderer.invoke()
ipcMain.handle('backend:getPort', () => BACKEND_PORT);
ipcMain.handle('backend:getUrl', () => BACKEND_URL);
```

### Preload Bridge (Renderer Access)
```typescript
// frontend/electron/preload/index.ts
window.electronAPI.backend.getPort(): Promise<number>
window.electronAPI.backend.getUrl(): Promise<string>
```

## For Agent 3: Dynamic API Client

### Your Objectives
1. Initialize API client with dynamic backend URL
2. Call IPC handlers during app startup
3. Configure axios/fetch with discovered URL
4. Handle initialization timing

### Implementation Pattern

#### Option A: Initialize in App.tsx (Recommended)

**File:** `frontend/src/App.tsx`

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [backendReady, setBackendReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeBackend() {
      try {
        // Check if running in Electron
        if (window.electronAPI?.backend) {
          const backendUrl = await window.electronAPI.backend.getUrl();
          console.log('🔌 Initializing API client with:', backendUrl);

          // Configure axios with discovered URL
          axios.defaults.baseURL = backendUrl;
        } else {
          // Web mode fallback
          axios.defaults.baseURL = 'http://localhost:8000';
          console.log('🌐 Running in web mode, using default backend URL');
        }

        setBackendReady(true);
      } catch (err) {
        console.error('Failed to initialize backend:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    initializeBackend();
  }, []);

  if (error) {
    return (
      <div>
        <h1>Backend Initialization Failed</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!backendReady) {
    return <div>Connecting to backend...</div>;
  }

  return <YourMainApp />;
}
```

#### Option B: Initialize in Config Module

**File:** `frontend/src/config.ts` (create if doesn't exist)

```typescript
let API_BASE_URL = 'http://localhost:8000'; // Default fallback
let initialized = false;

export async function initializeConfig(): Promise<void> {
  if (initialized) return;

  try {
    // Check if running in Electron
    if (window.electronAPI?.backend) {
      const backendUrl = await window.electronAPI.backend.getUrl();
      API_BASE_URL = backendUrl;
      console.log('✅ API config initialized:', API_BASE_URL);
    } else {
      console.log('ℹ️ Running in web mode, using default URL');
    }
    initialized = true;
  } catch (error) {
    console.error('❌ Failed to initialize API config:', error);
    throw error;
  }
}

export function getApiBaseUrl(): string {
  if (!initialized) {
    console.warn('⚠️ API config not initialized yet, using default');
  }
  return API_BASE_URL;
}
```

**File:** `frontend/src/services/api.ts`

```typescript
import axios from 'axios';
import { initializeConfig, getApiBaseUrl } from '../config';

class ApiClient {
  private client: AxiosInstance;
  private ready = false;

  constructor() {
    // Initialize with default, will be updated
    this.client = axios.create({
      baseURL: 'http://localhost:8000',
      timeout: 30000,
    });
  }

  async initialize(): Promise<void> {
    await initializeConfig();
    const baseURL = getApiBaseUrl();

    this.client = axios.create({
      baseURL,
      timeout: 30000,
    });

    this.ready = true;
    console.log('✅ API client ready with base URL:', baseURL);
  }

  // All API methods check readiness
  async getEmployees(): Promise<Employee[]> {
    if (!this.ready) {
      throw new Error('API client not initialized. Call initialize() first.');
    }
    const response = await this.client.get('/api/employees');
    return response.data;
  }

  // ... other methods
}

export const apiClient = new ApiClient();
```

**File:** `frontend/src/main.tsx`

```typescript
import { apiClient } from './services/api';

async function bootstrap() {
  await apiClient.initialize();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap().catch(error => {
  console.error('Failed to bootstrap app:', error);
});
```

### TypeScript Support

**File:** `frontend/src/global.d.ts` (create if doesn't exist)

```typescript
interface ElectronAPI {
  platform: string;
  version: string;
  backend: {
    getPort: () => Promise<number>;
    getUrl: () => Promise<string>;
  };
  // ... other existing properties
}

interface Window {
  electronAPI?: ElectronAPI;
}
```

### Testing Recommendations

1. **Test in Electron mode:**
   ```bash
   npm run electron:dev
   ```
   Verify API client uses dynamic URL from IPC.

2. **Test in web mode:**
   ```bash
   npm run dev
   ```
   Verify API client falls back to localhost:8000.

3. **Test with port conflict:**
   - Start Python server on port 8000
   - Start Electron app
   - Verify API client uses alternative port

4. **Test API calls:**
   - Make actual API calls after initialization
   - Verify they reach the correct backend port

## For Agent 4: Connection Monitoring

### Your Objectives
1. Monitor backend health with periodic checks
2. Handle backend crashes and restarts
3. Notify renderer of connection status changes
4. Update backend port if it changes on restart

### Key Integration Points

#### Backend Port May Change on Restart
If the backend crashes and restarts, it may use a different port. You'll need to:

1. Update global variables after successful restart:
   ```typescript
   // In attemptBackendRestart()
   const newPort = await startBackend(); // startBackend() returns port
   BACKEND_PORT = newPort;
   BACKEND_URL = `http://localhost:${newPort}`;
   ```

2. Broadcast port change to renderer:
   ```typescript
   function broadcastPortChange(port: number, url: string): void {
     BrowserWindow.getAllWindows().forEach(window => {
       window.webContents.send('backend:port-changed', { port, url });
     });
   }
   ```

3. Renderer should listen and reinitialize API client:
   ```typescript
   // In renderer
   if (window.electronAPI) {
     ipcRenderer.on('backend:port-changed', (event, { port, url }) => {
       console.log('🔌 Backend port changed:', port);
       axios.defaults.baseURL = url;
     });
   }
   ```

#### Health Check Already Uses Dynamic URL
The existing `waitForBackend()` function already uses `BACKEND_URL`, so health checks will automatically use the correct port after discovery.

#### Suggested Connection Status Events

**Main Process:**
```typescript
type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

function broadcastConnectionStatus(status: ConnectionStatus, port?: number): void {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('backend:connection-status', { status, port });
  });
}

// After health check success
broadcastConnectionStatus('connected', BACKEND_PORT);

// After health check failure
broadcastConnectionStatus('reconnecting');

// After failed restart
broadcastConnectionStatus('disconnected');
```

**Preload Bridge:**
```typescript
// Add to preload/index.ts
backend: {
  // ... existing methods
  onConnectionStatusChange: (callback: (data: { status: string; port?: number }) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on('backend:connection-status', listener);
    return () => ipcRenderer.removeListener('backend:connection-status', listener);
  },
}
```

## For Agent 5: Error Messages & UX

### Your Objectives
1. Improve error dialog UX
2. Add "Show Logs" button
3. Add retry mechanism
4. Provide better troubleshooting guidance

### Current Error Handling (Already Implemented)

Agent 2 already categorizes errors:
- **Backend Executable Not Found:** Missing backend binary
- **Backend Timeout:** Port discovery or health check timeout
- **Backend Crashed on Startup:** Backend exited with non-zero code
- **Backend Not Responding:** Health check failed

### Suggested Enhancements

#### Add "Show Logs" Button

**Main Process:**
```typescript
function showErrorWithLogs(title: string, message: string, detail: string): void {
  const { shell } = require('electron');
  const appDataPath = app.getPath('userData');
  const logPath = path.join(appDataPath, 'backend.log');

  const choice = dialog.showMessageBoxSync({
    type: 'error',
    title,
    message,
    detail,
    buttons: ['Show Logs', 'Quit'],
    defaultId: 0,
    cancelId: 1,
  });

  if (choice === 0) {
    // Show Logs
    shell.openPath(logPath);
  }
}
```

#### Add Retry Mechanism

```typescript
async function startupWithRetry(maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const port = await startBackend();
      BACKEND_PORT = port;
      BACKEND_URL = `http://localhost:${port}`;

      const ready = await waitForBackend();
      if (ready) return true;
    } catch (error) {
      console.error(`Startup attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        // Ask user if they want to retry
        const choice = dialog.showMessageBoxSync({
          type: 'warning',
          title: 'Startup Failed',
          message: `Failed to start backend (attempt ${attempt}/${maxRetries})`,
          detail: `Error: ${error.message}\n\nWould you like to retry?`,
          buttons: ['Retry', 'Quit'],
        });

        if (choice === 1) return false; // User chose Quit

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  return false;
}
```

#### Copy Error Details to Clipboard

```typescript
import { clipboard } from 'electron';

function showErrorWithCopy(title: string, message: string, detail: string): void {
  const errorDetails = `${title}\n\n${message}\n\n${detail}`;

  const choice = dialog.showMessageBoxSync({
    type: 'error',
    title,
    message,
    detail: `${detail}\n\n(Click "Copy Details" to copy error for support)`,
    buttons: ['Copy Details', 'Quit'],
  });

  if (choice === 0) {
    clipboard.writeText(errorDetails);
    console.log('Error details copied to clipboard');
  }
}
```

## Common Patterns

### Checking if Running in Electron

```typescript
// In renderer
const isElectron = Boolean(window.electronAPI);

if (isElectron) {
  // Use dynamic port discovery
  const url = await window.electronAPI.backend.getUrl();
} else {
  // Use default for web mode
  const url = 'http://localhost:8000';
}
```

### Graceful Degradation

```typescript
// Always provide fallback for web mode
async function getBackendUrl(): Promise<string> {
  try {
    if (window.electronAPI?.backend) {
      return await window.electronAPI.backend.getUrl();
    }
  } catch (error) {
    console.warn('Failed to get backend URL from Electron:', error);
  }

  // Fallback to default
  return 'http://localhost:8000';
}
```

### Debugging

```typescript
// Add to DevTools console for debugging
async function debugBackendConfig() {
  if (!window.electronAPI?.backend) {
    console.log('Not running in Electron mode');
    return;
  }

  const port = await window.electronAPI.backend.getPort();
  const url = await window.electronAPI.backend.getUrl();

  console.log('Backend Configuration:');
  console.log('  Port:', port);
  console.log('  URL:', url);
  console.log('  Axios Base URL:', axios.defaults.baseURL);
}

// Usage in DevTools
debugBackendConfig();
```

## File Locations Reference

### Modified Files (Agent 2)
- `frontend/electron/main/index.ts` - Main process with port discovery
- `frontend/electron/preload/index.ts` - IPC bridge to renderer

### Files to Modify (Agent 3)
- `frontend/src/config.ts` - API configuration
- `frontend/src/services/api.ts` - API client initialization
- `frontend/src/App.tsx` or `frontend/src/main.tsx` - App initialization
- `frontend/src/global.d.ts` - TypeScript declarations

### Files to Modify (Agent 4)
- `frontend/electron/main/index.ts` - Add health monitoring
- `frontend/electron/preload/index.ts` - Add connection status events
- `frontend/src/components/ConnectionStatus.tsx` - New component
- `frontend/src/hooks/useConnectionStatus.ts` - New hook

### Files to Modify (Agent 5)
- `frontend/electron/main/index.ts` - Enhance error dialogs
- `frontend/src/components/ErrorBoundary.tsx` - React error boundary

## Questions & Support

If you encounter issues during integration:

1. **Check console logs** for port discovery messages:
   - "✅ Backend port discovered: {port}"
   - "🔌 Backend URL updated to: {url}"

2. **Verify IPC handlers** in DevTools:
   ```javascript
   await window.electronAPI.backend.getPort()
   await window.electronAPI.backend.getUrl()
   ```

3. **Check backend logs** (production mode):
   - Location: `%APPDATA%/9Boxer/backend.log` (Windows)
   - Look for JSON output: `{"port": ..., "status": "ready"}`

4. **Verify backend changes** (Agent 1):
   - Backend must output JSON to stdout
   - JSON must be flushed immediately
   - Format: `{"port": <number>, "status": "ready"}`

## Success Criteria

Before marking Agent 2 work as complete:

- [ ] TypeScript compilation passes
- [ ] IPC handlers accessible from renderer
- [ ] Port discovery works with default port (8000)
- [ ] Port discovery works with port conflict
- [ ] Error messages are specific and helpful
- [ ] Backward compatible (works without JSON output)

Before starting Agent 3/4/5:

- [ ] Agent 1 backend changes are complete
- [ ] Backend outputs JSON correctly
- [ ] Manual testing completed (see testing-guide-agent-2.md)
- [ ] Integration notes reviewed
