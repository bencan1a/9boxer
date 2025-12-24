import { Page, expect } from "@playwright/test";

/**
 * Wait for network idle and UI settle time
 *
 * Combines waitForLoadState('networkidle') with a configurable settle duration
 * to ensure that both network requests and UI animations/React updates have completed.
 * This is more reliable than waitForLoadState alone, especially with Material-UI animations.
 *
 * @param page - Playwright Page object
 * @param duration - Settle time in seconds (default: 0.5)
 * @example
 * await waitForUiSettle(page); // Uses default 0.5s settle time
 * await waitForUiSettle(page, 1.0); // Uses 1s settle time for slower operations
 */
export async function waitForUiSettle(
  page: Page,
  duration: number = 0.5,
): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(duration * 1000);
}

/**
 * Comprehensive dialog and overlay cleanup
 *
 * Uses a 5-strategy approach to robustly close all open dialogs and overlays:
 * 1. Close file menu if open
 * 2. Remove Material-UI backdrops
 * 3. Hide open menus
 * 4. Press Escape key
 * 5. Click close buttons on dialogs
 *
 * This is particularly useful for ensuring clean test state between operations
 * or when a test needs to recover from an unexpected UI state.
 *
 * @param page - Playwright Page object
 * @example
 * await closeAllDialogsAndOverlays(page);
 */
export async function closeAllDialogsAndOverlays(page: Page): Promise<void> {
  // Strategy 1: Close file menu if open
  const fileMenu = page.locator('[role="menu"]');
  if ((await fileMenu.count()) > 0 && (await fileMenu.isVisible())) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }

  // Strategy 2: Remove Material-UI backdrops
  await page.evaluate(() => {
    const backdrops = document.querySelectorAll(".MuiBackdrop-root");
    backdrops.forEach((backdrop) => backdrop.remove());
  });

  // Strategy 3: Hide open menus by removing them from DOM
  await page.evaluate(() => {
    const menus = document.querySelectorAll('[role="menu"]');
    menus.forEach((menu) => {
      const parent = menu.parentElement;
      if (parent) {
        parent.style.display = "none";
      }
    });
  });

  // Strategy 4: Press Escape key to close any remaining dialogs
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // Strategy 5: Click close buttons on any remaining dialogs
  const closeButtons = page.locator(
    '[aria-label="close"], [data-testid*="close-button"]',
  );
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
 *
 * Clears localStorage and sessionStorage, then reloads the page to ensure
 * a fresh application state. Useful for tests that need to start from scratch
 * without beforeEach upload, or to clean up after a test.
 *
 * @param page - Playwright Page object
 * @example
 * await resetToEmptyState(page);
 * // App is now in initial empty state, ready for upload
 */
export async function resetToEmptyState(page: Page): Promise<void> {
  await page.goto("http://localhost:5173");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await waitForUiSettle(page, 0.5);
}

/**
 * Toggle donut mode on/off (idempotent)
 *
 * Checks the current aria-pressed state before toggling to ensure the
 * desired state is achieved. This prevents double-toggle issues and makes
 * the function safe to call multiple times with the same desired state.
 *
 * @param page - Playwright Page object
 * @param enabled - Target state (true = donut mode on, false = donut mode off)
 * @example
 * await toggleDonutMode(page, true);  // Enable donut mode
 * await toggleDonutMode(page, false); // Disable donut mode
 * await toggleDonutMode(page, true);  // Safe to call again - no-op if already enabled
 */
export async function toggleDonutMode(
  page: Page,
  enabled: boolean,
): Promise<void> {
  const donutButton = page.locator('[data-testid="donut-view-button"]');
  const isPressed = await donutButton.getAttribute("aria-pressed");

  const needsToggle =
    (enabled && isPressed !== "true") || (!enabled && isPressed === "true");

  if (needsToggle) {
    await donutButton.click();
    await waitForUiSettle(page, 0.5);
  }
}

/**
 * Click tab and wait for content to load
 *
 * Combines tab click with UI settle wait to reduce boilerplate in tests
 * that switch between tabs frequently. Ensures the tab content is fully
 * loaded before proceeding.
 *
 * @param page - Playwright Page object
 * @param tabTestId - The data-testid of the tab to click
 * @param waitDuration - Optional wait duration in seconds (default: 0.5)
 * @example
 * await clickTabAndWait(page, 'changes-tab');
 * await clickTabAndWait(page, 'statistics-tab', 1.0); // Longer wait for heavy tabs
 */
export async function clickTabAndWait(
  page: Page,
  tabTestId: string,
  waitDuration: number = 0.5,
): Promise<void> {
  await page.locator(`[data-testid="${tabTestId}"]`).click();
  await waitForUiSettle(page, waitDuration);
}

/**
 * Open file menu with animation wait
 *
 * Clicks the file menu button and waits for the Material-UI Popover animation
 * to complete (~300ms). This ensures menu items are clickable before proceeding.
 *
 * @param page - Playwright Page object
 * @example
 * await openFileMenu(page);
 * await page.locator('[data-testid="import-data-menu-item"]').click();
 */
export async function openFileMenu(page: Page): Promise<void> {
  await page.locator('[data-testid="file-menu-button"]').click();
  await page.waitForTimeout(300);
}

/**
 * Open filter drawer and wait for visibility
 *
 * Combines filter button click with visibility check to ensure the drawer
 * is fully opened before proceeding. This prevents race conditions when
 * interacting with filter controls.
 *
 * @param page - Playwright Page object
 * @example
 * await openFilterDrawer(page);
 * await page.locator('[data-testid="search-input"]').fill('Alice');
 */
export async function openFilterDrawer(page: Page): Promise<void> {
  await page.locator('[data-testid="filter-button"]').click();
  await expect(page.locator('[data-testid="filter-drawer"]')).toBeVisible();
}
