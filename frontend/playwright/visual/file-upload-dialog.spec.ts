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

  test("default closed state", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "common-fileuploaddialog--default",
      "file-upload-dialog-closed"
    );
  });

  test("open dialog", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "common-fileuploaddialog--open",
      "file-upload-dialog-open"
    );
  });

  test("with file selected", async ({ page }) => {
    await snapshotStoryBothThemes(
      page,
      "common-fileuploaddialog--with-file",
      "file-upload-dialog-with-file"
    );
  });

  test("uploading state", async ({ page }) => {
    // Mask the progress indicator as it may animate
    await snapshotStory(
      page,
      "common-fileuploaddialog--uploading",
      "file-upload-dialog-uploading-light.png",
      {
        theme: "light",
        mask: ['[role="progressbar"]'],
      }
    );
    await snapshotStory(
      page,
      "common-fileuploaddialog--uploading",
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
      "common-fileuploaddialog--error",
      "file-upload-dialog-error"
    );
  });
});
