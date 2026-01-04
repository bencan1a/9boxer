import { Page, expect } from "@playwright/test";

/**
 * Helper function to drag and drop an employee to a different grid position
 *
 * This implementation uses manual mouse events to work with dnd-kit's pointer event handling.
 * Playwright's built-in dragTo() doesn't work reliably with dnd-kit.
 *
 * Key improvements for robustness:
 * - Waits for network requests to complete
 * - Verifies the employee actually moved to target position
 * - Retries if move fails
 * - Provides detailed error messages
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee to move
 * @param targetPosition - The target grid position (1-9)
 * @param options - Optional configuration
 */
export async function dragEmployeeToPosition(
  page: Page,
  employeeId: number,
  targetPosition: number,
  options: {
    maxRetries?: number;
    waitForModifiedIndicator?: boolean;
    isDonutMode?: boolean;
    expectModified?: boolean;
    skipApiWait?: boolean;
  } = {}
): Promise<void> {
  const {
    maxRetries = 2,
    waitForModifiedIndicator: _waitForModifiedIndicator = true,
    isDonutMode = false,
    skipApiWait = false,
  } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Find the employee card
      const employeeCard = page.locator(
        `[data-testid="employee-card-${employeeId}"]`
      );
      await employeeCard.waitFor({ state: "visible", timeout: 5000 });

      // Scroll into view if needed (handles expanded boxes and scrollable containers)
      await employeeCard.scrollIntoViewIfNeeded();

      // Get the bounding box of the employee card
      const cardBox = await employeeCard.boundingBox();
      if (!cardBox) {
        throw new Error(`Employee card ${employeeId} not found`);
      }

      // Find the target grid box
      const targetBox = page.locator(
        `[data-testid="grid-box-${targetPosition}"]`
      );
      await targetBox.waitFor({ state: "visible", timeout: 5000 });

      // Get the bounding box of the target
      const targetBoxBounds = await targetBox.boundingBox();
      if (!targetBoxBounds) {
        throw new Error(`Target grid box ${targetPosition} not found`);
      }

      // Calculate positions
      const startX = cardBox.x + cardBox.width / 2;
      const startY = cardBox.y + cardBox.height / 2;

      // For positions 1, 4, 7 (leftmost column), aim more to the left to avoid ambiguous hit detection
      // This is needed because dnd-kit's collision detection can favor later DOM elements in edge cases
      const isLeftColumn =
        targetPosition === 1 || targetPosition === 4 || targetPosition === 7;
      const horizontalOffset = isLeftColumn ? 0.3 : 0.5; // 30% from left edge instead of 50% (center)

      const endX = targetBoxBounds.x + targetBoxBounds.width * horizontalOffset;
      const endY = targetBoxBounds.y + targetBoxBounds.height / 2;

      // Set up network request listener BEFORE starting drag (unless skipApiWait is true)
      let moveEmployeePromise: Promise<any> | null = null;

      if (!skipApiWait) {
        // Wait for the appropriate endpoint based on mode
        const moveEndpoint = isDonutMode ? "/move-donut" : "/move";
        console.log(
          `Setting up listener for endpoint: ${moveEndpoint}, employee: ${employeeId}, target: ${targetPosition}`
        );

        moveEmployeePromise = page.waitForResponse(
          (response) => {
            const matchesEndpoint = response.url().includes(moveEndpoint);
            const is200 = response.status() === 200;
            if (matchesEndpoint) {
              console.log(
                `  Response received: ${response.url()}, status: ${response.status()}`
              );
            }
            return matchesEndpoint && is200;
          },
          { timeout: 10000 } // 10s timeout per attempt (max 30s total with 3 attempts)
        );
      } else {
        console.log(
          `Skipping API wait for employee: ${employeeId}, target: ${targetPosition} (validating UX state only)`
        );
      }

      // Perform drag operation with mouse events
      // 1. Move to the drag handle area (left side of card)
      await page.mouse.move(cardBox.x + 12, startY);

      // 2. Mouse down to start drag
      await page.mouse.down();

      // 3. Move to target in steps (more realistic, no arbitrary waits)
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const x = startX + (endX - startX) * (i / steps);
        const y = startY + (endY - startY) * (i / steps);
        await page.mouse.move(x, y);
      }

      // 5. Mouse up to drop
      await page.mouse.up();

      // 5a. Brief wait to allow dnd-kit to process the drop event
      // dnd-kit needs to:
      // - Process the pointerup event
      // - Calculate the drop result
      // - Call onDragEnd callback
      // - Which then triggers the API call
      // Without this, we start waiting for API response before the drag completes
      await page.waitForTimeout(100);

      // 6. Wait for the API call to complete (unless we're skipping it)
      if (moveEmployeePromise) {
        try {
          await moveEmployeePromise;
        } catch (error) {
          console.log(
            `Attempt ${attempt + 1}: API call did not complete, retrying...`
          );
          if (attempt === maxRetries) {
            throw new Error(
              `Failed to move employee ${employeeId} to position ${targetPosition}: API call timeout`
            );
          }
          continue;
        }
      }

      // 7. Wait for UI to update (network idle and DOM content loaded)
      await page.waitForLoadState("networkidle");
      await page.waitForLoadState("domcontentloaded");

      // 8. Verify the employee moved by checking its data attribute (not DOM structure)
      const positionAttr = isDonutMode
        ? "data-donut-position"
        : "data-position";

      try {
        // Wait for the employee card to have the correct position attribute
        // Increased timeout to allow for React re-rendering
        await expect(employeeCard).toHaveAttribute(
          positionAttr,
          targetPosition.toString(),
          {
            timeout: 3000,
          }
        );
        console.log(
          `  ✓ Position attribute updated: ${positionAttr}=${targetPosition}`
        );
      } catch (error) {
        const currentValue = await employeeCard.getAttribute(positionAttr);
        console.log(
          `Attempt ${attempt + 1}: Position attribute not updated (expected ${targetPosition}, got ${currentValue}), retrying...`
        );
        if (attempt === maxRetries) {
          throw new Error(
            `Failed to move employee ${employeeId} to position ${targetPosition}: Position attribute not updated after drag (got ${currentValue})`
          );
        }
        continue;
      }

      // 9. Verification complete
      // Note: Modified state is shown via border styling, not a testable indicator element
      // For both regular and donut moves, we've already verified success via:
      // - API response (200 status for appropriate endpoint)
      // - Position attribute update (data-position or data-donut-position)
      // Visual modified state (purple border in donut mode) is shown via CSS styling only

      // The donut-indicator element no longer exists in the component
      // Donut mode is indicated by the purple border styling, which is sufficient validation

      // Success! Break out of retry loop
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // No arbitrary wait before retry - let's immediately try again
    }
  }
}
