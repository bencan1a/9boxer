/**
 * Playwright Test Fixtures
 *
 * Re-exports the enhanced test object with worker-scoped backend isolation.
 * Import from this module instead of @playwright/test in E2E tests.
 *
 * @example
 * ```typescript
 * import { test, expect } from '../fixtures';
 *
 * test('my test', async ({ page }) => {
 *   // Each worker automatically gets its own backend server
 *   // All API requests are automatically routed to the worker's backend
 *   await page.goto('/');
 *   // ... test code
 * });
 * ```
 */

export { test, expect } from "./worker-backend";
