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
  await captureStorybookScreenshot(page, {
    storyId: "grid-employeetile--modified",
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
  await captureStorybookScreenshot(page, {
    storyId: "grid-employeetile--default",
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
  await captureStorybookScreenshot(page, {
    storyId: "panel-employeedetails--default",
    outputPath,
    theme: "light",
    fullPage: false,
    waitTime: 800, // Panel has animations
  });
}

/**
 * Generate ratings timeline screenshot
 *
 * Captures the RatingsTimeline component showing performance history
 * over multiple years.
 *
 * Replaces: Full app workflow that loaded data, selected employee, opened details, switched tabs
 * Story: panel-ratingstimeline--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateRatingsTimeline(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "panel-ratingstimeline--default",
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
    storyId: "panel-managementchain--default",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate changes tab screenshot
 *
 * Captures the ChangeTrackerTab component showing employee movements
 * and modifications.
 *
 * Replaces: Full app workflow that loaded data, made changes, opened panel, switched tabs
 * Story: panel-changetrackertab--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateChangesTab(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "panel-changetrackertab--default",
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
    storyId: "panel-distributionchart--default",
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
    storyId: "grid-gridbox--default",
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
    storyId: "grid-gridbox--expanded",
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
    storyId: "common-zoomcontrols--default",
    outputPath,
    theme: "light",
    waitTime: 300,
  });
}

/**
 * Generate file upload dialog screenshot
 *
 * Captures the FileUploadDialog component showing the file
 * selection interface and upload button.
 *
 * Story: common-fileuploaddialog--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFileUploadDialog(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "common-fileuploaddialog--default",
    outputPath,
    theme: "light",
    fullPage: false,
    waitTime: 500,
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
    storyId: "settings-settingsdialog--default",
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
    storyId: "common-loadingspinner--default",
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
    storyId: "common-languageselector--default",
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
    storyId: "panel-employeechangessummary--default",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}
