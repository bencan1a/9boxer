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
      "grid-gridbox--empty",
      "grid-box-empty"
    );
  });

  test("grid box with employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridbox--with-employees",
      "grid-box-with-employees"
    );
  });

  test("collapsed grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridbox--collapsed",
      "grid-box-collapsed"
    );
  });

  test("expanded grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridbox--expanded",
      "grid-box-expanded"
    );
  });

  test("grid box with many employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridbox--many-employees",
      "grid-box-many-employees"
    );
  });

  test("needs attention grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridbox--needs-attention",
      "grid-box-needs-attention"
    );
  });

  test("development grid box", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-gridbox--development",
      "grid-box-development"
    );
  });
});
