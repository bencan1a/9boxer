/**
 * Smoke Test Suite - Critical User Workflows
 *
 * Fast smoke test that validates core functionality:
 * - Upload → View Details → Drag Employee → Filter → Export
 *
 * This suite catches 80% of critical regression issues in under 2 minutes.
 * Run this before commits to ensure basic functionality works.
 */

import { test, expect } from "../fixtures";
import { loadSampleData, dragEmployeeToPosition } from "../helpers";
import type { Page, Locator } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * Helper to find any employee in the grid
 * Returns the first employee found in any box (prioritizing likely populated boxes)
 */
async function findAnyEmployee(page: Page): Promise<{
  employeeCard: Locator;
  employeeId: string;
  boxNumber: number;
}> {
  // Check boxes in order of likelihood (high performers first)
  for (const box of [9, 8, 6, 5, 7, 4, 3, 2, 1]) {
    const gridBox = page.locator(`[data-testid="grid-box-${box}"]`);
    const employees = gridBox.locator('[data-testid^="employee-card-"]');
    const count = await employees.count();

    if (count > 0) {
      const firstEmployee = employees.first();
      const testId = await firstEmployee.getAttribute("data-testid");
      const employeeId = testId?.replace("employee-card-", "") || "";
      return {
        employeeCard: firstEmployee,
        employeeId,
        boxNumber: box,
      };
    }
  }

  throw new Error("No employees found in any grid box");
}

test.describe("Smoke Test - Critical Workflows", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session and start fresh
    await page.goto("/");

    // Clear localStorage to remove any persisted session
    await page.evaluate(() => localStorage.clear());

    // Reload to ensure clean state
    await page.reload();

    // Wait for app to be ready
    await page.waitForLoadState("domcontentloaded");
  });

  test("should complete full user workflow: upload, view, move, filter, and export", async ({
    page,
  }) => {
    // 1. LOAD - Load sample data and verify grid loads
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify initial employee count
    const employeeCountChip = page.locator('[data-testid="employee-count"]');
    await expect(employeeCountChip).toBeVisible();
    const initialCountText = await employeeCountChip.textContent();
    expect(initialCountText).toContain("employees");

    // 2. VIEW DETAILS - Click employee and view details panel
    const { employeeCard, employeeId } = await findAnyEmployee(page);
    await employeeCard.click();

    // Verify Details tab opens with employee information
    await expect(page.locator('[data-testid="details-tab"]')).toHaveAttribute(
      "aria-selected",
      "true"
    );
    // Verify details panel shows content (name and job info will vary)
    const detailsPanel = page.locator('[data-testid="tab-panel-0"]');
    const headings = detailsPanel.locator("h2, h3, h4, h5, h6");
    await expect(headings.first()).toBeVisible();

    // 3. DRAG & DROP - Move employee and verify visual feedback
    await dragEmployeeToPosition(page, parseInt(employeeId), 6);

    // Verify employee moved to box 6
    const box6 = page.locator('[data-testid="grid-box-6"]');
    const movedEmployee = box6.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );
    await expect(movedEmployee).toBeVisible();

    // Note: Modified indicator chip was removed - modified state is shown via border styling only

    // Verify file menu badge shows change count
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    await expect(fileMenuBadge).toContainText("1");

    // 4. FILTER - Verify filter drawer opens and closes
    const filterButton = page.locator('[data-testid="filter-button"]');
    await filterButton.click();

    // Wait for filter drawer to be visible
    const filterDrawer = page.locator(".MuiDrawer-paper");
    await expect(filterDrawer).toBeVisible();

    // Verify filter controls are present
    await expect(
      page.getByRole("button", { name: /Job Level/i })
    ).toBeVisible();

    // Close filter drawer
    await page.keyboard.press("Escape");

    // Verify drawer is closed
    await expect(filterDrawer).not.toBeVisible();

    // 5. EXPORT - Export to Excel and verify file
    // Open file menu and click export
    await page.locator('[data-testid="file-menu-button"]').click();
    // Wait for export menu item to be visible and enabled
    const exportMenuItem = page.locator(
      '[data-testid="export-changes-menu-item"]'
    );
    await expect(exportMenuItem).toBeVisible();
    await expect(exportMenuItem).toBeEnabled();
    await exportMenuItem.click();

    // Verify ApplyChangesDialog appears
    await expect(
      page.locator('[data-testid="apply-changes-dialog"]')
    ).toBeVisible();

    // Click Apply Changes button and wait for download
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Apply Changes" }).click();

    const download = await downloadPromise;

    // Verify filename pattern
    expect(download.suggestedFilename()).toMatch(/modified_.*\.xlsx$/);

    // Save and verify file exists
    const downloadPath = path.join(
      __dirname,
      "..",
      "tmp",
      download.suggestedFilename()
    );
    const tmpDir = path.join(__dirname, "..", "tmp");

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    await download.saveAs(downloadPath);
    expect(fs.existsSync(downloadPath)).toBeTruthy();

    // Clean up
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }
  });

  test("should handle change tracking workflow end-to-end", async ({
    page,
  }) => {
    // Load sample data and load grid
    await page.goto("/");
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Find and move employee
    const { employeeId } = await findAnyEmployee(page);
    await dragEmployeeToPosition(page, parseInt(employeeId), 6);

    // Navigate to Changes tab
    await page.locator('[data-testid="changes-tab"]').click();

    // Verify change appears (auto-retrying)
    const changeRow = page.locator(`[data-testid="change-row-${employeeId}"]`);
    await expect(changeRow).toBeVisible();

    // Add notes
    const notesField = page.locator(
      `textarea[data-testid="change-notes-${employeeId}"]`
    );
    await notesField.click();
    await notesField.fill("Smoke test - verified change tracking");

    // Blur to save (trigger blur event directly)
    await notesField.blur();

    // Verify notes saved - use auto-retry with longer timeout for async save
    await expect(notesField).toHaveValue(
      "Smoke test - verified change tracking",
      { timeout: 10000 }
    );
  });

  test("should verify statistics and intelligence tabs are accessible", async ({
    page,
  }) => {
    // Load data
    await page.goto("/");
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Click Statistics tab
    await page.locator('[data-testid="statistics-tab"]').click();

    // Verify statistics content visible (auto-retrying)
    await expect(page.getByText(/Total Employees/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Distribution by Position" })
    ).toBeVisible();

    // Click Intelligence tab
    await page.locator('[data-testid="intelligence-tab"]').click();

    // Verify intelligence tab panel visible (auto-retrying)
    await expect(page.locator("#panel-tabpanel-3")).toBeVisible();
  });
});
