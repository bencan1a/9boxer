/**
 * FilterDrawer Storybook Screenshot Workflow
 *
 * Generates screenshots for FilterDrawer documentation using Storybook stories.
 * This provides faster, more reliable screenshots than full-app workflows.
 *
 * Screenshots generated:
 * - Flags filtering section with checkboxes and counts
 * - Reporting chain filter with active state
 * - FilterDrawer overview showing all sections
 * - Multiple filters active demonstration
 */

import { Page } from "@playwright/test";
import { captureStorybookScreenshot } from "../storybook-screenshot";
import * as fs from "fs";
import * as path from "path";

/**
 * Generate flags filtering screenshot
 *
 * Shows the FilterDrawer with Flags section:
 * - Checkboxes for all 8 flag types
 * - Employee count next to each flag
 * - Some flags checked (active)
 * - Count badge showing active filters
 *
 * Uses Storybook story: dashboard-filterdrawer--flags-active
 * Expands the Flags section before capturing screenshot
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFlagsFiltering(
  page: Page,
  outputPath: string
): Promise<void> {
  // Navigate to story using the helper (ensures Storybook is running)
  const { navigateToStory } = await import("../storybook-screenshot");
  await navigateToStory(page, "dashboard-filterdrawer--flags-active", "light");

  // Wait for drawer to be visible
  await page.waitForSelector('[data-testid="filter-drawer"]', {
    state: "visible",
    timeout: 5000,
  });

  // Click to expand the Flags section (it's collapsed by default)
  const flagsAccordion = page.locator('[data-testid="filter-accordion-flags"]');
  await flagsAccordion.click();

  // Wait for expansion animation to complete
  await page.waitForTimeout(500);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Take screenshot of the drawer
  const drawer = page.locator('[data-testid="filter-drawer"]');
  await drawer.screenshot({ path: outputPath });

  console.log(`  ✓ Captured flags section screenshot (expanded)`);
}

/**
 * Generate reporting chain filter active screenshot
 *
 * Shows the FilterDrawer with Reporting Chain section:
 * - Green chip with manager icon (AccountTree)
 * - Manager name displayed in chip ("Reporting to: Jane Smith")
 * - Chip can be dismissed with X button
 *
 * Uses Storybook story: dashboard-filterdrawer--reporting-chain-active
 * Verifies reporting chain chip is visible before capturing
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateReportingChainFilterActive(
  page: Page,
  outputPath: string
): Promise<void> {
  // Navigate to story using the helper (ensures Storybook is running)
  const { navigateToStory } = await import("../storybook-screenshot");
  await navigateToStory(
    page,
    "dashboard-filterdrawer--reporting-chain-active",
    "light"
  );

  // Wait for drawer to be visible
  await page.waitForSelector('[data-testid="filter-drawer"]', {
    state: "visible",
    timeout: 5000,
  });

  // Verify the reporting chain filter chip is visible
  await page.waitForSelector('[data-testid="reporting-chain-filter-chip"]', {
    state: "visible",
    timeout: 5000,
  });

  // Additional wait to ensure rendering is complete
  await page.waitForTimeout(500);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Take screenshot of the drawer
  const drawer = page.locator('[data-testid="filter-drawer"]');
  await drawer.screenshot({ path: outputPath });

  console.log(`  ✓ Captured reporting chain filter screenshot (active)`);
}

/**
 * Generate FilterDrawer overview screenshot
 *
 * Shows the complete FilterDrawer anatomy with all sections:
 * - Job Levels (MT1-MT6)
 * - Job Functions
 * - Locations
 * - Managers
 * - Flags (8 types)
 * - Reporting Chain
 * - Exclusions
 * - Clear All Filters button
 *
 * Uses Storybook story: dashboard-filterdrawer--all-sections-expanded
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerOverview(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-filterdrawer--all-sections-expanded",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate multiple filters active screenshot
 *
 * Shows the FilterDrawer with multiple filter types active:
 * - Job Functions selected
 * - Locations selected
 * - Flags selected
 * - Reporting chain filter active
 * - Count badges on all sections
 *
 * Uses Storybook story: dashboard-filterdrawer--multiple-filters-active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateMultipleFiltersActive(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-filterdrawer--multiple-filters-active",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate FilterDrawer all expanded screenshot
 *
 * Shows the FilterDrawer with all sections expanded.
 * Used for filters-panel-expanded screenshot.
 *
 * Uses Storybook story: dashboard-filterdrawer--all-sections-expanded
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerAllExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-filterdrawer--all-sections-expanded",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate FilterDrawer Clear All button screenshot
 *
 * Shows the FilterSection component with Clear All button.
 * Used for filters-clear-all-button screenshot.
 *
 * Uses Storybook story: dashboard-filtersection--custom-content
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerClearAll(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-filtersection--custom-content",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate FilterDrawer calibration screenshot
 *
 * Shows the FilterDrawer with filter selections for calibration workflow.
 * Used for calibration-filters-panel screenshot.
 *
 * Uses Storybook story: dashboard-filterdrawer--multiple-filters-active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerCalibration(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-filterdrawer--multiple-filters-active",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate active filter chips screenshot
 *
 * Shows the AppBar with active filter chips and orange dot indicator.
 * Used for filters-active-chips screenshot.
 *
 * Uses Storybook story: dashboard-appbar-pureappbar--with-active-filters
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateActiveChips(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-appbar-pureappbar--with-active-filters",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}
