/**
 * Visual regression tests for LoadingSpinner component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("LoadingSpinner Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 400, height: 300 });
  });

  test("default spinner appearance", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-common-loadingspinner--default",
      "loading-spinner-default"
    );
  });

  test("small spinner appearance", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-common-loadingspinner--small",
      "loading-spinner-small"
    );
  });

  test("large spinner appearance", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-common-loadingspinner--large",
      "loading-spinner-large"
    );
  });

  test("with custom color", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-common-loadingspinner--with-custom-color",
      "loading-spinner-custom-color"
    );
  });
});
