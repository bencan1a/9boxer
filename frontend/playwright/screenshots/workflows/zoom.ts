/**
 * Zoom Controls Screenshot Workflow
 *
 * Generates screenshots showing the zoom and full-screen controls.
 */

import { Page } from "@playwright/test";
import { loadSampleData } from "../../helpers/fixtures";
import { closeAllDialogsAndOverlays, waitForUiSettle } from "../../helpers/ui";

/**
 * Generate zoom controls screenshot
 *
 * Shows the zoom controls in the bottom-left corner of the grid, including
 * zoom in/out buttons, reset button, percentage display, and full-screen toggle.
 *
 * @param page - Playwright Page object
 * @param outputPath - Absolute path where screenshot should be saved
 */
export async function generateZoomControls(
  page: Page,
  outputPath: string
): Promise<void> {
  // Ensure sample data is loaded
  await loadSampleData(page);

  // Close any dialogs
  await closeAllDialogsAndOverlays(page);

  // Wait for UI to settle
  await waitForUiSettle(page, 0.5);

  // Verify grid and zoom controls are visible
  const grid = page.locator('[data-testid="nine-box-grid"]');
  await grid.waitFor({ state: "visible", timeout: 5000 });

  const zoomControls = page.locator('[data-testid="zoom-controls"]');
  await zoomControls.waitFor({ state: "visible", timeout: 5000 });

  // Capture a portion of the page showing the bottom-left corner with zoom controls
  // We want to show the controls in context with some of the grid visible
  const gridBoundingBox = await grid.boundingBox();
  const controlsBoundingBox = await zoomControls.boundingBox();

  if (!gridBoundingBox || !controlsBoundingBox) {
    throw new Error("Could not get bounding boxes for grid or zoom controls");
  }

  // Calculate clip area: show bottom-left portion of grid with controls
  // Show approximately the bottom 400px of height and left 600px of width
  const clipX = Math.max(0, gridBoundingBox.x);
  const clipY = Math.max(0, controlsBoundingBox.y - 200); // Show some grid above controls
  const clipWidth = 600;
  const clipHeight = 300;

  // Take screenshot of the clipped area
  await page.screenshot({
    path: outputPath,
    clip: {
      x: clipX,
      y: clipY,
      width: clipWidth,
      height: clipHeight,
    },
  });
}
