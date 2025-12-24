/**
 * UI interaction helpers for Playwright tests
 * Provides reusable functions for common UI operations
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for network idle + UI settle time
 * Combines waitForLoadState('networkidle') with configurable settle duration
 */
export async function waitForUiSettle(page: Page, duration: number = 0.5): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(duration * 1000);
}

/**
 * Comprehensive dialog and overlay cleanup
 * Uses 5-strategy approach:
 * 1. Close file menu if open
 * 2. Remove Material-UI backdrops
 * 3. Hide open menus
 * 4. Press Escape key
 * 5. Click close buttons on dialogs
 */
export async function closeAllDialogsAndOverlays(page: Page): Promise<void> {
  // Strategy 1: Close file menu if open
  const fileMenuButton = page.locator('[data-testid="file-menu-button"]');
  if (await fileMenuButton.getAttribute('aria-expanded') === 'true') {
    await fileMenuButton.click();
    await page.waitForTimeout(300);
  }

  // Strategy 2: Remove Material-UI backdrops
  await page.evaluate(() => {
    const backdrops = document.querySelectorAll('.MuiBackdrop-root, .MuiModal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
  });

  // Strategy 3: Hide open menus
  await page.evaluate(() => {
    const menus = document.querySelectorAll('[role="menu"]');
    menus.forEach(menu => {
      if (menu instanceof HTMLElement) {
        menu.style.display = 'none';
      }
    });
  });

  // Strategy 4: Press Escape key
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // Strategy 5: Click close buttons on dialogs
  const closeButtons = page.locator('[data-testid*="close"], [aria-label*="close" i]');
  const count = await closeButtons.count();
  for (let i = 0; i < count; i++) {
    const button = closeButtons.nth(i);
    if (await button.isVisible()) {
      await button.click();
      await page.waitForTimeout(200);
    }
  }
}

/**
 * Reset to clean empty state
 * Clears localStorage/sessionStorage and reloads page
 * Useful for tests that need fresh state without beforeEach upload
 */
export async function resetToEmptyState(page: Page): Promise<void> {
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await waitForUiSettle(page, 0.5);
}

/**
 * Toggle donut mode on/off (idempotent)
 * Checks aria-pressed before toggling to avoid double-toggle
 */
export async function toggleDonutMode(page: Page, enabled: boolean): Promise<void> {
  const donutButton = page.locator('[data-testid="donut-view-button"]');
  const isPressed = await donutButton.getAttribute('aria-pressed');

  const needsToggle = (enabled && isPressed !== 'true') ||
                       (!enabled && isPressed === 'true');

  if (needsToggle) {
    await donutButton.click();
    await waitForUiSettle(page, 0.5);
  }
}

/**
 * Click tab and wait for content to load
 * Reduces boilerplate in tests with many tab switches
 */
export async function clickTabAndWait(
  page: Page,
  tabTestId: string,
  waitDuration: number = 0.5
): Promise<void> {
  await page.locator(`[data-testid="${tabTestId}"]`).click();
  await waitForUiSettle(page, waitDuration);
}

/**
 * Open file menu with animation wait
 * Material-UI Popover animation is ~300ms
 */
export async function openFileMenu(page: Page): Promise<void> {
  await page.locator('[data-testid="file-menu-button"]').click();
  await page.waitForTimeout(300);
}

/**
 * Open filter drawer and wait for visibility
 * Combines click + visibility check
 */
export async function openFilterDrawer(page: Page): Promise<void> {
  await page.locator('[data-testid="filter-button"]').click();
  await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();
}
