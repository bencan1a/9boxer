/**
 * Example E2E Test with i18n Best Practices
 * 
 * This template demonstrates how to write E2E tests that remain stable
 * across different languages by using data-testid selectors instead of
 * text-based selectors.
 * 
 * Key Principles:
 * 1. Use data-testid for all structural elements
 * 2. Use getByRole() for semantic elements when appropriate
 * 3. ONLY use text selectors for language-switching tests
 * 4. Never use text for buttons, navigation, or form fields
 * 5. Use text selectors for dynamic content (employee names, data values)
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers';

test.describe('Example Workflow - i18n-Safe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  /**
   * ✓ PATTERN 1: Use data-testid for navigation and structure
   * This test works regardless of the UI language
   */
  test('completes workflow using data-testid selectors', async ({ page }) => {
    // ✓ GOOD: Use data-testid for buttons
    await page.getByTestId('upload-button').click();
    
    // ✓ GOOD: Use data-testid for form inputs
    await page.getByTestId('file-input').setInputFiles('sample-data.xlsx');
    
    // ✓ GOOD: Use data-testid for submission
    await page.getByTestId('submit-button').click();
    
    // ✓ GOOD: Use data-testid to verify page structure
    await expect(page.getByTestId('employee-grid')).toBeVisible();
    await expect(page.getByTestId('statistics-panel')).toBeVisible();
  });

  /**
   * ✓ PATTERN 2: Use getByRole() for semantic elements
   * Roles are language-independent
   */
  test('uses semantic roles for navigation', async ({ page }) => {
    await uploadExcelFile(page, 'sample-employees.xlsx');
    
    // ✓ GOOD: Use roles for tabs
    await page.getByRole('tab', { name: /details/i }).click();
    
    // ✓ GOOD: Use roles for buttons (with data-testid as backup)
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();
    
    // Better: Use data-testid when available
    const filterButtonAlt = page.getByTestId('filter-button');
    await filterButtonAlt.click();
  });

  /**
   * ✓ PATTERN 3: Text selectors ONLY for dynamic content
   * Use text selectors for data that doesn't change with language
   */
  test('finds employee by name (dynamic content)', async ({ page }) => {
    await uploadExcelFile(page, 'sample-employees.xlsx');
    
    // ✓ GOOD: Employee names don't change with language
    await expect(page.getByText('Alice Smith')).toBeVisible();
    await expect(page.getByText('Bob Johnson')).toBeVisible();
    
    // Click on employee card using data-testid
    await page.getByTestId('employee-card-1').click();
    
    // Verify employee details panel shows the name
    await expect(page.getByTestId('details-panel')).toContainText('Alice Smith');
  });

  /**
   * ✓ PATTERN 4: Combine data-testid with dynamic content
   */
  test('verifies count displays correct number', async ({ page }) => {
    await uploadExcelFile(page, 'sample-employees.xlsx');
    
    // ✓ GOOD: Use data-testid for the container
    const employeeCount = page.getByTestId('employee-count');
    await expect(employeeCount).toBeVisible();
    
    // ✓ GOOD: Check for number (language-independent)
    await expect(employeeCount).toContainText('15');
    
    // Don't check for specific text like "15 employees" - that changes with language!
  });

  /**
   * ✓ PATTERN 5: Language-switching test (exception to the rule)
   * This is the ONLY time we use text selectors for UI elements
   */
  test('switches language and verifies UI updates', async ({ page }) => {
    await uploadExcelFile(page, 'sample-employees.xlsx');
    
    // Verify English text is displayed
    await expect(page.getByTestId('details-tab')).toContainText('Details');
    await expect(page.getByTestId('changes-tab')).toContainText('Changes');
    
    // Switch to Spanish using language selector
    const languageSelector = page.getByRole('combobox').first();
    await languageSelector.click();
    await page.getByRole('option', { name: /Español/i }).click();
    
    // Verify Spanish text is displayed
    await expect(page.getByTestId('details-tab')).toContainText('Detalles');
    await expect(page.getByTestId('changes-tab')).toContainText('Cambios');
    
    // Switch back to English
    await languageSelector.click();
    await page.getByRole('option', { name: /English/i }).click();
    
    // Verify English text is back
    await expect(page.getByTestId('details-tab')).toContainText('Details');
  });

  /**
   * ✓ PATTERN 6: Verify form validation without hardcoded messages
   */
  test('shows validation error without text matching', async ({ page }) => {
    await page.getByTestId('upload-button').click();
    
    // Select invalid file
    await page.getByTestId('file-input').setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Not an Excel file'),
    });
    
    // ✓ GOOD: Check for error role (language-independent)
    await expect(page.getByRole('alert')).toBeVisible();
    
    // ✓ GOOD: Check that submit button is disabled
    await expect(page.getByTestId('submit-button')).toBeDisabled();
    
    // ❌ BAD: Don't check exact error message text
    // await expect(page.getByText('Please select an Excel file')).toBeVisible();
  });

  /**
   * ✓ PATTERN 7: Navigate through multi-step workflow
   */
  test('completes multi-step workflow using stable selectors', async ({ page }) => {
    // Step 1: Upload file
    await page.getByTestId('upload-button').click();
    await page.getByTestId('file-input').setInputFiles('sample-employees.xlsx');
    await page.getByTestId('submit-button').click();
    
    // Step 2: Open filters
    await page.getByTestId('filter-button').click();
    await expect(page.getByTestId('filter-drawer')).toBeVisible();
    
    // Step 3: Apply filter
    await page.getByTestId('level-filter-checkbox-MT4').check();
    
    // Step 4: Verify filtered results
    const employeeCount = page.getByTestId('employee-count');
    await expect(employeeCount).toBeVisible();
    
    // Step 5: Open details panel
    await page.getByTestId('employee-card-1').click();
    await expect(page.getByTestId('details-panel')).toBeVisible();
    
    // Step 6: Switch tabs
    await page.getByTestId('statistics-tab').click();
    await expect(page.getByTestId('statistics-content')).toBeVisible();
  });

  /**
   * ✓ PATTERN 8: Verify success/error states by structure
   */
  test('verifies success state without text matching', async ({ page }) => {
    await uploadExcelFile(page, 'sample-employees.xlsx');
    
    // Move an employee
    await page.getByTestId('employee-card-1').dragTo(
      page.getByTestId('grid-box-5')
    );
    
    // ✓ GOOD: Check for success indicator by role or testid
    await expect(page.getByTestId('success-indicator')).toBeVisible();
    
    // ✓ GOOD: Verify change appears in changes tab
    await page.getByTestId('changes-tab').click();
    await expect(page.getByTestId('change-row-1')).toBeVisible();
    
    // ❌ BAD: Don't check success message text
    // await expect(page.getByText('Employee moved successfully')).toBeVisible();
  });

  /**
   * ❌ ANTI-PATTERNS: What NOT to do
   */
  test('demonstrates what NOT to do', async ({ page }) => {
    // ❌ BAD: Using text selector for buttons
    // await page.getByText('Upload File').click();
    
    // ❌ BAD: Using text selector for navigation
    // await page.getByText('Statistics').click();
    
    // ❌ BAD: Using CSS classes for structure
    // await page.locator('.btn-primary').click();
    
    // ❌ BAD: Checking exact translated text (except in language tests)
    // await expect(page.getByText('5 employees')).toBeVisible();
    
    // ✓ GOOD: Use these instead
    await page.getByTestId('upload-button').click();
    await page.getByTestId('statistics-tab').click();
    await expect(page.getByTestId('employee-count')).toContainText('5');
  });
});

/**
 * Key Takeaways:
 * 
 * DO:
 * ✓ Use data-testid for all structural elements (buttons, forms, panels)
 * ✓ Use getByRole() for semantic elements when appropriate
 * ✓ Use text selectors for dynamic content (names, values, dates)
 * ✓ Verify states by structure/role, not by text
 * ✓ Check for numbers, not formatted strings with units
 * ✓ Use language-switching tests to validate translations
 * 
 * DON'T:
 * ❌ Use text selectors for buttons, links, or navigation
 * ❌ Use text selectors for labels or placeholders
 * ❌ Use CSS classes or complex selectors
 * ❌ Check exact translated messages (except in language tests)
 * ❌ Assume English text will always be present
 * 
 * Benefits:
 * - Tests work in any language
 * - More stable (text can change, structure stays)
 * - Easier to maintain
 * - Better separation of concerns
 * - Encourages good semantic HTML with data-testid
 */
