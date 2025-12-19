/**
 * E2E tests for change tracking workflow
 * Tests the complete flow of moving employees, viewing changes, and adding notes
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile, dragEmployeeToPosition } from '../helpers';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Change Tracking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Visit and upload sample data
    await page.goto('/');
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test('should show empty state when no changes have been made', async ({ page }) => {
    // Click Changes tab
    await page.locator('[data-testid="changes-tab"]').click();

    // Verify empty state is visible
    await expect(page.locator('[data-testid="change-tracker-empty"]')).toBeVisible();
    await expect(page.getByText('No changes yet')).toBeVisible();
    await expect(page.getByText('Move employees to track changes here')).toBeVisible();
  });

  test('should display change in Changes tab after moving employee', async ({ page }) => {
    // Get the first employee from grid box 9 (Alice Smith, employee_id: 1)
    const gridBox9 = page.locator('[data-testid="grid-box-9"]');
    await expect(gridBox9.getByText('Alice Smith')).toBeVisible();

    // Move employee from position 9 to position 6 using drag and drop
    await dragEmployeeToPosition(page, 1, 6);

    // Click Changes tab
    await page.locator('[data-testid="changes-tab"]').click();

    // Verify change appears in table
    await expect(page.locator('[data-testid="change-tracker-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="change-tracker-view"]')).toBeVisible();

    // Verify the change row exists for employee ID 1
    const changeRow = page.locator('[data-testid="change-row-1"]');
    await expect(changeRow).toBeVisible();

    // Verify employee name is shown
    await expect(changeRow.getByText('Alice Smith')).toBeVisible();

    // Verify movement chips are shown (from Star to High Impact)
    await expect(changeRow.getByText(/Star/)).toBeVisible();
    await expect(changeRow.getByText(/High Impact/)).toBeVisible();
  });

  test('should allow user to add and save notes for a change', async ({ page }) => {
    // Move employee using drag and drop
    await dragEmployeeToPosition(page, 1, 6);

    // Navigate to Changes tab
    await page.locator('[data-testid="changes-tab"]').click();

    // Verify change row exists
    const changeRow = page.locator('[data-testid="change-row-1"]');
    await expect(changeRow).toBeVisible();

    // Find the notes field (TextField contains the actual textarea, excluding the hidden auto-sizing one)
    const notesField = page.locator('[data-testid="change-notes-1"] textarea:not([readonly])');
    await expect(notesField).toBeVisible();

    // Type notes
    const testNotes = 'Promoted to senior role after excellent performance review';
    await notesField.click();
    await notesField.fill(testNotes);

    // Blur the field to trigger save
    await page.locator('[data-testid="change-tracker-table"]').click();

    // Wait a moment for the save to complete
    await page.waitForTimeout(500);

    // Verify notes are visible in the field
    await expect(notesField).toHaveValue(testNotes);
  });

  test('should remove change from tracker when employee is moved back to original position', async ({ page }) => {
    // Move employee from position 9 to position 6
    await dragEmployeeToPosition(page, 1, 6);

    // Verify change appears
    await page.locator('[data-testid="changes-tab"]').click();
    await expect(page.locator('[data-testid="change-row-1"]')).toBeVisible();

    // Go back to grid and move employee back to original position (9)
    await page.locator('[data-testid="details-tab"]').click();
    await dragEmployeeToPosition(page, 1, 9);

    // Verify change is removed
    await page.locator('[data-testid="changes-tab"]').click();

    // Should show empty state again
    await expect(page.locator('[data-testid="change-tracker-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="change-row-1"]')).not.toBeVisible();
  });

  test('should show single entry with net change when employee is moved multiple times', async ({ page }) => {
    // Move employee from position 9 -> 6 -> 3
    // First move: 9 to 6
    await dragEmployeeToPosition(page, 1, 6);

    // Second move: 6 to 3
    await dragEmployeeToPosition(page, 1, 3);

    // Verify only one change entry exists (net change: 9 -> 3)
    await page.locator('[data-testid="changes-tab"]').click();

    // Should only have one change row for this employee
    const changeRows = page.locator('[data-testid^="change-row-1"]');
    await expect(changeRows).toHaveCount(1);

    // Verify it shows net change from Star (9) to Workhorse (3)
    const changeRow = page.locator('[data-testid="change-row-1"]');
    await expect(changeRow.getByText(/Star/)).toBeVisible();
    await expect(changeRow.getByText(/Workhorse/)).toBeVisible();
  });

  test('should export modified employees with notes to Excel', async ({ page }) => {
    // Move an employee
    await dragEmployeeToPosition(page, 1, 6);

    // Add notes
    await page.locator('[data-testid="changes-tab"]').click();

    const testNotes = 'Ready for leadership development program';
    const notesField = page.locator('[data-testid="change-notes-1"] textarea:not([readonly])');
    await notesField.click();
    await notesField.fill(testNotes);
    await page.locator('[data-testid="change-tracker-table"]').click(); // Blur to save
    await page.waitForTimeout(500);

    // Navigate back to grid
    await page.locator('[data-testid="details-tab"]').click();

    // Export button should now be enabled
    const exportButton = page.locator('[data-testid="export-button"]');
    await expect(exportButton).toBeEnabled();

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    await exportButton.click();

    // Wait for download to complete
    const download = await downloadPromise;

    // Verify filename pattern
    expect(download.suggestedFilename()).toMatch(/modified_.*\.xlsx$/);

    // Save the downloaded file temporarily
    const downloadPath = path.join(__dirname, '..', 'tmp', download.suggestedFilename());

    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    await download.saveAs(downloadPath);

    // Verify file exists
    expect(fs.existsSync(downloadPath)).toBeTruthy();

    // Note: Verifying Excel content would require additional libraries (xlsx, exceljs)
    // For now, we verify the file was downloaded with the correct name
    // The backend tests should verify the actual Excel content structure

    // Clean up
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }
  });
});
