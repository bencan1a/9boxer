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
      "app-right-panel-statistics-distributionchart--balanced-distribution",
      "distribution-chart-balanced"
    );
  });

  test("skewed distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-statistics-distributionchart--skewed-distribution",
      "distribution-chart-skewed"
    );
  });

  test("empty data distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-statistics-distributionchart--empty-data",
      "distribution-chart-empty"
    );
  });

  test("high performer heavy distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-statistics-distributionchart--high-performer-heavy",
      "distribution-chart-high-performer-heavy"
    );
  });

  test("small dataset distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-statistics-distributionchart--small-dataset",
      "distribution-chart-small-dataset"
    );
  });

  test("sparse distribution chart", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-statistics-distributionchart--sparse-distribution",
      "distribution-chart-sparse"
    );
  });
});
