/**
 * Test data helpers for creating state without UI interactions
 *
 * These helpers allow tests to set up state (changes, flags, notes)
 * by calling APIs directly instead of performing flaky UI operations.
 * This makes tests faster, more reliable, and more focused.
 */

import { Page, expect } from "@playwright/test";

/**
 * Create a change by moving an employee via API
 *
 * This bypasses the drag-and-drop UI and directly calls the backend API.
 * Use this in tests that need to verify behavior AFTER a change exists,
 * but don't specifically need to test the drag functionality.
 *
 * @param page - Playwright Page object
 * @param employeeId - ID of employee to move
 * @param newPosition - Target grid position (1-9)
 * @param options - Optional configuration
 *
 * @example
 * ```typescript
 * // Test change tracking without drag
 * test('should show change in tracker', async ({ page }) => {
 *   await loadSampleData(page);
 *   await createChange(page, 5, 6); // Move employee 5 to position 6
 *
 *   // Now verify change appears in Changes tab
 *   await clickTabAndWait(page, 'changes-tab');
 *   await expect(page.getByText('Position changed')).toBeVisible();
 * });
 * ```
 */
export async function createChange(
  page: Page,
  employeeId: number,
  newPosition: number,
  options: {
    isDonutMode?: boolean;
    waitForUiUpdate?: boolean;
  } = {}
): Promise<void> {
  const { isDonutMode = false, waitForUiUpdate = true } = options;

  // Determine the correct endpoint
  const endpoint = isDonutMode ? "move-donut" : "move";
  const port = new URL(page.url()).port;
  const baseUrl = `http://localhost:${port}`;

  // Call the move API directly
  const response = await page.request.post(
    `${baseUrl}/api/employees/${employeeId}/${endpoint}`,
    {
      data: { newPosition },
    }
  );

  if (!response.ok()) {
    throw new Error(
      `Failed to create change via API: ${response.status()} ${response.statusText()}`
    );
  }

  if (waitForUiUpdate) {
    // Wait for the UI to reflect the change
    await page.waitForLoadState("networkidle");

    // Verify the employee card has the new position
    const employeeCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );
    const positionAttr = isDonutMode ? "data-donut-position" : "data-position";
    await expect(employeeCard).toHaveAttribute(
      positionAttr,
      newPosition.toString(),
      { timeout: 3000 }
    );
  }
}

/**
 * Create multiple changes via API
 *
 * Useful for tests that need to verify behavior with multiple changes
 * without the overhead of multiple drag operations.
 *
 * @example
 * ```typescript
 * await createMultipleChanges(page, [
 *   { employeeId: 1, newPosition: 6 },
 *   { employeeId: 2, newPosition: 9 },
 *   { employeeId: 3, newPosition: 4 },
 * ]);
 * ```
 */
export async function createMultipleChanges(
  page: Page,
  changes: Array<{
    employeeId: number;
    newPosition: number;
    isDonutMode?: boolean;
  }>
): Promise<void> {
  for (const change of changes) {
    await createChange(page, change.employeeId, change.newPosition, {
      isDonutMode: change.isDonutMode,
      waitForUiUpdate: false, // Don't wait after each one
    });
  }

  // Wait once at the end for all changes to be reflected
  await page.waitForLoadState("networkidle");
}

/**
 * Get the first available employee ID from the grid
 *
 * Useful when tests don't care about which specific employee is moved,
 * just that a change exists.
 */
export async function getFirstEmployeeId(page: Page): Promise<number> {
  // Wait for employee cards to be fully loaded and stable
  await page.waitForLoadState("networkidle");

  const firstCard = page.locator('[data-testid^="employee-card-"]').first();

  // Ensure the card is visible and stable before extracting the ID
  await firstCard.waitFor({ state: "visible", timeout: 5000 });

  const testId = await firstCard.getAttribute("data-testid");

  if (!testId) {
    throw new Error("Could not find employee card");
  }

  const employeeId = parseInt(testId.replace("employee-card-", ""), 10);

  if (isNaN(employeeId)) {
    throw new Error(`Invalid employee ID from testId: ${testId}`);
  }

  return employeeId;
}

/**
 * Get an employee ID from a specific position
 *
 * Useful for tests that need to move an employee FROM a specific box.
 */
export async function getEmployeeIdFromPosition(
  page: Page,
  position: number
): Promise<number> {
  const gridBox = page.locator(`[data-testid="grid-box-${position}"]`);
  const firstCard = gridBox.locator('[data-testid^="employee-card-"]').first();
  const testId = await firstCard.getAttribute("data-testid");

  if (!testId) {
    throw new Error(`No employee found in position ${position}`);
  }

  const employeeId = parseInt(testId.replace("employee-card-", ""), 10);

  if (isNaN(employeeId)) {
    throw new Error(`Invalid employee ID from testId: ${testId}`);
  }

  return employeeId;
}
