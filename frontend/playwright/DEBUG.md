# Playwright E2E Test Debugging Guide

Comprehensive guide for running, debugging, and troubleshooting Playwright E2E tests in the 9Boxer application.

---

## Table of Contents

1. [Running Tests](#running-tests)
2. [Debug Modes](#debug-modes)
3. [Debugging Failures](#debugging-failures)
4. [Worker Backend Debugging](#worker-backend-debugging)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [VSCode Integration](#vscode-integration)

---

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e:pw
```

This runs all tests in the `playwright/e2e/` directory using the configuration from `playwright.config.ts`:
- **Workers**: Auto-detects CPU cores locally (2 workers in CI)
- **Timeout**: 30 seconds per test
- **Retries**: 1 retry locally, 2 in CI
- **Reporter**: HTML report generated in `playwright-report/`

### Run Specific Test File

```bash
# Run a single test file
npx playwright test sample-data-flow.spec.ts

# Run a specific test file with full path
npx playwright test playwright/e2e/sample-data-flow.spec.ts
```

### Run Tests Matching Pattern

```bash
# Run all tests with "filter" in the filename
npx playwright test filter

# Run all tests with "drag" in the test name
npx playwright test --grep "drag"

# Exclude tests with "skip" in the name
npx playwright test --grep-invert "skip"

# Combine patterns
npx playwright test --grep "employee" --grep-invert "visual"
```

### Run Tests in Specific Browser

```bash
# E2E tests use Desktop Chrome by default
# To run in different browser (requires config modification):
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Tests with Specific Tag

```bash
# Run only tests marked as @smoke
npx playwright test --grep "@smoke"

# Run tests excluding @slow tests
npx playwright test --grep-invert "@slow"
```

---

## Debug Modes

### Debug Mode (--debug) with Playwright Inspector

**Best for**: Step-through debugging, inspecting selectors, understanding test flow

```bash
# Debug all E2E tests
npm run test:e2e:pw:debug

# Debug specific test file
npx playwright test --debug sample-data-flow.spec.ts

# Debug specific test by line number
npx playwright test sample-data-flow.spec.ts:23 --debug
```

**What happens:**
1. Opens Playwright Inspector window
2. Pauses execution before each test action
3. Allows step-by-step execution with play/pause controls
4. Shows detailed action logs and selector information
5. Provides time-travel debugging (click on any step to see state)

**Inspector Features:**
- **Step Over**: Execute current action and pause at next
- **Resume**: Run until next breakpoint or test end
- **Pick Locator**: Click elements to generate selectors
- **Source**: View test source code with current execution line highlighted
- **Console**: Execute commands in browser context

### Headed Mode (--headed) to See Browser

**Best for**: Visual debugging, understanding UI state, verifying rendering

```bash
# Run tests with visible browser
npx playwright test --headed

# Combine with specific test
npx playwright test --headed sample-data-flow.spec.ts

# Run slower for better visibility
npx playwright test --headed --slow-mo=1000
```

**What happens:**
1. Browser window opens and stays visible
2. Tests run at normal speed (or slowed down)
3. You can see all interactions in real-time
4. Browser closes automatically when test completes

**Note**: By default, tests run in headless mode (`headless: true` in `playwright.config.ts`)

### UI Mode (--ui) for Interactive Debugging

**Best for**: Exploring test suite, filtering tests, watch mode, detailed timeline

```bash
# Open Playwright UI Mode
npm run test:e2e:pw:ui

# Or directly
npx playwright test --ui
```

**UI Mode Features:**
1. **Test Explorer**: Browse all tests in tree view
2. **Filter Tests**: Search and filter by name, file, or tag
3. **Watch Mode**: Automatically re-run tests on file changes
4. **Timeline View**: See detailed timeline of all actions
5. **DOM Snapshots**: Inspect DOM state at any point during test
6. **Network Inspector**: View all network requests
7. **Console Logs**: See browser console output
8. **Pick Locator**: Generate and test selectors interactively

**How to use:**
1. Run `npm run test:e2e:pw:ui`
2. Select test from left panel
3. Click play button to run
4. Inspect timeline, DOM, network, and logs in panels
5. Click any action in timeline to see state at that moment

### Slow Motion Mode

**Best for**: Observing fast interactions, debugging timing issues

```bash
# Slow down all actions by 1000ms (1 second)
npx playwright test --headed --slow-mo=1000

# Slower for detailed observation
npx playwright test --headed --slow-mo=2000

# Combined with debug mode
npx playwright test --debug --slow-mo=500
```

**What happens:**
- Each action (click, type, navigate) waits specified milliseconds before executing
- Useful for seeing rapid interactions that are hard to observe at normal speed

---

## Debugging Failures

### View HTML Report After Failures

When tests fail, Playwright automatically generates an HTML report.

```bash
# Open HTML report (auto-opens after test run)
npx playwright show-report

# Or manually
npx playwright show-report playwright-report
```

**Report Contents:**
- Test results summary with pass/fail counts
- Failed test details with error messages
- **Traces** (click "View trace" link)
- **Screenshots** (attached to failed tests)
- **Videos** (if enabled, attached to failed tests)
- Test duration and retry information

**Navigation:**
1. Click on failed test in report
2. View error message and stack trace
3. Click "View trace" to open detailed trace viewer
4. View screenshot of failure moment
5. See test steps with timing

### Inspect Traces

**Traces** are detailed recordings of test execution, captured only on failure (`trace: "retain-on-failure"` in config).

```bash
# Open trace from HTML report (click "View trace" link)
# Or open trace file directly
npx playwright show-trace path/to/trace.zip
```

**Trace Viewer Features:**
1. **Timeline**: Visual timeline of all test actions
2. **Actions**: List of every action taken (click, type, wait)
3. **DOM Snapshots**: Before/after DOM state for each action
4. **Network**: All network requests with headers and response
5. **Console**: Browser console logs
6. **Screenshots**: Before/after screenshots for each action
7. **Source**: Test source code with highlighted execution point

**How to use traces:**
1. Click on action in timeline
2. View DOM snapshot at that moment (left panel)
3. View action details (center panel)
4. View test source (right panel)
5. Inspect network requests (Network tab)
6. Check console logs (Console tab)

**Trace Benefits:**
- No need to re-run test to debug
- Complete context of failure (DOM, network, console)
- Time-travel debugging (see state at any point)
- Can share trace file with team members

### View Screenshots

Screenshots are captured only on failure (`screenshot: "only-on-failure"` in config).

**Location**: `test-results/<test-name>/<retry-number>/test-failed-<number>.png`

**Viewing:**
1. **In HTML Report**: Click on failed test, screenshot appears inline
2. **In Trace Viewer**: See screenshots in timeline
3. **Directly**: Open PNG file from `test-results/` folder

**Screenshot Settings** (in `playwright.config.ts`):
```typescript
screenshot: "only-on-failure",  // Only capture on failure
viewport: { width: 1920, height: 1080 },  // Full HD resolution
```

**Manual Screenshots in Tests:**
```typescript
// Take screenshot at any point
await page.screenshot({ path: 'debug-screenshot.png' });

// Full page screenshot
await page.screenshot({ path: 'fullpage.png', fullPage: true });
```

### View Videos

Videos are captured only on failure (`video: "retain-on-failure"` in config).

**Location**: `test-results/<test-name>/<retry-number>/video.webm`

**Viewing:**
1. **In HTML Report**: Click on failed test, video appears inline
2. **Directly**: Open `.webm` file with video player

**Video Settings** (in `playwright.config.ts`):
```typescript
video: "retain-on-failure",  // Only record on failure
```

**Note**: Videos capture entire test execution from start to failure, useful for seeing sequence of events leading to failure.

---

## Worker Backend Debugging

The 9Boxer E2E tests use **worker-scoped backend isolation** for true parallel execution. Each Playwright worker gets its own backend server with isolated database.

### Architecture Overview

```
Worker 0: Frontend (localhost:5173) → Backend (localhost:38000)
Worker 1: Frontend (localhost:5173) → Backend (localhost:38001)
Worker 2: Frontend (localhost:5173) → Backend (localhost:38002)
```

**Key Files:**
- `playwright/fixtures/worker-backend.ts` - Worker backend fixture
- `playwright/global-setup.ts` - Global setup (starts Vite/Storybook)
- `playwright/global-teardown.ts` - Global teardown

### How to Check Backend Health

Backend health is automatically checked during test setup, but you can manually verify:

```bash
# Check if backend is running for worker 0
curl http://localhost:38000/health

# Expected response: {"status": "ok"}

# Check worker 1 backend
curl http://localhost:38001/health

# Check worker 2 backend
curl http://localhost:38002/health
```

**From Test Code:**
```typescript
import { checkBackendHealth } from '../helpers/backend';

test('verify backend health', async ({ workerBackendUrl }) => {
  const healthy = await checkBackendHealth(workerBackendUrl);
  expect(healthy).toBe(true);
});
```

### View Backend Logs

Backend logs are piped to console during test execution:

**Look for:**
```
[Worker 0] Starting backend server on port 38000...
[Worker 0] Data directory: /tmp/ninebox-e2e-worker-0-1234567890
[Worker 0] ✓ Backend is healthy and ready
```

**Error Logs:**
```
[Worker 0 Backend Error] ERROR - Something went wrong
```

**Enable Verbose Logging:**

To see all backend logs (not just errors), modify `playwright/fixtures/worker-backend.ts`:

```typescript
// Change line ~123
if (message) {
  console.log(`[Worker ${workerIndex} Backend] ${message}`);
}
```

### Understand Worker Isolation

**Worker Fixtures** (`playwright/fixtures/worker-backend.ts`):

1. **`workerBackendPort`**: Unique port per worker (38000 + workerIndex)
2. **`workerDataDir`**: Isolated temp directory per worker
3. **`workerBackendUrl`**: Full URL to worker's backend
4. **`setupBackendRouting`**: Auto-routes API requests to worker backend

**How Routing Works:**

All requests to `/api/**` are intercepted by `setupBackendRouting` fixture:

```typescript
await page.route("**/api/**", async (route) => {
  const request = route.request();
  const url = request.url();

  // Replace default port with worker's port
  const newUrl = url.replace(
    /http:\/\/localhost:38000/,
    workerBackendUrl
  );

  await route.continue({ url: newUrl });
});
```

**Benefits:**
- True parallel execution (no shared state)
- No race conditions between tests
- Each worker has clean database
- Tests can run simultaneously without conflicts

**Worker Lifecycle:**

1. **Worker Start**: Backend spawned on unique port
2. **Health Check**: Wait for `/health` endpoint (60s timeout)
3. **Tests Run**: All tests in worker use this backend
4. **Worker End**: Backend killed, temp directory cleaned

---

## Common Issues & Solutions

### Timeouts

#### Issue: Test Timeout (30 seconds)

```
Error: Test timeout of 30000ms exceeded
```

**Causes:**
- Slow backend response
- Element not appearing
- Network request hanging
- Infinite loading state

**Solutions:**

1. **Increase timeout for specific test:**
   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
     // ... test code
   });
   ```

2. **Increase timeout globally** (in `playwright.config.ts`):
   ```typescript
   timeout: 60000, // 60 seconds for all tests
   ```

3. **Check backend health:**
   ```bash
   curl http://localhost:38000/health
   ```

4. **Review network requests in trace viewer**

5. **Add explicit waits:**
   ```typescript
   await page.waitForLoadState('networkidle');
   await page.waitForSelector('[data-testid="loaded"]', { timeout: 10000 });
   ```

#### Issue: Action Timeout (15 seconds)

```
Error: Action timeout of 15000ms exceeded
```

**Causes:**
- Element not clickable (covered by overlay)
- Element not visible
- Selector doesn't match any element

**Solutions:**

1. **Wait for element to be ready:**
   ```typescript
   await page.waitForSelector('[data-testid="button"]', { state: 'visible' });
   await page.locator('[data-testid="button"]').click();
   ```

2. **Close overlays/dialogs:**
   ```typescript
   import { closeAllDialogsAndOverlays } from '../helpers/ui';
   await closeAllDialogsAndOverlays(page);
   ```

3. **Check for correct selector:**
   ```typescript
   // Use Playwright Inspector to verify selector
   npx playwright test --debug your-test.spec.ts
   ```

4. **Increase action timeout:**
   ```typescript
   await page.locator('[data-testid="button"]').click({ timeout: 30000 });
   ```

#### Issue: Expect Timeout (5 seconds)

```
Error: Expect timeout of 5000ms exceeded
```

**Causes:**
- Assertion on element that never appears
- Element takes longer than 5s to render
- Wrong expected value

**Solutions:**

1. **Increase expect timeout:**
   ```typescript
   await expect(page.locator('[data-testid="result"]')).toBeVisible({ timeout: 10000 });
   ```

2. **Wait for UI to settle:**
   ```typescript
   import { waitForUiSettle } from '../helpers/ui';
   await waitForUiSettle(page);
   ```

3. **Check element selector in Inspector**

### Flaky Tests

#### Issue: Test Passes Sometimes, Fails Sometimes

**Causes:**
- Race conditions
- Timing issues
- Asynchronous state updates
- Shared state between tests

**Solutions:**

1. **Use auto-waiting locators:**
   ```typescript
   // BAD: No auto-waiting
   const text = await page.locator('[data-testid="result"]').textContent();

   // GOOD: Auto-waits for visibility
   await expect(page.locator('[data-testid="result"]')).toHaveText('Expected');
   ```

2. **Wait for network idle:**
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. **Use event-driven waits:**
   ```typescript
   // Wait for specific API response
   const response = await page.waitForResponse(
     (response) => response.url().includes('/api/employees') && response.status() === 200
   );
   ```

4. **Ensure test isolation:**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await resetToEmptyState(page);
   });
   ```

5. **Make tests idempotent (can run multiple times):**
   ```typescript
   // BAD: Assumes employee 123 exists
   await selectEmployee(page, 123);

   // GOOD: Get any employee first
   const employeeId = await getFirstEmployeeId(page);
   await selectEmployee(page, employeeId);
   ```

6. **Run test multiple times to verify fix:**
   ```bash
   npx playwright test flaky-test.spec.ts --repeat-each=10
   ```

### Data-testid Not Found

#### Issue: Element with `data-testid` Not Found

```
Error: locator.click: Selector "[data-testid="my-button"]" did not match any elements
```

**Causes:**
- Typo in testid
- Element not rendered yet
- Element conditionally rendered
- Wrong context (iframe, shadow DOM)

**Solutions:**

1. **Verify testid exists:**
   ```bash
   # Use Playwright Inspector Pick Locator
   npx playwright test --debug your-test.spec.ts
   ```

2. **Wait for element:**
   ```typescript
   await page.waitForSelector('[data-testid="my-button"]');
   ```

3. **Check if element is conditional:**
   ```typescript
   const button = page.locator('[data-testid="my-button"]');
   if (await button.isVisible()) {
     await button.click();
   }
   ```

4. **Use flexible selectors:**
   ```typescript
   // Matches any data-testid starting with "employee-card-"
   await page.locator('[data-testid^="employee-card-"]').first().click();
   ```

5. **Check component source code** to verify testid name

6. **Use alternative selectors if testid missing:**
   ```typescript
   // By role
   await page.getByRole('button', { name: 'Submit' }).click();

   // By text
   await page.getByText('Load Sample Data').click();

   // By label
   await page.getByLabel('Email').fill('test@example.com');
   ```

### Worker Backend Port Conflicts

#### Issue: Backend Fails to Start (Port Already in Use)

```
[Worker 0] Failed to start backend: Error: listen EADDRINUSE: address already in use :::38000
```

**Causes:**
- Previous test run didn't cleanup
- Another process using ports 38000-38002
- Backend process crashed but didn't release port

**Solutions:**

1. **Kill lingering processes:**
   ```bash
   npm run test:cleanup
   ```

2. **Manually kill processes on port:**
   ```bash
   # Linux/Mac
   lsof -ti:38000 | xargs kill -9
   lsof -ti:38001 | xargs kill -9

   # Windows
   netstat -ano | findstr :38000
   taskkill /PID <PID> /F
   ```

3. **Check for Python processes:**
   ```bash
   # Linux/Mac
   ps aux | grep uvicorn
   pkill -f uvicorn

   # Windows Task Manager
   # Find and kill python.exe processes running uvicorn
   ```

4. **Restart with clean state:**
   ```bash
   npm run test:cleanup
   npm run test:e2e:pw
   ```

5. **Change worker port range** (in `playwright/fixtures/worker-backend.ts`):
   ```typescript
   // Change line ~170
   const port = 39000 + workerInfo.workerIndex; // Use 39000+ instead of 38000+
   ```

#### Issue: Backend Unhealthy After Start

```
[Worker 0] Backend failed to start within 60 seconds
```

**Causes:**
- Python environment not set up
- Missing dependencies
- Backend code error
- Database initialization failure

**Solutions:**

1. **Check Python environment:**
   ```bash
   # Verify virtual environment exists
   ls .venv/

   # Verify Python can import backend modules
   source .venv/bin/activate  # Linux/Mac
   .venv\Scripts\activate  # Windows
   python -c "from ninebox.main import app"
   ```

2. **Check backend logs:**
   Look for error messages in test output:
   ```
   [Worker 0 Backend Error] ERROR - ...
   ```

3. **Test backend manually:**
   ```bash
   cd backend
   source ../.venv/bin/activate
   python -m uvicorn ninebox.main:app --host 127.0.0.1 --port 38000
   ```

4. **Rebuild backend:**
   ```bash
   cd backend
   pip install -e .
   ```

5. **Check database setup:**
   ```bash
   # Verify database can be created
   python -c "from ninebox.db import init_db; init_db()"
   ```

---

## VSCode Integration

### Playwright VSCode Extension

**Install Extension:**
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Playwright Test for VSCode"
4. Install official Microsoft extension

**Features:**
- Run/debug tests directly from editor
- View test results inline
- Pick locators
- Record new tests
- View trace files

### Running Single Test from Editor

**Method 1: Test Explorer**
1. Open Test Explorer panel (Testing icon in sidebar)
2. Expand test tree to find your test
3. Hover over test name
4. Click play button to run
5. Click debug button to debug

**Method 2: CodeLens**
1. Open test file in editor
2. Look for "Run" / "Debug" links above each `test()`
3. Click "Run" to execute test
4. Click "Debug" to debug with breakpoints

**Method 3: Command Palette**
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Playwright: Run Test"
3. Select test to run

### Debugging from VSCode

**Set Breakpoints:**
1. Open test file
2. Click in gutter (left of line numbers) to set breakpoint
3. Red dot appears
4. Click "Debug" link above test (CodeLens)
5. Test pauses at breakpoint
6. Use debug controls (step over, step into, continue)
7. Inspect variables in Debug panel

**Debug Configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Playwright Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/node_modules/.bin/playwright",
      "args": ["test", "--project=e2e", "--debug"],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

**Usage:**
1. Set breakpoints in test file
2. Open Run and Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
3. Select "Debug Playwright Tests"
4. Press F5 or click green play button
5. Test runs and pauses at breakpoints

**Debug Console:**
- Evaluate expressions during debugging
- Access `page`, `context`, test variables
- Execute Playwright commands interactively

**Example:**
```javascript
// In debug console while paused
await page.screenshot({ path: 'debug.png' })
await page.locator('[data-testid="button"]').textContent()
```

### Pick Locator Tool

**From Extension:**
1. Open test file
2. Click Playwright icon in sidebar
3. Click "Pick locator" button (crosshair icon)
4. Browser opens with target page
5. Click elements to generate selectors
6. Selector copied to clipboard
7. Paste into test code

**From Command:**
```bash
npx playwright codegen http://localhost:5173
```

**Features:**
- Hover over element to see selector
- Click to copy selector
- Record interactions to generate test code
- Multiple selector strategies (testid, role, text, CSS)

---

## Advanced Debugging Techniques

### Network Debugging

**View Network Traffic in Tests:**
```typescript
test('debug network', async ({ page }) => {
  // Log all requests
  page.on('request', request => {
    console.log('>>', request.method(), request.url());
  });

  // Log all responses
  page.on('response', response => {
    console.log('<<', response.status(), response.url());
  });

  // Your test code
});
```

**Inspect Specific Request:**
```typescript
const responsePromise = page.waitForResponse(
  response => response.url().includes('/api/employees')
);

await page.click('[data-testid="load-button"]');

const response = await responsePromise;
console.log('Status:', response.status());
console.log('Body:', await response.json());
```

### Console Log Debugging

**View Browser Console in Tests:**
```typescript
test('debug console', async ({ page }) => {
  // Listen to all console messages
  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]`, msg.text());
  });

  // Your test code
});
```

**Add Debug Logs:**
```typescript
test('debug test', async ({ page }) => {
  console.log('Step 1: Navigate');
  await page.goto('/');

  console.log('Step 2: Click button');
  await page.click('[data-testid="button"]');

  console.log('Step 3: Verify result');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

### Pause Test Execution

```typescript
test('pause for manual inspection', async ({ page }) => {
  await page.goto('/');

  // Pause here - browser stays open
  await page.pause();

  // Resume from Playwright Inspector
  await page.click('[data-testid="button"]');
});
```

**Use Cases:**
- Manually inspect application state
- Verify UI appearance
- Check browser DevTools
- Experiment with selectors in console

---

## Configuration Reference

**Key Settings** (from `playwright.config.ts`):

```typescript
{
  // Test timeout
  timeout: 30000,  // 30 seconds

  // Action timeout (click, fill, etc)
  actionTimeout: 15000,  // 15 seconds

  // Expect timeout
  expect: { timeout: 5000 },  // 5 seconds

  // Retries
  retries: process.env.CI ? 2 : 1,

  // Workers (parallel execution)
  workers: process.env.CI ? 2 : undefined,

  // Debugging artifacts
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
  video: "retain-on-failure",

  // Reporter
  reporter: "html",

  // Browser configuration
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1920, height: 1080 },
    headless: true,
  }
}
```

**Override Settings:**

```bash
# Override workers
npx playwright test --workers=1

# Override retries
npx playwright test --retries=0

# Override timeout
npx playwright test --timeout=60000

# Multiple overrides
npx playwright test --workers=1 --retries=0 --headed
```

---

## Getting Help

**Resources:**
- [Playwright Documentation](https://playwright.dev)
- [9Boxer Test Specification](/workspaces/9boxer/e2e-test-specification.md)
- [Infrastructure Evaluation](/workspaces/9boxer/e2e-infrastructure-evaluation.md)
- [Test Helpers](/workspaces/9boxer/frontend/playwright/helpers/)

**Common Commands Quick Reference:**

```bash
# Run all E2E tests
npm run test:e2e:pw

# Debug mode
npm run test:e2e:pw:debug

# UI mode
npm run test:e2e:pw:ui

# Headed mode
npx playwright test --headed

# Run specific test
npx playwright test sample-data-flow.spec.ts

# View HTML report
npx playwright show-report

# Cleanup lingering processes
npm run test:cleanup

# Check backend health
curl http://localhost:38000/health
```

**Debugging Workflow:**

1. **Test fails** → View HTML report
2. **Check screenshot** → See visual state at failure
3. **Open trace** → See detailed timeline and DOM snapshots
4. **Re-run with --debug** → Step through test with Inspector
5. **Add `page.pause()`** → Manually inspect at specific point
6. **Check backend logs** → Look for `[Worker N Backend Error]` messages
7. **Verify selectors** → Use Pick Locator tool
8. **Fix issue** → Re-run test to verify
9. **Run multiple times** → Verify no flakiness (`--repeat-each=5`)

---

**Last Updated**: 2025-12-30
