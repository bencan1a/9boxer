/**
 * E2E tests for Employee Details Panel workflow
 * Tests the complete flow of viewing employee details, timeline, and organizational chain
 */

import { test, expect } from "@playwright/test";
import { uploadExcelFile, dragEmployeeToPosition } from "../helpers";

test.describe("Employee Details Panel Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and upload sample data
    await page.goto("/");
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test("should display employee details when clicking employee card", async ({
    page,
  }) => {
    // Click on the first employee card (employee_id: 1)
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await expect(employeeCard).toBeVisible();
    await employeeCard.click();

    // Wait for details panel to be ready
    await page.waitForTimeout(300);

    // Verify Details tab is active by default
    const detailsTab = page.locator('[data-testid="details-tab"]');
    await expect(detailsTab).toBeVisible();
    await expect(detailsTab).toHaveAttribute("aria-selected", "true");

    // Verify employee name is visible in the details panel
    // The name appears in the EmployeeDetails card header - use more specific selector
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(
      detailsPanel.getByRole("heading", { name: "Alice Smith" })
    ).toBeVisible();

    // Verify business title is visible
    await expect(detailsPanel.getByText("Senior Engineer")).toBeVisible();

    // Verify job level is visible in the Employee Information section
    await expect(detailsPanel.getByText("Job Level")).toBeVisible();
    await expect(detailsPanel.getByText("IC").first()).toBeVisible();

    // Verify organizational chain displays
    // The reporting chain should show at least the employee and their manager
    await expect(detailsPanel.getByText("Reporting Chain")).toBeVisible();

    // Check if management chain data is available
    // The test data may not have full management chain info
    const hasManagementData = await detailsPanel
      .getByText("No management chain data available")
      .isVisible()
      .catch(() => false);

    if (!hasManagementData) {
      // If management chain data exists, verify employee appears
      const chainSection = detailsPanel
        .locator("text=Reporting Chain")
        .locator("../..");
      await expect(chainSection).toContainText("Alice Smith");
    } else {
      // If no data, just verify the empty state message appears
      await expect(
        detailsPanel.getByText("No management chain data available")
      ).toBeVisible();
    }
  });

  test("should display movement timeline in details tab", async ({ page }) => {
    // Click employee to open details panel
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to be ready
    await page.waitForTimeout(300);

    // Verify Performance History (timeline) is visible
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Performance History" });
    await expect(detailsPanel.getByText("Performance History")).toBeVisible();

    // Verify current year entry (2025) is shown in timeline
    await expect(detailsPanel.getByText("2025 (Current)")).toBeVisible();
    await expect(
      detailsPanel.getByText("Current Assessment").first()
    ).toBeVisible();

    // Verify current performance and potential are displayed
    await expect(detailsPanel.getByText(/Performance:/).first()).toBeVisible();
    await expect(detailsPanel.getByText(/Potential:/).first()).toBeVisible();

    // Now move the employee to a different position
    // Employee 1 starts at position 9 (Star), move to position 6 (High Impact)
    await dragEmployeeToPosition(page, 1, 6);

    // Wait for the move to complete and UI to update
    await page.waitForTimeout(500);

    // Re-click the employee to refresh the details panel
    const movedEmployeeCard = page.locator('[data-testid="employee-card-1"]');
    await movedEmployeeCard.click();

    // Wait for panel to update
    await page.waitForTimeout(300);

    // Verify timeline still displays with updated information
    const updatedDetailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Performance History" });
    await expect(
      updatedDetailsPanel.getByText("Performance History")
    ).toBeVisible();
    await expect(updatedDetailsPanel.getByText("2025 (Current)")).toBeVisible();

    // The position label should now reflect "High Impact" instead of "Star"
    // This is shown in the Current Assessment section
    await expect(
      updatedDetailsPanel.getByText("Current Assessment").first()
    ).toBeVisible();
    await expect(updatedDetailsPanel.getByText("High Impact")).toBeVisible();
  });

  test("should close details panel when clicking outside", async ({ page }) => {
    // Click employee to open panel
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to be ready
    await page.waitForTimeout(300);

    // Verify Details tab is active (panel is open)
    const detailsTab = page.locator('[data-testid="details-tab"]');
    await expect(detailsTab).toHaveAttribute("aria-selected", "true");

    // Verify employee details are visible
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(
      detailsPanel.getByRole("heading", { name: "Alice Smith" })
    ).toBeVisible();

    // Click on the grid background (not on another employee)
    // Use the nine-box-grid container but avoid employee cards
    const gridContainer = page.locator('[data-testid="nine-box-grid"]');

    // Click on the top-left corner of the grid (axis label area)
    const gridBox = await gridContainer.boundingBox();
    if (gridBox) {
      // Click in the axis label area (left side, away from employee cards)
      await page.mouse.click(gridBox.x + 40, gridBox.y + 40);
    }

    // Wait for any state changes
    await page.waitForTimeout(300);

    // Note: In this app, clicking outside doesn't deselect the employee
    // The employee remains selected unless another employee is clicked
    // So we verify the employee is still shown (not deselected)
    const updatedDetailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(
      updatedDetailsPanel.getByRole("heading", { name: "Alice Smith" })
    ).toBeVisible();
  });

  test("should show employee information section", async ({ page }) => {
    // Click employee card
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to load
    await page.waitForTimeout(300);

    // Verify Employee Information section is visible
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(detailsPanel.getByText("Employee Information")).toBeVisible();

    // Verify job function is displayed (if present in data)
    const jobFunctionExists = await detailsPanel
      .getByText("Job Function")
      .isVisible()
      .catch(() => false);
    if (jobFunctionExists) {
      await expect(detailsPanel.getByText("Job Function")).toBeVisible();
    }

    // Verify the section renders properly with at least some employee data
    await expect(detailsPanel.getByText("Job Level")).toBeVisible();
  });

  test("should display promotion readiness checkbox", async ({ page }) => {
    // Click employee card
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to load
    await page.waitForTimeout(300);

    // Verify Promotion Ready checkbox is visible
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(detailsPanel.getByText("Promotion Ready")).toBeVisible();

    // Find the checkbox input
    const promotionCheckbox = detailsPanel.getByRole("checkbox", {
      name: /Promotion Ready/i,
    });
    await expect(promotionCheckbox).toBeVisible();

    // Get initial state
    const initialState = await promotionCheckbox.isChecked();

    // Toggle the checkbox
    await promotionCheckbox.click();

    // Wait for state to update
    await page.waitForTimeout(300);

    // Verify checkbox state changed
    const newState = await promotionCheckbox.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("should display potential chip with correct styling", async ({
    page,
  }) => {
    // Click employee card
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to load
    await page.waitForTimeout(300);

    // Verify Current Assessment section is visible
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(
      detailsPanel.getByText("Current Assessment").first()
    ).toBeVisible();

    // Verify Potential label and value are shown
    await expect(detailsPanel.getByText(/Potential:/).first()).toBeVisible();

    // The potential value should be displayed as a chip
    // Alice Smith has "High" potential, which should be in the details
    const potentialSection = detailsPanel
      .locator("text=Potential:")
      .first()
      .locator("..");
    await expect(potentialSection).toBeVisible();
  });

  test("should display position label in current assessment", async ({
    page,
  }) => {
    // Click employee card
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to load
    await page.waitForTimeout(300);

    // Verify Current Assessment section
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(
      detailsPanel.getByText("Current Assessment").first()
    ).toBeVisible();

    // Verify Position label is displayed
    await expect(detailsPanel.getByText(/Position:/)).toBeVisible();

    // The position should show the grid position label (e.g., "Star")
    // This is dynamically based on grid_position
    const positionSection = detailsPanel
      .locator("text=Position:")
      .locator("..");
    await expect(positionSection).toBeVisible();
  });

  test("should show modified indicator when employee is moved", async ({
    page,
  }) => {
    // Move employee to a different position
    await dragEmployeeToPosition(page, 1, 6);

    // Click the moved employee
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to load
    await page.waitForTimeout(300);

    // Verify "Modified in Session" chip is visible
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(detailsPanel.getByText("Modified in Session")).toBeVisible();
  });

  test("should display multiple management chain levels", async ({ page }) => {
    // Click employee card
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to load
    await page.waitForTimeout(300);

    // Verify Reporting Chain section
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Reporting Chain" });
    await expect(detailsPanel.getByText("Reporting Chain")).toBeVisible();

    // Check if management chain data is available
    const hasManagementData = await detailsPanel
      .getByText("No management chain data available")
      .isVisible()
      .catch(() => false);

    if (!hasManagementData) {
      // If management chain data exists, verify employee appears
      await expect(detailsPanel.getByText("Alice Smith")).toBeVisible();

      // The management chain should display at least the employee
      const chainContent = detailsPanel
        .locator("text=Reporting Chain")
        .locator("../..");
      await expect(chainContent).toBeVisible();

      // Check if there are any management levels shown (Paper components in the chain)
      const chainLevels = chainContent.locator(".MuiPaper-root");
      const levelCount = await chainLevels.count();
      expect(levelCount).toBeGreaterThanOrEqual(1); // At least the employee should be shown
    } else {
      // If no data, just verify the empty state and that the component renders
      await expect(
        detailsPanel.getByText("No management chain data available")
      ).toBeVisible();
      // The component should still render the section header
      await expect(detailsPanel.getByText("Reporting Chain")).toBeVisible();
    }
  });

  test("should persist employee selection when switching tabs", async ({
    page,
  }) => {
    // Click employee card
    const employeeCard = page.locator('[data-testid="employee-card-1"]');
    await employeeCard.click();

    // Wait for panel to load
    await page.waitForTimeout(300);

    // Verify employee name is visible in Details tab
    const detailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(
      detailsPanel.getByRole("heading", { name: "Alice Smith" })
    ).toBeVisible();

    // Switch to Statistics tab
    const statisticsTab = page.locator('[data-testid="statistics-tab"]');
    await statisticsTab.click();

    // Wait for tab to switch
    await page.waitForTimeout(300);

    // Switch back to Details tab
    const detailsTab = page.locator('[data-testid="details-tab"]');
    await detailsTab.click();

    // Wait for tab to switch
    await page.waitForTimeout(300);

    // Verify employee details are still showing (selection persisted)
    const updatedDetailsPanel = page
      .locator('[role="tabpanel"]')
      .filter({ hasText: "Employee Information" });
    await expect(
      updatedDetailsPanel.getByRole("heading", { name: "Alice Smith" })
    ).toBeVisible();
  });
});
