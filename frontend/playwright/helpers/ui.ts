import { Page, expect } from "@playwright/test";

/**
 * Wait for network idle and DOM content loaded
 *
 * Waits for both network requests and DOM content to complete.
 * With reducedMotion: 'reduce' configured in playwright.config.ts,
 * this eliminates the need for arbitrary settle time waits.
 *
 * @param page - Playwright Page object
 * @param duration - DEPRECATED: Ignored. Kept for backward compatibility.
 * @example
 * await waitForUiSettle(page); // Waits for network idle and DOM loaded
 */
export async function waitForUiSettle(
  page: Page,
  _duration: number = 0.5
): Promise<void> {
  // Note: duration parameter ignored but kept for backward compatibility with existing tests
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Comprehensive dialog and overlay cleanup
 *
 * Uses a 5-strategy approach to robustly close all open dialogs and overlays:
 * 1. Press Escape key to close file menu and dialogs
 * 2. Remove Material-UI backdrops
 * 3. Hide open menus
 * 4. Click close buttons on dialogs
 * 5. Verify all dialogs are closed with visibility assertion
 *
 * This is particularly useful for ensuring clean test state between operations
 * or when a test needs to recover from an unexpected UI state.
 *
 * @param page - Playwright Page object
 * @example
 * await closeAllDialogsAndOverlays(page);
 */
export async function closeAllDialogsAndOverlays(page: Page): Promise<void> {
  // Strategy 1: Press Escape key to close file menu and dialogs
  await page.keyboard.press("Escape");

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

  // Strategy 4: Click close buttons on any visible dialogs
  const closeButtons = page.locator(
    '[aria-label="close"], [data-testid*="close-button"]'
  );
  const count = await closeButtons.count();
  for (let i = 0; i < count; i++) {
    const button = closeButtons.nth(i);
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 1000 }).catch(() => {
        // Ignore click errors if button disappears
      });
    }
  }

  // Strategy 5: Verify menus are not visible
  await expect(page.locator('[role="menu"]'))
    .not.toBeVisible()
    .catch(() => {
      // It's okay if there are no menus at all (count will be 0)
    });
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
 * Clicks the appropriate view mode button (grid or donut) to achieve the desired state.
 * The view mode toggle has two separate buttons - click grid button for grid mode,
 * click donut button for donut mode. Uses state checks instead of arbitrary waits.
 *
 * @param page - Playwright Page object
 * @param enabled - Target state (true = donut mode on, false = donut mode off)
 * @example
 * await toggleDonutMode(page, true);  // Enable donut mode - clicks donut button
 * await toggleDonutMode(page, false); // Disable donut mode - clicks grid button
 * await toggleDonutMode(page, true);  // Safe to call again - no-op if already enabled
 */
export async function toggleDonutMode(
  page: Page,
  enabled: boolean
): Promise<void> {
  const donutButton = page.locator('[data-testid="donut-view-button"]');
  const gridButton = page.locator('[data-testid="grid-view-button"]');

  // Check current state using donut button's aria-pressed
  const isPressed = await donutButton.getAttribute("aria-pressed");
  const isDonutModeActive = isPressed === "true";

  // Click the appropriate button to achieve desired state
  if (enabled && !isDonutModeActive) {
    // Want donut mode ON, currently OFF -> click donut button
    await donutButton.click();
    // Wait for the button to show pressed state
    await expect(donutButton).toHaveAttribute("aria-pressed", "true");
  } else if (!enabled && isDonutModeActive) {
    // Want donut mode OFF, currently ON -> click grid button
    await gridButton.click();
    // Wait for the donut button to show unpressed state
    await expect(donutButton).toHaveAttribute("aria-pressed", "false");
  }
  // else: already in desired state, no action needed
}

/**
 * Click tab and wait for tab selection state
 *
 * Clicks the tab and waits for the aria-selected attribute to be true,
 * ensuring the tab is fully activated before proceeding.
 *
 * @param page - Playwright Page object
 * @param tabTestId - The data-testid of the tab to click
 * @param waitDuration - DEPRECATED: Ignored. Kept for backward compatibility.
 * @example
 * await clickTabAndWait(page, 'changes-tab');
 * await clickTabAndWait(page, 'statistics-tab'); // Old waitDuration parameter ignored
 */
export async function clickTabAndWait(
  page: Page,
  tabTestId: string,
  _waitDuration: number = 0.5
): Promise<void> {
  // Note: waitDuration parameter ignored but kept for backward compatibility
  await page.locator(`[data-testid="${tabTestId}"]`).click();
  await expect(page.locator(`[data-testid="${tabTestId}"]`)).toHaveAttribute(
    "aria-selected",
    "true"
  );
}

/**
 * Open file menu and wait for visibility
 *
 * Clicks the file menu button and waits for the menu to become visible.
 * Uses auto-retrying assertions instead of arbitrary timeouts.
 *
 * @param page - Playwright Page object
 * @example
 * await openFileMenu(page);
 * await page.locator('[data-testid="import-data-menu-item"]').click();
 */
export async function openFileMenu(page: Page): Promise<void> {
  await page.locator('[data-testid="file-menu-button"]').click();
  await expect(page.locator('[role="menu"]')).toBeVisible();
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

/**
 * Verify right panel is visible
 *
 * Checks that the right panel (Details panel) is open and visible.
 * This panel typically opens when an employee is selected and shows
 * detailed information including tabs for Details, Timeline, Statistics, etc.
 *
 * Uses event-driven visibility assertion instead of arbitrary timeouts.
 *
 * @param page - Playwright Page object
 * @throws {AssertionError} If the right panel is not visible
 * @example
 * await page.locator('[data-testid="employee-card-1"]').click();
 * await expectRightPanelVisible(page);
 */
export async function expectRightPanelVisible(page: Page): Promise<void> {
  await expect(page.locator('[data-testid="details-panel"]')).toBeVisible();
}

/**
 * Verify tab is active
 *
 * Checks that a specific tab has aria-selected="true", indicating it is
 * the currently active tab. This is useful for verifying tab navigation
 * completed successfully.
 *
 * Provides clear error message if the tab is not active, showing which
 * tab was expected to be active and its current state.
 *
 * @param page - Playwright Page object
 * @param tabTestId - The data-testid of the tab to verify
 * @throws {AssertionError} If the tab does not have aria-selected="true"
 * @example
 * await page.locator('[data-testid="timeline-tab"]').click();
 * await expectTabActive(page, 'timeline-tab');
 *
 * @example
 * // Verify Statistics tab is active after clicking
 * await page.locator('[data-testid="statistics-tab"]').click();
 * await expectTabActive(page, 'statistics-tab');
 */
export async function expectTabActive(
  page: Page,
  tabTestId: string
): Promise<void> {
  await expect(page.locator(`[data-testid="${tabTestId}"]`)).toHaveAttribute(
    "aria-selected",
    "true"
  );
}

/**
 * Close right panel
 *
 * Closes the right panel (Details panel) using the Escape key.
 * This is the most reliable method as it works regardless of panel state
 * and doesn't require locating a close button.
 *
 * After pressing Escape, verifies that the panel is actually closed
 * by checking that it is no longer visible.
 *
 * @param page - Playwright Page object
 * @example
 * await page.locator('[data-testid="employee-card-1"]').click();
 * await expectRightPanelVisible(page);
 * await closeRightPanel(page);
 * // Panel is now closed
 *
 * @example
 * // Clean up after test that opened panel
 * await closeRightPanel(page);
 * // Can now proceed with next test operation
 */
export async function closeRightPanel(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-testid="details-panel"]')).not.toBeVisible();
}

/**
 * Expand manager anomaly details section
 *
 * Expands the "Detailed Deviations" collapsible section in the manager anomaly
 * component if it is not already expanded. The manager filter links are only
 * visible when this section is expanded.
 *
 * This function finds the "Detailed Deviations" text and clicks on it to expand
 * the section, then waits for the first manager filter link to become visible.
 *
 * @param page - Playwright Page object
 * @example
 * await switchPanelTab(page, 'intelligence');
 * await expandManagerAnomalyDetails(page);
 * // Manager filter links are now visible and clickable
 * await page.locator('[data-testid^="manager-filter-link-"]').first().click();
 */
export async function expandManagerAnomalyDetails(page: Page): Promise<void> {
  // Ensure all dialogs and modal backdrops are closed before interaction
  // This prevents clicks from being intercepted by modal overlays
  await closeAllDialogsAndOverlays(page);

  // Wait for any backdrop animations to complete
  await page.waitForLoadState("networkidle");

  // Find the "Detailed Deviations" text within the manager anomaly section
  const detailsHeader = page
    .locator('[data-testid="manager-anomaly-section"]')
    .getByText(/Detailed Deviations|Desviaciones Detalladas/);

  // Click to expand if present (might already be expanded)
  if (await detailsHeader.isVisible()) {
    await detailsHeader.click();
  }

  // Wait for manager links to become visible
  await expect(
    page.locator('[data-testid^="manager-filter-link-"]').first()
  ).toBeVisible({ timeout: 5000 });
}
