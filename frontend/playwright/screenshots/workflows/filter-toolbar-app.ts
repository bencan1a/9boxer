/**
 * FilterToolbar Integration Screenshots (Full-App Workflow)
 *
 * Generates screenshots showing the FilterToolbar integrated with the actual
 * application, not Storybook. These screenshots demonstrate:
 * - FilterToolbar visible on the grid at top-left
 * - Active filter states with orange button highlighting
 * - FilterDrawer open showing OrgTreeFilter integration
 * - Full grid view with toolbar visible
 *
 * Why full-app vs Storybook:
 * - Need to show FilterToolbar in context with the actual grid
 * - Need to demonstrate real filter state propagation
 * - Need to capture FilterDrawer + toolbar interaction
 *
 * Related requirements:
 * - resources/user-guide/SCREENSHOT_REQUIREMENTS.md
 * - frontend/src/components/common/FilterToolbar.tsx (integrated at grid level)
 * - frontend/src/components/grid/NineBoxGrid.tsx (FilterToolbarContainer rendered)
 */

import { Page, expect } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import {
  closeAllDialogsAndOverlays,
  openFilterDrawer,
  waitForUiSettle,
} from "../../helpers/ui";
import {
  verifyFilterActive,
  waitForCssTransition,
  CSS_TRANSITION_DURATIONS,
} from "../../helpers/visualValidation";
import * as fs from "fs";
import * as path from "path";

/**
 * Generate FilterDrawer expanded showing OrgTreeFilter
 *
 * Replaces the old filters-panel-expanded.png screenshot to show:
 * - FilterDrawer open from actual application (not Storybook)
 * - OrgTreeFilter with hierarchical org tree visible
 * - Manager names with team size badges
 * - Expand/collapse icons and checkboxes
 * - Other filter sections (Levels, Functions, Locations)
 *
 * Screenshot: filters/filters-panel-expanded.png
 */
export async function generateFilterDrawerExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer using helper
  await openFilterDrawer(page);

  // Wait for drawer open animation to complete
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await filterDrawer.waitFor({ state: "visible" });
  await waitForCssTransition(
    filterDrawer,
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // Expand the Managers section to show OrgTreeFilter
  const managersAccordion = page.locator(
    '[data-testid="filter-accordion-managers"]'
  );
  if (await managersAccordion.isVisible()) {
    // Check if already expanded by looking for the tree content
    const orgTreeVisible = await page
      .locator('[data-testid="org-tree-filter"]')
      .isVisible();

    if (!orgTreeVisible) {
      await managersAccordion.click();
      await waitForUiSettle(page, 0.5);

      // Wait for org tree to become visible
      await page
        .locator('[data-testid="org-tree-filter"]')
        .waitFor({ state: "visible", timeout: 3000 });
    }
  }

  // Expand Job Levels section for more content
  const levelsAccordion = page.locator(
    '[data-testid="filter-accordion-job-levels"]'
  );
  if (await levelsAccordion.isVisible()) {
    const levelsExpanded = await levelsAccordion.getAttribute("aria-expanded");
    if (levelsExpanded !== "true") {
      await levelsAccordion.click();
      await waitForUiSettle(page, 0.3);
    }
  }

  // Wait for all animations to settle
  await waitForUiSettle(page, 0.5);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the filter drawer showing OrgTreeFilter
  await filterDrawer.screenshot({
    path: outputPath,
  });

  console.log("✓ Captured FilterDrawer with OrgTreeFilter expanded");

  // Close drawer after capturing
  await closeAllDialogsAndOverlays(page);
}

/**
 * Generate active filter indicator screenshot
 *
 * Shows the FilterToolbar with:
 * - Orange highlighted filter button (indicating active filters)
 * - Filtered employee count (e.g., "45 of 200 employees")
 * - Filter summary text visible in toolbar
 *
 * This captures the toolbar in the actual grid context, not Storybook.
 *
 * Screenshot: filters/filters-active-indicator.png
 */
export async function generateFilterActiveIndicator(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer
  await openFilterDrawer(page);

  // Wait for drawer animation
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await waitForCssTransition(
    filterDrawer,
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // Select some filters to activate the orange indicator
  // Expand Job Levels section
  const levelsAccordion = page.locator(
    '[data-testid="filter-accordion-job-levels"]'
  );
  if (await levelsAccordion.isVisible()) {
    await levelsAccordion.click();
    await waitForUiSettle(page, 0.3);
  }

  // Select first two level checkboxes
  const firstCheckbox = page
    .locator('[data-testid^="filter-checkbox-job-levels-"]')
    .first();
  await firstCheckbox.check();
  await waitForUiSettle(page, 0.3);

  const secondCheckbox = page
    .locator('[data-testid^="filter-checkbox-job-levels-"]')
    .nth(1);
  if (await secondCheckbox.isVisible()) {
    await secondCheckbox.check();
    await waitForUiSettle(page, 0.3);
  }

  // Close filter drawer to show the active filter indicator
  const closeButton = page.locator('[data-testid="filter-close-button"]');
  if ((await closeButton.count()) > 0) {
    await closeButton.click();
  } else {
    await page.keyboard.press("Escape");
  }

  // Wait for drawer to close
  await expect(filterDrawer).not.toBeVisible();

  // Verify orange dot indicator is visible
  await verifyFilterActive(page);
  await waitForUiSettle(page, 0.3);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the FilterToolbar area showing the active filter button
  // We want to capture just the toolbar area at the top-left of the grid
  const filterToolbar = page.locator('[data-testid="filter-toolbar"]');
  await expect(filterToolbar).toBeVisible();

  await filterToolbar.screenshot({
    path: outputPath,
  });

  console.log("✓ Captured active filter indicator (orange button)");

  // Leave filters active for subsequent screenshots if needed
}

/**
 * Generate full grid with FilterToolbar visible
 *
 * Shows the complete 9-box grid with the FilterToolbar positioned at top-left:
 * - FilterToolbar visible above the vertical axis
 * - Full grid with employee tiles
 * - Performance and Potential axes labeled
 * - Clean state with no active filters
 *
 * This demonstrates the integration of FilterToolbar with the grid layout.
 *
 * Screenshot: toolbar/filter-toolbar-and-grid.png (NEW)
 */
export async function generateFilterToolbarAndGrid(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs and clear any active filters
  await closeAllDialogsAndOverlays(page);

  // If filters are active, clear them
  const filterButton = page.locator('[data-testid="filter-button"]');
  const badgeExists = await page
    .locator('[data-testid="filter-button"] .MuiBadge-badge')
    .isVisible()
    .catch(() => false);

  if (badgeExists) {
    // Open drawer and clear filters
    await openFilterDrawer(page);
    await waitForCssTransition(
      page.locator('[data-testid="filter-drawer"]'),
      CSS_TRANSITION_DURATIONS.enteringScreen
    );

    const clearButton = page.locator('[data-testid="clear-filter-button"]');
    if ((await clearButton.count()) > 0 && (await clearButton.isEnabled())) {
      await clearButton.click();
      await waitForUiSettle(page, 0.3);
    }

    await closeAllDialogsAndOverlays(page);
  }

  // Wait for UI to settle
  await waitForUiSettle(page, 0.5);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the entire grid area including FilterToolbar
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.screenshot({
    path: outputPath,
  });

  console.log(
    "✓ Captured full grid with FilterToolbar visible (no active filters)"
  );
}

/**
 * Generate grid basic layout screenshot
 *
 * Updates the existing grid-basic-layout.png to show FilterToolbar.
 * This is the foundational screenshot showing:
 * - Complete 9-box grid with all 9 positions labeled
 * - Performance axis (horizontal): Low/Medium/High
 * - Potential axis (vertical): Low/Medium/High
 * - FilterToolbar positioned at top-left
 * - Employee tiles distributed across boxes
 *
 * Screenshot: grid/grid-basic-layout.png (UPDATED)
 */
export async function generateGridBasicLayoutWithToolbar(
  page: Page,
  outputPath: string
): Promise<void> {
  // Reuse the logic from generateFilterToolbarAndGrid
  // This ensures consistency - same setup, just different output path
  await generateFilterToolbarAndGrid(page, outputPath);
  console.log(
    "✓ Updated grid-basic-layout.png to include FilterToolbar integration"
  );
}

/**
 * Generate FilterToolbar with search autocomplete
 *
 * Shows the employee search functionality:
 * - Search input field with text entered
 * - Autocomplete dropdown visible below toolbar
 * - Multiple search results showing
 * - Matched text highlighted with <mark> elements
 *
 * Screenshot: toolbar/filter-toolbar-search-autocomplete.png (NEW)
 */
export async function generateFilterToolbarSearchAutocomplete(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Locate the search input in FilterToolbar
  const searchInput = page
    .locator('[data-testid="filter-toolbar"] input[type="text"]')
    .first();
  await expect(searchInput).toBeVisible();

  // Type a search query to trigger autocomplete
  await searchInput.fill("a"); // Search for common letter to get multiple results
  await waitForUiSettle(page, 0.5);

  // Wait for autocomplete dropdown to appear
  const autocompleteDropdown = page.locator('[role="listbox"]');
  await autocompleteDropdown.waitFor({ state: "visible", timeout: 3000 });

  // Wait for search results to populate
  await waitForUiSettle(page, 0.3);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the FilterToolbar with search dropdown
  // We want to capture the toolbar + dropdown area
  const filterToolbar = page.locator('[data-testid="filter-toolbar"]');

  // Get bounding boxes to capture both toolbar and dropdown
  const toolbarBox = await filterToolbar.boundingBox();
  const dropdownBox = await autocompleteDropdown.boundingBox();

  if (toolbarBox && dropdownBox) {
    // Calculate combined area
    const x = Math.min(toolbarBox.x, dropdownBox.x);
    const y = Math.min(toolbarBox.y, dropdownBox.y);
    const maxX = Math.max(
      toolbarBox.x + toolbarBox.width,
      dropdownBox.x + dropdownBox.width
    );
    const maxY = Math.max(
      toolbarBox.y + toolbarBox.height,
      dropdownBox.y + dropdownBox.height
    );

    await page.screenshot({
      path: outputPath,
      clip: {
        x,
        y,
        width: maxX - x,
        height: maxY - y,
      },
    });

    console.log("✓ Captured FilterToolbar with search autocomplete dropdown");
  } else {
    // Fallback: just capture the toolbar
    await filterToolbar.screenshot({ path: outputPath });
    console.warn(
      "⚠ Could not capture full dropdown area, captured toolbar only"
    );
  }

  // Clear search to reset state
  await searchInput.clear();
  await waitForUiSettle(page, 0.2);
}

/**
 * Generate OrgTreeFilter expanded screenshot
 *
 * Shows the hierarchical organization tree in the FilterDrawer:
 * - Organization tree with 2-3 levels of hierarchy visible
 * - Manager names with team size badges (e.g., "Sarah Chen (12)")
 * - Expand/collapse icons visible
 * - Checkboxes for manager selection
 * - Search input field above the tree
 *
 * Screenshot: filters/org-tree-filter-expanded.png (NEW)
 */
export async function generateOrgTreeFilterExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer
  await openFilterDrawer(page);

  // Wait for drawer animation
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await waitForCssTransition(
    filterDrawer,
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // Expand the Managers section to show OrgTreeFilter
  const managersAccordion = page.locator(
    '[data-testid="filter-accordion-managers"]'
  );
  if (await managersAccordion.isVisible()) {
    await managersAccordion.click();
    await waitForUiSettle(page, 0.5);

    // Wait for org tree to become visible
    await page
      .locator('[data-testid="org-tree-filter"]')
      .waitFor({ state: "visible", timeout: 3000 });
  }

  // Expand some tree nodes to show hierarchy
  const expandButtons = page.locator(
    '[data-testid="org-tree-filter"] button[aria-label*="Expand"]'
  );
  const expandCount = Math.min(await expandButtons.count(), 2);
  for (let i = 0; i < expandCount; i++) {
    await expandButtons.nth(i).click();
    await waitForUiSettle(page, 0.2);
  }

  // Wait for expansion animations
  await waitForUiSettle(page, 0.5);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture just the OrgTreeFilter section
  const orgTreeFilter = page.locator('[data-testid="org-tree-filter"]');
  if (await orgTreeFilter.isVisible()) {
    // Capture with some padding to show context
    const managersSection = page.locator(
      '[data-testid="filter-section-managers"]'
    );
    await managersSection.screenshot({
      path: outputPath,
    });

    console.log("✓ Captured OrgTreeFilter with expanded hierarchy");
  } else {
    // Fallback: capture the whole drawer
    await filterDrawer.screenshot({ path: outputPath });
    console.warn("⚠ OrgTreeFilter not visible, captured full drawer");
  }

  // Close drawer after capturing
  await closeAllDialogsAndOverlays(page);
}

/**
 * Generate OrgTreeFilter with search highlighting
 *
 * Shows the search functionality within the org tree:
 * - Search input with text entered (e.g., "chen")
 * - Matching manager names highlighted
 * - Tree auto-expanded to show matching descendants
 * - Non-matching items filtered out or dimmed
 *
 * Screenshot: filters/org-tree-filter-search.png (NEW)
 */
export async function generateOrgTreeFilterSearch(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer
  await openFilterDrawer(page);

  // Wait for drawer animation
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await waitForCssTransition(
    filterDrawer,
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // Expand the Managers section
  const managersAccordion = page.locator(
    '[data-testid="filter-accordion-managers"]'
  );
  if (await managersAccordion.isVisible()) {
    await managersAccordion.click();
    await waitForUiSettle(page, 0.5);

    await page
      .locator('[data-testid="org-tree-filter"]')
      .waitFor({ state: "visible", timeout: 3000 });
  }

  // Find and fill the search input within OrgTreeFilter
  const searchInput = page.locator(
    '[data-testid="org-tree-filter"] input[type="text"]'
  );
  if (await searchInput.isVisible()) {
    await searchInput.fill("a"); // Search for common letter
    await waitForUiSettle(page, 0.8); // Wait for debounce + filtering

    // Verify highlighting is present
    const highlightedText = page.locator(
      '[data-testid="org-tree-filter"] mark'
    );
    const highlightCount = await highlightedText.count();
    if (highlightCount > 0) {
      console.log(`✓ Found ${highlightCount} highlighted matches in org tree`);
    } else {
      console.warn("⚠ No highlighted matches found");
    }
  }

  // Wait for search results to update
  await waitForUiSettle(page, 0.3);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the Managers section with search active
  const managersSection = page.locator(
    '[data-testid="filter-section-managers"]'
  );
  await managersSection.screenshot({
    path: outputPath,
  });

  console.log("✓ Captured OrgTreeFilter with search highlighting");

  // Close drawer after capturing
  await closeAllDialogsAndOverlays(page);
}

/**
 * Generate OrgTreeFilter with multiple managers selected
 *
 * Shows multiple manager selections with checkboxes:
 * - At least 2-3 managers checked at different hierarchy levels
 * - Checked checkboxes clearly visible
 * - Active filter summary showing selected managers
 * - Team size badges visible
 *
 * Screenshot: filters/org-tree-multi-select.png (NEW)
 */
export async function generateOrgTreeMultiSelect(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure data is loaded
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  if ((await employeeCards.count()) === 0) {
    await loadSampleData(page);
    await waitForUiSettle(page, 1.0);
  }

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Open filters drawer
  await openFilterDrawer(page);

  // Wait for drawer animation
  const filterDrawer = page.locator('[data-testid="filter-drawer"]');
  await waitForCssTransition(
    filterDrawer,
    CSS_TRANSITION_DURATIONS.enteringScreen
  );

  // Expand the Managers section
  const managersAccordion = page.locator(
    '[data-testid="filter-accordion-managers"]'
  );
  if (await managersAccordion.isVisible()) {
    await managersAccordion.click();
    await waitForUiSettle(page, 0.5);

    await page
      .locator('[data-testid="org-tree-filter"]')
      .waitFor({ state: "visible", timeout: 3000 });
  }

  // Expand some tree nodes to reveal more managers
  const expandButtons = page.locator(
    '[data-testid="org-tree-filter"] button[aria-label*="Expand"]'
  );
  const expandCount = Math.min(await expandButtons.count(), 2);
  for (let i = 0; i < expandCount; i++) {
    await expandButtons.nth(i).click();
    await waitForUiSettle(page, 0.2);
  }

  // Select multiple manager checkboxes
  const checkboxes = page.locator(
    '[data-testid="org-tree-filter"] input[type="checkbox"]'
  );
  const checkboxCount = await checkboxes.count();
  const selectCount = Math.min(checkboxCount, 3);

  for (let i = 0; i < selectCount; i++) {
    // Select every other checkbox to get different hierarchy levels
    await checkboxes.nth(i * 2).check();
    await waitForUiSettle(page, 0.2);
  }

  // Wait for filter state to update
  await waitForUiSettle(page, 0.5);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Capture the entire drawer to show both the selections and summary
  await filterDrawer.screenshot({
    path: outputPath,
  });

  console.log(`✓ Captured OrgTreeFilter with ${selectCount} managers selected`);

  // Close drawer after capturing
  await closeAllDialogsAndOverlays(page);
}
