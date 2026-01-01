/**
 * Visual regression tests for Axis component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("Axis Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 400, height: 300 });
  });

  test("horizontal axis default", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-axis--horizontal",
      "axis-horizontal"
    );
  });

  test("vertical axis default", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-axis--vertical",
      "axis-vertical"
    );
  });

  test("horizontal axis custom label", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-axis--custom-horizontal-label",
      "axis-horizontal-custom"
    );
  });

  test("vertical axis custom label", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-axis--custom-vertical-label",
      "axis-vertical-custom"
    );
  });

  test("hidden horizontal axis", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-axis--hidden-horizontal",
      "axis-horizontal-hidden"
    );
  });

  test("hidden vertical axis", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-axis--hidden-vertical",
      "axis-vertical-hidden"
    );
  });
});
