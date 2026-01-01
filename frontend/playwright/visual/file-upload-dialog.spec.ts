/**
 * Visual regression tests for FileUploadDialog component
 */
import { test } from "@playwright/test";
import { snapshotStory, snapshotStoryBothThemes } from "./storybook-helpers";

test.describe("FileUploadDialog Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for dialog tests
    await page.setViewportSize({ width: 600, height: 500 });
  });

  // Note: Skipping "default closed state" test - Material-UI Dialogs with open={false}
  // don't render any content to the DOM, so there's nothing to snapshot.
  // The Default story is still useful in Storybook for API documentation.

  test("open dialog", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-common-fileuploaddialog--open",
      "file-upload-dialog-open"
    );
  });

  test("with file selected", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-common-fileuploaddialog--with-file",
      "file-upload-dialog-with-file"
    );
  });

  test("uploading state", async ({ page }) => {
    // Mask the progress indicator as it may animate
    await snapshotStory(
      page,
      "app-common-fileuploaddialog--uploading",
      "file-upload-dialog-uploading-light.png",
      {
        theme: "light",
        mask: ['[role="progressbar"]'],
      }
    );
    await snapshotStory(
      page,
      "app-common-fileuploaddialog--uploading",
      "file-upload-dialog-uploading-dark.png",
      {
        theme: "dark",
        mask: ['[role="progressbar"]'],
      }
    );
  });

  test("error state", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "app-common-fileuploaddialog--error",
      "file-upload-dialog-error"
    );
  });
});
