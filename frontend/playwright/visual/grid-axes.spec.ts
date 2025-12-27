/**
 * Visual regression tests for GridAxes component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("GridAxes Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 400, height: 300 });
  });

  test("default axes labels", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridaxes--default",
      "grid-axes-default"
    );
  });

  test("custom axes labels", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridaxes--custom-labels",
      "grid-axes-custom-labels"
    );
  });

  test("hidden axes labels", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridaxes--hidden",
      "grid-axes-hidden"
    );
  });
});
