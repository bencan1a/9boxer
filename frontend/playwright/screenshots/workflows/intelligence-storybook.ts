/**
 * Intelligence Storybook Screenshot Workflow
 *
 * Generates screenshots for Intelligence documentation using Storybook stories.
 * Captures the 4 bias detector sections:
 * - Location bias
 * - Job function bias
 * - Job level bias
 * - Tenure bias
 */

import { Page } from "@playwright/test";
import { captureStorybookScreenshot } from "../storybook-screenshot";

/**
 * Generate Location Bias detector screenshot
 *
 * Shows the AnomalySection component with location analysis data.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateLocationBias(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-intelligence-anomalysection--location-bias-detector",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate Job Function Bias detector screenshot
 *
 * Shows the AnomalySection component with function analysis data.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFunctionBias(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-intelligence-anomalysection--function-bias-detector",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate Job Level Bias detector screenshot
 *
 * Shows the AnomalySection component with level analysis data.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateLevelBias(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-intelligence-anomalysection--level-bias-detector",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate Tenure Bias detector screenshot
 *
 * Shows the AnomalySection component with tenure analysis data.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateTenureBias(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-intelligence-anomalysection--tenure-bias-detector",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate Intelligence tab location screenshot
 *
 * Shows the right panel with the Intelligence tab selected and actual
 * Intelligence content (IntelligenceSummary with quality score and anomaly cards).
 * Uses wider viewport to avoid scrunching the content.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateIntelligenceTabLocation(
  page: Page,
  outputPath: string
): Promise<void> {
  // Wider viewport to accommodate Intelligence content without scrunching
  await page.setViewportSize({ width: 800, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-tabs--intelligence-selected",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}

/**
 * Generate Intelligence quality score screenshot
 *
 * Shows the quality score display at the top of the Intelligence panel,
 * including the overall score (0-100) with color indicator.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateIntelligenceQualityScore(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 600, height: 400 });

  await captureStorybookScreenshot(page, {
    storyId:
      "app-right-panel-intelligence-intelligencesummary--needs-attention",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate Intelligence anomaly card detail screenshot
 *
 * Shows a detailed anomaly card view with dimension, expected vs actual counts,
 * deviation amount, and affected categories.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateIntelligenceAnomalyCardDetail(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 600, height: 800 });

  await captureStorybookScreenshot(page, {
    storyId: "app-right-panel-intelligence-anomalysection--red-status",
    outputPath,
    theme: "dark",
    waitTime: 1000,
  });
}
