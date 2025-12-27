/**
 * Visual regression tests for NineBoxGrid component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("NineBoxGrid Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set larger viewport for grid
    await page.setViewportSize({ width: 1400, height: 1000 });
  });

  test("default populated grid", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--default",
      "nine-box-grid-default"
    );
  });

  test("empty grid", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--empty",
      "nine-box-grid-empty"
    );
  });

  test("populated grid", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--populated",
      "nine-box-grid-populated"
    );
  });

  test("skewed distribution", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--skewed-distribution",
      "nine-box-grid-skewed-distribution"
    );
  });

  test("single box concentration", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--single-box-concentration",
      "nine-box-grid-single-box-concentration"
    );
  });

  test("with box expanded", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--with-box-expanded",
      "nine-box-grid-with-box-expanded"
    );
  });

  test("donut mode", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--donut-mode",
      "nine-box-grid-donut-mode"
    );
  });

  test("with flags", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--with-flags",
      "nine-box-grid-with-flags"
    );
  });

  test("with modified employees", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--with-modified-employees",
      "nine-box-grid-with-modified-employees"
    );
  });

  test("loading state", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--loading-state",
      "nine-box-grid-loading-state"
    );
  });

  test("sparse distribution", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "grid-nineboxgrid--sparse-distribution",
      "nine-box-grid-sparse-distribution"
    );
  });
});
