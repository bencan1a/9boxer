/**
 * Employee selection helpers for Playwright E2E tests
 *
 * Provides helpers for selecting employees and verifying the Details panel.
 */

import { Page, expect } from "@playwright/test";
import { getFirstEmployeeId } from "./testData";

/**
 * Select an employee by clicking their tile
 *
 * Clicks the employee card and verifies the Details panel opens.
 * Uses event-driven waits for reliability.
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee to select
 *
 * @example
 * ```typescript
 * test('selecting employee shows details', async ({ page }) => {
 *   await loadSampleData(page);
 *   await selectEmployee(page, 5);
 *   // Details panel is now open with employee 5's information
 * });
 * ```
 */
export async function selectEmployee(
  page: Page,
  employeeId: number
): Promise<void> {
  // Click the employee card
  const employeeCard = page.locator(
    `[data-testid="employee-card-${employeeId}"]`
  );
  await employeeCard.click();

  // Verify Right panel opens
  await expect(page.locator('[data-testid="right-panel"]')).toBeVisible({
    timeout: 5000,
  });
}

/**
 * Select the first available employee in the grid
 *
 * Useful for tests that don't care which specific employee is selected,
 * just that an employee is selected and the Details panel opens.
 *
 * @param page - Playwright Page object
 * @returns The employee ID that was selected
 *
 * @example
 * ```typescript
 * test('details panel shows employee info', async ({ page }) => {
 *   await loadSampleData(page);
 *   const employeeId = await selectFirstEmployee(page);
 *   // Details panel is now open, use employeeId for further assertions
 * });
 * ```
 */
export async function selectFirstEmployee(page: Page): Promise<number> {
  const employeeId = await getFirstEmployeeId(page);
  await selectEmployee(page, employeeId);
  return employeeId;
}

/**
 * Verify the Details panel is open
 *
 * Checks that the Details panel is visible.
 * Useful for assertions in tests.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await selectEmployee(page, 10);
 * await expectDetailsPanelOpen(page);
 * ```
 */
export async function expectDetailsPanelOpen(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="right-panel"]')).toBeVisible();
}

/**
 * Verify Details panel shows all expected sections
 *
 * Checks that the Details tab displays:
 * - Current Assessment
 * - Job Information
 * - Flags section
 * - Reporting Chain
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await selectEmployee(page, 5);
 * await expectDetailsTabSections(page);
 * ```
 */
export async function expectDetailsTabSections(page: Page): Promise<void> {
  await expect(
    page.locator('[data-testid="current-assessment"]')
  ).toBeVisible();
  await expect(page.locator('[data-testid="job-information"]')).toBeVisible();
  await expect(page.locator('[data-testid="flags-section"]')).toBeVisible();
  await expect(page.locator('[data-testid="reporting-chain"]')).toBeVisible();
}
