/**
 * Visual regression tests for EmployeeTile component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("EmployeeTile Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 400, height: 300 });
  });

  test("default employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--default",
      "employee-tile-default"
    );
  });

  test("modified employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--modified-normal-mode",
      "employee-tile-modified"
    );
  });

  test("donut modified employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--modified-donut-mode",
      "employee-tile-donut-modified"
    );
  });

  test("long name employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--default",
      "employee-tile-long-name"
    );
  });

  test("with all fields employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--default",
      "employee-tile-with-all-fields"
    );
  });

  test("minimal data employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--default",
      "employee-tile-minimal-data"
    );
  });

  test("with flags employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--with-flags",
      "employee-tile-with-flags"
    );
  });

  test("low performer employee tile", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-grid-employeetile--default",
      "employee-tile-low-performer"
    );
  });
});
