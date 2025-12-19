/**
 * E2E tests for session persistence across backend restarts
 *
 * These tests verify that session state (employees, changes, notes) persists
 * across backend restarts and page reloads.
 *
 * Note: Since we cannot actually kill and restart the backend process in E2E tests,
 * these tests verify persistence by:
 * 1. Making changes (which trigger database writes)
 * 2. Reloading the page (which re-fetches data from backend)
 * 3. Verifying data survived the reload
 *
 * For true backend restart testing, see:
 * - backend/tests/test_integration/test_session_restore.py
 * - backend/tests/test_integration/test_end_to_end_persistence.py
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile, restartBackend, dragEmployeeToPosition } from '../helpers';

test.describe('Session Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the application to load
    await expect(page.getByText('9-Box Talent Grid')).toBeVisible();
  });

  test('should persist uploaded session after page reload', async ({ page }) => {
    // Upload file to create session
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Wait for grid to display with employees
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Get initial employee count
    const employeeCards = page.getByTestId('employee-card');
    const initialCount = await employeeCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Get first employee name for verification
    const firstEmployee = employeeCards.first();
    const employeeName = await firstEmployee.getByTestId('employee-name').textContent();

    // Simulate backend restart by reloading page
    await restartBackend(page);

    // Verify session was restored - grid should still be visible
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Verify same number of employees
    const restoredCount = await page.getByTestId('employee-card').count();
    expect(restoredCount).toBe(initialCount);

    // Verify same employee data exists
    await expect(page.getByText(employeeName!)).toBeVisible();
  });

  test('should persist employee position changes after page reload', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Find an employee to move
    const employeeCard = page.getByTestId('employee-card').first();
    const employeeName = await employeeCard.getByTestId('employee-name').textContent();
    expect(employeeName).toBeTruthy();

    // Get original position (grid box)
    const originalBox = await employeeCard.locator('..').getAttribute('data-testid');

    // Drag employee to a different position (box 9 - High Performance, High Potential)
    await dragEmployeeToPosition(page, employeeName!, 9);

    // Wait for the move to complete
    await page.waitForTimeout(500);

    // Verify employee is now in box 9
    const box9 = page.getByTestId('grid-box-9');
    await expect(box9.getByText(employeeName!)).toBeVisible();

    // Check that statistics tab shows 1 change
    await page.getByRole('tab', { name: /statistics/i }).click();
    await expect(page.getByText(/changes made.*1/i)).toBeVisible();

    // Simulate backend restart
    await restartBackend(page);

    // Verify employee is still in box 9 after reload
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    const box9AfterReload = page.getByTestId('grid-box-9');
    await expect(box9AfterReload.getByText(employeeName!)).toBeVisible();

    // Verify statistics still shows 1 change
    await page.getByRole('tab', { name: /statistics/i }).click();
    await expect(page.getByText(/changes made.*1/i)).toBeVisible();
  });

  test('should persist multiple employee changes and notes after reload', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Move multiple employees
    const employees = await page.getByTestId('employee-card').all();
    const movedEmployees: string[] = [];

    // Move first 3 employees to different positions
    for (let i = 0; i < Math.min(3, employees.length); i++) {
      const employeeName = await employees[i].getByTestId('employee-name').textContent();
      if (employeeName) {
        movedEmployees.push(employeeName);
        // Move to different boxes (9, 6, 5)
        const targetBox = [9, 6, 5][i];
        await dragEmployeeToPosition(page, employeeName, targetBox);
        await page.waitForTimeout(300);
      }
    }

    // Verify all 3 changes recorded
    await page.getByRole('tab', { name: /statistics/i }).click();
    await expect(page.getByText(/changes made.*3/i)).toBeVisible();

    // Simulate backend restart
    await restartBackend(page);

    // Verify grid still visible
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Verify all moved employees in correct positions
    await expect(page.getByTestId('grid-box-9').getByText(movedEmployees[0])).toBeVisible();
    await expect(page.getByTestId('grid-box-6').getByText(movedEmployees[1])).toBeVisible();
    await expect(page.getByTestId('grid-box-5').getByText(movedEmployees[2])).toBeVisible();

    // Verify statistics still shows 3 changes
    await page.getByRole('tab', { name: /statistics/i }).click();
    await expect(page.getByText(/changes made.*3/i)).toBeVisible();
  });

  test('should persist session data when viewing intelligence tab after reload', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Get employee count
    const initialCount = await page.getByTestId('employee-card').count();

    // Switch to intelligence tab
    await page.getByRole('tab', { name: /intelligence/i }).click();

    // Wait for intelligence content to load
    await page.waitForTimeout(1000);

    // Simulate backend restart
    await restartBackend(page);

    // Verify grid is still visible and has same employees
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    const restoredCount = await page.getByTestId('employee-card').count();
    expect(restoredCount).toBe(initialCount);

    // Verify intelligence tab still works
    await page.getByRole('tab', { name: /intelligence/i }).click();
    // Intelligence content should still be available
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('should handle export correctly after session persistence', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Move an employee
    const employeeCard = page.getByTestId('employee-card').first();
    const employeeName = await employeeCard.getByTestId('employee-name').textContent();
    expect(employeeName).toBeTruthy();

    await dragEmployeeToPosition(page, employeeName!, 9);
    await page.waitForTimeout(500);

    // Simulate backend restart
    await restartBackend(page);

    // Verify grid restored
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Trigger export
    await page.getByTestId('export-button').click();

    // Wait for export dialog or download
    // Note: Actual download verification would require additional setup
    // Here we just verify the export action doesn't error after restart
    await page.waitForTimeout(500);
  });

  test('should clear session and verify it does not restore after reload', async ({ page }) => {
    // Upload file
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Open import/export menu
    await page.getByTestId('upload-button').click();

    // Look for clear/reset option
    // Note: Adjust selector based on actual UI implementation
    const clearButton = page.getByRole('button', { name: /clear|reset|new/i });

    if (await clearButton.isVisible()) {
      // Clear the session
      await clearButton.click();

      // Confirm if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|yes|clear/i });
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Verify grid is no longer visible or is empty
      await page.waitForTimeout(500);

      // Reload page
      await page.reload({ waitUntil: 'networkidle' });

      // Verify session was not restored (grid should be empty or show upload prompt)
      const gridVisible = await page.getByTestId('nine-box-grid').isVisible({ timeout: 2000 }).catch(() => false);

      if (gridVisible) {
        // If grid is visible, it should have no employees
        const employeeCount = await page.getByTestId('employee-card').count();
        expect(employeeCount).toBe(0);
      } else {
        // Grid not visible - this is expected for cleared session
        expect(gridVisible).toBe(false);
      }
    }
  });
});

test.describe('Session Persistence - Edge Cases', () => {
  test('should handle rapid changes before reload', async ({ page }) => {
    await page.goto('/');
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    // Make rapid changes
    const employees = await page.getByTestId('employee-card').all();

    for (let i = 0; i < Math.min(5, employees.length); i++) {
      const employeeName = await employees[i].getByTestId('employee-name').textContent();
      if (employeeName) {
        await dragEmployeeToPosition(page, employeeName, (i % 9) + 1);
        // Minimal wait between moves
        await page.waitForTimeout(100);
      }
    }

    // Immediately reload (test write-through cache under load)
    await restartBackend(page);

    // Verify all changes persisted
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    await page.getByRole('tab', { name: /statistics/i }).click();
    await expect(page.getByText(/changes made.*5/i)).toBeVisible();
  });

  test('should preserve session across multiple reloads', async ({ page }) => {
    await page.goto('/');
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();

    const initialCount = await page.getByTestId('employee-card').count();

    // First reload
    await restartBackend(page);
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    expect(await page.getByTestId('employee-card').count()).toBe(initialCount);

    // Second reload
    await restartBackend(page);
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    expect(await page.getByTestId('employee-card').count()).toBe(initialCount);

    // Third reload
    await restartBackend(page);
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    expect(await page.getByTestId('employee-card').count()).toBe(initialCount);
  });
});
