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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate grid box expanded screenshot
 *
 * Captures the GridBox component in expanded state, showing the
 * full list of employees and collapse button with proper padding.
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
  // Set viewport to match story container with padding
  await page.setViewportSize({ width: 600, height: 600 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-gridbox--expanded",
    outputPath,
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    "dark"
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

  // Capture screenshot of just the menu element (cropped to eliminate whitespace)
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Find the menu element and capture it directly
  const menuElement = page.locator('[role="menu"]');
  if ((await menuElement.count()) > 0) {
    await menuElement.screenshot({ path: outputPath });
  } else {
    // Fallback to full page if menu not found
    await page.screenshot({ path: outputPath, fullPage: true });
  }

  console.log(
    `  ✓ Captured from Storybook with hover: app-dashboard-filemenubutton--menu-open (dark theme)`
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
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
    theme: "dark",
    waitTime: 800, // Dialog has animations
  });
}

/**
 * Generate donut mode grid screenshot
 *
 * Captures the NineBoxGrid in donut mode, showing:
 * - Concentric circles representing different positions
 * - Employee tiles arranged in donut layout
 * - Ghost tiles showing original positions
 *
 * Story: nineboxgrid--donut-mode
 */
export async function generateDonutModeGrid(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 1000, height: 800 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-nineboxgrid--donut-mode",
    outputPath,
    theme: "dark",
    waitTime: 1000, // Donut mode has animations
  });
}

/**
 * Generate donut changes tab screenshot
 *
 * Captures the ChangeTrackerTab showing donut mode movements
 * with descriptive calibration notes. This requires clicking the
 * "Donut Changes" tab since the component defaults to Grid Changes.
 *
 * Story: changetrackertab--donut-changes
 */
export async function generateDonutChangesTab(
  page: Page,
  outputPath: string
): Promise<void> {
  const { navigateToStory } = await import("../storybook-screenshot");
  const fs = await import("fs");
  const path = await import("path");

  await page.setViewportSize({ width: 700, height: 800 });

  // Navigate to the story
  await navigateToStory(
    page,
    "app-right-panel-changes-changetrackertab--donut-changes",
    "dark"
  );

  // Wait for the component to render
  await page.waitForTimeout(500);

  // Click the "Donut Changes" tab (second tab)
  const donutTab = page.locator('[data-testid="donut-changes-tab"]');
  if ((await donutTab.count()) > 0) {
    await donutTab.click();
    await page.waitForTimeout(500);
  }

  // Create output directory if needed
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the change tracker view
  const changeTracker = page.locator('[data-testid="change-tracker-view"]');
  if ((await changeTracker.count()) > 0) {
    await changeTracker.screenshot({ path: outputPath });
  } else {
    // Fallback to storybook root
    const storybookRoot = page.locator("#storybook-root > *");
    await storybookRoot.first().screenshot({ path: outputPath });
  }

  console.log(
    `  ✓ Captured from Storybook with tab click: app-right-panel-changes-changetrackertab--donut-changes (dark theme)`
  );
}

/**
 * Generate changes tab with notes screenshot
 *
 * Captures the ChangeTrackerTab showing employee movements
 * with well-documented notes demonstrating best practices.
 *
 * Story: changetrackertab--grid-changes-only
 */
export async function generateChangesTabWithNotes(
  page: Page,
  outputPath: string
): Promise<void> {
  // Wider viewport to prevent text clipping and wrapping
  await page.setViewportSize({ width: 800, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-changes-changetrackertab--grid-changes-only",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate grid with axes labeled screenshot
 *
 * Captures the NineBoxGrid with visible Performance (X) and Potential (Y)
 * axis labels for educational documentation.
 *
 * Story: nineboxgrid--populated
 */
export async function generateGridWithAxesLabeled(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 1000, height: 800 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-nineboxgrid--populated",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

// =============================================================================
// GRID SCREENSHOTS (4 screenshots for understanding-grid.md)
// =============================================================================

/**
 * Generate grid basic layout screenshot
 *
 * Captures the full 9-box grid with axis labels (Performance: Low/Medium/High,
 * Potential: Low/Medium/High) and all 9 position names visible.
 *
 * Story: app-grid-nineboxgrid--populated
 */
export async function generateGridBasicLayout(
  page: Page,
  outputPath: string
): Promise<void> {
  // Large viewport to show full grid with all labels
  await page.setViewportSize({ width: 1200, height: 1200 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-nineboxgrid--populated",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate grid color coding boxes screenshot
 *
 * Captures the grid view emphasizing the background color scheme:
 * green top row (high potential), yellow/amber middle row, orange bottom row.
 *
 * Story: app-grid-nineboxgrid--populated
 */
export async function generateGridColorCoding(
  page: Page,
  outputPath: string
): Promise<void> {
  // Similar viewport as basic layout to show color coding
  await page.setViewportSize({ width: 1200, height: 1200 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-nineboxgrid--populated",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate employee tile states composite screenshot
 *
 * This screenshot requires manual composition as it shows 4 different tile states
 * side by side: default blue, orange border (modified), purple border (donut),
 * and flag chips.
 *
 * NOTE: This is marked as manual in config.ts because it requires compositing
 * multiple screenshots together. The workflow function captures a placeholder.
 */
export async function generateEmployeeTileStates(
  page: Page,
  outputPath: string
): Promise<void> {
  // Use the composite story that shows all 4 tile states
  await page.setViewportSize({ width: 800, height: 500 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-employeetile--all-states-composite",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

// =============================================================================
// DONUT MODE SCREENSHOTS (2 screenshots for donut-mode.md)
// =============================================================================

/**
 * Generate donut mode employee tile with purple border screenshot
 *
 * Captures a single employee tile showing the purple border and visual
 * indication of original Position 5 placement.
 *
 * Story: app-grid-employeetile--donut-mode
 */
export async function generateDonutModeTilePurple(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 800, height: 600 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-employeetile--donut-mode",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate donut mode changes tabs toggle screenshot
 *
 * Captures the Changes panel showing both tab options:
 * Regular Changes and Donut Changes.
 *
 * Story: app-right-panel-changes-changetrackertab--with-donut-mode
 */
export async function generateDonutModeTabsToggle(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 700, height: 800 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-changes-changetrackertab--with-donut-mode",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

// =============================================================================
// WORKING WITH EMPLOYEES SCREENSHOTS (4 screenshots)
// =============================================================================

/**
 * Generate complete employee details panel screenshot
 *
 * Shows the full employee details panel with all sections:
 * - Ratings and job info
 * - Flags section
 * - Org chain
 * - Timeline
 *
 * Story: app-right-panel-details-employeedetails--default
 */
export async function generateEmployeeDetailsFullPanel(
  page: Page,
  outputPath: string
): Promise<void> {
  // Taller viewport to show full panel content
  await page.setViewportSize({ width: 500, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-employeedetails--default",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate employee tile with modified border screenshot
 *
 * Shows a single employee tile with orange left border indicating
 * the employee was modified in the current session.
 *
 * Story: app-grid-employeetile--modified-normal-mode
 */
export async function generateEmployeeTileModifiedBorder(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 400, height: 300 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-employeetile--modified-normal-mode",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate employee timeline history screenshot
 *
 * Shows the timeline section in Details tab with chronological
 * history of rating changes with dates and positions.
 *
 * Story: app-right-panel-details-ratingstimeline--with-history
 */
export async function generateEmployeeTimelineHistory(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 500, height: 600 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-ratingstimeline--with-history",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate employee flags section screenshot
 *
 * Shows the flags section in Details tab with existing flag chips
 * and the Add Flag dropdown menu open.
 *
 * Story: app-right-panel-details-employeeflags--with-multiple-flags
 */
export async function generateEmployeeFlagsSection(
  page: Page,
  outputPath: string
): Promise<void> {
  const { navigateToStory } = await import("../storybook-screenshot");
  const fs = await import("fs");
  const path = await import("path");

  await page.setViewportSize({ width: 500, height: 500 });

  // Navigate to the flags story with multiple flags
  await navigateToStory(
    page,
    "app-right-panel-details-employeeflags--with-multiple-flags",
    "dark"
  );

  await page.waitForTimeout(500);

  // Try to click the Add Flag button to open the dropdown
  const addFlagButton = page.locator('[data-testid="add-flag-button"]');
  if ((await addFlagButton.count()) > 0) {
    await addFlagButton.click();
    await page.waitForTimeout(300);
  }

  // Create output directory if needed
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the screenshot
  const flagsSection = page.locator('[data-testid="employee-flags-section"]');
  if ((await flagsSection.count()) > 0) {
    await flagsSection.screenshot({ path: outputPath });
  } else {
    const storybookRoot = page.locator("#storybook-root > *");
    await storybookRoot.first().screenshot({ path: outputPath });
  }

  console.log(
    `  ✓ Captured from Storybook: employee flags section with dropdown (dark theme)`
  );
}

// =============================================================================
// TRACKING CHANGES SCREENSHOTS (3 screenshots)
// =============================================================================

/**
 * Generate Apply button with badge screenshot
 *
 * Shows the FileMenu button with a badge indicating the number
 * of pending changes. Uses a dark themed container with proper padding.
 *
 * Story: app-dashboard-filemenubutton--with-changes-badge
 */
export async function generateApplyButtonWithBadge(
  page: Page,
  outputPath: string
): Promise<void> {
  // Larger viewport for proper button rendering with padding
  await page.setViewportSize({ width: 500, height: 300 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filemenubutton--with-changes-badge",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate employee tile with Big Mover flag screenshot
 *
 * Shows a single employee tile with the Big Mover flag chip (cyan color)
 * indicating a significant tier change.
 *
 * Story: app-grid-employeetile--with-flags
 */
export async function generateEmployeeTileBigMoverFlag(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 400, height: 300 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-employeetile--with-flags",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate grid change indicators screenshot
 *
 * Shows the grid view with multiple visual indicators:
 * orange borders on modified tiles and Big Mover flags.
 *
 * Story: app-grid-nineboxgrid--populated
 */
export async function generateGridChangeIndicators(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 1200, height: 1000 });

  await captureStorybookScreenshot(page, {
    storyId: "app-grid-nineboxgrid--populated",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

// =============================================================================
// VIEW CONTROLS SCREENSHOTS (3 close-up screenshots)
// =============================================================================

/**
 * Generate zoom controls close-up screenshot
 *
 * Shows just the zoom controls portion of the ViewControls toolbar:
 * minus, reset, plus buttons and percentage display.
 *
 * Story: app-common-viewcontrols--grid-view-active
 */
export async function generateViewControlsZoom(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 400, height: 200 });

  await captureStorybookScreenshot(page, {
    storyId: "app-common-viewcontrols--grid-view-active",
    outputPath,
    theme: "dark",
    waitTime: 300,
  });
}

/**
 * Generate fullscreen toggle close-up screenshot
 *
 * Shows the fullscreen toggle button in the ViewControls toolbar.
 *
 * Story: app-common-viewcontrols--grid-view-active
 */
export async function generateViewControlsFullscreen(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 400, height: 200 });

  await captureStorybookScreenshot(page, {
    storyId: "app-common-viewcontrols--grid-view-active",
    outputPath,
    theme: "dark",
    waitTime: 300,
  });
}

/**
 * Generate view mode toggle close-up screenshot
 *
 * Shows the Grid/Donut mode toggle buttons in the ViewControls toolbar.
 *
 * Story: app-common-viewcontrols--grid-view-active
 */
export async function generateViewControlsModeToggle(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 400, height: 200 });

  await captureStorybookScreenshot(page, {
    storyId: "app-common-viewcontrols--grid-view-active",
    outputPath,
    theme: "dark",
    waitTime: 300,
  });
}
