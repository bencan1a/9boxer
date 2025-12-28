# ADR-001: Electron Desktop Architecture

**Status:** ✅ Accepted
**Date:** 2024-Q4 (Initial implementation)
**Tags:** #deployment #desktop #frontend #electron

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Use Electron as the desktop application framework | Need cross-platform desktop app that wraps React frontend and Python backend | ~300MB installer size, mature ecosystem, subprocess-based backend integration |

## When to Reference This ADR

- Before proposing to switch to alternative frameworks (Tauri, NW.js, native)
- When evaluating bundle size vs maturity trade-offs
- When debugging Electron-specific issues (IPC, process model, security)
- When adding platform-specific features (file dialogs, native menus, system tray)

## Alternatives Comparison

| Framework | Bundle Size | Maturity | Ecosystem | Python Integration | Security Model | Decision |
|-----------|-------------|----------|-----------|-------------------|----------------|----------|
| **Electron** | ~300MB | ⭐⭐⭐⭐⭐ (13+ years, v28+) | ⭐⭐⭐⭐⭐ (VS Code, Slack, Discord) | ✅ Subprocess | Sandboxed renderer, contextIsolation | ✅ Chosen |
| Tauri | ~10MB | ⭐⭐⭐ (4 years, v1.x stable) | ⭐⭐⭐ (Growing, fewer examples) | ⚠️ Complex (Rust FFI) | Rust backend, WebView frontend | ❌ Rejected |
| NW.js | ~200MB | ⭐⭐⭐ (10 years, less popular) | ⭐⭐ (Smaller ecosystem) | ✅ Subprocess | Node + Chromium combined | ❌ Rejected |
| Native (Qt/Electron Forge) | ~50MB | ⭐⭐⭐⭐ (Mature but complex) | ⭐⭐ (Platform-specific) | ✅ Native libs | OS-dependent | ❌ Rejected |

## Decision Criteria Matrix

| Criterion | Weight | Winner | Rationale |
|-----------|--------|--------|-----------|
| **Maturity/Stability** | High | Electron | 13+ years in production, used by VS Code, Slack, Discord, Figma |
| **Ecosystem Size** | High | Electron | Largest ecosystem, most Stack Overflow answers, npm packages |
| **Python Integration** | High | Electron | Well-tested subprocess pattern, no Rust/FFI complexity |
| **Cross-Platform** | High | Tie | All options support Windows/macOS/Linux |
| **Development Speed** | Medium | Electron | React skills transfer directly, no new paradigms |
| **Bundle Size** | Low | Tauri | But enterprise users care less about download size |
| **Performance** | Low | Tauri/Native | But performance is acceptable for our use case (not real-time) |

**Final Score:** Electron wins 4/5 high-weighted criteria

## Implementation Details

### Key Constraints

- **Sandbox required**: Renderer process must be sandboxed (no Node.js access)
- **Context isolation required**: `contextIsolation: true` to prevent prototype pollution
- **Preload script boundary**: All IPC must go through preload script's `contextBridge`
- **Backend as subprocess**: Backend runs as separate process, communicated via HTTP
- **No Node.js in renderer**: All file/OS operations must go through main process IPC

### Process Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Electron App                                                │
│                                                             │
│  ┌──────────────┐      ┌─────────────┐                    │
│  │ Main Process │      │   Preload   │                    │
│  │              │      │   Script    │                    │
│  │ - Backend    │──────│             │                    │
│  │   lifecycle  │ IPC  │ - Context   │                    │
│  │ - Window mgmt│      │   Bridge    │                    │
│  │ - File dialogs      │ - Safe APIs │                    │
│  │ - System tray│      │             │                    │
│  └──────────────┘      └─────────────┘                    │
│        │                      │                            │
│        │                      ▼                            │
│        │             ┌─────────────────┐                  │
│        │             │ Renderer Process│                  │
│        │             │                 │                  │
│        │             │ - React App     │                  │
│        │             │ - No Node.js    │                  │
│        │             │ - Sandboxed     │                  │
│        │             └─────────────────┘                  │
│        │                      │                            │
│        │                      │ HTTP                       │
│        ▼                      ▼                            │
│  ┌──────────────────────────────────┐                     │
│  │ Backend Subprocess (PyInstaller) │                     │
│  │ - FastAPI on localhost:38000     │                     │
│  │ - SQLite database                │                     │
│  │ - Excel parsing/export           │                     │
│  └──────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Configuration

**Main Process:** `frontend/electron/main/index.ts`
```typescript
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 900,
  webPreferences: {
    nodeIntegration: false,        // MUST be false
    contextIsolation: true,         // MUST be true
    sandbox: true,                  // MUST be true
    preload: path.join(__dirname, '../preload/index.js'),
  },
});
```

**Preload Script:** `frontend/electron/preload/index.ts`
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // Safe APIs only - no Node.js exposure
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultName: string) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  getBackendUrl: () => ipcRenderer.invoke('backend:getUrl'),
});
```

**Renderer Security:**
```typescript
// ✅ CORRECT - Use exposed API
const filePath = await window.electronAPI.openFileDialog();

// ❌ WRONG - No access to require, fs, etc.
const fs = require('fs'); // Will throw error in sandboxed renderer
```

### Related Files

- `frontend/electron/main/index.ts` - Main process, backend lifecycle, window management
- `frontend/electron/preload/index.ts` - Secure IPC bridge via contextBridge
- `frontend/electron/renderer/splash.html` - Splash screen during backend startup
- `frontend/electron-builder.yml` - Electron Builder configuration for packaging
- `frontend/package.json` - Electron and electron-builder dependencies

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Large bundle (~300MB)** | Mature ecosystem, extensive documentation | Acceptable for enterprise deployment, one-time download |
| **Memory overhead (~150MB base)** | Chromium rendering engine, full browser APIs | Acceptable for desktop app, users have adequate RAM |
| **Slower startup (~3-5s)** | No Python/Node.js installation required | Show splash screen, optimize backend startup |
| **Security complexity** | Powerful desktop integration | Use sandbox + contextIsolation, follow security checklist |
| **Two process models to manage** | Clean separation of concerns | Documented lifecycle, health checks, graceful shutdown |

## Migration Considerations

**If we ever need to migrate away from Electron:**

1. **Tauri** (most likely successor):
   - Pros: Smaller bundle (~10MB), native OS WebView, Rust security
   - Cons: Rewrite backend integration (Python → Rust bridge), smaller ecosystem
   - Effort: Medium (3-4 weeks)

2. **Web-based SaaS**:
   - Pros: No installation, auto-updates, easier deployment
   - Cons: Requires backend infrastructure, network dependency, data privacy concerns
   - Effort: High (8-12 weeks)

3. **Native (Qt/Swift/C#)**:
   - Pros: Smallest bundle, best performance
   - Cons: Platform-specific code, lose React codebase, longer development
   - Effort: Very High (6+ months)

**Migration triggers:**
- Electron ecosystem declines significantly (unlikely given adoption)
- Bundle size becomes critical requirement (<50MB)
- Performance requirements exceed Chromium's capabilities
- Security model changes (unlikely, currently excellent)

## Related Decisions

- See [ADR-002](002-pyinstaller-backend-bundling.md) for backend bundling strategy
- See [ADR-003](003-http-ipc-communication.md) for backend-frontend communication
- See [GUIDELINES.md](../GUIDELINES.md#electron-architecture) for security patterns

## References

- [Electron Security Guide](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron Builder](https://www.electron.build/)
- [Tauri vs Electron Comparison](https://tauri.app/v1/references/benchmarks/)
