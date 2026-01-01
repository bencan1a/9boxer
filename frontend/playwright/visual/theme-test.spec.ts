/**
 * Visual regression tests for theme consistency
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("Theme Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Use full page viewport for theme tests
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test("color palette showcase", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "design-system-theme--color-palette",
      "theme-color-palette"
    );
  });

  test("typography showcase", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "design-system-theme--typography",
      "theme-typography"
    );
  });

  test("spacing showcase", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "design-system-theme--spacing",
      "theme-spacing"
    );
  });
});
