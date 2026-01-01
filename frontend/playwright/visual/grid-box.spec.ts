/**
 * Visual regression tests for GridBox component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("GridBox Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 700, height: 600 });
  });

  test("empty grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-gridbox--empty",
      "app-grid-box-empty"
    );
  });

  test("grid box with employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-gridbox--with-employees",
      "app-grid-box-with-employees"
    );
  });

  test("collapsed grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-gridbox--collapsed",
      "app-grid-box-collapsed"
    );
  });

  test("expanded grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-gridbox--expanded",
      "app-grid-box-expanded"
    );
  });

  test("grid box with many employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-gridbox--many-employees",
      "app-grid-box-many-employees"
    );
  });

  test("needs attention grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-gridbox--needs-attention",
      "app-grid-box-needs-attention"
    );
  });

  test("development grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-gridbox--development",
      "app-grid-box-development"
    );
  });
});
