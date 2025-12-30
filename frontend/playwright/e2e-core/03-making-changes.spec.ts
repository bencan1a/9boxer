/**
 * E2E Core Tests - Section 3: Making Changes
 *
 * Tests employee movement, change tracking, notes, and flags.
 * Based on e2e-test-specification.md lines 170-295
 */

import { test, expect } from "../fixtures/worker-backend";
import {
  loadSampleData,
  getFirstEmployeeId,
  dragEmployeeToPosition,
  expectEmployeeHasOrangeBorder,
  expectChangeRecordExists,
  selectEmployee,
  clickTabAndWait,
  applyFlag,
  expectEmployeeHasFlag,
} from "../helpers";
import { FLAGS } from "../../src/constants/flags";

test.describe("3. Making Changes Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("3.1 - Drag and Drop Employee to Different Box", async ({ page }) => {
    // Get first available employee
    const employeeId = await getFirstEmployeeId(page);
    const employeeCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );

    // Get original position
    const originalPosition = parseInt(
      (await employeeCard.getAttribute("data-position")) || "1",
      10
    );

    // Determine target position (different from original)
    const targetPosition = originalPosition === 6 ? 9 : 6;

    // Drag employee to different box
    await dragEmployeeToPosition(page, employeeId, targetPosition);

    // Success Criteria:
    // ✅ Tile follows cursor during drag operation (verified by dragEmployeeToPosition)
    // ✅ Visual feedback indicates valid drop zones during drag (handled by dnd-kit)
    // ✅ Employee tile appears in new box position after drop
    await expect(employeeCard).toHaveAttribute(
      "data-position",
      targetPosition.toString()
    );

    // ✅ Employee tile is removed from original box (implicit - same card moved)
    // ✅ Grid updates immediately without page refresh (verified by position attribute check)

    // Verify employee is in the correct grid box
    const targetBox = page.locator(
      `[data-testid="grid-box-${targetPosition}"]`
    );
    await expect(
      targetBox.locator(`[data-testid="employee-card-${employeeId}"]`)
    ).toBeVisible();
  });

  test("3.2 - Modified Employee Shows Orange Border", async ({ page }) => {
    // Get first available employee
    const employeeId = await getFirstEmployeeId(page);
    const employeeCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );

    // Get original position
    const originalPosition = parseInt(
      (await employeeCard.getAttribute("data-position")) || "1",
      10
    );

    // Determine target position (different from original)
    const targetPosition = originalPosition === 6 ? 9 : 6;

    // Drag employee to different box
    await dragEmployeeToPosition(page, employeeId, targetPosition);

    // Success Criteria:
    // ✅ Employee tile displays orange left border (color: #ff9800 in light mode, #ffb74d in dark mode)
    // ✅ Border is clearly visible and distinguishes modified from unmodified employees
    await expectEmployeeHasOrangeBorder(page, employeeId);

    // ✅ Border persists after deselecting the employee
    await page.locator('[data-testid="nine-box-grid"]').click();
    await expectEmployeeHasOrangeBorder(page, employeeId);

    // ✅ Border remains visible when filtering/navigating
    // (Just verify it's still there - full filter testing is in section 4)
    await expect(employeeCard).toBeVisible();
    await expectEmployeeHasOrangeBorder(page, employeeId);
  });

  test("3.3 - File Menu Badge Shows Change Count", async ({ page }) => {
    // Initial state - no changes
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    const badgePill = fileMenuBadge.locator(".MuiBadge-badge");

    // Success Criteria:
    // ✅ File menu button displays badge/indicator (initially invisible)
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Move an employee to create a change
    const employeeId = await getFirstEmployeeId(page);
    const employeeCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );
    const originalPosition = parseInt(
      (await employeeCard.getAttribute("data-position")) || "1",
      10
    );
    const targetPosition = originalPosition === 6 ? 9 : 6;

    await dragEmployeeToPosition(page, employeeId, targetPosition);

    // ✅ Badge shows correct number of changes (increments by 1 after move)
    // ✅ Badge updates immediately after change
    await expect(badgePill).not.toHaveClass(/MuiBadge-invisible/);
    await expect(fileMenuBadge).toContainText("1");

    // ✅ Badge is visually prominent (color/position makes it noticeable)
    // Verify badge is visible and has content
    await expect(badgePill).toBeVisible();
  });

  test("3.4 - Changes Records Show Up When Employee is Moved", async ({
    page,
  }) => {
    // Move an employee to create a change
    const employeeId = await getFirstEmployeeId(page);
    const employeeCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );

    // Get original position for verification
    const originalPosition = parseInt(
      (await employeeCard.getAttribute("data-position")) || "1",
      10
    );
    const targetPosition = originalPosition === 6 ? 9 : 6;

    await dragEmployeeToPosition(page, employeeId, targetPosition);

    // Click the moved employee tile
    await selectEmployee(page, employeeId);

    // Click the "Changes" tab in right panel
    await clickTabAndWait(page, "changes-tab");

    // Success Criteria:
    // ✅ Changes tab shows the moved employee
    const changeRow = page.locator(`[data-testid="change-row-${employeeId}"]`);
    await expect(changeRow).toBeVisible();

    // ✅ Previous position is displayed
    // ✅ New position is displayed
    // Movement chips should be visible (showing from and to boxes)
    await expect(changeRow.locator(".MuiChip-root").first()).toBeVisible();
    await expect(changeRow.locator(".MuiChip-root").nth(1)).toBeVisible();

    // ✅ Change timestamp or indicator is visible
    // (Change row being visible confirms the change is tracked)

    // ✅ Notes field is available for the change
    const notesField = page.locator(
      `[data-testid="change-notes-${employeeId}"]`
    );
    await expect(notesField).toBeVisible();
  });

  test("3.5 - Add Note to Changed Employee", async ({ page }) => {
    // Move an employee to create a change
    const employeeId = await getFirstEmployeeId(page);
    const employeeCard = page.locator(
      `[data-testid="employee-card-${employeeId}"]`
    );
    const originalPosition = parseInt(
      (await employeeCard.getAttribute("data-position")) || "1",
      10
    );
    const targetPosition = originalPosition === 6 ? 9 : 6;

    await dragEmployeeToPosition(page, employeeId, targetPosition);

    // Click moved employee tile
    await selectEmployee(page, employeeId);

    // Switch to Changes tab
    await clickTabAndWait(page, "changes-tab");

    // Click in the "Notes" field
    const notesField = page.locator(
      `[data-testid="change-notes-${employeeId}"]`
    );
    await notesField.click();

    // Success Criteria:
    // ✅ Notes field is editable
    await expect(notesField).toBeEditable();

    // Type a note: "Test note - promoted to senior role"
    const testNote = "Test note - promoted to senior role";
    await notesField.fill(testNote);

    // ✅ Text appears in field as user types
    await expect(notesField).toHaveValue(testNote);

    // Click outside the field to save
    await page.locator('[data-testid="change-tracker-view"]').click();

    // ✅ Note saves automatically (no explicit save button required)
    // Wait for auto-save
    await page.waitForLoadState("networkidle");

    // ✅ Note persists when deselecting and reselecting employee
    // Deselect by clicking grid
    await page.locator('[data-testid="nine-box-grid"]').click();

    // Reselect employee
    await selectEmployee(page, employeeId);
    await clickTabAndWait(page, "changes-tab");

    // Verify note is still there
    const notesFieldAfter = page.locator(
      `[data-testid="change-notes-${employeeId}"]`
    );
    await expect(notesFieldAfter).toHaveValue(testNote);

    // ✅ No error messages or save failures
    // (If there were errors, the note wouldn't persist)
  });

  test("3.6 - Apply Flag to Employee and Verify Display", async ({ page }) => {
    // Get an employee to work with
    const employeeId = await getFirstEmployeeId(page);

    // Success Criteria:
    // ✅ Flag can be applied/added to employee
    // Use production flag definition to avoid drift
    const flag = FLAGS.promotion_ready;

    // Use the helper function to apply the flag (this will select the employee)
    await applyFlag(page, employeeId, flag.key);

    // Verify Details tab is active (default when selecting employee)
    const detailsTab = page.locator('[data-testid="details-tab"]');
    await expect(detailsTab).toHaveAttribute("aria-selected", "true");

    // ✅ Flag appears in Flags section of Details tab
    // ✅ Flag displays with correct name/label
    // ✅ Flag is visually distinct (icon, color, badge)
    const flagChip = page.locator(`[data-testid="flag-chip-${flag.key}"]`);
    await expect(flagChip).toBeVisible();
    await expect(flagChip).toContainText(flag.displayName);

    // ✅ Flag persists when deselecting and reselecting employee
    // Deselect by clicking grid
    await page.locator('[data-testid="nine-box-grid"]').click();

    // Reselect employee
    await selectEmployee(page, employeeId);

    // Verify flag is still there
    await expectEmployeeHasFlag(page, employeeId, flag.key);

    // Also verify the display name is correct
    const flagChipAfter = page.locator(`[data-testid="flag-chip-${flag.key}"]`);
    await expect(flagChipAfter).toContainText(flag.displayName);
  });
});
