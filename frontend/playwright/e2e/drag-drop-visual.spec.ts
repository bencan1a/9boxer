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
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const employeeCard = page.locator('[data-testid="employee-card-1"]');

    await expect(gridBox9.getByText('Alice Smith')).toBeVisible();
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
    const gridBox6 = page.locator('[data-testid="grid-box-6"]');
    await expect(gridBox6.getByText('Alice Smith')).toBeVisible();

    // Verify employee card has visual feedback indicators
    const movedEmployeeCard = page.locator('[data-testid="employee-card-1"]');

    // Check for modified indicator chip
    const modifiedIndicator = movedEmployeeCard.locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).toBeVisible();
    await expect(modifiedIndicator).toHaveText('Modified');

    // Check for left border (secondary color) - using computed style
    const cardElement = movedEmployeeCard;
    const borderLeft = await cardElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderLeftWidth;
    });
    expect(borderLeft).toBe('4px');

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
    // Verify export button is initially disabled
    const exportButton = page.locator('[data-testid="export-button"]');
    await expect(exportButton).toBeDisabled();

    // Verify no badge is visible initially
    const badgeChip = page.locator('button[data-testid="export-button"] ~ div').locator('div[role="status"]');
    await expect(badgeChip).not.toBeVisible();

    // Move employee using dragEmployeeToPosition
    await dragEmployeeToPosition(page, 1, 6);

    // Verify export button becomes enabled
    await expect(exportButton).toBeEnabled();

    // Check for change count chip/badge next to export button
    // The AppBar shows a Chip with the count next to the export button
    const changeCountChip = page.locator('button[data-testid="export-button"]').locator('..').locator('div:has-text("1")');
    await expect(changeCountChip).toBeVisible();

    // Verify tooltip shows change count
    const changeCountDisplay = page.locator('div').filter({ hasText: /^1$/ }).nth(0);
    await expect(changeCountDisplay).toBeVisible();
  });

  test('should show modified indicator persists after multiple moves', async ({ page }) => {
    // Move employee 1 from box 9 to 6
    await dragEmployeeToPosition(page, 1, 6);

    // Verify employee is in box 6 with modified indicator
    const gridBox6 = page.locator('[data-testid="grid-box-6"]');
    await expect(gridBox6.getByText('Alice Smith')).toBeVisible();

    let modifiedIndicator = page.locator('[data-testid="employee-card-1"]').locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).toBeVisible();

    // Move same employee from box 6 to 3
    await dragEmployeeToPosition(page, 1, 3);

    // Verify employee is now in box 3
    const gridBox3 = page.locator('[data-testid="grid-box-3"]');
    await expect(gridBox3.getByText('Alice Smith')).toBeVisible();

    // Verify employee STILL shows modified indicator
    modifiedIndicator = page.locator('[data-testid="employee-card-1"]').locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).toBeVisible();
    await expect(modifiedIndicator).toHaveText('Modified');

    // Verify badge shows "1" (net change, not 2)
    // The system tracks net changes, so moving the same employee multiple times
    // should still show only 1 change in the counter
    const changeCountDisplay = page.locator('div').filter({ hasText: /^1$/ }).nth(0);
    await expect(changeCountDisplay).toBeVisible();

    // Verify export button is still enabled
    const exportButton = page.locator('[data-testid="export-button"]');
    await expect(exportButton).toBeEnabled();

    // Verify left border persists (4px border)
    const cardElement = page.locator('[data-testid="employee-card-1"]');
    const borderLeft = await cardElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderLeftWidth;
    });
    expect(borderLeft).toBe('4px');
  });

  test('should remove visual indicators when employee is moved back to original position', async ({ page }) => {
    // Move employee from box 9 to 6
    await dragEmployeeToPosition(page, 1, 6);

    // Verify modified indicator is visible
    let modifiedIndicator = page.locator('[data-testid="employee-card-1"]').locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).toBeVisible();

    // Move employee back to original position (box 9)
    await dragEmployeeToPosition(page, 1, 9);

    // Verify employee is back in box 9
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    await expect(gridBox9.getByText('Alice Smith')).toBeVisible();

    // Verify modified indicator is no longer visible
    modifiedIndicator = page.locator('[data-testid="employee-card-1"]').locator('[data-testid="modified-indicator"]');
    await expect(modifiedIndicator).not.toBeVisible();

    // Verify export button is disabled again
    const exportButton = page.locator('[data-testid="export-button"]');
    await expect(exportButton).toBeDisabled();

    // Verify change count badge is no longer visible
    const changeCountDisplay = page.locator('button[data-testid="export-button"]').locator('..').locator('div:has-text("1")');
    await expect(changeCountDisplay).not.toBeVisible();
  });

  test('should show multiple changes when different employees are moved', async ({ page }) => {
    // Move first employee (ID 1) from box 9 to 6
    await dragEmployeeToPosition(page, 1, 6);

    // Verify badge shows "1"
    let changeCountDisplay = page.locator('div').filter({ hasText: /^1$/ }).nth(0);
    await expect(changeCountDisplay).toBeVisible();

    // Move second employee (ID 2) from their position to another position
    // First, find employee ID 2 in the grid
    const employee2Card = page.locator('[data-testid="employee-card-2"]');
    await expect(employee2Card).toBeVisible();

    // Move employee 2 to box 5
    await dragEmployeeToPosition(page, 2, 5);

    // Verify both employees have modified indicators
    const employee1Modified = page.locator('[data-testid="employee-card-1"]').locator('[data-testid="modified-indicator"]');
    const employee2Modified = page.locator('[data-testid="employee-card-2"]').locator('[data-testid="modified-indicator"]');

    await expect(employee1Modified).toBeVisible();
    await expect(employee2Modified).toBeVisible();

    // Verify badge now shows "2"
    changeCountDisplay = page.locator('div').filter({ hasText: /^2$/ }).nth(0);
    await expect(changeCountDisplay).toBeVisible();

    // Verify export button is still enabled
    const exportButton = page.locator('[data-testid="export-button"]');
    await expect(exportButton).toBeEnabled();
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
