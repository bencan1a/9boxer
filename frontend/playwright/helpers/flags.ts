/**
 * Flag management helpers for Playwright E2E tests
 *
 * Provides helpers for applying and verifying employee flags.
 *
 * NOTE: This helper makes assumptions about data-testid values.
 * If tests fail, verify the actual data-testid values in the UI:
 * - Flag add button: assumed to be "add-flag-button"
 * - Flag option: assumed to be "flag-option-{flagName}"
 * - Flags display: assumed to be "employee-flags"
 */

import { Page, expect } from "@playwright/test";
import { selectEmployee } from "./selection";

/**
 * Apply a flag to an employee
 *
 * Selects the employee, opens the flag dropdown/dialog,
 * selects the specified flag, and verifies it appears in the Details panel.
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee
 * @param flagKey - Key of the flag to apply (e.g., "promotion_ready", "flight_risk")
 *
 * @example
 * ```typescript
 * test('apply flag to employee', async ({ page }) => {
 *   await loadSampleData(page);
 *   await applyFlag(page, 5, 'promotion_ready');
 *   // Flag now appears in Details panel
 * });
 * ```
 *
 * @remarks
 * This function assumes the following UI structure:
 * - An autocomplete with data-testid="flag-picker" to open flag selection
 * - Flag options with data-testid="flag-option-{flagKey}"
 * - Flag chips with data-testid="flag-chip-{flagKey}"
 */
export async function applyFlag(
  page: Page,
  employeeId: number,
  flagKey: string
): Promise<void> {
  // Select the employee
  await selectEmployee(page, employeeId);

  // Click on the flag picker autocomplete input to open dropdown
  const flagPicker = page.locator('[data-testid="flag-picker"]');
  const input = flagPicker.locator('input');
  await input.click();

  // Wait for the dropdown to open and the SPECIFIC flag option to appear
  const flagOption = page.locator(`[data-testid="flag-option-${flagKey}"]`);
  await flagOption.waitFor({ state: "visible", timeout: 10000 });

  // Select the specified flag
  await flagOption.click();

  // Verify flag appears in Details panel
  const flagChip = page.locator(`[data-testid="flag-chip-${flagKey}"]`);
  await expect(flagChip).toBeVisible();
}

/**
 * Verify an employee has a specific flag
 *
 * Selects the employee and verifies the flag appears in the Flags section
 * of the Details panel.
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee
 * @param flagKey - Key of the flag to verify (e.g., "promotion_ready")
 *
 * @example
 * ```typescript
 * test('employee has promotion ready flag', async ({ page }) => {
 *   await loadSampleData(page);
 *   await expectEmployeeHasFlag(page, 5, 'promotion_ready');
 * });
 * ```
 */
export async function expectEmployeeHasFlag(
  page: Page,
  employeeId: number,
  flagKey: string
): Promise<void> {
  // Select the employee
  await selectEmployee(page, employeeId);

  // Verify flag appears in Flags section
  const flagChip = page.locator(`[data-testid="flag-chip-${flagKey}"]`);
  await expect(flagChip).toBeVisible();
}

/**
 * Remove a flag from an employee
 *
 * Selects the employee and removes the specified flag.
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee
 * @param flagName - Name of the flag to remove
 *
 * @example
 * ```typescript
 * test('remove flag from employee', async ({ page }) => {
 *   await loadSampleData(page);
 *   await applyFlag(page, 5, 'Flight Risk');
 *   await removeFlag(page, 5, 'Flight Risk');
 *   // Flag is no longer visible
 * });
 * ```
 *
 * @remarks
 * This function assumes a remove button exists with data-testid="remove-flag-{flagName}"
 */
export async function removeFlag(
  page: Page,
  employeeId: number,
  flagName: string
): Promise<void> {
  // Select the employee
  await selectEmployee(page, employeeId);

  // Click remove button for the flag
  const removeButton = page.locator(
    `[data-testid="remove-flag-${flagName}"]`
  );
  await removeButton.click();

  // Verify flag is removed from Flags section
  const flagsSection = page.locator('[data-testid="employee-flags"]');
  await expect(flagsSection).not.toContainText(flagName);
}

/**
 * Verify the Flags section is visible in Details panel
 *
 * Checks that the Flags section exists and is displayed.
 *
 * @param page - Playwright Page object
 *
 * @example
 * ```typescript
 * await selectEmployee(page, 5);
 * await expectFlagsSectionVisible(page);
 * ```
 */
export async function expectFlagsSectionVisible(page: Page): Promise<void> {
  const flagsSection = page.locator('[data-testid="flags-section"]');
  await expect(flagsSection).toBeVisible();
}
