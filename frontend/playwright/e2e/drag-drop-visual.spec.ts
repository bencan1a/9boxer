/**
 * E2E tests for drag-and-drop with visual feedback
 * Tests visual indicators and state changes during employee movement
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile, dragEmployeeToPosition } from '../helpers';

test.describe('Drag-and-Drop Visual Feedback Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Upload sample data
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test('should move employee and show visual feedback', async ({ page }) => {
    // Verify employee ID 1 (Alice Smith) is in box 9 initially
    const employeeCard = page.locator('[data-testid="employee-card-1"]');

    await expect(employeeCard).toHaveAttribute('data-position', '9');
    await expect(employeeCard).toBeVisible();

    // Verify employee does NOT have modified indicator before move
    const modifiedIndicatorBefore = employeeCard.locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicatorBefore).not.toBeVisible();

    // Get initial count for box 9 (should include Alice Smith)
    const box9CountBefore = page.locator('[data-testid="grid-box-9-count"]');
    const box9InitialCount = await box9CountBefore.textContent();

    // Get initial count for box 6 (target box)
    const box6CountBefore = page.locator('[data-testid="grid-box-6-count"]');
    const box6InitialCount = await box6CountBefore.textContent();

    // Move employee from box 9 to box 6
    await dragEmployeeToPosition(page, 1, 6);

    // Verify employee now appears in box 6
    await expect(employeeCard).toHaveAttribute('data-position', '6');

    // Verify employee card has visual feedback indicators
    const movedEmployeeCard = page.locator('[data-testid="employee-card-1"]');

    // Check for modified indicator chip
    const modifiedIndicator = movedEmployeeCard.locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).toBeVisible();
    await expect(modifiedIndicator).toHaveText('Modified');

    // Verify box counts changed
    const box9CountAfter = page.locator('[data-testid="grid-box-9-count"]');
    const box6CountAfter = page.locator('[data-testid="grid-box-6-count"]');

    // Box 9 should have decreased by 1
    const box9FinalCount = await box9CountAfter.textContent();
    expect(parseInt(box9FinalCount || '0')).toBe(parseInt(box9InitialCount || '0') - 1);

    // Box 6 should have increased by 1
    const box6FinalCount = await box6CountAfter.textContent();
    expect(parseInt(box6FinalCount || '0')).toBe(parseInt(box6InitialCount || '0') + 1);
  });

  test('should enable export button and show badge after movement', async ({ page }) => {
    // Verify file menu badge is not visible initially (no changes)
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    // Badge should be invisible initially (no changes)
    // Check the MUI Badge content element (the pill)
    const badgePill = fileMenuBadge.locator('.MuiBadge-badge');
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Open file menu to check export menu item is disabled
    await page.locator('[data-testid="file-menu-button"]').click();
    const exportMenuItem = page.locator('[data-testid="export-changes-menu-item"]');
    await expect(exportMenuItem).toBeDisabled();

    // Close menu
    await page.keyboard.press('Escape');

    // Move employee using dragEmployeeToPosition
    await dragEmployeeToPosition(page, 1, 6);

    // Verify file menu badge becomes visible (showing 1 change)
    await expect(badgePill).not.toHaveClass(/MuiBadge-invisible/);
    await expect(fileMenuBadge).toContainText('1');

    // Open file menu and verify export menu item is now enabled
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(exportMenuItem).toBeEnabled();
    await expect(exportMenuItem).toContainText('Apply 1 Change');

    // Close menu
    await page.keyboard.press('Escape');
  });

  test('should remove visual indicators when employee is moved back to original position', async ({ page }) => {
    // Move employee from box 9 to 6
    await dragEmployeeToPosition(page, 1, 6);

    // Verify modified indicator is visible
    let modifiedIndicator = page.locator('[data-testid="employee-card-1"]').locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).toBeVisible();

    // Longer stabilization for consecutive drags
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Move employee back to original position (box 9) - skip API wait and don't expect modified indicator
    await dragEmployeeToPosition(page, 1, 9, {
      skipApiWait: true,
      expectModified: false
    });

    // Verify employee is back in box 9
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await expect(employeeCard).toHaveAttribute('data-position', '9');

    // Verify modified indicator is no longer visible
    modifiedIndicator = page.locator('[data-testid="employee-card-1"]').locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).not.toBeVisible();

    // Verify file menu badge is no longer visible (no changes)
    const fileMenuBadge = page.locator('[data-testid="file-menu-badge"]');
    // Badge should be invisible again (no changes)
    // Check the MUI Badge content element (the pill)
    const badgePill = fileMenuBadge.locator('.MuiBadge-badge');
    await expect(badgePill).toHaveClass(/MuiBadge-invisible/);

    // Verify export menu item is disabled again
    await page.locator('[data-testid="file-menu-button"]').click();
    const exportMenuItem = page.locator('[data-testid="export-changes-menu-item"]');
    await expect(exportMenuItem).toBeDisabled();
    await page.keyboard.press('Escape');
  });

  test('should show visual feedback during drag operation', async ({ page }) => {
    // Get the employee card
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await expect(employeeCard).toBeVisible();

    // Get initial opacity
    const initialOpacity = await employeeCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity;
    });
    expect(parseFloat(initialOpacity)).toBe(1);

    // Start dragging (move to card and mouse down)
    const cardBox = await employeeCard.boundingBox();
    if (!cardBox) {
      throw new Error('Employee card not found');
    }

    // Get target box
    const targetBox = page.locator('[data-testid="grid-box-6"]');
    const targetBoxBounds = await targetBox.boundingBox();
    if (!targetBoxBounds) {
      throw new Error('Target box not found');
    }

    // Calculate positions
    const startX = cardBox.x + cardBox.width / 2;
    const startY = cardBox.y + cardBox.height / 2;
    const endX = targetBoxBounds.x + targetBoxBounds.width / 2;
    const endY = targetBoxBounds.y + targetBoxBounds.height / 2;

    // Move to drag handle area (left side)
    await page.mouse.move(cardBox.x + 12, startY);
    await page.mouse.down();

    // Small delay to ensure drag is initiated
    await page.waitForTimeout(150);

    // Check opacity changed during drag (should be 0.5 per EmployeeTile.tsx)
    const dragOpacity = await employeeCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity;
    });
    expect(parseFloat(dragOpacity)).toBe(0.5);

    // Move to target in steps (more realistic and triggers dnd-kit properly)
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      const y = startY + (endY - startY) * (i / steps);
      await page.mouse.move(x, y);
      await page.waitForTimeout(10);
    }

    // Wait for drag-over state to be applied
    await page.waitForTimeout(100);

    // Check target box shows drag-over state (border should change)
    const targetBoxElement = targetBox;
    const borderColor = await targetBoxElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderColor;
    });
    // Border should be primary color when dragging over
    expect(borderColor).not.toBe('rgba(0, 0, 0, 0.12)'); // Not default divider color

    // Drop
    await page.mouse.up();

    // Wait for drop to complete
    await page.waitForTimeout(1000);

    // Verify opacity returns to normal after drop
    const finalOpacity = await employeeCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity;
    });
    expect(parseFloat(finalOpacity)).toBe(1);
  });
});
