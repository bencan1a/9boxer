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

import { test, expect } from "@playwright/test";
import { uploadExcelFile, dragEmployeeToPosition, t } from "../helpers";

test.describe("Details Panel - Core Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await uploadExcelFile(page, "sample-employees.xlsx");
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test.describe("Basic Panel Operations", () => {
    test("should display employee details when clicking employee card", async ({
      page,
    }) => {
      // Click employee card
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();

      // Verify Details tab is active
      const detailsTab = page.locator('[data-testid="details-tab"]');
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");

      // Verify employee name and title are displayed
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.employeeInformation") });
      await expect(
        detailsPanel.getByRole("heading", { name: "Alice Smith" })
      ).toBeVisible();
      await expect(detailsPanel.getByText("Senior Engineer")).toBeVisible();
    });

    test("should persist employee selection when switching tabs", async ({
      page,
    }) => {
      // Select employee
      await page.locator('[data-testid="employee-card-1"]').click();
      const detailsTab = page.locator('[data-testid="details-tab"]');
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");

      // Switch to Statistics tab
      const statsTab = page.locator('[data-testid="statistics-tab"]');
      await statsTab.click();
      await expect(statsTab).toHaveAttribute("aria-selected", "true");

      // Switch back to Details tab
      await detailsTab.click();
      await expect(detailsTab).toHaveAttribute("aria-selected", "true");

      // Verify employee still selected
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.employeeInformation") });
      await expect(
        detailsPanel.getByRole("heading", { name: "Alice Smith" })
      ).toBeVisible();
    });
  });

  test.describe("Employee Information", () => {
    test("should display job level and other employee info", async ({
      page,
    }) => {
      await page.locator('[data-testid="employee-card-1"]').click();

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
      await expect(detailsPanel.getByText("IC").first()).toBeVisible();
    });
  });

  test.describe("Current Assessment", () => {
    test("should display box name with grid coordinates", async ({ page }) => {
      // Alice Smith is in position 9 (Star box [H,H])
      await page.locator('[data-testid="employee-card-1"]').click();

      // Verify Current Assessment section exists
      const currentAssessment = page.locator(
        '[data-testid="current-assessment-section"]'
      );
      await expect(currentAssessment).toBeVisible();

      // Verify box position label shows name and coordinates
      const boxPositionLabel = page.locator(
        '[data-testid="box-position-label"]'
      );
      await expect(boxPositionLabel).toBeVisible();
      await expect(boxPositionLabel).toContainText("Star");
      await expect(boxPositionLabel).toContainText("[H,H]");
    });

    test("should display performance and potential chips", async ({ page }) => {
      await page.locator('[data-testid="employee-card-1"]').click();

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: t("panel.detailsTab.currentAssessment") });

      // Verify performance and potential are displayed
      // Alice Smith has High performance and High potential
      await expect(detailsPanel.getByText("Performance: High")).toBeVisible();
      await expect(detailsPanel.getByText("Potential: High")).toBeVisible();
    });

    test("should update box info when employee is moved", async ({ page }) => {
      // Select employee and verify initial position
      await page.locator('[data-testid="employee-card-1"]').click();

      // Verify initial position (Star [H,H])
      const initialBoxLabel = page.locator(
        '[data-testid="box-position-label"]'
      );
      await expect(initialBoxLabel).toContainText("Star");
      await expect(initialBoxLabel).toContainText("[H,H]");

      // Move employee from position 9 to position 6
      await dragEmployeeToPosition(page, 1, 6);

      // Verify employee moved
      await expect(
        page
          .locator('[data-testid="grid-box-6"]')
          .locator('[data-testid="employee-card-1"]')
      ).toBeVisible();

      // Re-click to refresh details
      await page.locator('[data-testid="employee-card-1"]').click();

      // Verify updated position using data-testid
      const updatedBoxLabel = page.locator(
        '[data-testid="box-position-label"]'
      );
      await expect(updatedBoxLabel).toBeVisible();
      await expect(updatedBoxLabel).toContainText("High Impact");
      await expect(updatedBoxLabel).toContainText("[H,M]");
    });

    test("should show modified indicator when employee is moved", async ({
      page,
    }) => {
      // Move employee
      await dragEmployeeToPosition(page, 1, 6);

      // Click to view details
      await page.locator('[data-testid="employee-card-1"]').click();

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
      // Move employee
      await dragEmployeeToPosition(page, 1, 6);
      await expect(
        page
          .locator('[data-testid="grid-box-6"]')
          .locator('[data-testid="employee-card-1"]')
      ).toBeVisible();

      // Click to view details
      await page.locator('[data-testid="employee-card-1"]').click();

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
      // Select employee
      await page.locator('[data-testid="employee-card-1"]').click();

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
      // Add flag first
      await page.locator('[data-testid="employee-card-1"]').click();
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
      await page.locator('[data-testid="employee-card-1"]').click();
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
      await page.locator('[data-testid="employee-card-1"]').click();

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
      await page.locator('[data-testid="employee-card-1"]').click();

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
      await page.locator('[data-testid="employee-card-1"]').click();

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
        // If management data exists, verify employee name appears
        await expect(detailsPanel.getByText("Alice Smith")).toBeVisible();
      } else {
        // Verify empty state message
        await expect(
          detailsPanel.getByText(t("panel.detailsTab.managementChain.noData"))
        ).toBeVisible();
      }
    });
  });
});
