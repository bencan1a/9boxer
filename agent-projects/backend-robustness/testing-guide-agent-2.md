# Agent 2 Testing Guide: Port Discovery

## Prerequisites

1. **Backend must be built** (Agent 1 completion required)
   - Backend executable exists at: `backend/dist/ninebox/ninebox.exe` (Windows)
   - Backend outputs JSON to stdout: `{"port": <number>, "status": "ready"}`

2. **Frontend Electron code must be compiled**
   ```bash
   cd frontend
   npm run electron:compile
   ```

## Test 1: Normal Startup (Port 38000 Available)

### Setup
1. Ensure port 38000 is not in use
   ```bash
   # Check if port 38000 is free (Windows)
   netstat -an | findstr :8000
   # Should return nothing
   ```

### Execute
```bash
cd frontend
npm run electron:dev
```

### Expected Results
**Console Output:**
```
🚀 Starting backend from: C:\Git_Repos\9boxer\backend\dist\ninebox\ninebox.exe
Backend stdout: {"port": 38000, "status": "ready"}
✅ Backend port discovered: 38000
🔌 Backend URL updated to: http://localhost:38000
⏳ Waiting for backend to be ready...
✅ Backend ready
```

**Application:**
- App starts successfully
- No error dialogs
- DevTools console shows no errors

**Verification:**
```javascript
// In DevTools console
await window.electronAPI.backend.getPort()
// Expected: 38000

await window.electronAPI.backend.getUrl()
// Expected: "http://localhost:38000"
```

## Test 2: Port Conflict (Port 38000 Occupied)

### Setup
1. Start a simple HTTP server on port 38000
   ```bash
   # In a separate terminal
   python -m http.server 38000
   ```
   Keep this running during the test.

### Execute
```bash
cd frontend
npm run electron:dev
```

### Expected Results
**Console Output:**
```
🚀 Starting backend from: C:\Git_Repos\9boxer\backend\dist\ninebox\ninebox.exe
Backend stdout: Port 38000 is in use, finding alternative...
Backend stdout: Using alternative port: 54321
Backend stdout: {"port": 54321, "status": "ready"}
✅ Backend port discovered: 54321
🔌 Backend URL updated to: http://localhost:54321
⏳ Waiting for backend to be ready...
✅ Backend ready
```

**Application:**
- App starts successfully on alternative port
- No error dialogs
- DevTools console shows no errors

**Verification:**
```javascript
// In DevTools console
await window.electronAPI.backend.getPort()
// Expected: A port number OTHER than 38000 (e.g., 54321)

await window.electronAPI.backend.getUrl()
// Expected: "http://localhost:<alternative-port>"
```

**Cleanup:**
```bash
# Stop the Python HTTP server
# Press Ctrl+C in the terminal running python
```

## Test 3: Port Discovery Timeout

### Setup
This test requires a mock backend that doesn't output JSON.

**Option A: Manual Mock (Recommended)**
1. Create a temporary script that mimics backend without JSON output:
   ```python
   # mock_backend.py
   import time
   print("Starting backend...")
   time.sleep(10)  # Sleep longer than timeout
   ```

2. Temporarily modify `frontend/electron/main/index.ts`:
   ```typescript
   // In getBackendPath(), temporarily change to:
   return 'python mock_backend.py';
   ```

**Option B: Test with Missing Backend**
1. Temporarily rename the backend executable:
   ```bash
   mv backend/dist/ninebox/ninebox.exe backend/dist/ninebox/ninebox.exe.bak
   ```

### Execute
```bash
cd frontend
npm run electron:dev
```

### Expected Results
**Console Output:**
```
🚀 Starting backend from: ...
❌ Port discovery timeout: Backend did not report port within 5 seconds
❌ Failed to start app: Error: Backend did not report port within timeout
```

**Application:**
- Error dialog appears
- **Title:** "Backend Timeout"
- **Message:** "The backend did not start within the expected time."
- **Details:** Mentions port conflict or configuration issue
- App quits after dialog is dismissed

**Cleanup:**
```bash
# Restore backend executable if renamed
mv backend/dist/ninebox/ninebox.exe.bak backend/dist/ninebox/ninebox.exe

# Revert any code changes to getBackendPath()
```

## Test 4: Backend Crash on Startup

### Setup
This test requires a mock backend that exits immediately.

**Manual Mock:**
1. Create a script that exits with error code:
   ```python
   # crash_backend.py
   import sys
   print("Starting...")
   sys.exit(1)
   ```

2. Temporarily modify `getBackendPath()` to point to this script.

### Expected Results
**Console Output:**
```
❌ Port discovery timeout: Backend did not report port within 5 seconds
Backend exited with code 1
```

**Application:**
- Error dialog appears
- **Title:** "Backend Crashed on Startup"
- **Message:** "The backend process crashed during startup."
- **Details:** "Error: Backend exited with code 1 before reporting port"
- App quits after dialog is dismissed

## Test 5: Backend Executable Not Found

### Setup
1. Temporarily rename the backend executable:
   ```bash
   mv backend/dist/ninebox/ninebox.exe backend/dist/ninebox/ninebox.exe.bak
   ```

### Execute
```bash
cd frontend
npm run electron:dev
```

### Expected Results
**Console Output:**
```
🚀 Starting backend from: C:\Git_Repos\9boxer\backend\dist\ninebox\ninebox.exe
🔍 Backend executable exists: false
❌ Failed to start app: Error: Backend executable not found at: ...
```

**Application:**
- Error dialog appears
- **Title:** "Backend Executable Not Found"
- **Message:** "The backend executable could not be found."
- **Details:** Full path to expected location
- App quits after dialog is dismissed

**Cleanup:**
```bash
# Restore backend executable
mv backend/dist/ninebox/ninebox.exe.bak backend/dist/ninebox/ninebox.exe
```

## Test 6: IPC Handler Verification

### Setup
1. Start app normally (Test 1 or Test 2)
2. Open DevTools (should auto-open in dev mode)

### Execute
In the DevTools console:

```javascript
// Test 1: Get backend port
const port = await window.electronAPI.backend.getPort();
console.log('Backend port:', port);
// Expected: 38000 or alternative port number

// Test 2: Get backend URL
const url = await window.electronAPI.backend.getUrl();
console.log('Backend URL:', url);
// Expected: "http://localhost:38000" or alternative

// Test 3: Verify TypeScript types (if using TS)
window.electronAPI.backend.getPort() satisfies Promise<number>;
window.electronAPI.backend.getUrl() satisfies Promise<string>;
```

### Expected Results
- All promises resolve successfully
- Port is a valid number (1024-65535)
- URL is a valid localhost URL
- No TypeScript errors (if testing in TS environment)

**Main Process Logs (check terminal):**
```
🔌 Renderer requested backend port: 38000
🔌 Renderer requested backend URL: http://localhost:38000
```

## Test 7: Multiple Rapid Requests

### Setup
1. Start app normally
2. Open DevTools

### Execute
In DevTools console:
```javascript
// Rapid-fire requests
for (let i = 0; i < 10; i++) {
  window.electronAPI.backend.getPort().then(port => console.log(`Request ${i}: ${port}`));
}
```

### Expected Results
- All 10 requests resolve successfully
- All return the same port number
- No crashes or errors
- Main process logs show 10 IPC requests

## Troubleshooting

### Issue: "window.electronAPI is undefined"
**Cause:** Preload script not loaded correctly
**Fix:**
1. Check that preload path is correct in `main/index.ts`
2. Verify preload script compiled: `npm run electron:compile`
3. Check console for preload script initialization message

### Issue: Port discovery always times out
**Cause:** Backend not outputting JSON correctly
**Fix:**
1. Verify Agent 1 backend changes are complete
2. Test backend directly: `python backend/src/ninebox/main.py`
3. Verify JSON appears in output: `{"port": 38000, "status": "ready"}`

### Issue: Error dialog shows generic message
**Cause:** Error type not matching expected patterns
**Fix:**
1. Check error message text in console logs
2. Verify error message matching logic in app.on('ready') handler
3. May need to adjust error message matching strings

### Issue: Backend log file not created
**Cause:** Production mode logging only activates in packaged app
**Fix:**
1. In dev mode, logs go to console (expected behavior)
2. To test log file creation, temporarily remove `if (!getIsDev())` check
3. Or build packaged app and test in production mode

## Success Criteria Checklist

After running all tests:

- [ ] Test 1: Normal startup works (port 38000)
- [ ] Test 2: Port conflict handled (alternative port used)
- [ ] Test 3: Timeout error shown correctly
- [ ] Test 4: Crash error shown correctly
- [ ] Test 5: Not found error shown correctly
- [ ] Test 6: IPC handlers work from renderer
- [ ] Test 7: Multiple requests handled correctly
- [ ] No TypeScript compilation errors
- [ ] No runtime errors in console
- [ ] All error messages are clear and helpful

## Next Steps After Testing

Once all tests pass:
1. Document any issues found
2. Update agent-2-completion.md with test results
3. Proceed to Agent 3 (Dynamic API Client)
4. Provide integration notes to Agent 3
