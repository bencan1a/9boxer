/**
 * Helper functions for visual regression testing of Storybook components
 */
import { Page, expect } from "@playwright/test";

/**
 * Navigate to a specific Storybook story in iframe mode (component only, no UI chrome)
 *
 * @param page - Playwright page object
 * @param storyId - Story ID in format 'component-name--story-name' (e.g., 'common-loadingspinner--default')
 * @param theme - Optional theme override ('light' or 'dark')
 */
export async function navigateToStory(
  page: Page,
  storyId: string,
  theme?: "light" | "dark"
): Promise<void> {
  const baseUrl = "http://localhost:6006/iframe.html";
  const url = `${baseUrl}?id=${storyId}&viewMode=story${theme ? `&globals=theme:${theme}` : ""}`;

  await page.goto(url, { waitUntil: "networkidle" });

  // Wait for Storybook to render the component
  // Look for the story root element
  await page.waitForSelector("#storybook-root", { state: "visible" });

  // Additional wait to ensure all animations/transitions complete
  await page.waitForTimeout(500);
}

/**
 * Take a visual snapshot of a Storybook story
 *
 * @param page - Playwright page object
 * @param storyId - Story ID in format 'component-name--story-name'
 * @param snapshotName - Name for the snapshot file (auto-generated if not provided)
 * @param options - Additional screenshot options
 */
export async function snapshotStory(
  page: Page,
  storyId: string,
  snapshotName?: string,
  options?: {
    theme?: "light" | "dark";
    fullPage?: boolean;
    mask?: string[]; // CSS selectors to mask
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
  }
): Promise<void> {
  // Navigate to the story
  await navigateToStory(page, storyId, options?.theme);

  // Generate snapshot name if not provided
  const finalSnapshotName =
    snapshotName ||
    `${storyId}${options?.theme ? `-${options.theme}` : ""}.png`;

  // Build mask locators if provided
  const maskLocators =
    options?.mask?.map((selector) => page.locator(selector)) || [];

  // Take the snapshot with Playwright's built-in visual comparison
  // Use config defaults (100 pixels, 1% ratio) if not explicitly provided
  await expect(page).toHaveScreenshot(finalSnapshotName, {
    fullPage: options?.fullPage ?? false,
    mask: maskLocators,
    maxDiffPixels: options?.maxDiffPixels ?? 100,
    maxDiffPixelRatio: options?.maxDiffPixelRatio ?? 0.01,
    animations: "disabled",
    scale: "css",
  });
}

/**
 * Test a story in both light and dark themes
 *
 * @param page - Playwright page object
 * @param storyId - Story ID in format 'component-name--story-name'
 * @param baseName - Base name for snapshots (will add -light/-dark suffix)
 */
export async function snapshotStoryBothThemes(
  page: Page,
  storyId: string,
  baseName?: string
): Promise<void> {
  const base = baseName || storyId;

  // Test light theme
  await snapshotStory(page, storyId, `${base}-light.png`, { theme: "light" });

  // Test dark theme
  await snapshotStory(page, storyId, `${base}-dark.png`, { theme: "dark" });
}

/**
 * Wait for Storybook component to be fully loaded and stable
 *
 * @param page - Playwright page object
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForStoryReady(
  page: Page,
  timeout = 2000
): Promise<void> {
  // Wait for the story root
  await page.waitForSelector("#storybook-root", { state: "visible" });

  // Wait for any loading spinners to disappear
  const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  if (await loadingSpinner.isVisible()) {
    await loadingSpinner.waitFor({ state: "hidden", timeout });
  }

  // Small buffer for animations
  await page.waitForTimeout(300);
}
