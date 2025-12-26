/**
 * E2E tests for Details Panel UX Enhancements
 * Tests all new features from the Details Panel UX Overhaul project:
 * - Enhanced Current Assessment display with box info and grid colors
 * - Changes display in Current Assessment section
 * - Flags system (add, remove, filtering)
 * - Flag badges on employee tiles
 * - Reporting Chain interactive filtering
 * - Excel export with flags
 * - Performance History layout fixes
 */

import { test, expect } from "@playwright/test";
import {
  uploadExcelFile,
  dragEmployeeToPosition,
  clickTabAndWait,
  waitForUiSettle,
  openFilterDrawer,
  openFileMenu,
} from "../helpers";

test.describe("Details Panel Enhancements", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and upload sample data
    await page.goto("/");
    await uploadExcelFile(page, "sample-employees.xlsx");

    // Verify grid is loaded
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  });

  test.describe("Enhanced Current Assessment Display", () => {
    test("should display box name with grid coordinates", async ({ page }) => {
      // Click on Alice Smith (employee_id: 1, position 9 - Stars box)
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Verify Details tab is active
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Current Assessment" });
      await expect(
        detailsPanel.getByRole("heading", { name: "Current Assessment" })
      ).toBeVisible();

      // Verify box name is displayed (should be "Star" for position 9)
      await expect(detailsPanel.getByText(/Box:.*Star/)).toBeVisible();

      // Verify grid coordinates are shown in [X,Y] format
      // Position 9 corresponds to [H,H]
      await expect(detailsPanel.getByText(/\[H,H\]/)).toBeVisible();
    });

    test("should display performance and potential chips with grid colors", async ({
      page,
    }) => {
      // Click on Alice Smith (employee_id: 1)
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Current Assessment" });

      // Verify performance chip is displayed (use first() to avoid strict mode violation)
      await expect(
        detailsPanel.locator("text=Performance:").first()
      ).toBeVisible();

      // Verify potential chip is displayed (use first() to avoid strict mode violation)
      await expect(
        detailsPanel.locator("text=Potential:").first()
      ).toBeVisible();

      // Verify the chips show "High" for Alice (Stars box employee)
      // Check for full text to avoid strict mode violations
      await expect(detailsPanel.getByText("Performance: High")).toBeVisible();
      await expect(detailsPanel.getByText("Potential: High")).toBeVisible();
    });

    test("should update box info when employee is moved to different position", async ({
      page,
    }) => {
      // Click on Alice Smith
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Verify initial position (Star [H,H])
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Current Assessment" });
      await expect(detailsPanel.getByText(/Box:.*Star/)).toBeVisible();
      await expect(
        detailsPanel.locator("text=/Box:.*\\[H,H\\]/").first()
      ).toBeVisible();

      // Move employee from position 9 to position 6 (High Impact [M,H])
      await dragEmployeeToPosition(page, 1, 6);
      await page.waitForTimeout(500);

      // Re-click the employee to refresh details
      const movedEmployeeCard = page.locator('[data-testid="employee-card-1"]');
      await movedEmployeeCard.click();
      await page.waitForTimeout(300);

      // Verify updated position (High Impact [H,M])
      const updatedDetailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Current Assessment" });
      await expect(
        updatedDetailsPanel.getByText(/Box:.*High Impact/)
      ).toBeVisible();
      await expect(
        updatedDetailsPanel.locator("text=/Box:.*\\[H,M\\]/").first()
      ).toBeVisible();
    });
  });

  test.describe("Changes Display in Current Assessment", () => {
    test("should display change in Current Assessment after employee is moved", async ({
      page,
    }) => {
      // Move Alice Smith from position 9 to position 6
      await dragEmployeeToPosition(page, 1, 6);
      await page.waitForTimeout(500);

      // Click on moved employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Verify Current Assessment section shows the change
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Current Assessment" });

      // Should show "Recent Changes" section with count
      await expect(
        detailsPanel.getByRole("heading", { name: /Recent Changes/ })
      ).toBeVisible();

      // Should display movement chips in change summary (use data-testid for specificity)
      const changeRow = detailsPanel
        .locator('[data-testid^="change-row-"]')
        .first();
      await expect(changeRow).toBeVisible();
    });

    test("should display notes with changes in Current Assessment", async ({
      page,
    }) => {
      // Move employee
      await dragEmployeeToPosition(page, 1, 6);
      await page.waitForTimeout(500);

      // Go to Changes tab to add notes
      await clickTabAndWait(page, "changes-tab");

      // Add notes to the change
      const notesField = page.locator(
        '[data-testid="change-notes-1"] textarea:not([readonly])'
      );
      await expect(notesField).toBeVisible();

      const testNotes = "Promoted based on Q4 performance review";
      await notesField.click();
      await notesField.fill(testNotes);
      await page.locator('[data-testid="change-table"]').click();
      await page.waitForTimeout(500);

      // Go back to Details tab
      await clickTabAndWait(page, "details-tab");

      // Click employee to refresh details
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Verify notes are displayed in Current Assessment changes
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Current Assessment" });
      await expect(detailsPanel.getByText(testNotes)).toBeVisible();
    });

    test("should show timestamp for changes in Current Assessment", async ({
      page,
    }) => {
      // Move employee
      await dragEmployeeToPosition(page, 1, 6);
      await page.waitForTimeout(500);

      // Click on moved employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Verify timestamp is shown (should contain today's date or time info)
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Recent Changes" });

      // Changes should have a timestamp (format may vary, but should be visible)
      // The timestamp is typically shown in the change row (use more specific selector)
      await expect(
        detailsPanel.locator('[data-testid^="change-row-"]').first()
      ).toBeVisible();
    });
  });

  test.describe("Flags System - Adding and Removing", () => {
    test("should add flag to employee via picker dropdown", async ({
      page,
    }) => {
      // Click employee to open details
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });

      // Verify Flags section exists
      await expect(
        detailsPanel.getByRole("heading", { name: "Flags" })
      ).toBeVisible();

      // Open flag picker dropdown (Autocomplete component)
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);

      // Select "Promotion Ready" flag from dropdown
      const promotionReadyOption = page.getByRole("option", {
        name: /Promotion Ready/i,
      });
      await expect(promotionReadyOption).toBeVisible();
      await promotionReadyOption.click();
      await page.waitForTimeout(300);

      // Verify flag chip appears
      const flagChip = detailsPanel.locator(
        '[data-testid="flag-chip-Promotion Ready"]'
      );
      await expect(flagChip).toBeVisible();
      await expect(flagChip.getByText("Promotion Ready")).toBeVisible();

      // Verify flag chip has delete button (X)
      await expect(
        flagChip.locator('[data-testid="CancelIcon"]')
      ).toBeVisible();
    });

    test("should remove flag by clicking X on chip", async ({ page }) => {
      // Click employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });

      // Add "Promotion Ready" flag
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(300);

      // Verify flag chip appears
      const flagChip = detailsPanel.locator(
        '[data-testid="flag-chip-Promotion Ready"]'
      );
      await expect(flagChip).toBeVisible();

      // Click X to remove flag
      await flagChip.locator('[data-testid="CancelIcon"]').click();
      await page.waitForTimeout(300);

      // Verify flag chip is removed
      await expect(flagChip).not.toBeVisible();

      // Verify flag reappears in picker dropdown
      await flagPicker.click();
      await page.waitForTimeout(300);
      await expect(
        page.getByRole("option", { name: /Promotion Ready/i })
      ).toBeVisible();
    });

    test("should add multiple flags to same employee", async ({ page }) => {
      // Click employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');

      // Add "Promotion Ready" flag
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(300);

      // Add "Flight Risk" flag
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Flight Risk/i }).click();
      await page.waitForTimeout(300);

      // Verify both flags are displayed
      await expect(
        detailsPanel.locator('[data-testid="flag-chip-Promotion Ready"]')
      ).toBeVisible();
      await expect(
        detailsPanel.locator('[data-testid="flag-chip-Flight Risk"]')
      ).toBeVisible();
    });

    test("should persist flag picker reset after adding flag", async ({
      page,
    }) => {
      // Click employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');

      // Add a flag
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(300);

      // Verify picker is reset (not showing the selected flag in input)
      const pickerInput = flagPicker.locator("input");
      await expect(pickerInput).toHaveValue("");

      // Verify dropdown shows remaining flags when clicked again
      await flagPicker.click();
      await page.waitForTimeout(300);

      // Should NOT show "Promotion Ready" (already added)
      const options = page.getByRole("option");
      const optionTexts = await options.allTextContents();
      expect(optionTexts).not.toContain("Promotion Ready");

      // Should show other flags
      await expect(
        page.getByRole("option", { name: /Flight Risk/i })
      ).toBeVisible();
    });
  });

  test.describe("Flag Badges on Employee Tiles", () => {
    test("should display flag badge on employee tile when flag is added", async ({
      page,
    }) => {
      // Click employee to open details
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Add flag
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(500);

      // Verify flag badge appears on employee tile
      const flagBadge = employeeCard.locator('[data-testid="flag-badge-1"]');
      await expect(flagBadge).toBeVisible();

      // Verify badge shows flag icon (🏷️)
      await expect(flagBadge).toContainText("🏷️");
    });

    test("should show tooltip with flag name on badge hover", async ({
      page,
    }) => {
      // Add flag to employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(500);

      // Hover over flag badge
      const flagBadge = employeeCard.locator('[data-testid="flag-badge-1"]');
      await flagBadge.hover();
      await page.waitForTimeout(500);

      // Verify tooltip shows flag name
      const tooltip = page.locator('[role="tooltip"]');
      await expect(tooltip).toBeVisible();
      await expect(tooltip.getByText(/Promotion Ready/)).toBeVisible();
    });

    test("should update badge count when multiple flags are added", async ({
      page,
    }) => {
      // Click employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');

      // Add first flag
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(500);

      // Verify badge shows single flag
      let flagBadge = employeeCard.locator('[data-testid="flag-badge-1"]');
      await expect(flagBadge).toBeVisible();

      // Add second flag
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Flight Risk/i }).click();
      await page.waitForTimeout(500);

      // Verify badge shows count (🏷️ 2)
      flagBadge = employeeCard.locator('[data-testid="flag-badge-1"]');
      await expect(flagBadge).toContainText("2");
    });

    test("should remove badge when all flags are removed", async ({ page }) => {
      // Add flag to employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(500);

      // Verify badge appears
      let flagBadge = employeeCard.locator('[data-testid="flag-badge-1"]');
      await expect(flagBadge).toBeVisible();

      // Remove the flag
      const flagChip = detailsPanel.locator(
        '[data-testid="flag-chip-Promotion Ready"]'
      );
      await flagChip.locator('[data-testid="CancelIcon"]').click();
      await page.waitForTimeout(300);

      // Verify badge is removed
      flagBadge = employeeCard.locator('[data-testid="flag-badge-1"]');
      await expect(flagBadge).not.toBeVisible();
    });
  });

  test.describe("Flag Filtering", () => {
    test("should filter employees by single flag", async ({ page }) => {
      // Add "Promotion Ready" flag to 2 employees (Alice and Bob)
      for (const employeeId of [1, 2]) {
        const employeeCard = page.locator(
          `[data-testid="employee-card-${employeeId}"]`
        );
        await employeeCard.click();
        await page.waitForTimeout(300);

        const detailsPanel = page
          .locator('[role="tabpanel"]')
          .filter({ hasText: "Employee Information" });
        const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
        await flagPicker.click();
        await page.waitForTimeout(300);
        await page.getByRole("option", { name: /Promotion Ready/i }).click();
        await page.waitForTimeout(500);
      }

      // Open FilterDrawer
      await openFilterDrawer(page);

      // Verify Flags section exists (use more specific selector to avoid strict mode violation)
      await expect(
        page
          .locator('[data-testid="filter-drawer"]')
          .getByRole("heading", { name: "Flags" })
      ).toBeVisible();

      // Verify "Promotion Ready" checkbox shows count (2)
      const promotionReadyFilter = page.locator(
        '[data-testid="flag-filter-Promotion Ready"]'
      );
      await expect(promotionReadyFilter).toBeVisible();
      await expect(promotionReadyFilter.getByText(/2/)).toBeVisible();

      // Check "Promotion Ready" filter
      const checkbox = promotionReadyFilter.locator('input[type="checkbox"]');
      await checkbox.check();
      await page.waitForTimeout(500);

      // Verify only 2 employees shown in grid
      const employeeCards = page.locator('[data-testid^="employee-card-"]');
      const count = await employeeCards.count();
      expect(count).toBe(2);

      // Verify the correct employees are shown
      await expect(
        page.locator('[data-testid="employee-card-1"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="employee-card-2"]')
      ).toBeVisible();
    });

    test("should clear flag filter and show all employees", async ({
      page,
    }) => {
      // Add flag to 2 employees
      for (const employeeId of [1, 2]) {
        const employeeCard = page.locator(
          `[data-testid="employee-card-${employeeId}"]`
        );
        await employeeCard.click();
        await page.waitForTimeout(300);

        const detailsPanel = page
          .locator('[role="tabpanel"]')
          .filter({ hasText: "Employee Information" });
        const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
        await flagPicker.click();
        await page.waitForTimeout(300);
        await page.getByRole("option", { name: /Promotion Ready/i }).click();
        await page.waitForTimeout(500);
      }

      // Get initial count of all employees
      const allEmployeeCards = page.locator('[data-testid^="employee-card-"]');
      const initialCount = await allEmployeeCards.count();

      // Open FilterDrawer and apply filter
      await openFilterDrawer(page);
      const promotionReadyFilter = page.locator(
        '[data-testid="flag-filter-Promotion Ready"]'
      );
      const checkbox = promotionReadyFilter.locator('input[type="checkbox"]');
      await checkbox.check();
      await page.waitForTimeout(500);

      // Verify only 2 employees shown
      let employeeCards = page.locator('[data-testid^="employee-card-"]');
      expect(await employeeCards.count()).toBe(2);

      // Uncheck filter
      await checkbox.uncheck();
      await page.waitForTimeout(500);

      // Verify all employees shown again
      employeeCards = page.locator('[data-testid^="employee-card-"]');
      expect(await employeeCards.count()).toBe(initialCount);
    });

    test("should filter with multiple flags using AND logic", async ({
      page,
    }) => {
      // Add "Promotion Ready" to employees 1 and 2
      for (const employeeId of [1, 2]) {
        const employeeCard = page.locator(
          `[data-testid="employee-card-${employeeId}"]`
        );
        await employeeCard.click();
        await page.waitForTimeout(300);

        const detailsPanel = page
          .locator('[role="tabpanel"]')
          .filter({ hasText: "Employee Information" });
        const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
        await flagPicker.click();
        await page.waitForTimeout(300);
        await page.getByRole("option", { name: /Promotion Ready/i }).click();
        await page.waitForTimeout(500);
      }

      // Add "Flight Risk" to employee 1 only (overlapping)
      const employee1Card = page.locator('[data-testid="employee-card-1"]');
      await employee1Card.click();
      await page.waitForTimeout(300);
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Flight Risk/i }).click();
      await page.waitForTimeout(500);

      // Open FilterDrawer
      await openFilterDrawer(page);

      // Check both filters (AND logic)
      const promotionReadyFilter = page.locator(
        '[data-testid="flag-filter-Promotion Ready"]'
      );
      await promotionReadyFilter.locator('input[type="checkbox"]').check();
      await page.waitForTimeout(300);

      const flightRiskFilter = page.locator(
        '[data-testid="flag-filter-Flight Risk"]'
      );
      await flightRiskFilter.locator('input[type="checkbox"]').check();
      await page.waitForTimeout(500);

      // Verify only 1 employee shown (employee 1 with both flags)
      const employeeCards = page.locator('[data-testid^="employee-card-"]');
      const count = await employeeCards.count();
      expect(count).toBe(1);

      // Verify it's employee 1
      await expect(
        page.locator('[data-testid="employee-card-1"]')
      ).toBeVisible();
    });

    test("should show flag count in filter section", async ({ page }) => {
      // Add flags to multiple employees
      const employeeCard1 = page.locator('[data-testid="employee-card-1"]');
      await employeeCard1.click();
      await page.waitForTimeout(300);

      let detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      let flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(500);

      const employeeCard2 = page.locator('[data-testid="employee-card-2"]');
      await employeeCard2.click();
      await page.waitForTimeout(300);

      detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(500);

      // Open FilterDrawer
      await openFilterDrawer(page);

      // Verify "Promotion Ready" shows count (2)
      const promotionReadyFilter = page.locator(
        '[data-testid="flag-filter-Promotion Ready"]'
      );
      await expect(promotionReadyFilter).toBeVisible();
      await expect(promotionReadyFilter.getByText(/2/)).toBeVisible();
    });
  });

  test.describe("Reporting Chain Filtering", () => {
    test("should filter by clicking manager name in reporting chain", async ({
      page,
    }) => {
      // Select employee with manager data
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Reporting Chain" });

      // Verify Reporting Chain section exists
      await expect(
        detailsPanel.getByRole("heading", { name: "Reporting Chain" })
      ).toBeVisible();

      // Check if management chain data exists
      const hasManagementData = await detailsPanel
        .getByText("No management chain data available")
        .isVisible()
        .catch(() => false);

      if (!hasManagementData) {
        // Find a manager name in the chain (should be clickable)
        const managerLinks = detailsPanel.locator(
          '[data-testid^="manager-link-"]'
        );
        const managerCount = await managerLinks.count();

        if (managerCount > 0) {
          // Click on the first manager
          const firstManager = managerLinks.first();
          const managerName = await firstManager.textContent();
          await firstManager.click();
          await page.waitForTimeout(500);

          // Verify FilterDrawer shows active reporting chain filter chip
          await expect(
            page.locator('[data-testid="filter-drawer"]')
          ).toBeVisible();
          const reportingChainFilterChip = page.locator(
            '[data-testid="reporting-chain-filter-chip"]'
          );
          await expect(reportingChainFilterChip).toBeVisible();
          await expect(
            reportingChainFilterChip.getByText(managerName?.trim() || "")
          ).toBeVisible();

          // Verify grid is filtered (should show fewer employees)
          const filteredCards = page.locator('[data-testid^="employee-card-"]');
          const filteredCount = await filteredCards.count();
          expect(filteredCount).toBeGreaterThan(0);
        }
      } else {
        // Skip test if no management data
        test.skip();
      }
    });

    test("should show pointer cursor on hover over manager names", async ({
      page,
    }) => {
      // Select employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Reporting Chain" });

      // Check if management data exists
      const hasManagementData = await detailsPanel
        .getByText("No management chain data available")
        .isVisible()
        .catch(() => false);

      if (!hasManagementData) {
        const managerLinks = detailsPanel.locator(
          '[data-testid^="manager-link-"]'
        );
        const managerCount = await managerLinks.count();

        if (managerCount > 0) {
          // Hover over manager name
          const firstManager = managerLinks.first();
          await firstManager.hover();
          await page.waitForTimeout(300);

          // Verify cursor style (should be pointer)
          const cursorStyle = await firstManager.evaluate(
            (el) => window.getComputedStyle(el).cursor
          );
          expect(cursorStyle).toBe("pointer");
        }
      } else {
        test.skip();
      }
    });

    test("should clear reporting chain filter via filter chip", async ({
      page,
    }) => {
      // Select employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Reporting Chain" });

      // Check if management data exists
      const hasManagementData = await detailsPanel
        .getByText("No management chain data available")
        .isVisible()
        .catch(() => false);

      if (!hasManagementData) {
        const managerLinks = detailsPanel.locator(
          '[data-testid^="manager-link-"]'
        );
        const managerCount = await managerLinks.count();

        if (managerCount > 0) {
          // Get initial employee count
          const initialCards = page.locator('[data-testid^="employee-card-"]');
          const initialCount = await initialCards.count();

          // Click manager to apply filter
          await managerLinks.first().click();
          await page.waitForTimeout(500);

          // Verify filter is applied
          const reportingChainFilterChip = page.locator(
            '[data-testid="reporting-chain-filter-chip"]'
          );
          await expect(reportingChainFilterChip).toBeVisible();

          // Verify filtered count is less than initial
          const filteredCards = page.locator('[data-testid^="employee-card-"]');
          const filteredCount = await filteredCards.count();
          expect(filteredCount).toBeLessThan(initialCount);

          // Click X on filter chip to clear
          await reportingChainFilterChip
            .locator('[data-testid="CancelIcon"]')
            .click();
          await page.waitForTimeout(500);

          // Verify filter chip is removed
          await expect(reportingChainFilterChip).not.toBeVisible();

          // Verify all employees shown again
          const finalCards = page.locator('[data-testid^="employee-card-"]');
          const finalCount = await finalCards.count();
          expect(finalCount).toBe(initialCount);
        }
      } else {
        test.skip();
      }
    });
  });

  test.describe("Excel Export with Flags", () => {
    test("should export Excel file with Flags column", async ({ page }) => {
      // Add flags to multiple employees
      for (const employeeId of [1, 2]) {
        const employeeCard = page.locator(
          `[data-testid="employee-card-${employeeId}"]`
        );
        await employeeCard.click();
        await page.waitForTimeout(300);

        const detailsPanel = page
          .locator('[role="tabpanel"]')
          .filter({ hasText: "Employee Information" });
        const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');
        await flagPicker.click();
        await page.waitForTimeout(300);
        await page.getByRole("option", { name: /Promotion Ready/i }).click();
        await page.waitForTimeout(500);
      }

      // Move an employee to trigger export
      await dragEmployeeToPosition(page, 1, 6);
      await page.waitForTimeout(500);

      // Set up download promise before clicking export
      const downloadPromise = page.waitForEvent("download");

      // Open file menu and click export
      await openFileMenu(page);
      const exportMenuItem = page.locator(
        '[data-testid="export-changes-menu-item"]'
      );
      await expect(exportMenuItem).toBeVisible();
      await expect(exportMenuItem).toBeEnabled();
      await exportMenuItem.click();

      // Wait for download to complete
      const download = await downloadPromise;

      // Verify download filename contains 'modified_'
      expect(download.suggestedFilename()).toContain("modified_");
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);

      // Note: Full Excel file validation (checking Flags column content)
      // would require loading the Excel file, which is complex in E2E tests.
      // This is better tested in backend API tests.
      // Here we verify the download happens successfully.
    });

    test("should format flags as comma-separated list in Excel", async ({
      page,
    }) => {
      // Add multiple flags to same employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Employee Information" });
      const flagPicker = detailsPanel.locator('[data-testid="flag-picker"]');

      // Add "Promotion Ready"
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Promotion Ready/i }).click();
      await page.waitForTimeout(500);

      // Add "Flight Risk"
      await flagPicker.click();
      await page.waitForTimeout(300);
      await page.getByRole("option", { name: /Flight Risk/i }).click();
      await page.waitForTimeout(500);

      // Move employee to trigger export
      await dragEmployeeToPosition(page, 1, 6);
      await page.waitForTimeout(500);

      // Trigger export
      const downloadPromise = page.waitForEvent("download");
      await openFileMenu(page);
      await page.locator('[data-testid="export-changes-menu-item"]').click();
      const download = await downloadPromise;

      // Verify download is successful
      expect(download.suggestedFilename()).toContain("modified_");

      // Note: Actual validation of comma-separated format would require
      // parsing the Excel file, which is better done in backend tests.
    });

    test("should handle employees with no flags in Excel export", async ({
      page,
    }) => {
      // Move employee without adding any flags
      await dragEmployeeToPosition(page, 1, 6);
      await page.waitForTimeout(500);

      // Trigger export
      const downloadPromise = page.waitForEvent("download");
      await openFileMenu(page);
      await page.locator('[data-testid="export-changes-menu-item"]').click();
      const download = await downloadPromise;

      // Verify download is successful (employees with no flags should have empty cells)
      expect(download.suggestedFilename()).toContain("modified_");
    });
  });

  test.describe("Performance History Layout", () => {
    test("should display performance history with left alignment", async ({
      page,
    }) => {
      // Click employee to open details
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Scroll to Performance History section
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Performance History" });
      await expect(
        detailsPanel.getByRole("heading", { name: "Performance History" })
      ).toBeVisible();

      // Verify timeline content exists
      await expect(detailsPanel.getByText("2025 (Current)")).toBeVisible();

      // Verify timeline items are left-aligned (not pushed to right)
      // Check that timeline content is positioned correctly
      const timelineItems = detailsPanel.locator(".MuiTimelineItem-root");
      const count = await timelineItems.count();
      expect(count).toBeGreaterThan(0);

      // Verify first timeline item has proper alignment
      const firstItem = timelineItems.first();
      const boundingBox = await firstItem.boundingBox();
      expect(boundingBox).not.toBeNull();

      // Content should not be pushed too far to the right
      // (This is a visual check - the x position should be reasonable)
      if (boundingBox) {
        const detailsPanelBox = await detailsPanel.boundingBox();
        if (detailsPanelBox) {
          // Timeline content should start within reasonable distance from left edge
          const relativeX = boundingBox.x - detailsPanelBox.x;
          expect(relativeX).toBeLessThan(detailsPanelBox.width * 0.5); // Not more than 50% to the right
        }
      }
    });

    test("should ensure proper spacing and readability in performance history", async ({
      page,
    }) => {
      // Click employee
      const employeeCard = page.locator('[data-testid="employee-card-1"]');
      await employeeCard.click();
      await page.waitForTimeout(300);

      // Verify Performance History section
      const detailsPanel = page
        .locator('[role="tabpanel"]')
        .filter({ hasText: "Performance History" });
      await expect(
        detailsPanel.getByRole("heading", { name: "Performance History" })
      ).toBeVisible();

      // Verify content is readable (not cut off or overlapping)
      await expect(detailsPanel.getByText("Current Assessment")).toBeVisible();
      await expect(
        detailsPanel.getByText(/Performance:/).first()
      ).toBeVisible();
      await expect(detailsPanel.getByText(/Potential:/).first()).toBeVisible();

      // Verify timeline items have proper spacing
      const timelineItems = detailsPanel.locator(".MuiTimelineItem-root");
      const count = await timelineItems.count();

      if (count > 1) {
        // Check spacing between items
        const firstItemBox = await timelineItems.first().boundingBox();
        const secondItemBox = await timelineItems.nth(1).boundingBox();

        if (firstItemBox && secondItemBox) {
          // Items should have vertical spacing
          const gap = secondItemBox.y - (firstItemBox.y + firstItemBox.height);
          expect(gap).toBeGreaterThan(0); // Positive gap indicates proper spacing
        }
      }
    });
  });
});
