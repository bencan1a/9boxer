/**
 * Visual regression tests for SettingsDialog component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("SettingsDialog Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 600, height: 500 });
  });

  test("closed settings dialog", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "settings-settingsdialog--closed",
      "settings-dialog-closed"
    );
  });

  test("open settings dialog", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "settings-settingsdialog--open",
      "settings-dialog-open"
    );
  });

  test("light theme selected settings dialog", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "settings-settingsdialog--light-theme-selected",
      "settings-dialog-light-theme-selected"
    );
  });

  test("dark theme selected settings dialog", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "settings-settingsdialog--dark-theme-selected",
      "settings-dialog-dark-theme-selected"
    );
  });

  test("auto theme selected settings dialog", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "settings-settingsdialog--auto-theme-selected",
      "settings-dialog-auto-theme-selected"
    );
  });
});
