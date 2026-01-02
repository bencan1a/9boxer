/**
 * Details Panel Enhancements Screenshot Workflow
 *
 * Generates screenshots for the Details Panel UX overhaul documentation:
 * - Enhanced Current Assessment with box name, coordinates, chips
 * - Flags system UI
 * - Flag badges on employee tiles
 * - Flag filtering in FilterDrawer
 * - Reporting Chain with clickable managers
 * - Active reporting chain filter
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";
import { captureStorybookScreenshot } from "../storybook-screenshot";

/**
 * Generate enhanced current assessment screenshot
 *
 * Shows the Current Assessment section in Details panel with:
 * - Box name with grid coordinates (e.g., "Star [H,H]")
 * - Color-coded Performance chip
 * - Color-coded Potential chip
 * - Recent changes summary
 * - Exterior padding to match app appearance
 *
 * Uses Storybook for reliable component capture.
 * Story: panel-employeedetails--default-with-padding
 *
 * Note: Removed selector to capture full component with padding from story.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateCurrentAssessmentEnhanced(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match panel width (no excess horizontal whitespace)
  await page.setViewportSize({ width: 450, height: 800 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-employeedetails--default-with-padding",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate flags UI screenshot
 *
 * Shows the Flags section in Details panel with:
 * - "Flags" heading
 * - Autocomplete picker with "Add flag..." placeholder
 * - Existing flag chips with colors and X buttons
 *
 * Uses Storybook for isolated component capture.
 * Story: panel-employeeflags--with-multiple-flags
 *
 * Note: Viewport constrained to match other detail panels (~400px width).
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFlagsUI(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to constrain width to match other detail panels
  await page.setViewportSize({ width: 450, height: 300 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-employeeflags--with-multiple-flags",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate flag badges screenshot
 *
 * Shows employee tiles with flag badges:
 * - Flag count badges (🏷️ icon + count)
 * - Multiple tiles with different flag counts
 * - Badges in top-right corner of tiles
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFlagBadges(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data
  await loadSampleData(page);

  // Add flags to some employees
  await page.evaluate(() => {
    const sessionStore = (window as any).useSessionStore?.getState?.();
    const employees = sessionStore?.employees || [];

    // Add different numbers of flags to employees for variety
    if (employees.length >= 3) {
      // Employee 1: 1 flag
      employees[0].flags = ["promotion_ready"];

      // Employee 2: 2 flags
      employees[1].flags = ["flight_risk", "high_retention_priority"];

      // Employee 3: 3 flags
      employees[2].flags = [
        "new_hire",
        "flagged_for_discussion",
        "succession_candidate",
      ];

      // Force re-render
      sessionStore?.setEmployees?.(employees);
    }
  });

  // Wait for UI to update
  await waitForUiSettle(page, 1);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Find a grid box with multiple flagged employees
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.waitFor({ state: "visible", timeout: 5000 });

  // Capture a portion showing several employee tiles with flag badges
  const gridBox = page.locator('[data-testid^="grid-box-"]').first();
  await gridBox.waitFor({ state: "visible", timeout: 5000 });

  const boundingBox = await gridBox.boundingBox();
  if (!boundingBox) {
    throw new Error("Could not get grid box bounding box");
  }

  // Capture showing multiple tiles
  await page.screenshot({
    path: outputPath,
    clip: {
      x: boundingBox.x,
      y: boundingBox.y,
      width: Math.min(600, boundingBox.width),
      height: Math.min(400, boundingBox.height),
    },
  });
}

/**
 * Generate flag filtering screenshot
 *
 * Shows the FilterDrawer with Flags section:
 * - Checkboxes for all 8 flag types
 * - Employee count next to each flag
 * - Some flags checked (active)
 * - Filter chips at top
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFlagFiltering(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure we're on the app page (might be on Storybook from previous screenshot)
  const currentUrl = page.url();
  if (currentUrl.includes("localhost:6006")) {
    // We're on Storybook, need to navigate back to app by reloading
    // (the page was already on the app initially)
    await page.goBack({ waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
  }

  // Load sample data
  await loadSampleData(page);

  // Wait for grid to load with employees
  await page.waitForSelector('[data-testid="nine-box-grid"]', {
    state: "visible",
    timeout: 10000,
  });

  // Wait for employee cards to be rendered (ensures grid is fully populated)
  await page.waitForSelector('[data-testid^="employee-card-"]', {
    state: "visible",
    timeout: 10000,
  });

  await waitForUiSettle(page, 1);

  // Add flags to employees to show counts
  await page.evaluate(() => {
    const sessionStore = (window as any).useSessionStore?.getState?.();
    const employees = sessionStore?.employees || [];

    // Distribute flags across employees
    if (employees.length >= 8) {
      employees[0].flags = ["promotion_ready"];
      employees[1].flags = ["promotion_ready", "succession_candidate"];
      employees[2].flags = ["flight_risk"];
      employees[3].flags = ["flight_risk", "high_retention_priority"];
      employees[4].flags = ["new_hire"];
      employees[5].flags = ["flagged_for_discussion"];
      employees[6].flags = ["pip"];
      employees[7].flags = ["ready_for_lateral_move"];

      sessionStore?.setEmployees?.(employees);
    }
  });

  await waitForUiSettle(page, 1.5);

  // Wait for toolbar to be ready
  await page.waitForSelector('[data-testid="app-bar"]', {
    state: "visible",
    timeout: 10000,
  });

  // Open FilterDrawer using the toolbar button
  const filterButton = page.locator(
    'button[aria-label*="filter" i], button[aria-label*="Filter" i]'
  );
  await filterButton.waitFor({ state: "visible", timeout: 10000 });
  await filterButton.click();
  await waitForUiSettle(page, 1);

  // Wait for drawer to be visible - use MUI Drawer selector
  const drawer = page.locator('.MuiDrawer-root [role="presentation"]').first();
  await drawer.waitFor({ state: "visible", timeout: 10000 });

  // Scroll to Flags section in drawer
  const flagsSection = page
    .locator('text="Flags"')
    .or(page.locator("text=/flags/i"));
  if ((await flagsSection.count()) > 0) {
    await flagsSection.first().scrollIntoViewIfNeeded();
    await waitForUiSettle(page, 0.5);
  }

  // Select a couple of flags using label click (more reliable than checkbox)
  const promotionLabel = page.locator('text="Promotion Ready"').first();
  if ((await promotionLabel.count()) > 0) {
    await promotionLabel.click();
    await waitForUiSettle(page, 0.3);
  }

  const flightRiskLabel = page.locator('text="Flight Risk"').first();
  if ((await flightRiskLabel.count()) > 0) {
    await flightRiskLabel.click();
    await waitForUiSettle(page, 0.3);
  }

  // Capture the FilterDrawer
  const boundingBox = await drawer.boundingBox();
  if (!boundingBox) {
    throw new Error("Could not get FilterDrawer bounding box");
  }

  await page.screenshot({
    path: outputPath,
    clip: {
      x: boundingBox.x,
      y: boundingBox.y,
      width: boundingBox.width,
      height: boundingBox.height,
    },
  });
}

/**
 * Generate clickable reporting chain screenshot
 *
 * Shows the Reporting Chain section in Details panel with:
 * - Manager names as blue underlined links
 * - Hover state on one manager
 * - Management hierarchy levels
 *
 * Uses Storybook for component capture.
 * Story: panel-managementchain--clickable
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateReportingChainClickable(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-details-managementchain--with-manager",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate active reporting chain filter screenshot
 *
 * Shows the grid with an active reporting chain filter:
 * - FilterDrawer showing "Reporting Chain: [Manager Name]" chip
 * - Grid filtered to show only employees under that manager
 * - Employee count updated
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateReportingChainFilterActive(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure we're on the app page (might be on Storybook from previous screenshot)
  const currentUrl = page.url();
  if (currentUrl.includes("localhost:6006")) {
    // We're on Storybook, need to navigate back to app by reloading
    // (the page was already on the app initially)
    await page.goBack({ waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
  }

  // Load sample data
  await loadSampleData(page);

  // Wait for grid to be fully loaded with employees
  await page.waitForSelector('[data-testid="nine-box-grid"]', {
    state: "visible",
    timeout: 10000,
  });

  // Wait for employee cards to be rendered (ensures grid is fully populated)
  await page.waitForSelector('[data-testid^="employee-card-"]', {
    state: "visible",
    timeout: 10000,
  });

  await waitForUiSettle(page, 1.5);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Find and click an employee card
  const employeeCard = page.locator('[data-testid^="employee-card-"]').first();
  await employeeCard.waitFor({ state: "visible", timeout: 10000 });
  await employeeCard.click();
  await waitForUiSettle(page, 1);

  // Wait for Details panel to open
  await page.waitForSelector('[data-testid="employee-details-panel"]', {
    state: "visible",
    timeout: 10000,
  });

  // Look for manager chain button (use more flexible selector)
  const managerButton = page
    .locator('[data-testid^="manager-chain-button-"]')
    .first();

  if ((await managerButton.count()) > 0) {
    await managerButton.waitFor({ state: "visible", timeout: 3000 });
    await managerButton.click();
    await waitForUiSettle(page, 1);
  } else {
    // Fallback: try to find any clickable manager name in the management chain section
    const managerName = page.locator('button:has-text("Manager")').first();
    if ((await managerName.count()) > 0) {
      await managerName.click();
      await waitForUiSettle(page, 1);
    }
  }

  // Open FilterDrawer to show the active filter
  const filterButton = page.locator(
    'button[aria-label*="filter" i], button[aria-label*="Filter" i]'
  );
  await filterButton.waitFor({ state: "visible", timeout: 5000 });
  await filterButton.click();
  await waitForUiSettle(page, 1);

  // Take screenshot showing both drawer and filtered grid
  await page.screenshot({
    path: outputPath,
    fullPage: false,
  });
}
