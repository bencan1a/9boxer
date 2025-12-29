/**
 * E2E tests for Employee Details Panel
 *
 * Tests critical functionality of the right panel Details tab:
 * - Basic employee information display
 * - Current assessment (box, performance, potential)
 * - Flags system (add, remove)
 * - Changes summary after movements
 * - Performance history timeline
 * - Management chain
 * - Panel interactions (tabs, closing)
 *
 * Follows Playwright best practices:
 * - Uses data-testid selectors
 * - Auto-retrying assertions instead of arbitrary waits
 * - Single-purpose tests
 * - Shared helpers for common operations
 */

import { test, expect } from "../fixtures";
import { loadSampleData, dragEmployeeToPosition, t } from "../helpers";
import type { Page, Locator } from "@playwright/test";

/**
 * Helper to find any employee in the grid
 * Returns the first employee found in any box (prioritizing likely populated boxes)
 */
async function findAnyEmployee(page: Page): Promise<{
  employeeCard: Locator;
  employeeId: string;
  boxNumber: number;
}> {
  // Check boxes in order of likelihood (high performers first)
  for (const box of [9, 8, 6, 5, 7, 4, 3, 2, 1]) {
    const gridBox = page.locator(`[data-testid="grid-box-${box}"]`);
    const employees = gridBox.locator('[data-testid^="employee-card-"]');
    const count = await employees.count();

    if (count > 0) {
      const firstEmployee = employees.first();
      const testId = await firstEmployee.getAttribute("data-testid");
      const employeeId = testId?.replace("employee-card-", "") || "";
      return {
        employeeCard: firstEmployee,
        employeeId,
        boxNumber: box,
      };
    }
  }

  throw new Error("No employees found in any grid box");
}

test.describe("Details Panel - Core Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await loadSampleData(page);
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test.describe("Basic Panel Operations", () => {
    test("should display employee details when clicking employee card", async ({
      page,
    }) => {
      // Find and click any employee card
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      // Verify Details tab is active
      const detailsTab = page.locator('[data-testid="details-tab"]');
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");

      // Verify employee information section is displayed using testid
      const detailsPanel = page.locator('[data-testid="tab-panel-0"]');
      await expect(detailsPanel).toBeVisible();

      // Verify current assessment section is visible (more robust than text matching)
      const currentAssessment = page.locator(
        '[data-testid="current-assessment-section"]'
      );
      await expect(currentAssessment).toBeVisible();
    });

    test("should persist employee selection when switching tabs", async ({
      page,
    }) => {
      // Find and select employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      const detailsTab = page.locator('[data-testid="details-tab"]');
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");

      // Switch to Statistics tab
      const statsTab = page.locator('[data-testid="statistics-tab"]');
      await statsTab.click();
      await expect(statsTab).toHaveAttribute("aria-selected", "true");

      // Switch back to Details tab
      await detailsTab.click();
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");

      // Verify employee information is still displayed using testid
      const detailsPanel = page.locator('[data-testid="tab-panel-0"]');
      await expect(detailsPanel).toBeVisible();

      const currentAssessment = page.locator(
        '[data-testid="current-assessment-section"]'
      );
      await expect(currentAssessment).toBeVisible();
    });
  });

  test.describe("Employee Information", () => {
    test("should display job level and other employee info", async ({
      page,
    }) => {
      // Find and click any employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.employeeInformation") });

      // Verify Employee Information section
      await expect(
        detailsPanel.getByText(t("panel.detailsTab.employeeInformation"))
      ).toBeVisible();
      await expect(
        detailsPanel.getByText(t("panel.detailsTab.jobLevel"))
      ).toBeVisible();
      // Verify job level is displayed (exact value will vary by employee)
      const jobLevelSection = detailsPanel.locator("text=/Job Level/");
      await expect(jobLevelSection).toBeVisible();
    });
  });

  test.describe("Current Assessment", () => {
    test("should display box name with grid coordinates", async ({ page }) => {
      // Find and click any employee
      const { employeeCard, boxNumber } = await findAnyEmployee(page);
      await employeeCard.click();

      // Verify Current Assessment section exists
      const currentAssessment = page.locator(
        '[data-testid="current-assessment-section"]'
      );
      await expect(currentAssessment).toBeVisible();

      // Verify box position label shows name and coordinates (format: [P,P] where P is H/M/L)
      const boxPositionLabel = page.locator(
        '[data-testid="box-position-label"]'
      );
      await expect(boxPositionLabel).toBeVisible();
      // Verify coordinates format is present
      await expect(boxPositionLabel).toContainText("[");
      await expect(boxPositionLabel).toContainText("]");
    });

    test("should display performance and potential chips", async ({ page }) => {
      // Find and click any employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      // Verify current assessment section is visible
      const currentAssessmentSection = page.locator(
        '[data-testid="current-assessment-section"]'
      );
      await expect(currentAssessmentSection).toBeVisible();

      // Verify performance and potential chips are displayed
      // Chips contain text like "High", "Medium", "Low" for performance/potential values
      const chips = currentAssessmentSection.locator('[class*="MuiChip"]');
      const chipCount = await chips.count();
      expect(chipCount).toBeGreaterThanOrEqual(2); // At least performance and potential chips
    });

    test("should update box info when employee is moved", async ({ page }) => {
      // Find and select employee
      const { employeeCard, employeeId, boxNumber } =
        await findAnyEmployee(page);
      await employeeCard.click();

      // Get initial position
      const initialBoxLabel = page.locator(
        '[data-testid="box-position-label"]'
      );
      await expect(initialBoxLabel).toBeVisible();
      const initialPosition = await initialBoxLabel.textContent();

      // Move employee to a different box (box 6)
      await dragEmployeeToPosition(page, parseInt(employeeId), 6);

      // Verify employee moved to box 6
      await expect(
        page
          .locator('[data-testid="grid-box-6"]')
          .locator(`[data-testid="employee-card-${employeeId}"]`)
      ).toBeVisible();

      // Re-click to refresh details
      await page.locator(`[data-testid="employee-card-${employeeId}"]`).click();

      // Verify updated position is different and shows new coordinates
      const updatedBoxLabel = page.locator(
        '[data-testid="box-position-label"]'
      );
      await expect(updatedBoxLabel).toBeVisible();
      const updatedPosition = await updatedBoxLabel.textContent();
      expect(updatedPosition).not.toBe(initialPosition);
      // Verify box 6 coordinates are shown
      await expect(updatedBoxLabel).toContainText("[H,M]");
    });

    test("should show modified indicator when employee is moved", async ({
      page,
    }) => {
      // Find and move employee
      const { employeeId } = await findAnyEmployee(page);
      await dragEmployeeToPosition(page, parseInt(employeeId), 6);

      // Click to view details
      await page.locator(`[data-testid="employee-card-${employeeId}"]`).click();

      // Verify modified indicator
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.employeeInformation") });
      await expect(
        detailsPanel.getByText(t("panel.detailsTab.modifiedInSession"))
      ).toBeVisible();
    });
  });

  test.describe("Changes Summary", () => {
    test("should display changes after employee movement", async ({ page }) => {
      // Find and move employee
      const { employeeId } = await findAnyEmployee(page);
      await dragEmployeeToPosition(page, parseInt(employeeId), 6);
      await expect(
        page
          .locator('[data-testid="grid-box-6"]')
          .locator(`[data-testid="employee-card-${employeeId}"]`)
      ).toBeVisible();

      // Click to view details
      await page.locator(`[data-testid="employee-card-${employeeId}"]`).click();

      // Verify changes summary section
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.currentAssessment") });
      await expect(
        detailsPanel.getByText(/Recent Changes.*\(1\)/)
      ).toBeVisible();

      // Verify change row is displayed
      const changeRow = detailsPanel.locator('[data-testid^="change-row-"]');
      await expect(changeRow).toBeVisible();
    });
  });

  test.describe("Flags System", () => {
    test("should add flag to employee", async ({ page }) => {
      // Find and select employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      // Find flag picker in Employee Information section
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.employeeInformation") });
      await expect(detailsPanel.getByText(/Flags/)).toBeVisible();

      // Click flag picker to open dropdown
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();

      // Select "Promotion Ready" from dropdown
      const promotionReadyOption = page.getByRole("option", {
        name: /Promotion Ready/i,
      });
      await expect(promotionReadyOption).toBeVisible();
      await promotionReadyOption.click();

      // Verify flag chip appears
      const flagChip = detailsPanel.locator(
        '[data-testid="flag-chip-promotion_ready"]'
      );
      await expect(flagChip).toBeVisible();
      await expect(flagChip.getByText("Promotion Ready")).toBeVisible();
    });

    test("should remove flag by clicking delete icon", async ({ page }) => {
      // Find and select employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.employeeInformation") });

      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.getByRole("option", { name: /Promotion Ready/i }).click();

      // Verify flag appears
      const flagChip = detailsPanel.locator(
        '[data-testid="flag-chip-promotion_ready"]'
      );
      await expect(flagChip).toBeVisible();

      // Click delete button on chip
      const deleteButton = flagChip.locator('[data-testid="CancelIcon"]');
      await deleteButton.click();

      // Verify flag is removed
      await expect(flagChip).not.toBeVisible();
    });

    test("should add multiple flags to same employee", async ({ page }) => {
      // Find and select employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.employeeInformation") });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');

      // Add first flag
      await flagPicker.click();
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await expect(
        detailsPanel.locator('[data-testid="flag-chip-promotion_ready"]')
      ).toBeVisible();

      // Add second flag
      await flagPicker.click();
      await page.getByRole("option", { name: /Flight Risk/i }).click();

      // Verify both flags are displayed
      await expect(
        detailsPanel.locator('[data-testid="flag-chip-promotion_ready"]')
      ).toBeVisible();
      await expect(
        detailsPanel.locator('[data-testid="flag-chip-flight_risk"]')
      ).toBeVisible();
    });
  });

  test.describe("Performance History", () => {
    test("should display performance history timeline", async ({ page }) => {
      // Find and select employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.performanceHistory") });

      // Verify Performance History section
      await expect(
        detailsPanel.getByRole("heading", {
          name: t("panel.detailsTab.performanceHistory"),
        })
      ).toBeVisible();

      // Verify current year entry is shown
      await expect(
        detailsPanel.getByText(
          t("panel.detailsTab.currentYear", { year: 2025 })
        )
      ).toBeVisible();
      await expect(
        detailsPanel.getByText(t("panel.detailsTab.currentAssessment")).first()
      ).toBeVisible();
    });

    test("should display performance and potential in timeline", async ({
      page,
    }) => {
      // Find and select employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.performanceHistory") });

      // Verify performance and potential are displayed in timeline
      await expect(
        detailsPanel.getByText(/Performance:/).first()
      ).toBeVisible();
      await expect(detailsPanel.getByText(/Potential:/).first()).toBeVisible();
    });
  });

  test.describe("Management Chain", () => {
    test("should display reporting chain section", async ({ page }) => {
      // Find and select employee
      const { employeeCard } = await findAnyEmployee(page);
      await employeeCard.click();

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.reportingChain") });

      // Verify Reporting Chain section exists
      await expect(
        detailsPanel.getByRole("heading", {
          name: t("panel.detailsTab.reportingChain"),
        })
      ).toBeVisible();

      // Check if management data exists or empty state is shown
      const hasManagementData = await detailsPanel
        .getByText(t("panel.detailsTab.managementChain.noData"))
        .isVisible()
        .catch(() => false);

      if (!hasManagementData) {
        // If management data exists, verify some content appears (name will vary)
        const headings = detailsPanel.locator("h2, h3, h4, h5, h6");
        await expect(headings.first()).toBeVisible();
      } else {
        // Verify empty state message
        await expect(
          detailsPanel.getByText(t("panel.detailsTab.managementChain.noData"))
        ).toBeVisible();
      }
    });
  });
});
