/**
 * Calibration Screenshot Workflow
 *
 * Generates screenshots for the calibration guide showing data analysis and validation features.
 * These screenshots demonstrate advanced workflows including statistics, intelligence, filters,
 * and donut mode for reviewing moved employees.
 */

import { Page } from "@playwright/test";
import {
  closeAllDialogsAndOverlays,
  waitForUiSettle,
  toggleDonutMode,
  clickTabAndWait,
  openFileMenu,
  openFilterDrawer,
} from "../../helpers/ui";
import { loadSampleData } from "../../helpers/fixtures";
import { dragEmployeeToPosition } from "../../helpers/dragAndDrop";

/**
 * Generate File Import screenshot
 *
 * Shows the File menu open with "Import Data" menu item highlighted.
 * Demonstrates how to access the data import functionality.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateFileImport(page, 'docs/images/screenshots/calibration-file-import.png');
 * ```
 */
export async function generateFileImport(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Navigate to a state where we can open file menu
  await page.goto("http://localhost:5173");
  await page.waitForTimeout(1000);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click File menu button to open dropdown
  const fileMenuButton = page.locator('[data-testid="file-menu-button"]');
  if ((await fileMenuButton.count()) > 0) {
    await fileMenuButton.click();
    await page.waitForTimeout(300);

    // Wait for menu to appear
    const importItem = page.locator('[data-testid="import-data-menu-item"]');
    if ((await importItem.count()) > 0) {
      // Hover over Import Data item to highlight it
      await importItem.hover();
      await page.waitForTimeout(200);

      // Capture the menu area showing highlighted Import Data option
      const menu = page.locator('[role="menu"]');
      await menu.screenshot({ path: outputPath });
    }
  }
}

/**
 * Generate Statistics Red Flags screenshot
 *
 * Shows the Statistics tab with distribution table highlighting problematic patterns.
 * Demonstrates statistical analysis features for identifying distribution issues.
 *
 * Requires calibration data to show realistic distribution patterns.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateStatisticsRedFlags(page, 'docs/images/screenshots/calibration-statistics-red-flags.png');
 * ```
 */
export async function generateStatisticsRedFlags(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure sample data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  const count = await employeeCards.count();
  if (count === 0) {
    await loadSampleData(page);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click Statistics tab and wait for content to load
  await clickTabAndWait(page, "statistics-tab");

  // Capture the right panel showing statistics
  const rightPanel = page.locator('[data-testid="right-panel"]');
  await rightPanel.screenshot({ path: outputPath });
}

/**
 * Generate Intelligence Anomalies screenshot
 *
 * Shows the Intelligence tab with anomaly detection results.
 * Demonstrates AI-powered insights for identifying statistical anomalies,
 * location/function analysis with deviations, and manager rating patterns.
 *
 * NOTE: This screenshot requires test data with actual anomalies to show:
 * - Red/yellow indicators for statistical anomalies
 * - Location/function analysis with deviations
 * - Manager rating patterns that differ from baseline
 *
 * Current sample data may show "No Issues" - calibration-sample.xlsx has
 * more varied distribution for realistic anomaly detection.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateIntelligenceAnomalies(page, 'docs/images/screenshots/calibration-intelligence-anomalies.png');
 * ```
 */
export async function generateIntelligenceAnomalies(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure sample data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  const count = await employeeCards.count();
  if (count === 0) {
    await loadSampleData(page);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click Intelligence tab and wait for content to load (longer wait for AI processing)
  await clickTabAndWait(page, "intelligence-tab", 1.5);

  // Capture the right panel showing intelligence insights
  const rightPanel = page.locator('[data-testid="right-panel"]');
  await rightPanel.screenshot({ path: outputPath });
}

/**
 * Generate Filters Panel screenshot
 *
 * Shows the Filters panel with active filter selections.
 * Demonstrates filtering functionality with specific filters applied.
 *
 * CRITICAL: This screenshot must show ACTIVE filters to demonstrate the feature.
 * Previous versions showed empty filter panel which was not useful for documentation.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateFiltersPanel(page, 'docs/images/screenshots/calibration-filters-panel.png');
 * ```
 */
export async function generateFiltersPanel(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded (filter button is disabled without data)
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
  }

  await closeAllDialogsAndOverlays(page);

  try {
    // Open filters drawer
    await openFilterDrawer(page);

    // SELECT filters to show active state
    // This makes the screenshot useful for documentation
    // Try to select a location filter if available
    const locationFilters = page.locator(
      '[data-testid^="location-filter-"]',
    ).first;
    if (
      (await locationFilters.count()) > 0 &&
      (await locationFilters.isVisible())
    ) {
      await locationFilters.click();
      await page.waitForTimeout(300);
    }

    // Try to select a function filter if available
    const functionFilters = page.locator(
      '[data-testid^="function-filter-"]',
    ).first;
    if (
      (await functionFilters.count()) > 0 &&
      (await functionFilters.isVisible())
    ) {
      await functionFilters.click();
      await page.waitForTimeout(300);
    }

    // Capture the filter drawer
    const filterDrawer = page.locator('[data-testid="filter-drawer"]');
    await filterDrawer.screenshot({ path: outputPath });
  } catch (error) {
    console.warn("[Warning] Filters panel capture failed:", error);
    throw error;
  }
}

/**
 * Generate Donut Mode Toggle screenshot
 *
 * Shows the View Mode Toggle with Donut mode activated.
 * The toggle button should be in pressed/active state, visually distinct from inactive state.
 *
 * Demonstrates the donut mode control that filters the grid to show only position-5
 * related employees (Core Talent).
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateDonutModeToggle(page, 'docs/images/screenshots/calibration-donut-mode-toggle.png');
 * ```
 */
export async function generateDonutModeToggle(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
  }

  // Close any dialogs to ensure clean screenshot
  await closeAllDialogsAndOverlays(page);

  try {
    // Activate donut mode
    await toggleDonutMode(page, true);

    // Capture the grid area showing active donut mode toggle
    const grid = page.locator('[data-testid="nine-box-grid"]');
    await grid.screenshot({ path: outputPath });
  } catch (error) {
    console.warn("[Warning] Donut toggle capture failed:", error);
    throw error;
  }
}

/**
 * Generate Donut Mode Grid screenshot
 *
 * Shows the grid in Donut Mode displaying ghostly purple-bordered employees.
 * Demonstrates the validation workflow where employees moved from position-5 (Core Talent)
 * are shown with special visual treatment (70% opacity, purple borders).
 *
 * This workflow:
 * 1. Activates donut mode
 * 2. Drags an employee from position-5 to create the ghostly effect
 * 3. Captures the grid showing the visual feedback
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 *
 * @example
 * ```typescript
 * await generateDonutModeGrid(page, 'docs/images/screenshots/calibration-donut-mode-grid.png');
 * ```
 */
export async function generateDonutModeGrid(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure data is loaded (donut mode requires employees)
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
  }

  await closeAllDialogsAndOverlays(page);

  try {
    // CRITICAL: Activate donut mode first
    // This filters the grid to show only position-5 related employees
    await toggleDonutMode(page, true);

    // Optional: Perform a donut drag to show ghostly effect
    // (Without this, grid just shows position-5 employees normally)
    // Dragging creates the "ghostly" visual state with purple borders
    const pos5Employees = page.locator(
      '[data-testid="grid-box-5"] [data-testid^="employee-card-"]',
    );
    if ((await pos5Employees.count()) > 0) {
      // Get first employee in position 5
      const firstEmployee = pos5Employees.first;
      const employeeId = await firstEmployee.getAttribute("data-testid");

      if (employeeId) {
        // Extract numeric ID from "employee-card-123" format
        const id = employeeId.replace("employee-card-", "");

        // Drag to position 6 (top-right) to trigger ghostly effect
        await dragEmployeeToPosition(page, id, 6);

        // Wait for drag animation and ghost rendering
        await page.waitForTimeout(1000);
      }
    }

    // Capture the grid showing ghostly employees with purple borders
    const grid = page.locator('[data-testid="nine-box-grid"]');
    await grid.screenshot({ path: outputPath });
  } catch (error) {
    console.warn("[Warning] Donut mode grid capture failed:", error);
    throw error;
  }
}

/**
 * Generate Export Results screenshot (manual capture required)
 *
 * Shows the exported Excel file with changes applied after calibration workflow.
 * This demonstrates the final output of the calibration process.
 *
 * NOTE: This screenshot requires manual capture:
 * 1. Complete calibration workflow in app
 * 2. Export data to Excel (File > Export Data)
 * 3. Open exported Excel file
 * 4. Highlight new columns showing updated positions
 * 5. Capture screenshot
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateExportResults(
  page: Page,
  outputPath: string,
): Promise<void> {
  // This is a placeholder for manual screenshot workflow
  // The actual screenshot must be captured manually from Excel
  console.log(
    "MANUAL SCREENSHOT REQUIRED: Calibration export results\n" +
      "Steps:\n" +
      "1. Complete calibration workflow in application\n" +
      "2. Export data to Excel (File > Export Data)\n" +
      "3. Open exported Excel file\n" +
      "4. Highlight columns showing position changes\n" +
      `5. Save to: ${outputPath}`,
  );

  // Return without error to allow generator to continue
  // Manual screenshots are tracked separately
}
