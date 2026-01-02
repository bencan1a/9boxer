/**
 * Statistics Storybook Screenshot Workflow
 *
 * Generates screenshots for Statistics panel documentation using Storybook stories.
 * This provides faster, more reliable screenshots than full-app workflows.
 *
 * Benefits:
 * - 10x faster (no app startup, navigation, or state setup)
 * - 100% reliable (isolated components, no flakiness from app state)
 * - Single source of truth (same stories used for dev, testing, and docs)
 * - Auto theme support (light/dark mode screenshots automatically)
 *
 * Screenshots generated:
 * - Distribution table with grouping indicators (balanced distribution)
 * - Trend indicators showing all 9 position colors
 * - CSS-based grouping indicators for high/middle/low tiers
 * - Summary cards showing total, modified, high performers
 */

import { Page } from "@playwright/test";
import { captureStorybookScreenshot } from "../storybook-screenshot";

/**
 * Generate distribution table screenshot
 *
 * Shows the Statistics panel distribution table with:
 * - All 9 positions in custom sort order (9,8,6, 7,5,3, 4,2,1)
 * - Colored percentage bars based on position
 * - Three-tier grouping with CSS-based indicators
 * - Balanced distribution percentages
 *
 * Uses Storybook story: panel-statistics-distributiontable--balanced-distribution
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generatePanelDistribution(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match panel width (no excess whitespace)
  // Note: Storybook requires minimum ~600px width to avoid hiding content
  await page.setViewportSize({ width: 600, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-statistics-distributiontable--balanced-distribution",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate trend indicators screenshot
 *
 * Shows all 9 position percentage bars with color-coded trends:
 * - High Performers (9, 8, 6): Green bars
 * - Middle Tier (7, 5, 3): Blue bars
 * - Low Performers (4, 2, 1): Red bars
 * - Labels showing position and color logic
 *
 * Uses Storybook story: panel-statistics-coloredpercentagebar--all-positions-comparison
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateTrendIndicators(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-statistics-coloredpercentagebar--all-positions-comparison",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate grouping indicators screenshot
 *
 * Shows CSS-based grouping design with:
 * - High performers group (green border, light green background)
 * - Middle tier group (blue border, light blue background)
 * - Low performers group (orange/red border, light tint background)
 * - All three groups in a realistic table layout
 * - Percentage labels for each group
 *
 * Uses Storybook story: panel-statistics-groupingindicator--all-groupings-together
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateGroupingIndicators(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-statistics-groupingindicator--all-groupings-together",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate summary cards screenshot
 *
 * Shows the three summary cards at the top of Statistics panel:
 * - Total Employees (primary/blue, with people icon)
 * - Modified Employees (warning/orange, with edit icon)
 * - High Performers (success/green, with star icon)
 * - Responsive grid layout (3 columns)
 *
 * Uses Storybook story: panel-statistics-statisticssummary--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateSummaryCards(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-statistics-statisticssummary--default",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate statistics red flags screenshot
 *
 * Shows the Statistics panel distribution table with problematic patterns:
 * - Skewed distribution (not balanced)
 * - Red flags indicating potential issues
 * - Three-tier grouping with warning indicators
 *
 * Uses Storybook story: panel-statistics-distributiontable--skewed-distribution
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateStatisticsRedFlags(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-statistics-distributiontable--skewed-distribution",
    outputPath,
    theme: "dark",
    waitTime: 800,
    selector: '[data-testid="distribution-table"]',
  });
}

/**
 * Generate distribution table screenshot for docs
 *
 * Shows the 9-box distribution table with:
 * - All 9 positions with counts and percentages
 * - Colored bars indicating tier groupings
 * - Balanced distribution for healthy example
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateDistributionTable(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 600, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-statistics-distributiontable--balanced-distribution",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}
