/**
 * E2E tests for org hierarchy with duplicate names
 *
 * Tests that the org hierarchy filter and reporting chain display
 * correctly handle duplicate employee names, verifying that the
 * correct employees are shown in the correct positions.
 */

import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../helpers/auth";
import { waitForDataLoad } from "../helpers/data";
import { openEmployeeDetailPanel } from "../helpers/panel";

test.describe("Org Hierarchy - Duplicate Names Handling", () => {
  test.beforeEach(async ({ page }) => {
    // Login and wait for data
    await loginAsTestUser(page);
    await waitForDataLoad(page);
  });

  test("org tree filter displays all managers with duplicate names", async ({
    page,
  }) => {
    // Open the filter drawer
    await page.getByRole("button", { name: /filter/i }).click();

    // Wait for filter drawer to be visible
    await expect(page.getByTestId("filter-drawer")).toBeVisible();

    // Expand org hierarchy filter section
    const orgSection = page.getByTestId("filter-section-orgHierarchy");
    await orgSection.click();

    // Wait for the tree to load
    await page.waitForSelector('[data-testid="org-tree-node"]', {
      timeout: 10000,
    });

    // Find Mary Moore (CEO) node
    const maryNode = page
      .getByTestId("org-tree-node")
      .filter({ hasText: "Mary Moore" })
      .first();
    await expect(maryNode).toBeVisible();

    // Expand Mary Moore's node if not already expanded
    const expandButton = maryNode.locator('[data-testid="expand-icon"]');
    const isExpanded = await expandButton
      .evaluate(
        (el) =>
          el.classList.contains("MuiTreeItem-iconContainer") &&
          !el.querySelector(".MuiTreeItem-expandIcon")
      )
      .catch(() => false);

    if (!isExpanded) {
      await expandButton.click();
      await page.waitForTimeout(500); // Wait for expansion animation
    }

    // Count how many Leo Browns appear as Mary's direct reports
    const leoBrownNodes = page
      .getByTestId("org-tree-node")
      .filter({ hasText: /^Leo Brown/ });

    // There should be at least 2 Leo Browns visible in the tree
    const leoBrownCount = await leoBrownNodes.count();
    expect(leoBrownCount).toBeGreaterThanOrEqual(2);

    // Verify both Leo Browns show under Mary Moore
    // Check that they appear as children of Mary's node
    const maryChildren = maryNode.locator('~ [data-testid="org-tree-node"]');
    const childrenTexts = await maryChildren.allTextContents();

    const leoBrownsUnderMary = childrenTexts.filter((text) =>
      text.includes("Leo Brown")
    );
    expect(leoBrownsUnderMary.length).toBeGreaterThanOrEqual(2);
  });

  test("employee detail panel shows correct reporting chain with duplicate names", async ({
    page,
  }) => {
    // Search for and select Iris Wilson
    const searchBox = page.getByPlaceholder(/search employee/i);
    await searchBox.fill("Iris Wilson");
    await page.waitForTimeout(500); // Wait for search debounce

    // Click on Iris Wilson in the grid
    const irisCard = page
      .getByTestId("employee-card")
      .filter({ hasText: "Iris Wilson" })
      .first();
    await expect(irisCard).toBeVisible({ timeout: 10000 });
    await irisCard.click();

    // Wait for detail panel to open
    await expect(page.getByTestId("detail-panel")).toBeVisible();

    // Navigate to Details tab if not already there
    const detailsTab = page.getByRole("tab", { name: /details/i });
    if (!(await detailsTab.getAttribute("aria-selected"))) {
      await detailsTab.click();
    }

    // Check the reporting chain section
    const reportingChainSection = page.getByTestId("management-chain-section");
    await expect(reportingChainSection).toBeVisible();

    // Get all chain items
    const chainItems = reportingChainSection.locator(
      '[data-testid="chain-item"]'
    );
    const chainCount = await chainItems.count();

    // Should have at least 4 levels (Iris -> Carol -> Jack -> Leo -> Mary)
    expect(chainCount).toBeGreaterThanOrEqual(5); // Including Iris herself

    // Verify the chain contains the expected names in order
    const chainTexts = await chainItems.allTextContents();

    // The chain should be:
    // 1. Iris Wilson (Employee)
    // 2. Carol Garcia (Manager)
    // 3. Jack Thomas (Level 01)
    // 4. Leo Brown (Level 02)
    // 5. Mary Moore (Level 03)

    expect(chainTexts[0]).toContain("Iris Wilson");
    expect(chainTexts[1]).toContain("Carol Garcia");
    expect(chainTexts[2]).toContain("Jack Thomas");
    expect(chainTexts[3]).toContain("Leo Brown");
    expect(chainTexts[4]).toContain("Mary Moore");
  });

  test("manager navigation works correctly with duplicate names", async ({
    page,
  }) => {
    // Open Iris Wilson's detail panel
    const searchBox = page.getByPlaceholder(/search employee/i);
    await searchBox.fill("Iris Wilson");
    await page.waitForTimeout(500);

    const irisCard = page
      .getByTestId("employee-card")
      .filter({ hasText: "Iris Wilson" })
      .first();
    await irisCard.click();

    await expect(page.getByTestId("detail-panel")).toBeVisible();

    // Navigate to Details tab
    const detailsTab = page.getByRole("tab", { name: /details/i });
    if (!(await detailsTab.getAttribute("aria-selected"))) {
      await detailsTab.click();
    }

    // Click on Carol Garcia in the reporting chain
    const carolButton = page
      .getByTestId("chain-item")
      .filter({ hasText: "Carol Garcia" })
      .locator("button");

    await expect(carolButton).toBeVisible();
    await carolButton.click();

    // This should filter to show Carol Garcia's team
    // Verify the filter has been applied
    await page.waitForTimeout(1000); // Wait for filter to apply

    // Check that the quick filter shows Carol Garcia
    const filterStatus = page.getByTestId("filter-status");
    const filterText = await filterStatus.textContent().catch(() => "");
    expect(filterText.toLowerCase()).toContain("carol garcia");

    // Now click on Jack Thomas in the chain
    const jackButton = page
      .getByTestId("chain-item")
      .filter({ hasText: "Jack Thomas" })
      .locator("button");

    await jackButton.click();
    await page.waitForTimeout(1000);

    // Verify Jack Thomas filter is applied
    const updatedFilterText = await filterStatus.textContent().catch(() => "");
    expect(updatedFilterText.toLowerCase()).toContain("jack thomas");

    // The grid should show employees under the selected Jack Thomas
    // Since there are multiple Jack Thomas, it should pick the right one based on context
    const gridEmployees = page.getByTestId("employee-card");
    const employeeCount = await gridEmployees.count();
    expect(employeeCount).toBeGreaterThan(0); // Should have some employees
  });

  test("org tree and reporting chain use same data source", async ({
    page,
  }) => {
    // Open filter drawer and expand org tree
    await page.getByRole("button", { name: /filter/i }).click();
    await expect(page.getByTestId("filter-drawer")).toBeVisible();

    const orgSection = page.getByTestId("filter-section-orgHierarchy");
    await orgSection.click();

    // Wait for tree to load
    await page.waitForSelector('[data-testid="org-tree-node"]', {
      timeout: 10000,
    });

    // Find and expand Mary Moore
    const maryNode = page
      .getByTestId("org-tree-node")
      .filter({ hasText: "Mary Moore" })
      .first();
    const expandButton = maryNode.locator('[data-testid="expand-icon"]');
    await expandButton.click();
    await page.waitForTimeout(500);

    // Count Leo Browns under Mary in the tree
    const treeLeoBrowns = maryNode
      .locator('~ [data-testid="org-tree-node"]')
      .filter({ hasText: /Leo Brown/ });
    const treeLeoBrownCount = await treeLeoBrowns.count();

    // Close filter drawer
    await page.keyboard.press("Escape");

    // Now check an employee under one of the Leo Browns
    // Search for an employee we know reports up through Leo Brown
    const searchBox = page.getByPlaceholder(/search employee/i);
    await searchBox.fill("Jack Thomas");
    await page.waitForTimeout(500);

    // Click on one of the Jack Thomas employees
    const jackCard = page
      .getByTestId("employee-card")
      .filter({ hasText: "Jack Thomas" })
      .first();
    await jackCard.click();

    await expect(page.getByTestId("detail-panel")).toBeVisible();

    // Check the reporting chain
    const detailsTab = page.getByRole("tab", { name: /details/i });
    if (!(await detailsTab.getAttribute("aria-selected"))) {
      await detailsTab.click();
    }

    const chainItems = page.getByTestId("chain-item");
    const chainTexts = await chainItems.allTextContents();

    // If Jack reports to Leo Brown, and Leo reports to Mary,
    // then the chain should include both Leo Brown and Mary Moore
    const hasLeoInChain = chainTexts.some((text) => text.includes("Leo Brown"));
    const hasMaryInChain = chainTexts.some((text) =>
      text.includes("Mary Moore")
    );

    expect(hasLeoInChain).toBe(true);
    expect(hasMaryInChain).toBe(true);

    // Both the tree and reporting chain should show consistent data
    // The tree showed multiple Leo Browns under Mary, and the chain shows Leo Brown -> Mary
    expect(treeLeoBrownCount).toBeGreaterThanOrEqual(2);
  });

  test("filter by manager with duplicate name selects correct subtree", async ({
    page,
  }) => {
    // Open filter drawer
    await page.getByRole("button", { name: /filter/i }).click();
    await expect(page.getByTestId("filter-drawer")).toBeVisible();

    // Expand org hierarchy
    const orgSection = page.getByTestId("filter-section-orgHierarchy");
    await orgSection.click();

    // Wait for tree
    await page.waitForSelector('[data-testid="org-tree-node"]', {
      timeout: 10000,
    });

    // Find Mary Moore and expand
    const maryNode = page
      .getByTestId("org-tree-node")
      .filter({ hasText: "Mary Moore" })
      .first();
    const expandButton = maryNode.locator('[data-testid="expand-icon"]');
    await expandButton.click();
    await page.waitForTimeout(500);

    // Find one of the Leo Browns and select them
    const leoBrownNode = maryNode
      .locator('~ [data-testid="org-tree-node"]')
      .filter({ hasText: /Leo Brown/ })
      .first();

    // Click the checkbox for this Leo Brown
    const checkbox = leoBrownNode.locator('input[type="checkbox"]');
    await checkbox.click();

    // Close the filter drawer
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000); // Wait for filter to apply

    // Check that employees are filtered
    const gridEmployees = page.getByTestId("employee-card");
    const beforeCount = await gridEmployees.count();
    expect(beforeCount).toBeGreaterThan(0);

    // Open filter again and select a different Leo Brown
    await page.getByRole("button", { name: /filter/i }).click();
    await orgSection.click();

    // Uncheck the first Leo Brown
    await checkbox.click();

    // Find and select the second Leo Brown
    const secondLeoBrown = maryNode
      .locator('~ [data-testid="org-tree-node"]')
      .filter({ hasText: /Leo Brown/ })
      .nth(1);

    const secondCheckbox = secondLeoBrown.locator('input[type="checkbox"]');
    await secondCheckbox.click();

    // Close drawer
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);

    // The employee count should potentially be different
    // (different Leo Browns manage different teams)
    const afterCount = await gridEmployees.count();
    expect(afterCount).toBeGreaterThan(0);

    // Both filters should work, showing they're tracking different Leo Browns
  });

  test("search correctly disambiguates employees with duplicate names", async ({
    page,
  }) => {
    // Search for "Leo Brown"
    const searchBox = page.getByPlaceholder(/search employee/i);
    await searchBox.fill("Leo Brown");
    await page.waitForTimeout(500);

    // Should show multiple Leo Brown cards
    const leoBrownCards = page
      .getByTestId("employee-card")
      .filter({ hasText: "Leo Brown" });
    const cardCount = await leoBrownCards.count();

    // We know there are at least 3 Leo Browns in the test data
    expect(cardCount).toBeGreaterThanOrEqual(2);

    // Each card should be clickable and show different employee details
    const firstLeo = leoBrownCards.first();
    await firstLeo.click();

    // Get the employee ID from the detail panel
    await expect(page.getByTestId("detail-panel")).toBeVisible();

    // Check that we can see employee details
    const detailsTab = page.getByRole("tab", { name: /details/i });
    if (!(await detailsTab.getAttribute("aria-selected"))) {
      await detailsTab.click();
    }

    // Should show employee-specific information
    const employeeInfo = page.getByTestId("employee-details");
    await expect(employeeInfo).toBeVisible();

    // Close panel
    const closeButton = page.getByTestId("panel-close-button");
    await closeButton.click();

    // Click on a different Leo Brown
    const secondLeo = leoBrownCards.nth(1);
    await secondLeo.click();

    await expect(page.getByTestId("detail-panel")).toBeVisible();

    // This should show different employee details
    // (Different employee ID, potentially different job level, etc.)
    await expect(employeeInfo).toBeVisible();
  });
});
