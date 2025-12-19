/**
 * TEMPLATE: Playwright E2E Test
 *
 * Use this template when writing end-to-end tests with Playwright.
 *
 * Location: frontend/playwright/e2e/feature-flow.spec.ts
 *
 * Key Principles:
 * - Test complete user workflows end-to-end
 * - Use data-testid attributes for reliable element selection
 * - Verify both UI updates and data state
 * - Keep tests focused on user perspective
 * - Use beforeEach for common setup
 * - Tests run with auto-started backend and frontend servers
 */

import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers';
import * as path from 'path';

/**
 * Describe block: Feature or workflow name
 *
 * Example: 'Employee Upload Flow', 'Grid Movement Feature', 'Export Workflow'
 */
test.describe('Feature Name E2E Flow', () => {
  /**
   * BeforeEach: Common setup for all tests in this suite
   *
   * Typically includes:
   * - Navigating to the application
   * - Verifying initial state
   * - Setting up test data
   */
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Optional: Verify initial page load
    await expect(page.getByTestId('app-container')).toBeVisible();

    // Optional: Perform any authentication if needed
    // await page.getByLabel('Email').fill('testuser@example.com');
    // await page.getByLabel('Password').fill('password');
    // await page.getByRole('button', { name: 'Login' }).click();

    // Optional: Load initial test data
    // const fixturePath = path.join(__dirname, '..', 'fixtures', 'sample-data.xlsx');
    // await uploadExcelFile(page, fixturePath);
  });

  /**
   * TEST 1: Primary happy path workflow
   *
   * The most important test - the main user journey
   * Tests the complete happy path from start to finish
   */
  test('should complete primary user workflow successfully', async ({ page }) => {
    // Step 1: Arrange - Verify initial state
    await expect(page.getByTestId('nine-box-grid')).not.toBeVisible();

    // Step 2: Act - User uploads file
    await page.getByTestId('upload-button').click();

    // Verify dialog opens
    await expect(page.getByTestId('file-upload-dialog')).toBeVisible();

    const fixturePath = path.join(__dirname, '..', 'fixtures', 'sample-employees.xlsx');
    await page.locator('#file-upload-input').setInputFiles(fixturePath);

    // Step 3: Submit upload
    await page.getByTestId('upload-submit-button').click();

    // Step 4: Assert - File upload succeeds
    await expect(page.getByText(/upload successful/i)).toBeVisible();

    // Step 5: Assert - Grid displays with data
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    const employeeCards = page.locator('[data-testid^="employee-card-"]');
    expect(await employeeCards.count()).toBeGreaterThan(0);

    // Step 6: Assert - Statistics update
    await expect(page.getByTestId('total-employees')).toContainText(/[1-9]/);
  });

  /**
   * TEST 2: Alternative workflow or user action
   *
   * Tests another important user journey
   * Could be: interaction flow, export flow, filter flow, etc.
   */
  test('should allow user to move employee and track modifications', async ({ page }) => {
    // Setup: Upload initial data using helper
    const fixturePath = path.join(__dirname, '..', 'fixtures', 'sample-employees.xlsx');
    await page.getByTestId('upload-button').click();
    await page.locator('#file-upload-input').setInputFiles(fixturePath);
    await page.getByTestId('upload-submit-button').click();
    await expect(page.getByTestId('file-upload-dialog')).not.toBeVisible();

    // Get an employee from box 1
    const gridBox1 = page.getByTestId('grid-box-1');
    const employeeCard = gridBox1.locator('[data-testid^="employee-card-"]').first();

    // Get employee name before move
    const employeeName = await employeeCard.getByTestId('employee-name').textContent();

    // Drag employee to new position (Playwright drag & drop)
    await employeeCard.dragTo(page.getByTestId('grid-box-5'));

    // Verify employee moved
    const gridBox5 = page.getByTestId('grid-box-5');
    await expect(gridBox5.getByText(employeeName as string)).toBeVisible();

    // Verify modified indicator appears
    await expect(employeeCard.getByTestId('modified-indicator')).toBeVisible();

    // Verify statistics updated
    await expect(page.getByTestId('grid-box-1-count')).toContainText('0');
    const box5Count = await page.getByTestId('grid-box-5-count').textContent();
    expect(parseInt(box5Count || '0')).toBeGreaterThan(0);
  });

  /**
   * TEST 3: Error handling flow
   *
   * Tests how application handles errors or invalid inputs
   * Important for user confidence and support
   */
  test('should show error message when invalid file is uploaded', async ({ page }) => {
    // Click upload button
    await page.getByTestId('upload-button').click();

    // Try to upload invalid file type
    const invalidFileContent = Buffer.from('invalid content');
    await page.locator('#file-upload-input').setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: invalidFileContent,
    });

    // Verify error message displayed
    await expect(page.getByText(/invalid file type|not supported/i)).toBeVisible();

    // Verify upload button is disabled
    await expect(page.getByTestId('upload-submit-button')).toBeDisabled();

    // Verify grid didn't load
    await expect(page.getByTestId('nine-box-grid')).not.toBeVisible();

    // Verify user can try again (close dialog)
    await page.getByTestId('close-dialog-button').click();
    await expect(page.getByTestId('upload-button')).toBeEnabled();
  });

  /**
   * TEST 4: Data persistence and state verification
   *
   * Tests that data persists and state is consistent
   * Important for data integrity
   */
  test('should persist employee modifications across page reload', async ({ page }) => {
    // Upload data
    const fixturePath = path.join(__dirname, '..', 'fixtures', 'sample-employees.xlsx');
    await page.getByTestId('upload-button').click();
    await page.locator('#file-upload-input').setInputFiles(fixturePath);
    await page.getByTestId('upload-submit-button').click();
    await expect(page.getByTestId('file-upload-dialog')).not.toBeVisible();

    // Move an employee
    const employeeCard = page.getByTestId('grid-box-1')
      .locator('[data-testid^="employee-card-"]')
      .first();
    const employeeName = await employeeCard.getByTestId('employee-name').textContent();

    await employeeCard.dragTo(page.getByTestId('grid-box-5'));

    // Save changes
    await page.getByTestId('save-button').click();
    await expect(page.getByText(/saved/i)).toBeVisible();

    // Reload page
    await page.reload();

    // Verify employee is still in new position
    await expect(page.getByTestId('grid-box-5').getByText(employeeName as string)).toBeVisible();

    // Verify no modified indicator (changes were saved)
    const savedCard = page.locator(`[data-testid^="employee-card-"]:has-text("${employeeName}")`);
    await expect(savedCard.getByTestId('modified-indicator')).not.toBeVisible();
  });

  /**
   * TEST 5: Complex multi-step workflow
   *
   * Tests a complete workflow with multiple steps
   * Simulates realistic user behavior
   */
  test('should complete full employee management workflow', async ({ page }) => {
    // Step 1: Upload file
    const fixturePath = path.join(__dirname, '..', 'fixtures', 'sample-employees.xlsx');
    await page.getByTestId('upload-button').click();
    await page.locator('#file-upload-input').setInputFiles(fixturePath);
    await page.getByTestId('upload-submit-button').click();
    await expect(page.getByText(/upload successful/i)).toBeVisible();

    // Step 2: Filter employees
    await page.getByTestId('filter-button').click();
    await page.getByTestId('department-filter').selectOption('Engineering');
    await page.getByTestId('apply-filter-button').click();

    // Step 3: Move employee
    const employeeCard = page.getByTestId('grid-box-1')
      .locator('[data-testid^="employee-card-"]')
      .first();
    await employeeCard.dragTo(page.getByTestId('grid-box-5'));

    // Step 4: Export changes
    await page.getByTestId('export-button').click();
    await page.getByTestId('confirm-export-button').click();

    // Step 5: Verify export initiated
    await expect(page.getByText(/download|export/i)).toBeVisible();
  });
});

/**
 * Common Playwright Patterns
 *
 * NAVIGATION:
 *   await page.goto('/')
 *   await page.goto('/path?param=value')
 *
 * ELEMENT SELECTION:
 *   page.getByTestId('id')                    // By test ID (preferred)
 *   page.getByRole('button', { name: 'text' }) // By ARIA role
 *   page.getByText('text')                    // By text content
 *   page.getByLabel('label')                  // By label
 *   page.locator('css-selector')              // By CSS selector
 *   page.locator('[data-testid="id"]')        // Alternative test ID syntax
 *
 * USER ACTIONS:
 *   await element.click()
 *   await element.fill('text')
 *   await element.clear()
 *   await element.selectOption('value')
 *   await element.setInputFiles('path/to/file')
 *   await element.press('Enter')               // Keyboard
 *
 * DRAG & DROP:
 *   await element.dragTo(targetElement)
 *
 * ASSERTIONS:
 *   await expect(element).toBeVisible()
 *   await expect(element).toContainText('text')
 *   await expect(element).toHaveText('exact text')
 *   await expect(element).toHaveCount(5)
 *   await expect(element).toBeEnabled()
 *   await expect(element).toBeDisabled()
 *   await expect(element).toBeChecked()
 *   await expect(element).not.toBeVisible()
 *
 * WAITING:
 *   await expect(element).toBeVisible()           // Auto-waits up to timeout
 *   await expect(element).not.toBeVisible()       // Waits for element to disappear
 *   await page.waitForLoadState('networkidle')    // Wait for network
 *   await page.waitForTimeout(1000)               // Explicit wait (avoid if possible)
 *
 * GETTING DATA:
 *   const text = await element.textContent()
 *   const value = await element.inputValue()
 *   const count = await elements.count()
 *   const isVisible = await element.isVisible()
 *
 * HELPER FUNCTIONS:
 *   Defined in: frontend/playwright/helpers/
 *   Usage: import { uploadExcelFile } from '../helpers';
 *
 * FIXTURES:
 *   Located in: frontend/playwright/fixtures/
 *   Access with: path.join(__dirname, '..', 'fixtures', 'filename')
 */

/**
 * Test Data Fixtures
 *
 * Create reusable test data files in frontend/playwright/fixtures/
 *
 * Examples:
 * - sample-employees.xlsx - Employee data for upload tests
 * - large-dataset.xlsx - Large dataset for performance tests
 * - invalid-file.txt - Invalid file for error testing
 */

/**
 * Best Practices
 *
 * 1. Use getByTestId() for all selector queries (not CSS classes)
 * 2. Always use beforeEach for common setup
 * 3. Use descriptive test names that explain the user journey
 * 4. Keep tests focused on one workflow per test
 * 5. Use helper functions for repeated actions (see helpers/)
 * 6. Include both happy path and error handling
 * 7. Verify end state, not just UI changes
 * 8. Tests auto-cleanup between runs
 * 9. Use expect() with auto-waiting instead of manual waits
 * 10. Always include at least one assertion per test
 * 11. Backend and frontend servers start automatically (configured in playwright.config.ts)
 */

/**
 * Running Playwright Tests
 *
 * From frontend directory:
 *   npm run test:e2e:pw              # Run all tests headless
 *   npm run test:e2e:pw:ui           # Run with Playwright UI (interactive)
 *   npm run test:e2e:pw:debug        # Run in debug mode with inspector
 *   npx playwright test upload-flow.spec.ts  # Run specific test file
 *   npx playwright test --grep "upload"      # Run tests matching pattern
 *
 * Servers auto-start:
 *   - Backend (FastAPI) starts on localhost:8000
 *   - Frontend (Vite) starts on localhost:5173
 *   - No manual setup required
 */
