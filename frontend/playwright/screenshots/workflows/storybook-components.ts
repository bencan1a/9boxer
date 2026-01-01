/**
 * Storybook Component Screenshots Workflow
 *
 * Generates component-level documentation screenshots using Storybook stories.
 * This is significantly faster and more reliable than using the full application
 * for isolated component screenshots.
 *
 * Benefits:
 * - 10x faster (no app startup or navigation)
 * - 100% reliable (isolated, no app state flakiness)
 * - Single source of truth (same stories for dev, testing, docs)
 * - Easy theme switching (light/dark mode)
 *
 * When to use this workflow vs full-app workflows:
 * - ✅ Use Storybook for: Individual components, UI elements, component states
 * - ❌ Use full-app for: Multi-component interactions, workflows, full layouts
 */

import { Page } from "@playwright/test";
import { captureStorybookScreenshot } from "../storybook-screenshot";

/**
 * Generate employee tile screenshot showing orange modified border
 *
 * Captures the EmployeeTile component in its "Modified" state, showing
 * the orange left border and "Modified" chip indicator.
 *
 * Replaces: Full app workflow that loaded sample data and navigated to modified employee
 * Story: grid-employeetile--modified
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeTileModified(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport for tile screenshots
  await page.setViewportSize({ width: 800, height: 600 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-employeetile--modified-normal-mode",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate normal employee tile screenshot
 *
 * Captures a standard employee tile with complete data, showing the
 * default appearance with name, title, and job level.
 *
 * Replaces: Full app workflow that loaded sample data and captured first employee
 * Story: grid-employeetile--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeTileNormal(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport for tile screenshots
  await page.setViewportSize({ width: 800, height: 600 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-employeetile--default",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate employee details panel screenshot
 *
 * Captures the EmployeeDetails panel component showing all employee
 * information fields in a clean, isolated state.
 *
 * Replaces: Full app workflow that loaded data, selected employee, opened panel
 * Story: panel-employeedetails--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeDetailsPanel(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match panel width (no excess horizontal whitespace)
  // Note: Storybook requires minimum ~600px width to avoid hiding content
  await page.setViewportSize({ width: 600, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-employeedetails--default",
    outputPath,
    theme: "light",
    fullPage: false,
    waitTime: 800, // Panel has animations
  });
}

/**
 * Generate employee details panel with changes screenshot
 *
 * Captures the EmployeeDetails panel component showing an employee
 * with visible changes/modifications in the Changes Summary section.
 *
 * Story: panel-employeedetails--with-changes
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeDetailsPanelWithChanges(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match panel width (no excess horizontal whitespace)
  // Note: Storybook requires minimum ~600px width to avoid hiding content
  await page.setViewportSize({ width: 600, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-employeedetails--with-changes",
    outputPath,
    theme: "light",
    fullPage: false,
    waitTime: 1200, // Panel has animations + needs time for changes to render
  });
}

/**
 * Generate ratings timeline screenshot
 *
 * Captures the RatingsTimeline component showing performance history
 * over multiple years with actual historical data.
 *
 * Replaces: Full app workflow that loaded data, selected employee, opened details, switched tabs
 * Story: panel-ratingstimeline--with-history
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateRatingsTimeline(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match panel width (no excess horizontal whitespace)
  // Note: Storybook requires minimum ~600px width to avoid hiding content
  await page.setViewportSize({ width: 600, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-ratingstimeline--with-history",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate management chain screenshot
 *
 * Captures the ManagementChain component showing the employee's
 * reporting hierarchy.
 *
 * Story: panel-managementchain--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateManagementChain(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-managementchain--default",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate changes tab screenshot
 *
 * Captures the ChangeTrackerTab component showing employee movements
 * and modifications with grid changes.
 *
 * Replaces: Full app workflow that loaded data, made changes, opened panel, switched tabs
 * Story: components-panel-changetrackertab--grid-changes-only
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateChangesTab(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match panel width (no excess horizontal whitespace)
  // Note: Storybook requires minimum ~600px width to avoid hiding content
  await page.setViewportSize({ width: 600, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-changes-changetrackertab--grid-changes-only",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate distribution chart screenshot
 *
 * Captures the DistributionChart component showing employee
 * distribution across the 9-box grid.
 *
 * Story: panel-distributionchart--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateDistributionChart(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-statistics-distributionchart--default",
    outputPath,
    theme: "light",
    waitTime: 800, // Chart animations
  });
}

/**
 * Generate grid box screenshot
 *
 * Captures the GridBox component showing a single box from the
 * 9-box grid with employee tiles.
 *
 * Story: grid-gridbox--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateGridBox(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-grid-gridbox--default",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate grid box expanded screenshot
 *
 * Captures the GridBox component in expanded state, showing the
 * full list of employees and collapse button.
 *
 * Story: grid-gridbox--expanded
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateGridBoxExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-grid-gridbox--expanded",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate zoom controls screenshot
 *
 * Captures the ZoomControls component showing +/- buttons,
 * percentage display, and full-screen toggle.
 *
 * Replaces: Full app workflow that loaded data and captured bottom-left controls
 * Story: common-zoomcontrols--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateZoomControls(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-common-zoomcontrols--default",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate file upload dialog screenshot
 *
 * Captures the FileUploadDialog component showing the file
 * selection interface and upload button in open state.
 *
 * Story: common-fileuploaddialog--open
 *
 * Note: Material-UI Dialog renders in a portal outside the Storybook root,
 * so we use the [role="dialog"] selector to capture the dialog element.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFileUploadDialog(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-common-fileuploaddialog--open",
    outputPath,
    theme: "light",
    fullPage: false,
    waitTime: 1000, // Increased to ensure dialog renders
    selector: '[role="dialog"]', // Dialog renders in portal, not in storybook root
  });
}

/**
 * Generate settings dialog screenshot
 *
 * Captures the SettingsDialog component showing all user
 * preferences and configuration options.
 *
 * Story: settings-settingsdialog--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateSettingsDialog(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-settings-settingsdialog--default",
    outputPath,
    theme: "light",
    fullPage: false,
    waitTime: 500,
  });
}

/**
 * Generate loading spinner screenshot
 *
 * Captures the LoadingSpinner component in its default state.
 *
 * Story: common-loadingspinner--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateLoadingSpinner(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-common-loadingspinner--default",
    outputPath,
    theme: "light",
    waitTime: 800, // Let spinner animate for a moment
  });
}

/**
 * Generate language selector screenshot
 *
 * Captures the LanguageSelector component showing available
 * language options.
 *
 * Story: common-languageselector--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateLanguageSelector(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-common-languageselector--default",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate employee changes summary screenshot
 *
 * Captures the EmployeeChangesSummary component showing a
 * condensed view of employee modifications.
 *
 * Story: panel-employeechangessummary--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeChangesSummary(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-employeechangessummary--default",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate employee tile with flags screenshot
 *
 * Captures the EmployeeTile component showing individual colored
 * flag badges (16px circular) in the top-right corner.
 *
 * Replaces: Full app workflow that loaded data and captured employee tiles with flags
 * Story: grid-employeetile--with-flags
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmployeeTileFlagged(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport for tile screenshots
  await page.setViewportSize({ width: 800, height: 600 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-employeetile--with-flags",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate FileMenuButton no file screenshot
 *
 * Captures the FileMenuButton component showing "No file selected"
 * empty state. Used for quickstart-file-menu-button screenshot.
 *
 * Replaces: Full app workflow that loaded empty state
 * Story: dashboard-appbar-filemenubutton--no-file
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFileMenuButtonNoFile(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match element size (no excess whitespace)
  // Note: Storybook requires minimum ~600px width to avoid hiding content
  await page.setViewportSize({ width: 600, height: 400 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filemenubutton--no-file",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate FileMenuButton with changes screenshot
 *
 * Captures the FileMenuButton component showing file loaded with
 * change count badge. Used for file-menu-apply-changes screenshot.
 *
 * Replaces: Full app workflow that loaded data and made changes
 * Story: dashboard-appbar-filemenubutton--with-changes
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFileMenuButtonWithChanges(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filemenubutton--with-changes",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate FileMenuButton with Import menu item highlighted
 *
 * Captures the FileMenuButton component with menu open and Import Data
 * menu item highlighted (via hover). This demonstrates how to access
 * the data import functionality.
 *
 * Hybrid approach: Uses Storybook to render the menu open state,
 * then uses Playwright to hover over Import item before screenshot.
 *
 * Replaces: calibration.ts generateFileImport() full-app workflow
 * Story: app-dashboard-filemenubutton--menu-open
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFileMenuImport(
  page: Page,
  outputPath: string
): Promise<void> {
  const { navigateToStory } = await import("../storybook-screenshot");
  const fs = await import("fs");
  const path = await import("path");

  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  // Navigate to MenuOpen story
  await navigateToStory(
    page,
    "app-dashboard-filemenubutton--menu-open",
    "light"
  );

  // Wait for menu to be visible
  await page.waitForSelector('[data-testid="file-menu"]', { state: "visible" });
  await page.waitForTimeout(500);

  // Hover over Import Data menu item to highlight it
  const importItem = page.locator('[data-testid="import-data-menu-item"]');
  if ((await importItem.count()) > 0) {
    await importItem.hover();
    await page.waitForTimeout(200);
  }

  // Capture screenshot of the entire page (includes button + menu connected)
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: true });

  console.log(
    `  ✓ Captured from Storybook with hover: app-dashboard-filemenubutton--menu-open (light theme)`
  );
}

/**
 * Generate FileMenuButton with Apply Changes menu item
 *
 * Captures the FileMenuButton component with menu open showing Apply Changes option.
 * This demonstrates how to apply changes before exporting.
 *
 * Hybrid approach: Uses Storybook to render the menu open state with changes,
 * then captures the menu showing the Apply Changes option.
 *
 * Story: dashboard-appbar-filemenubutton--menu-open-with-changes
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFileMenuApplyChanges(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filemenubutton--menu-open",
    outputPath,
    theme: "light",
    waitTime: 1000,
  });
}

/**
 * Generate populated grid screenshot (normal mode)
 *
 * Captures the NineBoxGrid component in Populated story state, showing
 * all 9 boxes with employees distributed across performance/potential levels.
 *
 * Used for both:
 * - quickstart-grid-populated: Shows initial populated state after upload
 * - grid-normal: Standard grid documentation screenshot
 *
 * Replaces: Full app workflow that loaded sample data and captured grid
 * Story: grid-nineboxgrid--populated
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateGridPopulated(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to ensure entire 9-box grid is visible (not clipped at bottom)
  // Grid needs ~1200px height to show all 9 boxes without clipping
  await page.setViewportSize({ width: 1200, height: 1200 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-nineboxgrid--populated",
    outputPath,
    theme: "light",
    waitTime: 1000, // Grid has animations and drag-drop setup
  });
}

/**
 * Generate donut mode active layout screenshot
 *
 * Captures the NineBoxGrid component in DonutMode story state, showing
 * the calibration mode with concentric circles and ghost tiles for
 * moved employees.
 *
 * Shows:
 * - Donut mode layout (concentric circles)
 * - Only position 5 employees visible
 * - Ghost tile at position 8 (original position of modified employee)
 * - Purple/teal color scheme
 *
 * Replaces: Full app workflow that activated donut mode
 * Story: grid-nineboxgrid--donut-mode
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateDonutModeActive(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to ensure entire grid is visible (donut mode needs same space as normal grid)
  await page.setViewportSize({ width: 1200, height: 1000 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-nineboxgrid--donut-mode",
    outputPath,
    theme: "light",
    waitTime: 1000, // Grid animations
  });
}

/**
 * Generate simplified AppBar screenshot
 *
 * Captures the PureAppBar component showing the simplified interface with:
 * - Logo
 * - File menu button
 * - Help button
 * - Settings button
 *
 * Used for view-controls-simplified-appbar screenshot.
 * Replaces: Full app workflow that loaded data and captured AppBar element
 * Story: dashboard-appbar-pureappbar--file-loaded
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateSimplifiedAppBar(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-appbar--file-loaded",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate ViewControls with Grid view active screenshot
 *
 * Captures the ViewControls toolbar showing Grid view active state with
 * standard 100% zoom level. Shows all control groups: view mode toggle,
 * zoom controls, and fullscreen button.
 *
 * Used for view-controls-grid-view screenshot.
 * Replaces: Full app workflow that loaded data and captured ViewControls
 * Story: common-viewcontrols--grid-view-active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateViewControlsGridView(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-common-viewcontrols--grid-view-active",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate ViewControls with Donut view active screenshot
 *
 * Captures the ViewControls toolbar showing Donut view active state with
 * the toggle switched to donut mode. Demonstrates the visual difference
 * when donut mode is enabled.
 *
 * Used for view-controls-donut-view screenshot.
 * Replaces: Full app workflow that activated donut mode
 * Story: common-viewcontrols--donut-view-active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateViewControlsDonutView(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-common-viewcontrols--donut-view-active",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate empty state with sample data button screenshot
 *
 * Captures the EmptyState component showing the "Load Sample Data" button
 * for the quickstart guided tour.
 *
 * Story: app-dashboard-emptystate--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateEmptyStateWithSampleButton(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-emptystate--default",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate load sample dialog screenshot
 *
 * Captures the LoadSampleDialog component in its initial state
 * (no existing data warning).
 *
 * Story: dialogs-loadsampledialog--no-existing-data
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateLoadSampleDialog(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dialogs-loadsampledialog--no-existing-data",
    outputPath,
    theme: "light",
    waitTime: 800, // Dialog has animations
  });
}
