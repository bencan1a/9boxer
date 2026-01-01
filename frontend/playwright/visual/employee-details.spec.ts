/**
 * Visual regression tests for EmployeeDetails component
 */
import { test } from "@playwright/test";
import { snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("EmployeeDetails Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 450, height: 800 });
  });

  test("default employee details", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-employeedetails--default",
      "employee-details-default"
    );
  });

  test("minimal data employee details", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-employeedetails--minimal-data",
      "employee-details-minimal-data"
    );
  });

  test("no manager employee details", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-employeedetails--no-manager",
      "employee-details-no-manager"
    );
  });

  test("long fields employee details", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-employeedetails--long-fields",
      "employee-details-long-fields"
    );
  });

  test("modified in session employee details", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-employeedetails--modified-in-session",
      "employee-details-modified-in-session"
    );
  });

  test("low performer employee details", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-employeedetails--low-performer",
      "employee-details-low-performer"
    );
  });

  test("high potential development employee details", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-right-panel-details-employeedetails--high-potential-development",
      "employee-details-high-potential-development"
    );
  });
});
