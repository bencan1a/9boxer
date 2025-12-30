/**
 * Change tracking verification helpers for Playwright E2E tests
 *
 * Provides helpers for verifying change records in the Changes tab.
 */

import { Page, expect } from "@playwright/test";
import { selectEmployee } from "./selection";
import { clickTabAndWait } from "./ui";

/**
 * Verify that a change record exists for an employee
 *
 * Selects the employee, opens the Changes tab, and verifies
 * that the change record shows:
 * - Position change indicator
 * - Old position
 * - New position
 * - Timestamp or change indicator
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee to check
 *
 * @example
 * ```typescript
 * test('moving employee creates change record', async ({ page }) => {
 *   await loadSampleData(page);
 *   await dragEmployeeToPosition(page, 5, 6);
 *
 *   // Verify change record exists
 *   await expectChangeRecordExists(page, 5);
 * });
 * ```
 */
export async function expectChangeRecordExists(
  page: Page,
  employeeId: number
): Promise<void> {
  // Select the employee
  await selectEmployee(page, employeeId);

  // Switch to Changes tab
  await clickTabAndWait(page, "changes-tab");

  // Verify changes panel is visible
  const changesPanel = page.locator('[data-testid="changes-panel"]');
  await expect(changesPanel).toBeVisible();

  // Verify position change indicator/text is shown
  // This could be "Position changed", "Moved from X to Y", etc.
  await expect(changesPanel).toContainText(/position|moved|changed/i);

  // Verify old position is displayed
  const oldPosition = changesPanel.locator('[data-testid="change-old-position"]');
  await expect(oldPosition).toBeVisible();

  // Verify new position is displayed
  const newPosition = changesPanel.locator('[data-testid="change-new-position"]');
  await expect(newPosition).toBeVisible();
}

/**
 * Verify that the Changes tab shows a specific number of changes
 *
 * Useful for verifying multiple changes are tracked.
 *
 * @param page - Playwright Page object
 * @param expectedCount - Expected number of change records
 *
 * @example
 * ```typescript
 * test('multiple changes tracked', async ({ page }) => {
 *   await loadSampleData(page);
 *   await createMultipleChanges(page, [
 *     { employeeId: 1, newPosition: 6 },
 *     { employeeId: 2, newPosition: 9 },
 *   ]);
 *
 *   await clickTabAndWait(page, 'changes-tab');
 *   await expectChangeCount(page, 2);
 * });
 * ```
 */
export async function expectChangeCount(
  page: Page,
  expectedCount: number
): Promise<void> {
  // Verify changes panel shows correct count
  const changesPanel = page.locator('[data-testid="changes-panel"]');
  const changeRecords = changesPanel.locator('[data-testid^="change-record-"]');
  await expect(changeRecords).toHaveCount(expectedCount);
}

/**
 * Verify that a note exists for a changed employee
 *
 * Selects the employee, opens the Changes tab, and verifies
 * that the notes field contains the expected note text.
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee to check
 * @param expectedNote - The note text to verify
 *
 * @example
 * ```typescript
 * test('note appears in changes tab', async ({ page }) => {
 *   await loadSampleData(page);
 *   const employeeId = await getFirstEmployeeId(page);
 *   await dragEmployeeToPosition(page, employeeId, 6);
 *   await selectEmployee(page, employeeId);
 *   await clickTabAndWait(page, 'changes-tab');
 *   await page.locator('[data-testid="change-notes"]').fill('Test note');
 *
 *   await expectChangeNoteExists(page, employeeId, 'Test note');
 * });
 * ```
 */
export async function expectChangeNoteExists(
  page: Page,
  employeeId: number,
  expectedNote: string
): Promise<void> {
  // Select the employee
  await selectEmployee(page, employeeId);

  // Switch to Changes tab
  await clickTabAndWait(page, "changes-tab");

  // Verify notes field contains the expected text
  const notesField = page.locator('[data-testid="change-notes"]');
  await expect(notesField).toHaveValue(expectedNote);
}
