/**
 * Visual regression tests for DistributionChart component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("DistributionChart Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 700, height: 500 });
  });

  test("balanced distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-distributionchart--balanced-distribution",
      "distribution-chart-balanced"
    );
  });

  test("skewed distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-distributionchart--skewed-distribution",
      "distribution-chart-skewed"
    );
  });

  test("empty data distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-distributionchart--empty-data",
      "distribution-chart-empty"
    );
  });

  test("high performer heavy distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-distributionchart--high-performer-heavy",
      "distribution-chart-high-performer-heavy"
    );
  });

  test("small dataset distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-distributionchart--small-dataset",
      "distribution-chart-small-dataset"
    );
  });

  test("sparse distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-distributionchart--sparse-distribution",
      "distribution-chart-sparse"
    );
  });
});
