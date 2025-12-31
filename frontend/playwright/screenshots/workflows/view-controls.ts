/**
 * ViewControls Screenshot Workflow
 *
 * Generates screenshots for the ViewControls consolidation documentation:
 * - Main interface with new AppBar and floating ViewControls
 * - ViewControls toolbar in Grid view
 * - ViewControls toolbar in Donut view
 * - Settings dialog with theme and language options
 * - Simplified AppBar
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";
import { captureStorybookScreenshot } from "../storybook-screenshot";

/**
 * Generate main interface screenshot showing new AppBar and floating ViewControls
 *
 * Shows the complete dashboard with:
 * - Simplified AppBar (Logo, File, Help, Settings)
 * - Floating ViewControls toolbar in top-right
 * - 9-box grid with employee tiles
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateMainInterface(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 1);

  // Verify key elements are visible
  const appBar = page.locator('[data-testid="app-bar"]');
  await appBar.waitFor({ state: "visible", timeout: 5000 });

  const viewControls = page.locator('[data-testid="view-controls"]');
  await viewControls.waitFor({ state: "visible", timeout: 5000 });

  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.waitFor({ state: "visible", timeout: 5000 });

  // Take full viewport screenshot
  await page.screenshot({
    path: outputPath,
    fullPage: false,
  });
}

/**
 * Generate ViewControls toolbar screenshot in Grid view
 *
 * Closeup of ViewControls showing:
 * - Grid/Donut toggle with Grid view active
 * - Zoom controls (+, -, reset, percentage)
 * - Fullscreen button
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateViewControlsGrid(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Ensure we're in grid view
  const sessionStore = await page.evaluate(() => {
    return (window as any).useSessionStore?.getState?.();
  });

  if (sessionStore?.donutModeActive) {
    // Toggle to grid view
    await page.evaluate(() => {
      (window as any).useSessionStore?.getState?.().toggleDonutMode();
    });
    await waitForUiSettle(page, 0.5);
  }

  // Wait for ViewControls
  const viewControls = page.locator('[data-testid="view-controls"]');
  await viewControls.waitFor({ state: "visible", timeout: 5000 });

  // Get bounding box and capture with context
  const boundingBox = await viewControls.boundingBox();
  if (!boundingBox) {
    throw new Error("Could not get ViewControls bounding box");
  }

  // Add padding around the controls
  const padding = 20;
  await page.screenshot({
    path: outputPath,
    clip: {
      x: Math.max(0, boundingBox.x - padding),
      y: Math.max(0, boundingBox.y - padding),
      width: boundingBox.width + padding * 2,
      height: boundingBox.height + padding * 2,
    },
  });
}

/**
 * Generate ViewControls toolbar screenshot in Donut view
 *
 * Shows ViewControls with Donut view active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateViewControlsDonut(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Toggle to donut view
  await page.evaluate(() => {
    const state = (window as any).useSessionStore?.getState?.();
    if (state && !state.donutModeActive) {
      state.toggleDonutMode();
    }
  });

  // Wait for donut view to render
  await waitForUiSettle(page, 1);

  // Wait for ViewControls
  const viewControls = page.locator('[data-testid="view-controls"]');
  await viewControls.waitFor({ state: "visible", timeout: 5000 });

  // Get bounding box and capture with context
  const boundingBox = await viewControls.boundingBox();
  if (!boundingBox) {
    throw new Error("Could not get ViewControls bounding box");
  }

  // Add padding around the controls
  const padding = 20;
  await page.screenshot({
    path: outputPath,
    clip: {
      x: Math.max(0, boundingBox.x - padding),
      y: Math.max(0, boundingBox.y - padding),
      width: boundingBox.width + padding * 2,
      height: boundingBox.height + padding * 2,
    },
  });
}

/**
 * Generate Settings dialog screenshot
 *
 * Uses Storybook to capture the SettingsDialog component showing:
 * - Theme options (Light, Dark, Auto)
 * - Language dropdown (English, Español)
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
    storyId: "settings-settingsdialog--open",
    outputPath,
    theme: "light",
    waitTime: 1000,
    selector: '[role="dialog"]', // Dialog renders in portal, not in storybook root
  });
}

/**
 * Generate simplified AppBar screenshot
 *
 * Shows the AppBar with only:
 * - Logo
 * - File menu button
 * - Help button
 * - Settings button
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateSimplifiedAppBar(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 0.5);

  // Wait for AppBar
  const appBar = page.locator('[data-testid="app-bar"]');
  await appBar.waitFor({ state: "visible", timeout: 5000 });

  // Get bounding box and capture
  const boundingBox = await appBar.boundingBox();
  if (!boundingBox) {
    throw new Error("Could not get AppBar bounding box");
  }

  await page.screenshot({
    path: outputPath,
    clip: {
      x: 0,
      y: 0,
      width: boundingBox.width,
      height: boundingBox.height,
    },
  });
}

/**
 * Generate fullscreen mode screenshot
 *
 * Shows the application in fullscreen mode
 *
 * Note: True fullscreen cannot be captured in automated tests (browser API restriction).
 * This captures the normal view which is what users see before pressing F11.
 * The documentation should note to press F11 for actual fullscreen.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFullscreenMode(
  page: Page,
  outputPath: string
): Promise<void> {
  // Navigate to app if not already there
  const currentUrl = page.url();
  if (!currentUrl.includes("localhost:5173")) {
    await page.goto("http://localhost:5173");
  }

  // Wait for app to load
  await waitForUiSettle(page, 1.0);

  // Check if we need to load sample data
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  const count = await employeeCards.count();

  if (count === 0) {
    // Load sample data using the helper
    await loadSampleData(page);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to fully stabilize
  await waitForUiSettle(page, 0.5);

  // Take full page screenshot
  await page.screenshot({
    path: outputPath,
    fullPage: false,
  });
}
