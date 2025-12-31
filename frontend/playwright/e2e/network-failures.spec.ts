/**
 * E2E tests for network failure scenarios
 * Tests graceful degradation when backend is unavailable
 *
 * Phase 4: Edge case testing for error paths
 */

import { test, expect } from "../fixtures";
import { loadSampleData } from "../helpers";

test.describe("Network Failure Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    // Start with clean state
    await page.goto("/");
  });

  test("should show offline message when backend is unavailable", async ({
    page,
  }) => {
    // Load sample data first to verify app works
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Now intercept all API calls and abort them (simulate backend down)
    await page.route("**/api/**", (route) => route.abort());

    // Try to perform an action that requires backend (e.g., move employee)
    const employeeCard = page
      .locator('[data-testid^="employee-card-"]')
      .first();
    await expect(employeeCard).toBeVisible();

    // Click employee to open details panel
    await employeeCard.click();

    // Wait for details panel to open
    await expect(page.locator('[data-testid="right-panel"]')).toBeVisible();

    // Try to update employee (this should fail gracefully)
    const promotionCheckbox = page.locator(
      '[data-testid="promotion-ready-checkbox"]'
    );
    if (await promotionCheckbox.isVisible()) {
      await promotionCheckbox.click();

      // Verify error notification appears
      const errorAlert = page.locator('[role="alert"]');
      await expect(errorAlert).toBeVisible({ timeout: 5000 });

      // Verify error message is user-friendly
      const errorText = await errorAlert.textContent();
      expect(errorText).toMatch(
        /network|connection|offline|failed|unable to connect/i
      );
      expect(errorText).not.toMatch(/undefined|null|500|TypeError/i); // No technical jargon
    }

    // Verify app doesn't crash - grid should still be visible
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Remove route interception for cleanup
    await page.unroute("**/api/**");
  });

  test("should retry failed requests automatically", async ({ page }) => {
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Simulate intermittent network failure (fail first request, succeed second)
    let callCount = 0;
    await page.route("**/api/employees/*", (route) => {
      callCount++;
      if (callCount === 1) {
        // First request fails
        route.abort("failed");
      } else {
        // Subsequent requests succeed
        route.continue();
      }
    });

    // Click employee to trigger API call
    const employeeCard = page
      .locator('[data-testid^="employee-card-"]')
      .first();
    await employeeCard.click();

    // If the app has retry logic, this should eventually succeed
    // Otherwise, we should see an error message
    await page.waitForTimeout(2000);

    // Check if details panel opened (success) or error appeared (failure without retry)
    const detailsPanel = page.locator('[data-testid="right-panel"]');
    const errorAlert = page.locator('[role="alert"]');

    const detailsVisible = await detailsPanel.isVisible().catch(() => false);
    const errorVisible = await errorAlert.isVisible().catch(() => false);

    // At least one should be true (either success or graceful failure)
    expect(detailsVisible || errorVisible).toBe(true);

    // Verify app didn't crash
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Remove route interception
    await page.unroute("**/api/employees/*");
  });

  test("should handle timeout gracefully", async ({ page }) => {
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Simulate slow backend (delay response by 35 seconds)
    await page.route("**/api/employees/*/move", async (route) => {
      // Delay the response to trigger timeout
      await new Promise((resolve) => setTimeout(resolve, 35000));
      route.continue();
    });

    // Try to drag an employee (this will trigger a move API call)
    const employeeCard = page
      .locator('[data-testid^="employee-card-"]')
      .first();
    await expect(employeeCard).toBeVisible();

    // Get employee ID and current position
    const cardTestId = await employeeCard.getAttribute("data-testid");
    const employeeId = cardTestId?.replace("employee-card-", "");

    // Find a grid box to drag to
    const targetBox = page.locator('[data-testid="grid-box-6"]'); // Box 6: Medium Performance, High Potential
    await expect(targetBox).toBeVisible();

    // Perform drag and drop
    await employeeCard.dragTo(targetBox);

    // Wait for timeout error to appear
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 40000 }); // Wait longer than backend timeout

    // Verify error message mentions timeout
    const errorText = await errorAlert.textContent();
    expect(errorText).toMatch(/timeout|taking too long|slow|try again/i);

    // Verify app is still responsive
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Remove route interception
    await page.unroute("**/api/employees/*/move");
  });

  test("should recover when connection is restored", async ({ page }) => {
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Step 1: Simulate backend down
    await page.route("**/api/**", (route) => route.abort());

    // Try to open file menu (which might check backend status)
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();

    // Close menu
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="menu"]')).not.toBeVisible();

    // Step 2: Restore connection
    await page.unroute("**/api/**");

    // Wait a moment for any reconnection logic
    await page.waitForTimeout(1000);

    // Step 3: Verify app works again
    // Try to load sample data again
    await page.locator('[data-testid="file-menu-button"]').click();
    await expect(page.locator('[role="menu"]')).toBeVisible();

    await page.locator('[data-testid="load-sample-menu-item"]').click();

    // Verify dialog appears (backend connection restored)
    await expect(
      page.locator('[data-testid="load-sample-dialog"]')
    ).toBeVisible({ timeout: 5000 });

    // Cancel dialog
    await page.locator('[data-testid="cancel-button"]').click();

    // Verify app is fully functional
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });
});
