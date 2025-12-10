# Phase 3 Integration Testing Checklist

## Prerequisites
- [ ] Backend built: `cd backend && make build-exe`
- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] Both TypeScript compilations successful

## Test 1: Frontend Build
- [ ] Run `npm run build`
- [ ] Verify `dist/` directory created
- [ ] Verify `dist/index.html` has relative paths (./assets/)
- [ ] No build errors

## Test 2: Electron TypeScript Compilation
- [ ] Run `npx tsc -p electron/tsconfig.json`
- [ ] Verify `dist-electron/` directory created
- [ ] Verify main/index.js, preload/index.js, main/menu.js exist
- [ ] No compilation errors

## Test 3: Backend Validation Script
- [ ] Run `npm run prebuild`
- [ ] Should show "✅ Backend found (XX MB)"
- [ ] Should not error

## Test 4: Electron Builder Test Build
- [ ] Run `npx electron-builder --dir`
- [ ] Verify `release/*/resources/app/dist/index.html` exists (frontend)
- [ ] Verify `release/*/resources/backend/ninebox` exists (backend)
- [ ] Both are properly bundled

## Test 5: Configuration Detection
- [ ] Check `frontend/src/config.ts` exists
- [ ] Verify `isElectron()` function defined
- [ ] Verify `API_BASE_URL` set to localhost:8000

## Test 6: IPC Handlers
- [ ] Verify dialog:openFile handler in main process
- [ ] Verify dialog:saveFile handler in main process
- [ ] Verify preload exposes openFileDialog and saveFileDialog

## Test 7: Splash Screen
- [ ] Verify `electron/renderer/splash.html` exists
- [ ] Check splash screen is shown on startup (in logs)
- [ ] Check splash screen closes when ready

## Test 8: Error Handling
- [ ] Verify error dialogs defined for:
  - Backend startup failures
  - Backend crashes
  - General startup errors

## Test 9: Mode Detection
- [ ] Verify isDev constant defined
- [ ] Verify setupLogging() function exists
- [ ] Verify DevTools only open in dev mode

## Test 10: File Loading Strategy
- [ ] Verify getWindowUrl() handles three modes:
  - Development with Vite (http://localhost:5173)
  - Development without Vite (built files)
  - Production (bundled files)
- [ ] Verify loadFile() used for file paths, loadURL() for HTTP

## Summary
- [ ] All 10 test categories passed
- [ ] No errors in any test
- [ ] Integration is complete and working
