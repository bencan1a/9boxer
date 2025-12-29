/**
 * E2E tests for complete file load/save/apply workflows
 *
 * Tests the complete user workflows for:
 * - Loading files
 * - Making changes
 * - Applying changes (update original vs save as new)
 * - Unsaved changes warnings
 * - Recent files
 * - Error handling
 *
 * NOTE: These tests verify Phase 3 (Chunks 3A, 3B, 3C) implementation.
 * Some functionality may still be in development.
 */

import { test, expect } from "../fixtures";
import {
  uploadFile,
  makeChange,
  clickExport,
  verifyChangeCount,
  clickCloseFile,
  clickLoadSampleData,
  verifySessionClosed,
  verifyFileLoaded,
} from "../helpers/fileOperations";
import {
  openFileMenu,
  waitForUiSettle,
  resetToEmptyState,
} from "../helpers/ui";

test.describe("File Load/Save/Apply Workflows", () => {
  test.beforeEach(async ({ page }) => {
    // Reset to clean state (clears localStorage/sessionStorage)
    await resetToEmptyState(page);

    // Verify we start with empty state
    const emptyStateHeading = page.getByRole("heading", {
      name: /no employees loaded/i,
    });
    const noFileText = page.getByText(/no file selected/i);

    await Promise.race([
      emptyStateHeading.waitFor({ state: "visible", timeout: 5000 }),
      noFileText.waitFor({ state: "visible", timeout: 5000 }),
    ]);
  });

  test("load file and make changes: change count updates", async ({ page }) => {
    // 1. Upload file
    await uploadFile(page, "sample-employees.xlsx");
    await verifyFileLoaded(page);
    await verifyChangeCount(page, 0);

    // 2. Make a change
    await makeChange(page);

    // 3. Verify change count badge appears
    await verifyChangeCount(page, 1);
  });

  test("export with changes: shows ApplyChangesDialog", async ({ page }) => {
    // 1. Upload file and make changes
    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);
    await verifyChangeCount(page, 1);

    // 2. Click export
    await clickExport(page);

    // 3. Verify ApplyChangesDialog appears
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).toBeVisible({ timeout: 5000 });

    // Verify filename is shown
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).toContainText("sample-employees.xlsx");

    // Verify checkbox exists
    await expect(
      page.locator('[data-testid="save-as-new-checkbox"]')
    ).toBeVisible();
  });

  test.skip("export without changes: not applicable in new UX", async ({
    page,
  }) => {
    // NOTE: In the new UX, "Apply Changes" menu item ONLY appears when there ARE changes.
    // When there are no changes, there is no export menu item visible.
    // This test is no longer applicable and has been skipped.
  });

  test("import new file with unsaved changes: shows UnsavedChangesDialog", async ({
    page,
  }) => {
    // 1. Upload file
    await uploadFile(page, "sample-employees.xlsx");

    // 2. Make changes
    await makeChange(page);
    await verifyChangeCount(page, 1);

    // 3. Click import button
    await openFileMenu(page);
    await page.locator('[data-testid="import-data-menu-item"]').click();

    // 4. Verify UnsavedChangesDialog appears
    await expect(
      page.locator('[data-testid="unsaved-changes-dialog"]')
    ).toBeVisible({ timeout: 5000 });

    // Verify change count is shown
    const dialogText = await page
      .locator('[data-testid="unsaved-changes-dialog"]')
      .textContent();
    expect(dialogText).toContain("1");

    // Verify dialog shows correct options (using testids for reliability)
    await expect(page.locator('[data-testid="discard-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="apply-button"]')).toBeVisible();
  });

  test("unsaved changes dialog: cancel keeps session active", async ({
    page,
  }) => {
    // 1. Upload file and make changes
    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);

    // 2. Try to close file
    await clickCloseFile(page);

    // 3. Verify UnsavedChangesDialog appears
    await expect(
      page.locator('[data-testid="unsaved-changes-dialog"]')
    ).toBeVisible();

    // 4. Click Cancel (use testid for reliability)
    await page.locator('[data-testid="cancel-button"]').click();

    // 5. Verify dialog closes, session still active
    await expect(
      page.locator('[data-testid="unsaved-changes-dialog"]')
    ).not.toBeVisible();
    await verifyFileLoaded(page);
    await verifyChangeCount(page, 1);
  });

  test("unsaved changes dialog: discard changes continues action", async ({
    page,
  }) => {
    // 1. Upload file and make changes
    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);

    // 2. Try to close file
    await clickCloseFile(page);

    // 3. Verify UnsavedChangesDialog appears
    await expect(
      page.locator('[data-testid="unsaved-changes-dialog"]')
    ).toBeVisible();

    // 4. Click "Discard Changes" (use testid for reliability)
    await page.locator('[data-testid="discard-button"]').click();

    // 5. Verify session is closed
    await verifySessionClosed(page);
  });

  test("close file with no changes: immediate close (no dialog)", async ({
    page,
  }) => {
    // 1. Upload file (no changes)
    await uploadFile(page, "sample-employees.xlsx");
    await verifyChangeCount(page, 0);

    // 2. Click "Close File"
    await clickCloseFile(page);

    // 3. Verify no dialog shown (immediate close)
    await expect(
      page.locator('[data-testid="unsaved-changes-dialog"]')
    ).not.toBeVisible();

    // 4. Verify session is closed
    await verifySessionClosed(page);
  });

  test("load sample data with unsaved changes: shows warning", async ({
    page,
  }) => {
    // 1. Upload file and make changes
    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);

    // 2. Click "Load Sample Data"
    await clickLoadSampleData(page);

    // 3. Verify UnsavedChangesDialog appears
    await expect(
      page.locator('[data-testid="unsaved-changes-dialog"]')
    ).toBeVisible();

    // 4. Click "Discard Changes" (use testid for reliability)
    await page.locator('[data-testid="discard-button"]').click();

    // 5. Verify sample data dialog opens (correct testid)
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible();
  });

  test("apply changes dialog: cancel returns to session", async ({ page }) => {
    // 1. Upload file and make changes
    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);

    // 2. Click export
    await clickExport(page);

    // 3. Verify dialog appears
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).toBeVisible();

    // 4. Click Cancel button in ApplyChangesDialog
    await page
      .locator('[data-testid="apply-changes-dialog"]')
      .getByRole("button", { name: "Cancel" })
      .click();

    // 5. Verify dialog closes
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).not.toBeVisible();

    // 6. Verify session is still active with changes
    await verifyFileLoaded(page);
    await verifyChangeCount(page, 1);
  });

  test("multiple changes: change count accumulates", async ({ page }) => {
    // 1. Upload file
    await uploadFile(page, "sample-employees.xlsx");
    await verifyChangeCount(page, 0);

    // 2. Make first change
    await makeChange(page);
    await verifyChangeCount(page, 1);

    // 3. Make second change (move another employee)
    const secondCard = page.locator('[data-testid^="employee-card-"]').nth(1);
    await secondCard.waitFor({ state: "visible" });

    const cardTestId = await secondCard.getAttribute("data-testid");
    const employeeId = parseInt(
      cardTestId?.replace("employee-card-", "") || "2"
    );

    // Import dragEmployeeToPosition for direct use
    const { dragEmployeeToPosition } = await import("../helpers/dragAndDrop");
    await dragEmployeeToPosition(page, employeeId, 5);

    // 4. Verify change count is 2
    await verifyChangeCount(page, 2);
  });

  // ============================================================
  // TESTS FOR FUNCTIONALITY STILL IN DEVELOPMENT (Phase 3D)
  // ============================================================

  test.skip("apply changes: update original file", async ({ page }) => {
    // TODO: Requires backend endpoint implementation
    // This test will be enabled when /api/session/apply-changes is implemented

    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);
    await clickExport(page);

    // Click Apply button
    const applyButton = page.locator('button:has-text("Apply Changes")');
    await applyButton.click();

    // Verify dialog closes (success)
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).not.toBeVisible({ timeout: 10000 });

    // Verify change count is reset to 0
    await verifyChangeCount(page, 0);
  });

  test.skip("apply changes: save as new file", async ({ page }) => {
    // TODO: Requires backend endpoint implementation
    // This test will be enabled when /api/session/apply-changes is implemented

    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);
    await clickExport(page);

    // Check "Save as new file"
    await page.locator('[data-testid="save-as-new-checkbox"]').check();

    // Mock file save dialog
    const newPath = "/tmp/employees-updated.xlsx";
    await page.evaluate((path) => {
      (window as any).electronAPI = {
        ...(window as any).electronAPI,
        saveFileDialog: async () => path,
      };
    }, newPath);

    // Click Apply
    const applyButton = page.locator('button:has-text("Apply Changes")');
    await applyButton.click();

    // Verify dialog closes
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).not.toBeVisible({ timeout: 10000 });

    // Verify change count is reset
    await verifyChangeCount(page, 0);
  });

  test.skip("apply changes then continue: unsaved changes workflow", async ({
    page,
  }) => {
    // TODO: Requires backend endpoint implementation
    // This test combines UnsavedChangesDialog → ApplyChangesDialog → Continue

    await uploadFile(page, "sample-employees.xlsx");
    await makeChange(page);

    // Trigger unsaved changes warning
    await openFileMenu(page);
    await page.locator('[data-testid="import-data-menu-item"]').click();

    // Click "Apply Changes" (use testid for reliability)
    await page.locator('[data-testid="apply-button"]').click();

    // Verify ApplyChangesDialog appears
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).toBeVisible();

    // Apply changes
    const applyButton = page.locator('button:has-text("Apply Changes")');
    await applyButton.click();

    // Wait for apply to complete
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).not.toBeVisible({ timeout: 10000 });

    // Verify upload dialog opens after apply
    await expect(
      page.locator('[data-testid="file-upload-dialog"]')
    ).toBeVisible();
  });

  test.skip("recent files: load recent file", async ({ page }) => {
    // TODO: Requires recent files API implementation
    // This test will be enabled when recent files backend is implemented
  });

  test.skip("apply changes: error handling", async ({ page }) => {
    // TODO: Requires backend endpoint implementation
    // This test verifies error display when apply fails
  });
});
