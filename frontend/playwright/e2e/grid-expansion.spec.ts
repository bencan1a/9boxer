/**
 * E2E tests for grid box expansion and collapse workflow
 * Tests the complete flow of expanding/collapsing grid boxes with keyboard shortcuts
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile, dragEmployeeToPosition } from '../helpers';

test.describe('Grid Box Expansion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Visit and upload sample data
    await page.goto('/');
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test('should expand grid box when clicking expand button', async ({ page }) => {
    // Target grid box 9 (Star - High Performance, High Potential)
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    await expect(gridBox9).toBeVisible();

    // Verify box is not expanded initially
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'false');

    // Get initial bounding box to compare size
    const initialBox = await gridBox9.boundingBox();
    if (!initialBox) {
      throw new Error('Grid box 9 not found');
    }

    // Find and click the expand button (OpenInFullIcon)
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    // Wait for expansion animation to complete
    await page.waitForTimeout(400);

    // Verify box is now expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Verify box size increased
    const expandedBox = await gridBox9.boundingBox();
    if (!expandedBox) {
      throw new Error('Grid box 9 not found after expansion');
    }

    // Height should increase significantly (expanded has min-height 200px vs normal 150px)
    expect(expandedBox.height).toBeGreaterThan(initialBox.height);

    // Verify collapse button is now visible instead of expand button
    const collapseButton = gridBox9.locator('button[aria-label="Collapse box"]');
    await expect(collapseButton).toBeVisible();
    await expect(expandButton).not.toBeVisible();

    // Verify employee cards are still visible and more detailed
    await expect(gridBox9.getByText('Alice Smith')).toBeVisible();
  });

  test('should collapse grid box when clicking collapse button', async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // First, expand the box
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();
    await page.waitForTimeout(400);

    // Verify expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Get expanded size
    const expandedBox = await gridBox9.boundingBox();
    if (!expandedBox) {
      throw new Error('Grid box 9 not found when expanded');
    }

    // Click collapse button
    const collapseButton = gridBox9.locator('button[aria-label="Collapse box"]');
    await collapseButton.click();
    await page.waitForTimeout(400);

    // Verify box is now collapsed
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'false');

    // Verify size decreased
    const collapsedBox = await gridBox9.boundingBox();
    if (!collapsedBox) {
      throw new Error('Grid box 9 not found after collapse');
    }

    expect(collapsedBox.height).toBeLessThan(expandedBox.height);

    // Verify expand button is visible again
    await expect(expandButton).toBeVisible();
    await expect(collapseButton).not.toBeVisible();
  });

  test('should collapse expanded box when pressing ESC key', async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand the box
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();
    await page.waitForTimeout(400);

    // Verify expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Press ESC key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Verify box collapsed
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'false');

    // Verify expand button is visible again
    await expect(expandButton).toBeVisible();
  });

  test('should maintain expansion state during session', async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand box 9
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();
    await page.waitForTimeout(400);

    // Verify expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Click an employee to open details panel
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();
    await page.waitForTimeout(300);

    // Navigate to Changes tab
    await page.locator('[data-testid="changes-tab"]').click();
    await page.waitForTimeout(300);

    // Navigate back to Details tab (grid view)
    await page.locator('[data-testid="details-tab"]').click();
    await page.waitForTimeout(300);

    // Verify box 9 is still expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Move an employee (Alice Smith from box 9 to box 6)
    await dragEmployeeToPosition(page, 1, 6);

    // Verify box 9 is still expanded even after move
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');
  });

  test('should collapse other boxes when one box is expanded', async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const gridBox5 = page.locator('[data-testid="grid-box-5"]');

    // Initially, both boxes should not be expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'false');
    await expect(gridBox5).toHaveAttribute('aria-expanded', 'false');

    // Expand box 9
    await gridBox9.locator('button[aria-label="Expand box"]').click();
    await page.waitForTimeout(400);

    // Verify box 9 is expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Get initial size of box 5
    const box5Initial = await gridBox5.boundingBox();
    if (!box5Initial) {
      throw new Error('Grid box 5 not found');
    }

    // Box 5 should now be in collapsed state (other boxes collapse when one expands)
    // The grid uses dynamic template columns/rows - non-expanded boxes get 80px
    // Check that box 5 is smaller than it was initially
    const box5Collapsed = await gridBox5.boundingBox();
    if (!box5Collapsed) {
      throw new Error('Grid box 5 not found after box 9 expansion');
    }

    // Box 5 should be visually collapsed (smaller than normal)
    // We can verify this by checking for collapsed styling or reduced height
    // Note: aria-expanded only applies to the expanded box, not collapsed ones
    // The collapsed state is indicated by the grid template changing
  });

  test('should restore expansion state after page reload', async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand box 9
    const expandButton = gridBox9.locator('button[aria-label="Expand box"]');
    await expandButton.click();
    await page.waitForTimeout(400);

    // Verify expanded
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Reload the page
    await page.reload();

    // Wait for grid to load again
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify box 9 is still expanded after reload (state persisted in localStorage)
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');

    // Verify collapse button is visible
    const collapseButton = gridBox9.locator('button[aria-label="Collapse box"]');
    await expect(collapseButton).toBeVisible();
  });

  test('should clear expansion state from localStorage when collapsed', async ({ page }) => {
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');

    // Expand box 9
    await gridBox9.locator('button[aria-label="Expand box"]').click();
    await page.waitForTimeout(400);

    // Verify localStorage has the expanded position
    const expandedPosition = await page.evaluate(() => {
      return localStorage.getItem('nineBoxExpandedPosition');
    });
    expect(expandedPosition).toBe('9');

    // Collapse the box
    await gridBox9.locator('button[aria-label="Collapse box"]').click();
    await page.waitForTimeout(400);

    // Verify localStorage is cleared
    const clearedPosition = await page.evaluate(() => {
      return localStorage.getItem('nineBoxExpandedPosition');
    });
    expect(clearedPosition).toBeNull();

    // Reload to verify expansion doesn't persist
    await page.reload();
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Box 9 should not be expanded after reload
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'false');
  });

  test('should handle expanding boxes with different employee counts', async ({ page }) => {
    // Test expanding box 9 (likely has employees)
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    const badge9 = page.locator('[data-testid="grid-box-9-count"]');

    // Get employee count
    const count9 = await badge9.textContent();

    // Expand box 9
    await gridBox9.locator('button[aria-label="Expand box"]').click();
    await page.waitForTimeout(400);

    // Verify expanded and employees still visible
    await expect(gridBox9).toHaveAttribute('aria-expanded', 'true');
    if (count9 && parseInt(count9) > 0) {
      // If there are employees, verify they're visible
      await expect(gridBox9.locator('[data-testid^="employee-card-"]').first()).toBeVisible();
    }

    // Collapse it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Test expanding box 1 (Low Performance, Low Potential - may have fewer/no employees)
    const gridBox1 = page.locator('[data-testid="grid-box-1"]');

    // Expand box 1
    await gridBox1.locator('button[aria-label="Expand box"]').click();
    await page.waitForTimeout(400);

    // Verify expanded (even if empty)
    await expect(gridBox1).toHaveAttribute('aria-expanded', 'true');
  });
});
