/**
 * Visual regression tests for ManagementChain component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("ManagementChain Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 450, height: 700 });
  });

  test("with manager chain", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-managementchain--with-manager",
      "management-chain-with-manager"
    );
  });

  test("no manager chain", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-managementchain--no-manager",
      "management-chain-no-manager"
    );
  });

  test("deep hierarchy chain", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-managementchain--deep-hierarchy",
      "management-chain-deep-hierarchy"
    );
  });

  test("shallow hierarchy chain", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-managementchain--shallow-hierarchy",
      "management-chain-shallow-hierarchy"
    );
  });

  test("with duplicates chain", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-managementchain--with-duplicates",
      "management-chain-with-duplicates"
    );
  });

  test("manager chain", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-managementchain--manager-chain",
      "management-chain-manager-chain"
    );
  });

  test("new hire chain", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-managementchain--new-hire",
      "management-chain-new-hire"
    );
  });
});
