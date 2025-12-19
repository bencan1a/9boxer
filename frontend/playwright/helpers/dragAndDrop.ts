import { Page } from '@playwright/test';

/**
 * Helper function to drag and drop an employee to a different grid position
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
  // Find the employee card
  const employeeCard = page.locator(`[data-testid="employee-card-${employeeId}"]`);

  // Find the target grid box
  const targetBox = page.locator(`[data-testid="grid-box-${targetPosition}"]`);

  // Perform drag and drop
  await employeeCard.dragTo(targetBox);

  // Wait for the move to complete (API call + state update)
  await page.waitForTimeout(1000);
}
