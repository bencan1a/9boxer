/**
 * Visual regression tests for BoxHeader component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("BoxHeader Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 400, height: 200 });
  });

  test("normal box header", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-boxheader--normal",
      "box-header-normal"
    );
  });

  test("expanded box header", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-boxheader--expanded",
      "box-header-expanded"
    );
  });

  test("collapsed box header", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-boxheader--collapsed",
      "box-header-collapsed"
    );
  });

  test("empty box header", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-boxheader--empty",
      "box-header-empty"
    );
  });

  test("box header with many employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-boxheader--many-employees",
      "box-header-many-employees"
    );
  });

  test("development position box header", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-boxheader--development-position",
      "box-header-development-position"
    );
  });
});
