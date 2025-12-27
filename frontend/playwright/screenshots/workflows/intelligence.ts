/**
 * Intelligence Panel Screenshot Workflow
 *
 * Generates screenshots showing the Intelligence tab with anomalies,
 * insights, and distribution analysis.
 */

import { Page } from "@playwright/test";
import { uploadExcelFile } from "../../helpers/upload";
import { clickTabAndWait, waitForUiSettle } from "../../helpers/ui";

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
  // Upload sample data that will generate anomalies
  await uploadExcelFile(page, "Sample_People_List.xlsx");

  // Wait for upload to complete
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
  // Upload sample data with ideal distribution
  await uploadExcelFile(page, "Sample_People_List.xlsx");

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
