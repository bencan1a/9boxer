/**
 * File operation helpers for E2E tests
 *
 * Provides helper functions for file load/save/apply workflows
 */

import { Page, expect } from "@playwright/test";
import * as path from "path";
import { dragEmployeeToPosition } from "./dragAndDrop";
import { createChange, getFirstEmployeeId } from "./testData";
import { openFileMenu } from "./ui";

/**
 * Upload a file using the file upload dialog
 *
 * @param page - Playwright Page object
 * @param fileName - Name of the file in fixtures directory
 */
export async function uploadFile(page: Page, fileName: string): Promise<void> {
  // Try empty state button first, fall back to file menu
  const emptyStateButton = page.locator('[data-testid="upload-file-button"]');
  const isEmptyState = await emptyStateButton.isVisible().catch(() => false);

  if (isEmptyState) {
    await emptyStateButton.click();
  } else {
    await openFileMenu(page);
    await page.locator('[data-testid="import-data-menu-item"]').click();
  }

  // Wait for dialog to open
  await expect(
    page.locator('[data-testid="file-upload-dialog"]')
  ).toBeVisible();

  // Select file
  const fixturePath = path.join(__dirname, "..", "fixtures", fileName);
  await page.locator("#file-upload-input").setInputFiles(fixturePath);

  // Upload
  await page.locator('[data-testid="upload-submit-button"]').click();

  // Wait for upload to complete
  await expect(
    page.locator('[data-testid="file-upload-dialog"]')
  ).not.toBeVisible({
    timeout: 10000,
  });

  // Wait for grid to load
  await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
}

/**
 * Make a change to create unsaved changes
 * Moves the first employee to a different position via API
 *
 * @param page - Playwright Page object
 */
export async function makeChange(page: Page): Promise<void> {
  // Get any employee ID (faster than querying DOM for specific positions)
  const employeeId = await getFirstEmployeeId(page);

  // Move employee to position 6 via API (faster and more reliable than drag)
  await createChange(page, employeeId, 6);

  // Verify change count badge appears
  await expect(page.locator('[data-testid="file-menu-badge"]')).toBeVisible();
}

/**
 * Click the export button to trigger apply changes dialog or direct download
 * Note: "Apply Changes" menu item only appears when there ARE changes
 *
 * @param page - Playwright Page object
 */
export async function clickExport(page: Page): Promise<void> {
  await openFileMenu(page);

  // Wait for menu to be visible
  await expect(page.locator('[role="menu"]')).toBeVisible();

  // "Apply Changes" menu item only appears when there ARE changes
  const exportChangesItem = page.locator(
    '[data-testid="export-changes-menu-item"]'
  );

  // Check if export changes item is visible (means there are changes)
  const hasChanges = await exportChangesItem.isVisible().catch(() => false);

  if (hasChanges) {
    await exportChangesItem.click();
  } else {
    throw new Error("Export Changes menu item not found - no changes to apply");
  }
}

/**
 * Apply changes with specified mode
 *
 * @param page - Playwright Page object
 * @param mode - 'update' to update original, 'save_new' to save as new file
 * @param newPath - Optional new file path (required for save_new mode)
 */
export async function applyChanges(
  page: Page,
  mode: "update" | "save_new",
  newPath?: string
): Promise<void> {
  // Wait for Apply Changes dialog
  await expect(
    page.locator('[data-testid="apply-changes-dialog"]')
  ).toBeVisible();

  if (mode === "save_new") {
    // Check "Save as new file" checkbox
    await page.locator('[data-testid="save-as-new-checkbox"]').check();

    // Mock file save dialog
    await page.evaluate((path) => {
      (window as any).electronAPI = {
        ...(window as any).electronAPI,
        saveFileDialog: async () => path,
      };
    }, newPath);
  }

  // Click Apply button (use getByRole for reliability)
  const applyButton = page.getByRole("button", { name: "Apply Changes" });
  await applyButton.click();

  // Wait for dialog to close (indicates success)
  await expect(
    page.locator('[data-testid="apply-changes-dialog"]')
  ).not.toBeVisible({
    timeout: 10000,
  });
}

/**
 * Verify unsaved changes dialog appears with correct count
 *
 * @param page - Playwright Page object
 * @param expectedCount - Expected number of changes
 */
export async function verifyUnsavedChangesDialog(
  page: Page,
  expectedCount: number
): Promise<void> {
  await expect(
    page.locator('[data-testid="unsaved-changes-dialog"]')
  ).toBeVisible();

  // Check that change count is mentioned in dialog
  const dialogText = await page
    .locator('[data-testid="unsaved-changes-dialog"]')
    .textContent();
  expect(dialogText).toContain(expectedCount.toString());
}

/**
 * Click a recent file in the file menu
 *
 * @param page - Playwright Page object
 * @param fileName - File name to click
 */
export async function clickRecentFile(
  page: Page,
  fileName: string
): Promise<void> {
  await openFileMenu(page);

  // Recent files are displayed in menu items under "Recent Files" section
  // Find menu item containing the file name
  const menuItem = page.locator(`[role="menuitem"]:has-text("${fileName}")`);
  await menuItem.click();
}

/**
 * Verify change count badge
 *
 * @param page - Playwright Page object
 * @param expectedCount - Expected change count
 */
export async function verifyChangeCount(
  page: Page,
  expectedCount: number
): Promise<void> {
  // The badge is inside the MuiBadge-root wrapper
  // Find the actual badge content element
  const badgeContent = page.locator(
    '[data-testid="file-menu-badge"] .MuiBadge-badge'
  );

  if (expectedCount === 0) {
    // When invisible prop is true, MUI adds 'MuiBadge-invisible' class to the badge
    const hasInvisibleClass = await badgeContent.evaluate((el) =>
      el.classList.contains("MuiBadge-invisible")
    );

    expect(hasInvisibleClass).toBe(true);
  } else {
    // Badge should be visible (not have invisible class) and show count
    const hasInvisibleClass = await badgeContent.evaluate((el) =>
      el.classList.contains("MuiBadge-invisible")
    );

    expect(hasInvisibleClass).toBe(false);
    await expect(badgeContent).toContainText(expectedCount.toString());
  }
}

/**
 * Click "Close File" menu item
 *
 * @param page - Playwright Page object
 */
export async function clickCloseFile(page: Page): Promise<void> {
  await openFileMenu(page);
  await page.locator('[data-testid="close-file-menu-item"]').click();
}

/**
 * Click "Load Sample Data" button
 *
 * @param page - Playwright Page object
 */
export async function clickLoadSampleData(page: Page): Promise<void> {
  await openFileMenu(page);
  await page.locator('[data-testid="load-sample-menu-item"]').click();
}

/**
 * Verify session is closed (grid shows empty state)
 *
 * @param page - Playwright Page object
 */
export async function verifySessionClosed(page: Page): Promise<void> {
  // Check for empty state heading
  const emptyStateHeading = page.getByRole("heading", {
    name: /no employees loaded/i,
  });
  await expect(emptyStateHeading).toBeVisible();

  // Grid should not be visible
  await expect(page.locator('[data-testid="nine-box-grid"]')).not.toBeVisible();
}

/**
 * Verify file is loaded (grid shows employees)
 *
 * @param page - Playwright Page object
 */
export async function verifyFileLoaded(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

  // At least one employee card should be visible
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  await expect(employeeCards.first()).toBeVisible();
}
