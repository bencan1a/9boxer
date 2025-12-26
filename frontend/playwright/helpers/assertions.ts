/**
 * Test assertion and utility helpers for Playwright E2E tests
 *
 * These helpers provide safe, reusable utilities for common test operations
 * like extracting data from UI elements and setting up test preconditions.
 */

import { Page, Locator } from "@playwright/test";
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

      // Add longer stabilization between consecutive drags (per issue #29)
      // This prevents race conditions when creating multiple changes
      await page.waitForTimeout(1000);

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
