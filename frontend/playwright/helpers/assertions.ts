/**
 * Test assertion and utility helpers for Playwright tests
 * Provides functions for common test assertions and data extraction
 */

import { Page, Locator } from '@playwright/test';
import { waitForUiSettle } from './ui';

/**
 * Get badge count from Material-UI badge
 * Returns 0 if badge not found or no text
 * Safe with error handling to prevent flakiness
 */
export async function getBadgeCount(page: Page, badgeSelector: string): Promise<number> {
  try {
    const badge = page.locator(`[data-testid="${badgeSelector}"]`);
    if (await badge.count() > 0) {
      const text = await badge.textContent() || '0';
      return parseInt(text.trim(), 10) || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Extract employee ID from employee card testid
 * Parses data-testid="employee-card-{id}" format
 */
export async function getEmployeeIdFromCard(employeeCard: Locator): Promise<number> {
  const testId = await employeeCard.getAttribute('data-testid');
  const match = testId?.match(/employee-card-(\d+)/);
  return parseInt(match?.[1] || '0', 10);
}

/**
 * Ensure minimum changes exist for test preconditions
 * Creates employee movements if current count < minChanges
 * Returns number of changes created
 */
export async function ensureChangesExist(
  page: Page,
  minChanges: number = 1
): Promise<number> {
  const currentCount = await getBadgeCount(page, 'changes-tab-badge');

  if (currentCount >= minChanges) {
    return 0;
  }

  const needed = minChanges - currentCount;
  for (let i = 0; i < needed; i++) {
    const source = page.locator('[data-testid^="employee-card-"]').nth(i);
    const target = page.locator('[data-testid^="grid-box-"]').nth(i + 1);

    if (await source.count() === 0 || await target.count() === 0) {
      break;
    }

    await source.dragTo(target);
    await waitForUiSettle(page, 0.5);
  }

  return needed;
}
