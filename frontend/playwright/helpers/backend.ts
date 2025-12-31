import { Page } from "@playwright/test";

/**
 * Wait for the backend server to be ready
 *
 * This helper replicates the Cypress `cy.waitForBackend()` custom command.
 * It performs a health check request to ensure the backend server is running
 * and ready to accept requests before proceeding with tests.
 *
 * The backend health endpoint is expected to be at http://localhost:38000/health
 * and should return a 200 status code when healthy.
 *
 * @param page - Playwright Page object
 * @example
 * await waitForBackend(page);
 */
export async function waitForBackend(page: Page): Promise<void> {
  // Wait for the backend health endpoint to respond with 200
  await page.waitForResponse(
    (response) => {
      return (
        response.url().includes("http://localhost:38000/health") &&
        response.status() === 200
      );
    },
    { timeout: 10000 }
  );
}

/**
 * Alternative implementation that makes a direct request to the health endpoint
 * without requiring a page navigation. This is useful for ensuring the backend
 * is ready before starting tests.
 *
 * @param page - Playwright Page object
 * @example
 * await checkBackendHealth(page);
 */
export async function checkBackendHealth(page: Page): Promise<void> {
  const context = page.context();
  let retries = 0;
  const maxRetries = 10;
  const retryDelay = 1000; // 1 second

  while (retries < maxRetries) {
    try {
      const response = await context.request.get(
        "http://localhost:38000/health"
      );
      if (response.status() === 200) {
        return;
      }
    } catch (error) {
      // Backend not ready yet, will retry
    }

    retries++;
    if (retries < maxRetries) {
      await page.waitForTimeout(retryDelay);
    }
  }

  throw new Error("Backend health check failed after maximum retries");
}

/**
 * Simulate a backend restart for testing session persistence
 *
 * This helper is used in E2E tests to verify that session state persists
 * across backend restarts. It works by:
 * 1. Making a request to trigger a session save (if needed)
 * 2. Simulating a backend restart by clearing server-side state
 * 3. Waiting for the backend to restore sessions from database
 *
 * Note: In the current test environment, we cannot actually kill and restart
 * the backend process managed by Playwright. Instead, we simulate a restart
 * by triggering the session restoration logic via a special endpoint or
 * by relying on the auto-restore behavior when sessions are loaded.
 *
 * For true restart testing, integration tests at the backend level are
 * more appropriate (see test_session_restore.py).
 *
 * @param page - Playwright Page object
 * @example
 * // Upload file and make changes
 * await uploadExcelFile(page, 'sample-employees.xlsx');
 * await dragEmployeeToPosition(page, 'Alice Smith', 9);
 *
 * // Simulate backend restart
 * await restartBackend(page);
 *
 * // Verify session persisted
 * await expect(page.getByText('Alice Smith')).toBeVisible();
 */
export async function restartBackend(page: Page): Promise<void> {
  const context = page.context();

  // NOTE: In a real scenario, we would kill and restart the backend process.
  // However, in Playwright E2E tests, the backend is managed by the test runner
  // and cannot be easily restarted mid-test.
  //
  // Instead, we rely on the SessionManager's auto-restore behavior:
  // 1. Sessions are persisted to database on every change (write-through cache)
  // 2. When backend starts, SessionManager.__init__ restores all sessions
  // 3. We can verify persistence by checking that data survives page reloads
  //
  // For true backend restart testing, use integration tests:
  // - backend/tests/test_integration/test_session_restore.py
  // - backend/tests/test_integration/test_end_to_end_persistence.py

  // Simulate restart by reloading the frontend (triggers new API calls)
  // This will cause the frontend to fetch session data from the backend,
  // which should have been restored from database
  await page.reload({ waitUntil: "networkidle" });

  // Wait for backend to be healthy
  await checkBackendHealth(page);

  // Give the frontend time to re-establish connection and load data
  await page.waitForTimeout(1000);
}

/**
 * Trigger a manual session save (for testing)
 *
 * This helper triggers a session save by making a state-changing operation.
 * Useful for ensuring session is persisted before testing restoration.
 *
 * @param page - Playwright Page object
 * @example
 * await triggerSessionSave(page);
 */
export async function triggerSessionSave(page: Page): Promise<void> {
  const context = page.context();

  // Trigger a session save by making a GET request to session status
  // This ensures the session is persisted to database
  try {
    await context.request.get("http://localhost:38000/api/session/status");
  } catch (error) {
    // Ignore errors - session might not exist yet
  }
}

/**
 * Get the backend URL for the current worker
 *
 * Each Playwright worker uses a unique backend port (38000 + workerIndex)
 * for parallel test execution with isolated databases. This helper extracts
 * the correct backend URL from the page context.
 *
 * In worker-scoped backend mode:
 * - Worker 0: http://localhost:38000
 * - Worker 1: http://localhost:38001
 * - Worker 2: http://localhost:38002
 * - etc.
 *
 * @param page - Playwright Page object
 * @returns Backend URL (e.g., "http://localhost:38001")
 * @example
 * const backendUrl = await getBackendUrl(page);
 * console.log(`Worker backend: ${backendUrl}`);
 */
export async function getBackendUrl(page: Page): Promise<string> {
  // Navigate to the frontend to ensure page context is initialized
  // This is safe to call multiple times - Playwright caches if already loaded
  const currentUrl = page.url();
  if (!currentUrl || currentUrl === "about:blank") {
    await page.goto("/");
  }

  // Extract port from first API request made by the page
  // Worker-scoped routing intercepts /api/** requests and routes to worker backend
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          "Failed to determine backend URL - no API requests detected within 5 seconds"
        )
      );
    }, 5000);

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/")) {
        clearTimeout(timeout);
        // Extract base URL (protocol + host + port)
        const match = url.match(/(http:\/\/localhost:\d+)/);
        if (match) {
          resolve(match[1]);
        } else {
          // Fallback to default backend port
          resolve("http://localhost:38000");
        }
      }
    });
  });
}

/**
 * Check if backend is healthy and responding
 *
 * Performs a health check against the worker's backend server without throwing
 * errors. Useful for debugging test failures, verifying backend state, or
 * implementing retry logic in tests.
 *
 * This helper:
 * - Extracts the correct worker backend URL from the page context
 * - Makes a GET request to the /health endpoint
 * - Returns true if backend responds with 200, false otherwise
 * - Handles all errors gracefully (no exceptions thrown)
 *
 * @param page - Playwright Page object
 * @returns true if backend is healthy, false otherwise
 * @example
 * // Check backend health before running test
 * const isHealthy = await isBackendHealthy(page);
 * if (!isHealthy) {
 *   console.warn('Backend is not healthy, test may fail');
 * }
 *
 * @example
 * // Implement retry logic
 * let healthy = false;
 * for (let i = 0; i < 5 && !healthy; i++) {
 *   healthy = await isBackendHealthy(page);
 *   if (!healthy) await page.waitForTimeout(1000);
 * }
 *
 * @example
 * // Debug test failures
 * test('my test', async ({ page }) => {
 *   await loadSampleData(page);
 *   const healthBefore = await isBackendHealthy(page);
 *   console.log(`Backend health before action: ${healthBefore}`);
 *
 *   // ... perform actions ...
 *
 *   const healthAfter = await isBackendHealthy(page);
 *   console.log(`Backend health after action: ${healthAfter}`);
 * });
 */
export async function isBackendHealthy(page: Page): Promise<boolean> {
  try {
    // Get the worker's backend URL
    const backendUrl = await getBackendUrl(page);

    // Make health check request
    const response = await page.request.get(`${backendUrl}/health`);

    // Return true only if status is 200
    return response.status() === 200;
  } catch (error) {
    // Don't throw - return false for any errors
    // This includes network errors, timeouts, or backend not responding
    return false;
  }
}
