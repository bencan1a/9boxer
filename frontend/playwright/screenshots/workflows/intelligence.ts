/**
 * Intelligence Panel Screenshot Workflow
 *
 * Generates screenshots showing the Intelligence tab with anomalies,
 * insights, and distribution analysis.
 *
 * This workflow now uses Storybook stories for component-level screenshots
 * (IntelligenceSummary, AnomalySection, DeviationChart, LevelDistributionChart)
 * for faster, more reliable, and isolated documentation screenshots.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { clickTabAndWait, waitForUiSettle } from "../../helpers/ui";
import { captureStorybookScreenshot } from "../storybook-screenshot";

/**
 * Captures screenshot of Intelligence Panel showing anomalies and insights.
 *
 * Screenshot: calibration-intelligence-anomalies.png
 * Shows: Intelligence tab with populated anomalies and insights sections
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateIntelligenceAnomalies(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data that will generate anomalies
  await loadSampleData(page);

  // Wait for data load to complete
  await page.waitForSelector('[data-testid="nine-box-grid"]', {
    timeout: 10000,
  });

  // Navigate to Intelligence tab
  await clickTabAndWait(page, "intelligence-tab");

  // Wait for Intelligence sections to load
  await page.waitForSelector('[data-testid="anomalies-section"]', {
    timeout: 5000,
  });
  await page.waitForSelector('[data-testid="insights-section"]', {
    timeout: 5000,
  });

  // Allow a moment for any animations to complete
  await waitForUiSettle(page);

  // Capture screenshot of the Intelligence panel
  const rightPanel = page.locator('[data-testid="right-panel"]');
  await rightPanel.screenshot({ path: outputPath });
}

/**
 * Captures screenshot of distribution chart with ideal distribution.
 *
 * Screenshot: distribution-chart-ideal.png (optional)
 * Shows: Distribution section with ideal talent spread
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function captureDistributionChartIdeal(
  page: Page,
  outputPath: string
): Promise<void> {
  // Load sample data with ideal distribution
  await loadSampleData(page);

  await page.waitForSelector('[data-testid="nine-box-grid"]', {
    timeout: 10000,
  });

  // Navigate to Intelligence tab
  await clickTabAndWait(page, "intelligence-tab");

  // Wait for distribution section
  await page.waitForSelector('[data-testid="distribution-section"]', {
    timeout: 5000,
  });

  // Focus on distribution section
  const distributionSection = await page.locator(
    '[data-testid="distribution-section"]'
  );
  await distributionSection.scrollIntoViewIfNeeded();

  await waitForUiSettle(page);

  // Capture screenshot (cropped to distribution section)
  await distributionSection.screenshot({ path: outputPath });
}

// ============================================================================
// Storybook-based Intelligence Component Screenshots
// ============================================================================

/**
 * IntelligenceSummary with excellent quality score (85+)
 *
 * Screenshot: intelligence-summary-excellent.png
 * Shows: Summary cards with high quality score, green status, low anomaly count
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function intelligenceSummaryExcellent(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "intelligence-intelligencesummary--excellent-quality",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * IntelligenceSummary with low quality score (<50) needing attention
 *
 * Screenshot: intelligence-summary-needs-attention.png
 * Shows: Summary cards with low quality score, red status, high anomaly count
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function intelligenceSummaryNeedsAttention(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "intelligence-intelligencesummary--needs-attention",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * AnomalySection with green status (no significant issues)
 *
 * Screenshot: intelligence-anomaly-green.png
 * Shows: Green status chip, p > 0.05, all deviations within expected range
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function intelligenceAnomalyGreen(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "intelligence-anomalysection--green-status",
    outputPath,
    theme: "light",
    waitTime: 800, // Allow chart animations
  });
}

/**
 * AnomalySection with red status (severe anomaly, p < 0.01)
 *
 * Screenshot: intelligence-anomaly-red.png
 * Shows: Red status chip, low p-value, significant deviations requiring attention
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function intelligenceAnomalyRed(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "intelligence-anomalysection--red-status",
    outputPath,
    theme: "light",
    waitTime: 800, // Allow chart animations
  });
}

/**
 * DeviationChart showing mixed significance levels
 *
 * Screenshot: intelligence-deviation-chart.png
 * Shows: Bar chart with green/yellow/red bars showing varying statistical significance
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function intelligenceDeviationChart(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "intelligence-deviationchart--mixed-significance",
    outputPath,
    theme: "light",
    waitTime: 800, // Allow chart animations
  });
}

/**
 * LevelDistributionChart showing normal distribution across levels
 *
 * Screenshot: intelligence-level-distribution.png
 * Shows: Stacked bar chart with Low/Medium/High performance distribution by job level
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function intelligenceLevelDistribution(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "intelligence-leveldistributionchart--normal-distribution",
    outputPath,
    theme: "light",
    waitTime: 800, // Allow chart animations
  });
}
