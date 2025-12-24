/**
 * Statistics Screenshot Workflow
 *
 * Generates screenshots for the Statistics tab showing distribution analysis,
 * ideal vs actual comparisons, and trend indicators.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import {
  closeAllDialogsAndOverlays,
  clickTabAndWait,
  waitForUiSettle,
} from "../../helpers/ui";

/**
 * Generate statistics panel distribution screenshot
 *
 * Shows the Statistics panel with employee distribution across all 9 boxes.
 * Displays the distribution table with counts and percentages.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generatePanelDistribution(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure sample data is loaded
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Click Statistics tab
  await clickTabAndWait(page, "statistics-tab", 0.8);

  // Wait for statistics content to load
  await waitForUiSettle(page, 0.5);

  // Capture the right panel showing statistics
  const rightPanel = page.locator('[data-testid="right-panel"]');
  await rightPanel.waitFor({ state: "visible", timeout: 5000 });
  await rightPanel.screenshot({ path: outputPath });
}

/**
 * Generate ideal vs actual comparison screenshot
 *
 * Shows the comparison chart between ideal distribution (bell curve)
 * and actual employee distribution.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateIdealActualComparison(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure we're on the Statistics tab with data loaded
  const statisticsTab = page.locator('[data-testid="statistics-tab"]');
  const isStatisticsActive = await statisticsTab.getAttribute("aria-selected");

  if (isStatisticsActive !== "true") {
    await loadSampleData(page);
    await closeAllDialogsAndOverlays(page);
    await clickTabAndWait(page, "statistics-tab", 0.8);
  }

  // Wait for charts to render
  await waitForUiSettle(page, 0.5);

  // Look for the comparison chart/section
  const comparisonSection = page.locator(
    '[data-testid="distribution-comparison"]',
  );
  if ((await comparisonSection.count()) > 0) {
    await comparisonSection.screenshot({ path: outputPath });
  } else {
    // Fallback: capture entire statistics panel
    const rightPanel = page.locator('[data-testid="right-panel"]');
    await rightPanel.screenshot({ path: outputPath });
  }
}

/**
 * Generate trend indicators screenshot
 *
 * Shows trend indicators displaying distribution changes over time.
 * Includes arrows and percentages showing movement trends.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateTrendIndicators(
  page: Page,
  outputPath: string,
): Promise<void> {
  // Ensure we're on the Statistics tab with data loaded
  const statisticsTab = page.locator('[data-testid="statistics-tab"]');
  const isStatisticsActive = await statisticsTab.getAttribute("aria-selected");

  if (isStatisticsActive !== "true") {
    await loadSampleData(page);
    await closeAllDialogsAndOverlays(page);
    await clickTabAndWait(page, "statistics-tab", 0.8);
  }

  // Wait for trend indicators to render
  await waitForUiSettle(page, 0.5);

  // Look for trend indicators section
  const trendsSection = page.locator('[data-testid="trend-indicators"]');
  if ((await trendsSection.count()) > 0) {
    await trendsSection.screenshot({ path: outputPath });
  } else {
    // Fallback: capture entire statistics panel
    const rightPanel = page.locator('[data-testid="right-panel"]');
    await rightPanel.screenshot({ path: outputPath });
  }
}
