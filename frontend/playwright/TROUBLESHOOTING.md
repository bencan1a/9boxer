# Playwright E2E Testing Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "DLL initialization failed" (Exit code 3221225794 / 0xC0000142)

**Symptoms:**
- Playwright shows "Running global setup if any..." and then hangs
- Error: `Process from config.webServer was not able to start. Exit code: 3221225794`
- Tests never start running

**Root Cause:**
Port conflicts. This error on Windows typically means that Playwright's `webServer` configuration cannot start `npm run dev` or `npm run storybook` because the ports (5173 for Vite, 6006 for Storybook) are already occupied by existing development servers.

**Solution 1: Quick Fix - Kill Existing Servers**

Run the cleanup script before running tests:

```bash
npm run test:cleanup
npm run test:e2e:pw
```

**Solution 2: Manual Cleanup (PowerShell)**

```powershell
# Kill processes on ports 5173 and 6006
Get-NetTCPConnection -LocalPort 5173,6006 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

# Then run tests
cd frontend
npm run test:e2e:pw
```

**Solution 3: Development Workflow (Reuse Servers)**

The Playwright config has `reuseExistingServer: !process.env.CI`, which means in development, it will try to reuse existing servers. This works IF:
1. Servers are already running and healthy
2. They're listening on the correct ports (5173, 6006)
3. They respond to health checks

To use this workflow:

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Storybook (if running visual tests)
npm run storybook

# Terminal 3: Run Playwright tests (will reuse servers)
npm run test:e2e:pw
```

**Prevention:**

Add this to your test script to auto-cleanup:

```json
{
  "scripts": {
    "test:e2e:clean": "npm run test:cleanup && npm run test:e2e:pw"
  }
}
```

---

### Issue 2: Backend Server Fails to Start

**Symptoms:**
- `[Worker N] Backend failed to start within 60 seconds`
- Worker hangs waiting for backend health check

**Root Cause:**
- Python virtual environment not activated
- Backend port (38000+) already in use
- Missing Python dependencies

**Solution:**

1. **Check Python virtual environment:**
   ```bash
   # From project root
   .venv\Scripts\activate  # Windows
   # or
   . .venv/bin/activate    # Linux/macOS

   # Verify
   which python  # Should point to .venv
   ```

2. **Check backend ports:**
   ```bash
   # Windows
   netstat -ano | grep 38000

   # Linux/macOS
   lsof -i :38000
   ```

3. **Test backend manually:**
   ```bash
   cd backend
   python -m uvicorn ninebox.main:app --host 127.0.0.1 --port 38000
   ```

4. **Check Python dependencies:**
   ```bash
   pip install -e '.[dev]'
   ```

---

### Issue 3: Tests Pass Locally But Fail in CI

**Symptoms:**
- Tests pass on your machine but fail in GitHub Actions
- Flaky tests with inconsistent results

**Root Cause:**
- Race conditions in test setup
- Environment differences (CI vs local)
- Timing issues with `reuseExistingServer`

**Solution:**

1. **CI always starts fresh servers** (this is correct behavior):
   - CI has `reuseExistingServer: false` (via `!process.env.CI`)
   - Local dev has `reuseExistingServer: true` for faster iteration

2. **Fix race conditions:**
   - Use `waitForBackend()` helper (already implemented)
   - Add explicit waits for critical UI elements
   - Use `data-testid` instead of text selectors

3. **Increase timeouts for CI:**
   ```typescript
   // playwright.config.ts
   workers: process.env.CI ? 2 : undefined,  // Limit CI workers
   timeout: 30000,  // 30s timeout
   retries: process.env.CI ? 2 : 1,  // More retries in CI
   ```

---

### Issue 4: "Cannot find module" Errors in Tests

**Symptoms:**
- `Cannot find module '../helpers'`
- TypeScript compilation errors in test files

**Root Cause:**
- Incorrect import paths
- Missing TypeScript path aliases

**Solution:**

1. **Use correct import paths:**
   ```typescript
   // Correct
   import { loadSampleData } from '../helpers';

   // Incorrect
   import { loadSampleData } from '@/helpers';  // No path alias configured
   ```

2. **Verify TypeScript config:**
   ```bash
   npx tsc -p playwright/tsconfig.json --noEmit
   ```

---

### Issue 5: Worker Backend Isolation Not Working

**Symptoms:**
- Tests interfere with each other
- Database state from one test affects another
- Parallel tests fail but sequential tests pass

**Root Cause:**
- Workers not properly isolated
- Shared database instead of worker-scoped databases

**Solution:**

The project already uses worker-scoped backend isolation (see `playwright/fixtures/worker-backend.ts`). Each worker gets:
- Unique port: `38000 + workerInfo.workerIndex`
- Isolated data directory: `ninebox-e2e-worker-N-<timestamp>`
- Independent backend process

If tests still interfere:

1. **Check test cleanup:**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Clean up test data
     await page.evaluate(() => localStorage.clear());
   });
   ```

2. **Disable parallel execution** (temporary debugging):
   ```typescript
   // playwright.config.ts
   fullyParallel: false,  // Run tests sequentially
   workers: 1,            // Single worker
   ```

3. **Verify worker isolation:**
   ```bash
   # Run with debug logging
   DEBUG=pw:webserver npm run test:e2e:pw
   ```

---

## Debugging Tips

### Enable Verbose Logging

```bash
# Show all Playwright debug logs
DEBUG=pw:* npm run test:e2e:pw

# Show only webServer logs
DEBUG=pw:webserver npm run test:e2e:pw

# Show browser console logs
npm run test:e2e:pw:debug
```

### Run Tests in UI Mode

```bash
# Interactive test runner with time-travel debugging
npm run test:e2e:pw:ui
```

### Run Single Test File

```bash
# Run only upload-flow tests
npx playwright test upload-flow.spec.ts --project=e2e

# Run with headed browser (see what's happening)
npx playwright test upload-flow.spec.ts --project=e2e --headed
```

### Check Server Health

```bash
# Verify Vite is running
curl http://localhost:5173

# Verify backend is running
curl http://localhost:38000/health

# Verify Storybook is running
curl http://localhost:6006
```

### Inspect Test Artifacts

After test failures, check:
- `playwright-report/` - HTML report with screenshots and traces
- `test-results/` - Raw test artifacts (videos, traces)

```bash
# Open HTML report
npx playwright show-report

# Open specific trace file
npx playwright show-trace test-results/upload-flow-should-upload-Excel-file-e2e/trace.zip
```

---

## Windows-Specific Issues

### Git Bash vs PowerShell

- The Bash tool in Claude Code runs in Git Bash/WSL
- Some Windows commands (like `taskkill`) don't work correctly in Git Bash
- Use PowerShell for Windows-specific operations:

```bash
# Correct (Git Bash)
powershell.exe -Command "Stop-Process -Id 12345 -Force"

# Incorrect (Git Bash)
taskkill /F /PID 12345  # /F gets interpreted as path
```

### Path Separators

- Always use forward slashes in test code (cross-platform)
- Windows handles both `/` and `\`, but Linux only handles `/`

```typescript
// Correct
path.join(__dirname, '../helpers')

// Incorrect
path.join(__dirname, '..\\helpers')  // Windows-specific
```

---

## Getting Help

If you're still stuck:

1. **Check the Playwright documentation:**
   - https://playwright.dev/docs/intro
   - https://playwright.dev/docs/test-webserver

2. **Check worker backend fixtures:**
   - `playwright/fixtures/worker-backend.ts` - Worker isolation implementation
   - `playwright/global-setup.ts` - Global setup logic

3. **Check test helpers:**
   - `playwright/helpers/` - Reusable test utilities
   - Documented in `internal-docs/testing/`

4. **Run cleanup and retry:**
   ```bash
   npm run test:cleanup
   npm run test:e2e:pw
   ```

5. **Contact the E2E Testing Expert:**
   - See `.github/agents/test-e2e-expert.md`
   - Use `/test-e2e` slash command in Claude Code
