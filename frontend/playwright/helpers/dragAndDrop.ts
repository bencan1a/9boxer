import { Page } from '@playwright/test';

/**
 * Helper function to drag and drop an employee to a different grid position
 *
 * This implementation uses manual mouse events to work with dnd-kit's pointer event handling.
 * Playwright's built-in dragTo() doesn't work reliably with dnd-kit.
 *
 * @param page - Playwright Page object
 * @param employeeId - The ID of the employee to move
 * @param targetPosition - The target grid position (1-9)
 */
export async function dragEmployeeToPosition(
  page: Page,
  employeeId: number,
  targetPosition: number
): Promise<void> {
  // Find the employee card and its drag handle
  const employeeCard = page.locator(`[data-testid="employee-card-${employeeId}"]`);

  // Wait for the card to be visible
  await employeeCard.waitFor({ state: 'visible' });

  // Get the bounding box of the employee card
  const cardBox = await employeeCard.boundingBox();
  if (!cardBox) {
    throw new Error(`Employee card ${employeeId} not found`);
  }

  // Find the target grid box
  const targetBox = page.locator(`[data-testid="grid-box-${targetPosition}"]`);
  await targetBox.waitFor({ state: 'visible' });

  // Get the bounding box of the target
  const targetBoxBounds = await targetBox.boundingBox();
  if (!targetBoxBounds) {
    throw new Error(`Target grid box ${targetPosition} not found`);
  }

  // Calculate positions
  const startX = cardBox.x + cardBox.width / 2;
  const startY = cardBox.y + cardBox.height / 2;
  const endX = targetBoxBounds.x + targetBoxBounds.width / 2;
  const endY = targetBoxBounds.y + targetBoxBounds.height / 2;

  // Perform drag operation with mouse events
  // 1. Move to the drag handle area (left side of card)
  await page.mouse.move(cardBox.x + 12, startY);

  // 2. Mouse down to start drag
  await page.mouse.down();

  // 3. Small delay to ensure drag is initiated
  await page.waitForTimeout(100);

  // 4. Move to target in steps (more realistic)
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const x = startX + (endX - startX) * (i / steps);
    const y = startY + (endY - startY) * (i / steps);
    await page.mouse.move(x, y);
    await page.waitForTimeout(10);
  }

  // 5. Mouse up to drop
  await page.mouse.up();

  // Wait for the move to complete (API call + state update)
  await page.waitForTimeout(1000);
}
