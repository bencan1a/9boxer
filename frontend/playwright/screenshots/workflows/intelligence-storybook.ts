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
