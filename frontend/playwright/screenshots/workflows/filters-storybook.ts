/**
 * FilterDrawer Storybook Screenshot Workflow
 *
 * Generates screenshots for FilterDrawer documentation using Storybook stories.
 * This provides faster, more reliable screenshots than full-app workflows.
 *
 * Screenshots generated:
 * - Flags filtering section with checkboxes and counts
 * - Reporting chain filter with active state
 * - FilterDrawer overview showing all sections
 * - Multiple filters active demonstration
 */

import { Page } from "@playwright/test";
import { captureStorybookScreenshot } from "../storybook-screenshot";
import * as fs from "fs";
import * as path from "path";

/**
 * Generate flags filtering screenshot
 *
 * Shows the FilterDrawer with Flags section:
 * - Checkboxes for all 8 flag types
 * - Employee count next to each flag
 * - Some flags checked (active)
 * - Count badge showing active filters
 *
 * Uses Storybook story: app-dashboard-filterdrawer--flags-active
 * Expands the Flags section before capturing screenshot
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFlagsFiltering(
  page: Page,
  outputPath: string
): Promise<void> {
  // Navigate to story using the helper (ensures Storybook is running)
  const { navigateToStory } = await import("../storybook-screenshot");
  await navigateToStory(
    page,
    "app-dashboard-filterdrawer--flags-active",
    "dark"
  );

  // Wait for drawer to be visible
  await page.waitForSelector('[data-testid="filter-drawer"]', {
    state: "visible",
    timeout: 5000,
  });

  // Click to expand the Flags section (it's collapsed by default)
  const flagsAccordion = page.locator('[data-testid="filter-accordion-flags"]');
  await flagsAccordion.click();

  // Wait for expansion animation to complete
  await page.waitForTimeout(500);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Take screenshot of the drawer
  const drawer = page.locator('[data-testid="filter-drawer"]');
  await drawer.screenshot({ path: outputPath });

  console.log(`  ✓ Captured flags section screenshot (expanded)`);
}

/**
 * Generate reporting chain filter active screenshot
 *
 * Shows the ReportingChainFilter component with employee count:
 * - Green chip with manager icon (AccountTree)
 * - Manager name displayed in chip ("Reporting to: Jane Smith")
 * - Employee count badge
 * - Chip can be dismissed with X button
 * - Dark theme to show contrast
 *
 * Uses Storybook story: dashboard-filters-reportingchainfilter--with-employee-count
 * Component-level story for cleaner screenshot
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateReportingChainFilterActive(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filters-reportingchainfilter--with-employee-count",
    outputPath,
    theme: "dark",
    waitTime: 800,
  });
}

/**
 * Generate FilterDrawer overview screenshot
 *
 * Shows the complete FilterDrawer anatomy with all sections:
 * - Job Levels (MT1-MT6)
 * - Job Functions
 * - Locations
 * - Managers
 * - Flags (8 types)
 * - Reporting Chain
 * - Exclusions
 * - Clear All Filters button
 *
 * Uses Storybook story: dashboard-filterdrawer--all-sections-expanded
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerOverview(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--all-sections-expanded",
    outputPath,
    theme: "dark",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate multiple filters active screenshot
 *
 * Shows the FilterDrawer with multiple filter types active:
 * - Job Functions selected
 * - Locations selected
 * - Flags selected
 * - Reporting chain filter active
 * - Count badges on all sections
 *
 * Uses Storybook story: dashboard-filterdrawer--multiple-filters-active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateMultipleFiltersActive(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--multiple-filters-active",
    outputPath,
    theme: "dark",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate FilterDrawer all expanded screenshot
 *
 * Shows the FilterDrawer with all sections expanded.
 * Used for filters-panel-expanded screenshot.
 *
 * Uses Storybook story: dashboard-filterdrawer--all-sections-expanded
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerAllExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--all-sections-expanded",
    outputPath,
    theme: "dark",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate FilterDrawer Clear All button screenshot
 *
 * Shows the FilterSection component with Clear All button.
 * Used for filters-clear-all-button screenshot.
 *
 * Uses Storybook story: dashboard-filtersection--custom-content
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerClearAll(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match container size (no excess whitespace)
  await page.setViewportSize({ width: 500, height: 700 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filters-filtersection--custom-content",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

/**
 * Generate FilterDrawer calibration screenshot
 *
 * Shows the FilterDrawer with filter selections for calibration workflow.
 * Used for calibration-filters-panel screenshot.
 *
 * Uses Storybook story: dashboard-filterdrawer--multiple-filters-active
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterDrawerCalibration(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--multiple-filters-active",
    outputPath,
    theme: "dark",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]', // Drawer renders in portal
  });
}

/**
 * Generate active filter chips screenshot
 *
 * Shows the AppBar with active filter chips and orange dot indicator.
 * Used for filters-active-chips screenshot.
 *
 * Uses Storybook story: dashboard-appbar-pureappbar--with-active-filters
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateActiveChips(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to match element size (no excess whitespace)
  // Note: Storybook requires minimum ~600px width to avoid hiding content
  await page.setViewportSize({ width: 600, height: 400 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-appbar--with-active-filters",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}

// =============================================================================
// FILTER TOOLBAR SCREENSHOTS (3 screenshots for new FilterToolbar component)
// =============================================================================

/**
 * Generate FilterToolbar expanded screenshot
 *
 * Shows the FilterToolbar in expanded state with all features visible:
 * - Filter button (not highlighted - no active filters)
 * - Employee count display (e.g., "200 employees")
 * - Search box
 * - Positioned at top-left of grid, above vertical axis
 * - Light theme
 *
 * Uses Storybook story: app-common-filtertoolbar--compact-no-filters
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterToolbarExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to show toolbar in context (no excess whitespace)
  await page.setViewportSize({ width: 600, height: 300 });

  await captureStorybookScreenshot(page, {
    storyId: "app-common-filtertoolbar--compact-no-filters",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate FilterToolbar with active filters screenshot
 *
 * Shows FilterToolbar with active filters and highlighted button:
 * - Filter button highlighted in ORANGE/SECONDARY color
 * - Employee count showing filtered subset (e.g., "75 of 200 employees")
 * - Active filter summary visible (e.g., "Level: IC5, IC6")
 * - Light theme
 *
 * Uses Storybook story: app-common-filtertoolbar--compact-with-filters
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterToolbarWithActiveFilters(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 600, height: 300 });

  await captureStorybookScreenshot(page, {
    storyId: "app-common-filtertoolbar--compact-with-filters",
    outputPath,
    theme: "light",
    waitTime: 500,
  });
}

/**
 * Generate FilterToolbar search autocomplete screenshot
 *
 * Shows employee search dropdown with highlighted matches:
 * - Search input field with text entered (e.g., "sarah")
 * - Autocomplete dropdown visible below
 * - Multiple search results (up to 10)
 * - Matched text highlighted with <mark> elements (orange background)
 * - Search results showing name, job level, and manager
 * - Light theme
 *
 * NOTE: This screenshot requires a special story with search results open,
 * or manual interaction via Playwright to trigger the search dropdown.
 * For now, using the compact-with-filters story as a placeholder.
 * TODO: Create a dedicated story for search autocomplete state.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFilterToolbarSearchAutocomplete(
  page: Page,
  outputPath: string
): Promise<void> {
  const { navigateToStory } = await import("../storybook-screenshot");
  const fs = await import("fs");
  const path = await import("path");

  await page.setViewportSize({ width: 600, height: 500 });

  // Navigate to the compact story with filters
  await navigateToStory(
    page,
    "app-common-filtertoolbar--compact-with-filters",
    "light"
  );

  // Wait for toolbar to be visible
  await page.waitForSelector('[data-testid="filter-toolbar"]', {
    state: "visible",
    timeout: 5000,
  });

  // Try to activate search by clicking and typing
  const searchInput = page.locator('input[placeholder*="Search"]');
  if ((await searchInput.count()) > 0) {
    await searchInput.click();
    await searchInput.fill("sarah");
    await page.waitForTimeout(800); // Wait for autocomplete to appear
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Take screenshot of the toolbar area
  const toolbar = page.locator('[data-testid="filter-toolbar"]');
  if ((await toolbar.count()) > 0) {
    await toolbar.screenshot({ path: outputPath });
  } else {
    // Fallback to full storybook root
    const storybookRoot = page.locator("#storybook-root > *");
    await storybookRoot.first().screenshot({ path: outputPath });
  }

  console.log(`  ✓ Captured FilterToolbar search autocomplete (light theme)`);
}

// =============================================================================
// ORG TREE FILTER SCREENSHOTS (3 screenshots for OrgTreeFilter in FilterDrawer)
// =============================================================================

/**
 * Generate OrgTreeFilter expanded screenshot
 *
 * Shows the hierarchical organization tree in FilterDrawer:
 * - FilterDrawer open
 * - "Managers" section expanded
 * - Organization tree showing at least 2-3 levels of hierarchy
 * - Manager names with team size badges (e.g., "Sarah Chen (12)")
 * - Expand/collapse icons visible
 * - Checkboxes for manager selection
 * - Light theme
 *
 * Uses Storybook story: app-dashboard-filterdrawer--managers-selected
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateOrgTreeFilterExpanded(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to accommodate drawer
  await page.setViewportSize({ width: 500, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--managers-selected",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]',
  });
}

/**
 * Generate OrgTreeFilter search screenshot
 *
 * Shows search functionality within the org tree with highlighted matches:
 * - FilterDrawer open with Managers section
 * - Search input field with text entered (e.g., "chen")
 * - Matching manager names highlighted
 * - Tree auto-expanded to show matching descendants
 * - Light theme
 *
 * NOTE: This screenshot requires a special story with search active,
 * or manual interaction via Playwright. Using managers-selected as base.
 * TODO: Create a dedicated story for org tree search state.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateOrgTreeFilterSearch(
  page: Page,
  outputPath: string
): Promise<void> {
  const { navigateToStory } = await import("../storybook-screenshot");
  const fs = await import("fs");
  const path = await import("path");

  await page.setViewportSize({ width: 500, height: 900 });

  // Navigate to the managers selected story
  await navigateToStory(
    page,
    "app-dashboard-filterdrawer--managers-selected",
    "light"
  );

  // Wait for drawer to be visible
  await page.waitForSelector('[data-testid="filter-drawer"]', {
    state: "visible",
    timeout: 5000,
  });

  // Try to find and interact with search input in Managers section
  const searchInput = page.locator(
    '[data-testid="org-tree-search"], .org-tree-filter input[type="text"]'
  );
  if ((await searchInput.count()) > 0) {
    await searchInput.click();
    await searchInput.fill("chen");
    await page.waitForTimeout(800); // Wait for search results to filter
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Take screenshot of the drawer
  const drawer = page.locator('[data-testid="filter-drawer"]');
  if ((await drawer.count()) > 0) {
    await drawer.screenshot({ path: outputPath });
  } else {
    const storybookRoot = page.locator("#storybook-root > *");
    await storybookRoot.first().screenshot({ path: outputPath });
  }

  console.log(`  ✓ Captured OrgTreeFilter search (light theme)`);
}

/**
 * Generate OrgTreeFilter multi-select screenshot
 *
 * Shows multiple managers selected with checkboxes:
 * - FilterDrawer open with Managers section
 * - At least 2-3 managers checked (at different hierarchy levels)
 * - Active filter summary at top of drawer showing selected managers
 * - Checked checkboxes clearly visible
 * - Light theme
 *
 * Uses Storybook story: app-dashboard-filterdrawer--managers-selected
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateOrgTreeMultiSelect(
  page: Page,
  outputPath: string
): Promise<void> {
  await page.setViewportSize({ width: 500, height: 900 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--managers-selected",
    outputPath,
    theme: "light",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]',
  });
}

/**
 * Generate Exclusions Dialog screenshot
 *
 * Shows the ExclusionDialog with:
 * - Quick filter buttons (VPs, Directors+, Managers, Clear All)
 * - Search field
 * - Employee checkbox list
 * - Apply/Cancel buttons
 *
 * Uses Storybook story: app-dashboard-exclusiondialog--default
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateExclusionsDialog(
  page: Page,
  outputPath: string
): Promise<void> {
  // Set viewport to accommodate dialog
  await page.setViewportSize({ width: 700, height: 800 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-exclusiondialog--default",
    outputPath,
    theme: "dark",
    waitTime: 2000,
    selector: '[data-testid="exclusion-dialog"]',
  });
}

// =============================================================================
// FILTER LOGIC SCREENSHOTS (3 screenshots for filters.md)
// =============================================================================

/**
 * Generate filters OR logic example screenshot
 *
 * Shows the FilterDrawer with multiple selections in the Job Functions
 * category (Engineering and Product) to demonstrate OR behavior:
 * employees in EITHER function are shown.
 *
 * Uses Storybook story: app-dashboard-filterdrawer--multiple-selections-or
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFiltersOrLogic(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--multiple-selections-or",
    outputPath,
    theme: "dark",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]',
  });
}

/**
 * Generate filters AND logic example screenshot
 *
 * Shows the FilterDrawer with selections across multiple categories
 * (Job Function + Location + Flag) to demonstrate AND behavior:
 * only employees matching ALL criteria are shown.
 *
 * Uses Storybook story: app-dashboard-filterdrawer--multiple-categories-and
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFiltersAndLogic(
  page: Page,
  outputPath: string
): Promise<void> {
  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-filterdrawer--multiple-categories-and",
    outputPath,
    theme: "dark",
    waitTime: 1500,
    selector: '[data-testid="filter-drawer"]',
  });
}

/**
 * Generate filters active indicator screenshot
 *
 * Shows the AppBar/toolbar area with the Filters button displaying
 * an orange dot badge and the employee count showing filtered vs total.
 *
 * NOTE: This screenshot is source: "full-app" in config.ts because it
 * needs to capture the AppBar in context with the employee count.
 * The WithActiveFilters story in PureAppBar.stories.tsx provides the base.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateFiltersActiveIndicator(
  page: Page,
  outputPath: string
): Promise<void> {
  // Use the AppBar story with active filters
  await page.setViewportSize({ width: 800, height: 400 });

  await captureStorybookScreenshot(page, {
    storyId: "app-dashboard-appbar--with-active-filters",
    outputPath,
    theme: "dark",
    waitTime: 500,
  });
}
