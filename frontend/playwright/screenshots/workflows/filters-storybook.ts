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
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFlagsFiltering(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-filterdrawer--flags-active",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate reporting chain filter active screenshot
 *
 * Shows the FilterDrawer with Reporting Chain section:
 * - Green chip with manager icon
 * - Manager name displayed in chip
 * - Chip can be dismissed with X button
 *
 * Uses Storybook story: dashboard-filterdrawer--reporting-chain-active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateReportingChainFilterActive(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "dashboard-filterdrawer--reporting-chain-active",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
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
