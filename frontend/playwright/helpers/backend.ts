import { Page } from '@playwright/test';

/**
 * Wait for the backend server to be ready
 *
 * This helper replicates the Cypress `cy.waitForBackend()` custom command.
 * It performs a health check request to ensure the backend server is running
 * and ready to accept requests before proceeding with tests.
 *
 * The backend health endpoint is expected to be at http://localhost:8000/health
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
        response.url().includes('http://localhost:8000/health') &&
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
      const response = await context.request.get('http://localhost:8000/health');
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

  throw new Error('Backend health check failed after maximum retries');
}
