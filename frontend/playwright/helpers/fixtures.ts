/**
 * Data loading helpers for Playwright tests
 * Provides functions to load test data fixtures
 */

import { Page } from '@playwright/test';
import { uploadExcelFile } from './upload';

/**
 * Load calibration sample data
 * Uses calibration-sample.xlsx with realistic distribution
 * Ideal for statistics, intelligence, calibration workflow tests
 */
export async function loadCalibrationData(page: Page): Promise<void> {
  await uploadExcelFile(page, 'calibration-sample.xlsx');
}

/**
 * Load basic sample data
 * Uses sample-employees.xlsx with simple employee data
 * Ideal for basic grid, quickstart, general feature tests
 */
export async function loadSampleData(page: Page): Promise<void> {
  await uploadExcelFile(page, 'sample-employees.xlsx');
}
