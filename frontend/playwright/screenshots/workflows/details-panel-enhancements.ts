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
 *
 * Uses Storybook for reliable component capture.
 * Story: panel-employeedetails--with-flags-and-assessment
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateCurrentAssessmentEnhanced(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "panel-employeedetails--with-flags-and-assessment",
    outputPath,
    theme: "light",
    waitTime: 800,
    selector: '[data-testid="current-assessment-section"]',
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
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFlagsUI(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "panel-employeeflags--with-multiple-flags",
    outputPath,
    theme: "light",
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
  // Load sample data
  await loadSampleData(page);

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

  await waitForUiSettle(page, 0.5);

  // Open FilterDrawer
  const filterButton = page.locator('[aria-label*="Filter"]');
  await filterButton.click();
  await waitForUiSettle(page, 0.5);

  // Scroll to Flags section in drawer
  const flagsSection = page.locator('text="Flags"').first();
  await flagsSection.scrollIntoViewIfNeeded();
  await waitForUiSettle(page, 0.3);

  // Select a couple of flags
  const promotionCheckbox = page.locator(
    'input[type="checkbox"][value="promotion_ready"]'
  );
  const flightRiskCheckbox = page.locator(
    'input[type="checkbox"][value="flight_risk"]'
  );

  if ((await promotionCheckbox.count()) > 0) {
    await promotionCheckbox.check();
  }
  if ((await flightRiskCheckbox.count()) > 0) {
    await flightRiskCheckbox.check();
  }

  await waitForUiSettle(page, 0.5);

  // Capture the FilterDrawer
  const drawer = page.locator('[role="dialog"]').or(
    page.locator('[data-testid="filter-drawer"]')
  );
  await drawer.waitFor({ state: "visible", timeout: 5000 });

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
    storyId: "panel-managementchain--clickable",
    outputPath,
    theme: "light",
    waitTime: 500,
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
  // Load sample data
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click an employee to open Details panel
  const employeeTile = page.locator('[data-testid^="employee-tile-"]').first();
  await employeeTile.click();
  await waitForUiSettle(page, 0.5);

  // Click a manager name in the reporting chain
  const managerLink = page.locator('[data-testid^="manager-link-"]').first();
  if ((await managerLink.count()) > 0) {
    await managerLink.click();
    await waitForUiSettle(page, 1);
  }

  // Open FilterDrawer to show the active filter
  const filterButton = page.locator('[aria-label*="Filter"]');
  await filterButton.click();
  await waitForUiSettle(page, 0.5);

  // Take screenshot showing both drawer and filtered grid
  await page.screenshot({
    path: outputPath,
    fullPage: false,
  });
}
