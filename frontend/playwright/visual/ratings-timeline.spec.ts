/**
 * Visual regression tests for RatingsTimeline component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("RatingsTimeline Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 450, height: 700 });
  });

  test("with history ratings timeline", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-ratingstimeline--with-history",
      "ratings-timeline-with-history"
    );
  });

  test("no history ratings timeline", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-ratingstimeline--no-history",
      "ratings-timeline-no-history"
    );
  });

  test("multiple years ratings timeline", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-ratingstimeline--multiple-years",
      "ratings-timeline-multiple-years"
    );
  });

  test("inconsistent ratings timeline", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-ratingstimeline--inconsistent-ratings",
      "ratings-timeline-inconsistent"
    );
  });

  test("short history high potential ratings timeline", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-ratingstimeline--short-history-high-potential",
      "ratings-timeline-short-history-high-potential"
    );
  });

  test("performance concern ratings timeline", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "panel-ratingstimeline--performance-concern",
      "ratings-timeline-performance-concern"
    );
  });
});
