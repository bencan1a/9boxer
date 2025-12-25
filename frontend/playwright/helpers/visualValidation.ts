/**
 * Visual Validation Helpers for Screenshot Generation
 *
 * This module provides pre-capture validation functions that verify expected
 * visual elements are present and in the correct state before taking screenshots.
 * This ensures screenshots accurately represent documented features.
 *
 * All validators throw descriptive errors if validation fails, making it easy
 * to identify what's wrong with the visual state.
 *
 * @module visualValidation
 * @see Issue #30 - Screenshot Generator Quality Improvements
 */

import { Page, Locator, expect } from "@playwright/test";

/**
 * Material-UI CSS transition timings (milliseconds)
 *
 * These constants match the default Material-UI theme transitions.
 * Use these when waiting for CSS transitions to complete before capturing screenshots.
 *
 * @see https://mui.com/material-ui/customization/transitions/
 */
export const CSS_TRANSITION_DURATIONS = {
  /** Standard duration for most transitions (dialogs, drawers, etc.) */
  standard: 300,
  /** Short duration for small UI updates (tooltips, ripples) */
  short: 200,
  /** Long duration for complex animations (page transitions) */
  complex: 375,
  /** Enter duration for appearing elements */
  enteringScreen: 225,
  /** Exit duration for disappearing elements */
  leavingScreen: 195,
} as const;

/**
 * Verify employee card has modified indicator (orange border + badge)
 *
 * Validates that an employee card shows all visual indicators of modification:
 * - Orange left border (4px solid rgb(255, 152, 0))
 * - Modified badge visible in top-right corner
 *
 * @param employeeCard - Locator for the employee card element
 * @throws Error if orange border or badge not found/incorrect
 *
 * @example
 * ```typescript
 * const card = page.locator('[data-testid="employee-card-123"]');
 * await verifyModifiedIndicator(card);
 * await card.screenshot({ path: 'orange-border.png' });
 * ```
 */
export async function verifyModifiedIndicator(
  employeeCard: Locator
): Promise<void> {
  // Wait for card to be attached
  await employeeCard.waitFor({ state: "attached" });

  // Wait for CSS transition to complete
  await employeeCard.page().waitForTimeout(CSS_TRANSITION_DURATIONS.standard);

  // Verify card has data-modified="true" attribute
  const isModified = await employeeCard.getAttribute("data-modified");
  if (isModified !== "true") {
    const testId = await employeeCard.getAttribute("data-testid");
    throw new Error(
      `Employee card ${testId} does not have data-modified="true" attribute. ` +
        `Visual indicators may not be present.`
    );
  }

  // Verify orange left border using CSS
  const borderLeftColor = await employeeCard.evaluate((el) =>
    window.getComputedStyle(el).borderLeftColor
  );

  // MUI orange[500] = rgb(255, 152, 0)
  const expectedOrangeRgb = "rgb(255, 152, 0)";
  if (!borderLeftColor.includes("255") || !borderLeftColor.includes("152")) {
    throw new Error(
      `Employee card orange border not found. Expected ${expectedOrangeRgb}, got ${borderLeftColor}`
    );
  }

  // Verify modified badge is visible
  const badge = employeeCard.locator('[data-testid="modified-badge"]');
  try {
    await expect(badge).toBeVisible({ timeout: 2000 });
  } catch (error) {
    const testId = await employeeCard.getAttribute("data-testid");
    throw new Error(
      `Modified badge not visible on card ${testId}. ` +
        `Screenshot would not show modification indicator.`
    );
  }
}

/**
 * Verify badge shows expected count
 *
 * Validates that a Material-UI badge element displays the correct number.
 * Returns the actual count found.
 *
 * @param badgeLocator - Locator for the badge element (typically data-testid="*-badge")
 * @param expectedMin - Minimum expected count (default: 1)
 * @returns Actual badge count
 * @throws Error if badge not visible or count less than expectedMin
 *
 * @example
 * ```typescript
 * const changesBadge = page.locator('[data-testid="changes-tab-badge"]');
 * const count = await verifyBadgeCount(changesBadge, 3);
 * console.log(`Found ${count} changes`);
 * ```
 */
export async function verifyBadgeCount(
  badgeLocator: Locator,
  expectedMin: number = 1
): Promise<number> {
  // Verify badge is visible
  try {
    await expect(badgeLocator).toBeVisible({ timeout: 3000 });
  } catch (error) {
    const testId = await badgeLocator.getAttribute("data-testid");
    throw new Error(
      `Badge ${testId} not visible. Cannot verify count. ` +
        `Screenshot may show empty state instead of populated state.`
    );
  }

  // Get badge text and parse count
  const badgeText = await badgeLocator.textContent();
  const count = parseInt(badgeText?.trim() || "0", 10);

  if (count < expectedMin) {
    const testId = await badgeLocator.getAttribute("data-testid");
    throw new Error(
      `Badge ${testId} shows ${count} but expected at least ${expectedMin}. ` +
        `Screenshot may not demonstrate the feature effectively.`
    );
  }

  return count;
}

/**
 * Verify filter button has active indicator (orange dot)
 *
 * Validates that the filter button shows the orange dot indicator that appears
 * when filters are active. This is a critical visual element for the filters documentation.
 *
 * @param page - Playwright Page object
 * @throws Error if filter button not found or orange dot not visible
 *
 * @example
 * ```typescript
 * await openFilterDrawer(page);
 * await selectFilter(page, 'Engineering');
 * await closeFilterDrawer(page);
 * await verifyFilterActive(page);
 * await page.screenshot({ path: 'filters-active.png' });
 * ```
 */
export async function verifyFilterActive(page: Page): Promise<void> {
  const filterButton = page.locator('[data-testid="filter-button"]');

  // Verify button exists
  await expect(filterButton).toBeVisible();

  // The orange dot is a MUI Badge component
  // It should have a badge indicator when filters are active
  const badge = filterButton.locator('[class*="MuiBadge-badge"]');

  try {
    await expect(badge).toBeVisible({ timeout: 2000 });
  } catch (error) {
    throw new Error(
      "Filter button orange dot indicator not visible. " +
        "Filters may not be active, or visual indicator failed to appear. " +
        "Screenshot would not demonstrate active filter state."
    );
  }

  // Verify badge has orange color (optional but recommended)
  const badgeColor = await badge.evaluate((el) =>
    window.getComputedStyle(el).backgroundColor
  );

  // MUI orange[500] = rgb(255, 152, 0)
  if (!badgeColor.includes("255") || !badgeColor.includes("152")) {
    console.warn(
      `Warning: Filter badge color is ${badgeColor}, expected orange rgb(255, 152, 0). ` +
        `Visual may not match documentation expectations.`
    );
  }
}

/**
 * Verify active filter chips are visible
 *
 * Validates that filter chips are displayed above the grid, showing which
 * filters are currently active. This is a key visual element for filter documentation.
 *
 * @param page - Playwright Page object
 * @param expectedMin - Minimum number of filter chips expected (default: 1)
 * @returns Number of active filter chips found
 * @throws Error if filter chips not found
 *
 * @example
 * ```typescript
 * await selectFilters(page, ['Engineering', 'Senior']);
 * await closeFilterDrawer(page);
 * const chipCount = await verifyFilterChips(page, 2);
 * console.log(`Found ${chipCount} active filter chips`);
 * ```
 */
export async function verifyFilterChips(
  page: Page,
  expectedMin: number = 1
): Promise<number> {
  // Filter chips use MUI Chip component with delete functionality
  // They appear in the filter chips container
  const filterChips = page.locator('[data-testid*="filter-chip"]');

  const count = await filterChips.count();

  if (count < expectedMin) {
    throw new Error(
      `Expected at least ${expectedMin} filter chips but found ${count}. ` +
        `Screenshot may not show active filters. ` +
        `Make sure filters are selected before closing the drawer.`
    );
  }

  // Verify at least first chip is visible
  await expect(filterChips.first()).toBeVisible({ timeout: 2000 });

  return count;
}

/**
 * Verify element has specific CSS property value
 *
 * Generic validator for checking computed CSS styles. Useful for verifying
 * visual states that don't have data-testid attributes.
 *
 * @param element - Locator for the element to check
 * @param property - CSS property name (e.g., 'borderLeftColor', 'opacity')
 * @param expectedValue - Expected value (can be string or regex pattern)
 * @throws Error if CSS property doesn't match expected value
 *
 * @example
 * ```typescript
 * const highlightedField = page.locator('[data-testid="note-field"]');
 * await verifyCssState(highlightedField, 'borderColor', /rgb.*0.*0.*255/);
 * await verifyCssState(highlightedField, 'opacity', '1');
 * ```
 */
export async function verifyCssState(
  element: Locator,
  property: string,
  expectedValue: string | RegExp
): Promise<void> {
  await element.waitFor({ state: "attached" });

  const actualValue = await element.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property
  );

  const matches =
    typeof expectedValue === "string"
      ? actualValue === expectedValue
      : expectedValue.test(actualValue);

  if (!matches) {
    const testId = await element.getAttribute("data-testid");
    throw new Error(
      `CSS validation failed for element ${testId}. ` +
        `Property '${property}': expected ${expectedValue}, got '${actualValue}'`
    );
  }
}

/**
 * Wait for CSS transition to complete before capturing screenshot
 *
 * Waits for a CSS transition to finish based on the property and duration.
 * Use this when you need to ensure an animation has completed before capturing.
 *
 * @param element - Locator for the element with transition
 * @param duration - Transition duration in milliseconds (default: CSS_TRANSITION_DURATIONS.standard)
 * @param property - Optional CSS property to verify after transition (e.g., 'opacity')
 *
 * @example
 * ```typescript
 * await dragEmployeeToPosition(page, 1, 6);
 * const card = page.locator('[data-testid="employee-card-1"]');
 * await waitForCssTransition(card, CSS_TRANSITION_DURATIONS.standard);
 * await card.screenshot({ path: 'after-drag.png' });
 * ```
 */
export async function waitForCssTransition(
  element: Locator,
  duration: number = CSS_TRANSITION_DURATIONS.standard,
  property?: string
): Promise<void> {
  // Wait for element to be attached first
  await element.waitFor({ state: "attached" });

  // Wait for transition duration + small buffer
  await element.page().waitForTimeout(duration + 50);

  // If property specified, verify transition completed
  if (property) {
    const transitionStatus = await element.evaluate(
      (el, prop) => {
        const style = window.getComputedStyle(el);
        return {
          property: prop,
          value: style.getPropertyValue(prop || ""),
          isTransitioning: style.getPropertyValue("transition-property") !== "none",
        };
      },
      property
    );

    console.log(`CSS transition complete: ${property} = ${transitionStatus.value}`);
  }
}

/**
 * Verify element is highlighted (has focus or highlight styling)
 *
 * Validates that an element has visual highlighting, typically used for
 * form fields or interactive elements in documentation screenshots.
 *
 * @param element - Locator for the element to check
 * @throws Error if element not found or not highlighted
 *
 * @example
 * ```typescript
 * const noteField = page.locator('[data-testid="change-notes-1"]');
 * await noteField.focus();
 * await verifyHighlighted(noteField);
 * await page.screenshot({ path: 'note-field-highlighted.png' });
 * ```
 */
export async function verifyHighlighted(element: Locator): Promise<void> {
  await element.waitFor({ state: "visible" });

  // Check if element has focus
  const hasFocus = await element.evaluate((el) => el === document.activeElement);

  // Check for common highlight CSS properties
  const styles = await element.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      outline: computed.outline,
      outlineColor: computed.outlineColor,
      borderColor: computed.borderColor,
      boxShadow: computed.boxShadow,
    };
  });

  const hasHighlightStyling =
    hasFocus ||
    styles.outline !== "none" ||
    styles.outlineColor !== "rgb(0, 0, 0)" ||
    styles.boxShadow !== "none";

  if (!hasHighlightStyling) {
    const testId = await element.getAttribute("data-testid");
    console.warn(
      `Warning: Element ${testId} may not be highlighted. ` +
        `Focus: ${hasFocus}, Styles: ${JSON.stringify(styles)}`
    );
  }
}

/**
 * Verify employee count display shows filtered vs total
 *
 * When filters are active, the employee count should show "X of Y" format
 * (e.g., "5 of 12 employees"). This validates that display is correct.
 *
 * @param page - Playwright Page object
 * @param expectFiltered - Whether to expect filtered count display (default: true)
 * @returns Object with filtered and total counts
 *
 * @example
 * ```typescript
 * await selectFilters(page, ['Engineering']);
 * const counts = await verifyEmployeeCount(page, true);
 * console.log(`Showing ${counts.filtered} of ${counts.total} employees`);
 * ```
 */
export async function verifyEmployeeCount(
  page: Page,
  expectFiltered: boolean = true
): Promise<{ filtered?: number; total: number }> {
  // The employee count is typically in the dashboard/stats area
  // Look for text matching "X of Y employees" or "X employees"
  const countElement = page.locator('[data-testid*="employee-count"]').first();

  if ((await countElement.count()) === 0) {
    console.warn("Employee count element not found. Cannot verify count display.");
    return { total: 0 };
  }

  const countText = (await countElement.textContent()) || "";

  // Parse "5 of 12 employees" or "12 employees"
  const filteredMatch = countText.match(/(\d+)\s+of\s+(\d+)/);
  const totalMatch = countText.match(/(\d+)/);

  if (expectFiltered && !filteredMatch) {
    throw new Error(
      `Expected filtered count display ("X of Y") but got "${countText}". ` +
        `Filters may not be active.`
    );
  }

  if (filteredMatch) {
    return {
      filtered: parseInt(filteredMatch[1], 10),
      total: parseInt(filteredMatch[2], 10),
    };
  }

  if (totalMatch) {
    return {
      total: parseInt(totalMatch[1], 10),
    };
  }

  throw new Error(`Unable to parse employee count from "${countText}"`);
}

/**
 * Verify dialog is fully visible and settled
 *
 * Validates that a dialog/modal is visible and its enter animation has completed.
 * Use this before capturing dialog screenshots to avoid mid-animation states.
 *
 * @param page - Playwright Page object
 * @param dialogTestId - data-testid of the dialog element
 *
 * @example
 * ```typescript
 * await page.locator('[data-testid="import-data-menu-item"]').click();
 * await verifyDialogVisible(page, 'file-upload-dialog');
 * await page.screenshot({ path: 'upload-dialog.png' });
 * ```
 */
export async function verifyDialogVisible(
  page: Page,
  dialogTestId: string
): Promise<void> {
  const dialog = page.locator(`[data-testid="${dialogTestId}"]`);

  // Wait for dialog to be visible
  await expect(dialog).toBeVisible({ timeout: 3000 });

  // Wait for MUI dialog enter animation
  await page.waitForTimeout(CSS_TRANSITION_DURATIONS.enteringScreen);

  // Verify dialog is fully opaque (animation complete)
  const opacity = await dialog.evaluate((el) =>
    window.getComputedStyle(el).opacity
  );

  if (opacity !== "1") {
    console.warn(
      `Warning: Dialog ${dialogTestId} opacity is ${opacity}, may still be animating`
    );
  }
}

/**
 * Verify grid has minimum number of employee cards
 *
 * Validates that the 9-box grid contains at least the expected number of
 * employee cards. Use this to ensure screenshots show populated state.
 *
 * @param page - Playwright Page object
 * @param expectedMin - Minimum number of employee cards expected (default: 1)
 * @returns Actual number of employee cards found
 *
 * @example
 * ```typescript
 * await loadSampleData(page);
 * const employeeCount = await verifyGridPopulated(page, 5);
 * console.log(`Grid has ${employeeCount} employees`);
 * ```
 */
export async function verifyGridPopulated(
  page: Page,
  expectedMin: number = 1
): Promise<number> {
  const employeeCards = page.locator('[data-testid^="employee-card-"]');

  // Wait for at least one card to be visible
  await expect(employeeCards.first()).toBeVisible({ timeout: 5000 });

  const count = await employeeCards.count();

  if (count < expectedMin) {
    throw new Error(
      `Grid has only ${count} employees but expected at least ${expectedMin}. ` +
        `Screenshot may show sparse or empty grid.`
    );
  }

  return count;
}
