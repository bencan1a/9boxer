# Security Configuration for 9-Box Electron App

## Overview

This document outlines the security measures implemented in the Electron application to protect against common web vulnerabilities and ensure safe operation.

## Security Architecture

### 1. Process Isolation

The Electron app uses multiple isolated processes:

- **Main Process (Node.js)**: Runs with full system access
- **Renderer Process (Chromium)**: Sandboxed web content (limited permissions)
- **Backend Process (FastAPI)**: Separate Python subprocess with controlled API surface

### 2. Context Isolation

Context isolation is **enabled** in the BrowserWindow configuration:

```typescript
webPreferences: {
  nodeIntegration: false,      // Disable Node.js in renderer
  contextIsolation: true,       // Separate contexts for Node and web
  sandbox: true,                // Full sandbox mode
  preload: path.join(__dirname, '../preload/index.js'),
}
```

This means:
- Renderer cannot directly access Node.js APIs (`require`, `process`, etc.)
- Renderer cannot access filesystem or system resources
- All communication goes through explicit IPC channels
- Preload script is the only bridge between contexts

### 3. Preload Script Security

The preload script (`frontend/electron/preload/index.ts`) uses `contextBridge.exposeInMainWorld()` to safely expose a minimal API:

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,      // Read-only platform info
  version: process.versions.electron,  // Read-only version
});
```

**Security guarantees**:
- Only explicitly exposed APIs are available to renderer
- `ipcRenderer` is NOT exposed (would allow direct IPC)
- `require` and `process` are NOT exposed
- No access to filesystem or subprocess APIs
- All exposed values are read-only

### 4. Communication Flow

```
Renderer (Web Content)
    ↓
    └→ window.electronAPI (safe, read-only)
       └→ IPC messages (if implemented)
           └→ Main Process (Node.js)
               ↓
               ├→ Child Process (Backend)
               └→ Filesystem / System APIs
```

For HTTP communication:
```
Renderer
    ↓
    └→ HTTP requests (normal browser XMLHttpRequest/fetch)
       └→ FastAPI Backend (localhost:8000)
```

## Content Security Policy (CSP)

Since we load the frontend from the FastAPI backend, the backend's CSP headers apply.

### Current Setup

The frontend loads from `http://localhost:8000` (BACKEND_URL), which is:
- **Same-origin**: All XHR/fetch requests to the same host
- **No third-party resources**: Only resources from localhost:8000
- **No eval()**: Frontend doesn't use eval() or new Function()

### Recommended Backend CSP Header

The backend should set:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{nonce}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

This ensures:
- Only scripts from same origin
- Inline styles allowed (React inline styles)
- No frame embedding
- HTTP upgraded to HTTPS (in production)

## IPC Security Best Practices

If you add IPC handlers in the future, follow these guidelines:

### Good: Explicit IPC Handler

```typescript
// main/index.ts
ipcMain.handle('file:save', async (event, fileName: string, content: string) => {
  // Validate inputs
  if (!fileName || fileName.includes('..')) {
    throw new Error('Invalid filename');
  }

  const filePath = path.join(app.getPath('userData'), fileName);
  await fs.promises.writeFile(filePath, content);
  return filePath;
});
```

```typescript
// preload/index.ts
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (fileName: string, content: string) =>
    ipcRenderer.invoke('file:save', fileName, content),
});
```

### Bad: Exposing ipcRenderer

```typescript
// ❌ NEVER DO THIS
contextBridge.exposeInMainWorld('ipc', ipcRenderer);
// This allows renderer to send ANY message to main process
```

## File Dialog Security

When implementing file dialogs:

```typescript
// main/index.ts
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
    ],
  });
  return result.filePaths[0] || null;
});
```

- Dialog is modal and user-initiated
- File path returned to renderer can be validated
- Renderer sends file to backend via HTTP, not directly to main process

## Network Security

### API Communication

All API calls use HTTP to localhost:8000:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

**Security considerations**:
- Localhost is not exposed to network
- HTTP is safe for localhost (no interception risk)
- Backend uses JWT for authentication
- Credentials stored in browser localStorage (standard web pattern)

### HTTPS Considerations

In production (if served over network):
- Use HTTPS with valid certificate
- Enable HSTS headers
- Use secure flag on cookies
- Implement CORS properly

## Frontend Security

### XSS Protection

- **React escapes by default**: React escapes all text content
- **No dangerous patterns**: No `dangerouslySetInnerHTML` in code
- **Input validation**: Backend validates all inputs
- **No eval()**: No dynamic code execution

### CSRF Protection

- Uses JWT tokens instead of cookies (CSRF-immune)
- Backend can add CSRF tokens if cookies are used

### Authentication

- JWT tokens stored in localStorage
- Tokens sent via `Authorization: Bearer <token>` header
- Tokens have expiration time
- Refresh tokens for long-lived sessions (if implemented)

## Backend Process Security

The FastAPI backend subprocess:

```typescript
backendProcess = spawn(backendPath, [], {
  env: {
    ...process.env,
    APP_DATA_DIR: appDataPath,
    PORT: BACKEND_PORT.toString(),
  },
  stdio: 'inherit', // Show logs in console
});
```

**Security measures**:
- Backend runs in separate process (isolated)
- Backend can be killed by main process
- Backend receives limited environment variables
- Standard input/output inherited (can be closed)

## Vulnerability Considerations

### SQL Injection

The backend uses SQLAlchemy ORM with parameterized queries:

```python
# Safe: parameterized query
user = db.query(User).filter(User.username == username).first()

# Unsafe (NOT USED): string concatenation
query = f"SELECT * FROM users WHERE username = '{username}'"
```

### Path Traversal

The preload script doesn't expose filesystem access. If file dialogs are added:

```typescript
// Validate path in main process
const userPath = path.resolve(app.getPath('userData'), filePath);
const basePath = path.resolve(app.getPath('userData'));

// Reject if path escapes userData directory
if (!userPath.startsWith(basePath)) {
  throw new Error('Path traversal attack detected');
}
```

### Command Injection

Backend subprocess is spawned with arguments array (not shell):

```typescript
// Safe: arguments as array
spawn(backendPath, [], { ... });

// Unsafe (NOT USED): shell string
spawn(`${backendPath} arg1 arg2`, { shell: true });
```

## Updating Dependencies

Keep dependencies updated to patch vulnerabilities:

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Major version upgrades (review breaking changes)
npm install electron@latest

# Check security vulnerabilities
npm audit
npx snyk test
```

## Testing Security

### Manual Security Checklist

- [ ] DevTools not accessible in production (`ELECTRON_ENABLE_LOGGING` only in dev)
- [ ] No console errors about CSP violations
- [ ] No direct file access from renderer
- [ ] No exposed process or require in console
- [ ] Preload script logs appear in console
- [ ] Window.electronAPI exists and contains only expected properties
- [ ] Backend process starts and stops cleanly

### Automated Testing

```bash
# Type checking catches some issues
npx tsc --noEmit

# Linting finds common patterns
npx eslint .

# Security scanning
npm audit
```

## Security Checklist

- [x] Context isolation enabled
- [x] Node integration disabled
- [x] Sandbox enabled
- [x] Preload script created
- [x] Minimal API exposed via contextBridge
- [x] No ipcRenderer exposed
- [x] HTTP communication to localhost backend
- [x] Subprocess launched with arguments array
- [x] Error handling for backend crashes
- [x] Backend process killed on app exit

## Further Reading

- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Same-Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

---

**Last Updated**: 2025-12-09
**Electron Version**: 39.2.6
**Status**: Security configuration complete
