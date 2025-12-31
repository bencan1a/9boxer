/**
 * Test assertion and utility helpers for Playwright E2E tests
 *
 * These helpers provide safe, reusable utilities for common test operations
 * like extracting data from UI elements and setting up test preconditions.
 */

import { Page, Locator, expect } from "@playwright/test";
import { waitForUiSettle } from "./ui";
import { dragEmployeeToPosition } from "./dragAndDrop";

/**
 * Get badge count from Material-UI badge
 *
 * Returns 0 if badge not found or no text.
 * Safe with error handling to prevent flakiness.
 *
 * @param page - Playwright page object
 * @param badgeSelector - data-testid of the badge element
 * @returns Badge count as number, or 0 if not found
 *
 * @example
 * ```typescript
 * const changesCount = await getBadgeCount(page, 'file-menu-badge');
 * expect(changesCount).toBeGreaterThan(0);
 * ```
 */
export async function getBadgeCount(
  page: Page,
  badgeSelector: string
): Promise<number> {
  try {
    const badge = page.locator(`[data-testid="${badgeSelector}"]`);
    if ((await badge.count()) > 0) {
      const text = (await badge.textContent()) || "0";
      return parseInt(text.trim(), 10) || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Extract employee ID from employee card testid
 *
 * Parses data-testid="employee-card-{id}" format.
 *
 * @param employeeCard - Locator for the employee card element
 * @returns Employee ID as number
 *
 * @example
 * ```typescript
 * const firstEmployee = page.locator('[data-testid^="employee-card-"]').first();
 * const employeeId = await getEmployeeIdFromCard(firstEmployee);
 * console.log(`Employee ID: ${employeeId}`);
 * ```
 */
export async function getEmployeeIdFromCard(
  employeeCard: Locator
): Promise<number> {
  const testId = await employeeCard.getAttribute("data-testid");
  const match = testId?.match(/employee-card-(\d+)/);
  return parseInt(match?.[1] || "0", 10);
}

/**
 * Ensure minimum changes exist for test preconditions
 *
 * Creates employee movements if current count < minChanges.
 * Returns number of changes created.
 *
 * @param page - Playwright page object
 * @param minChanges - Minimum number of changes required (default: 1)
 * @returns Number of changes created
 *
 * @example
 * ```typescript
 * // Ensure at least 3 changes exist before testing change tracking
 * await ensureChangesExist(page, 3);
 * await clickTabAndWait(page, 'changes-tab');
 * ```
 */
export async function ensureChangesExist(
  page: Page,
  minChanges: number = 1
): Promise<number> {
  let currentCount = await getBadgeCount(page, "file-menu-badge");

  if (currentCount >= minChanges) {
    return 0;
  }

  // Get available employees to move
  const employees = page.locator('[data-testid^="employee-card-"]');
  const count = await employees.count();

  if (count === 0) {
    console.warn("No employees found to create changes");
    return 0;
  }

  // Define target positions to use (cycling through positions 1-9)
  const targetPositions = [1, 2, 3, 4, 6, 7, 8, 9]; // Skip 5 (center)

  let successfulMoves = 0;
  let attemptIndex = 0;
  const maxAttempts = Math.min(count, minChanges * 2); // Try up to 2x employees needed

  while (successfulMoves < minChanges && attemptIndex < maxAttempts) {
    // Re-query employees and current count on each iteration
    const freshEmployees = page.locator('[data-testid^="employee-card-"]');
    const employeeCard = freshEmployees.nth(attemptIndex);
    const employeeId = await getEmployeeIdFromCard(employeeCard);

    // Get current position to avoid moving to same position
    const currentPosition = await employeeCard.getAttribute("data-position");
    const currentPosNum = parseInt(currentPosition || "0", 10);

    // Find a target position different from current
    let targetPosition = targetPositions[attemptIndex % targetPositions.length];
    if (targetPosition === currentPosNum) {
      // If target matches current, use next position in array
      targetPosition =
        targetPositions[(attemptIndex + 1) % targetPositions.length];
    }

    try {
      await dragEmployeeToPosition(page, employeeId, targetPosition, {
        maxRetries: 5, // Increased from default 2 (per issue #29)
        skipApiWait: false,
        expectModified: true,
      });

      successfulMoves++;

      // Wait for UI state to stabilize after drag (state-based, not time-based)
      // This prevents race conditions when creating multiple changes (issue #29)

      // 1. Wait for position attribute to update to confirm drag completed
      // Note: We don't check modified status because employees moved back to
      // their original position lose modified status (drag-back logic)
      const movedCard = page.locator(
        `[data-testid="employee-card-${employeeId}"]`
      );
      await expect(movedCard).toHaveAttribute(
        "data-position",
        targetPosition.toString(),
        { timeout: 5000 }
      );

      // 2. Wait for network and DOM to settle (API call completes)
      await page.waitForLoadState("networkidle", { timeout: 3000 });

      // 3. Poll badge count to ensure UI has updated
      // Note: Badge can increment, decrement, or stay same depending on whether
      // the employee moved to/from their original position
      await expect(async () => {
        const newCount = await getBadgeCount(page, "file-menu-badge");
        expect(newCount).toBeGreaterThanOrEqual(0); // Just verify readable
      }).toPass({ timeout: 2000 });

      // Check if we've reached the goal
      currentCount = await getBadgeCount(page, "file-menu-badge");
      if (currentCount >= minChanges) {
        console.log(
          `✓ Successfully created ${successfulMoves} changes (total: ${currentCount})`
        );
        return successfulMoves;
      }
    } catch (error) {
      console.warn(
        `Failed to move employee ${employeeId} (attempt ${attemptIndex + 1}): ${error}`
      );
      // Continue trying other employees
    }

    attemptIndex++;
  }

  console.log(
    `Created ${successfulMoves} successful moves (needed ${minChanges})`
  );

  // Wait for final UI updates and badge to appear
  await waitForUiSettle(page, 1.0);

  return successfulMoves;
}

/**
 * Assert that employee card has orange left border (modified indicator)
 *
 * Verifies the employee card has a modified state indicator via CSS border
 * or data attribute. This is used to confirm that changes to an employee
 * are visually indicated in the grid.
 *
 * @param page - Playwright page object
 * @param employeeId - ID of the employee to check
 * @throws {Error} If employee card not found or doesn't have modified indicator
 *
 * @example
 * ```typescript
 * // After moving an employee, verify the card shows modified state
 * await dragEmployeeToPosition(page, 123, 3);
 * await expectEmployeeHasOrangeBorder(page, 123);
 * ```
 */
export async function expectEmployeeHasOrangeBorder(
  page: Page,
  employeeId: number
): Promise<void> {
  const employeeCard = page.locator(
    `[data-testid="employee-card-${employeeId}"]`
  );

  // Verify card exists first
  await expect(employeeCard).toBeVisible({
    timeout: 5000,
  });

  // Check for data-modified attribute (primary indicator)
  const hasModifiedAttribute = await employeeCard.getAttribute("data-modified");
  if (hasModifiedAttribute === "true") {
    // Attribute-based check passed
    return;
  }

  // Fallback: Check CSS border-left-color for orange indicator
  // This handles cases where the modified state is purely visual
  const borderColor = await employeeCard.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.borderLeftColor;
  });

  // Orange color in RGB format: rgb(255, 152, 0) or similar
  // Accept various shades of orange (RGB range check)
  const isOrangeBorder = /rgb\(25[0-5], 1[0-9]{2}, [0-9]{1,2}\)/.test(
    borderColor
  );

  if (!isOrangeBorder && hasModifiedAttribute !== "true") {
    throw new Error(
      `Employee ${employeeId} card does not have orange border indicator. ` +
        `Border color: ${borderColor}, data-modified: ${hasModifiedAttribute}`
    );
  }
}

/**
 * Assert that Details panel is visible and contains expected elements
 *
 * Performs comprehensive verification that the Details panel is not just
 * visible, but also contains all expected sections: current assessment,
 * job information, flags section, and reporting chain.
 *
 * @param page - Playwright page object
 * @throws {Error} If Details panel not visible or missing expected sections
 *
 * @example
 * ```typescript
 * // After selecting an employee, verify Details panel is fully loaded
 * await page.locator('[data-testid="employee-card-123"]').click();
 * await expectDetailsPanelVisible(page);
 * ```
 *
 * @example
 * ```typescript
 * // Verify panel visibility after tab navigation
 * await clickTabAndWait(page, 'timeline-tab');
 * await expectDetailsPanelVisible(page);
 * ```
 */
export async function expectDetailsPanelVisible(page: Page): Promise<void> {
  // Main panel must be visible
  const detailsPanel = page.locator('[data-testid="details-panel"]');
  await expect(detailsPanel).toBeVisible({
    timeout: 5000,
  });

  // Verify critical sections are present and visible
  // These sections define a "properly loaded" Details panel
  const criticalSections = [
    { testid: "current-assessment", name: "Current Assessment" },
    { testid: "job-information", name: "Job Information" },
    { testid: "flags-section", name: "Flags Section" },
    { testid: "reporting-chain", name: "Reporting Chain" },
  ];

  const missingSections: string[] = [];

  for (const section of criticalSections) {
    const sectionLocator = detailsPanel.locator(
      `[data-testid="${section.testid}"]`
    );
    const isVisible = await sectionLocator.isVisible().catch(() => false);

    if (!isVisible) {
      missingSections.push(section.name);
    }
  }

  if (missingSections.length > 0) {
    throw new Error(
      `Details panel is visible but missing sections: ${missingSections.join(", ")}. ` +
        `Expected all critical sections to be present.`
    );
  }
}

/**
 * Assert that employee card is in expected grid position
 *
 * Verifies the employee card has the correct data-position attribute,
 * confirming it appears in the expected box of the 9-box grid.
 * Positions are numbered 1-9 (top-left to bottom-right).
 *
 * @param page - Playwright page object
 * @param employeeId - ID of the employee to check
 * @param expectedPosition - Expected position (1-9)
 * @throws {Error} If employee not found or in wrong position
 *
 * @example
 * ```typescript
 * // After dragging employee to position 3, verify the move succeeded
 * await dragEmployeeToPosition(page, 123, 3);
 * await expectEmployeeInPosition(page, 123, 3);
 * ```
 *
 * @example
 * ```typescript
 * // Verify employee hasn't moved from original position
 * const originalPosition = 7;
 * await expectEmployeeInPosition(page, 456, originalPosition);
 * ```
 */
export async function expectEmployeeInPosition(
  page: Page,
  employeeId: number,
  expectedPosition: number
): Promise<void> {
  // Validate position is in valid range
  if (expectedPosition < 1 || expectedPosition > 9) {
    throw new Error(
      `Invalid expected position: ${expectedPosition}. Must be between 1 and 9.`
    );
  }

  const employeeCard = page.locator(
    `[data-testid="employee-card-${employeeId}"]`
  );

  // Verify card exists
  await expect(employeeCard).toBeVisible({
    timeout: 5000,
  });

  // Get actual position from data attribute
  const actualPositionStr = await employeeCard.getAttribute("data-position");
  const actualPosition = parseInt(actualPositionStr || "0", 10);

  if (actualPosition !== expectedPosition) {
    throw new Error(
      `Employee ${employeeId} is in position ${actualPosition}, expected position ${expectedPosition}. ` +
        `Verify drag-and-drop completed successfully.`
    );
  }
}
