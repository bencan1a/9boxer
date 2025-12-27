/**
 * Visual regression tests for EmployeeTileList component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("EmployeeTileList Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 600, height: 800 });
  });

  test("empty tile list", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--empty",
      "employee-tile-list-empty"
    );
  });

  test("normal layout", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--normal-layout",
      "employee-tile-list-normal-layout"
    );
  });

  test("expanded layout", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--expanded-layout",
      "employee-tile-list-expanded-layout"
    );
  });

  test("few employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--few-employees",
      "employee-tile-list-few-employees"
    );
  });

  test("many employees scrollable", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--many-employees-scrollable",
      "employee-tile-list-many-employees-scrollable"
    );
  });

  test("donut mode layout", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--donut-mode",
      "employee-tile-list-donut-mode"
    );
  });

  test("with flags", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--with-flags",
      "employee-tile-list-with-flags"
    );
  });

  test("with modified employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-employeetilelist--with-modified-employees",
      "employee-tile-list-with-modified-employees"
    );
  });
});
