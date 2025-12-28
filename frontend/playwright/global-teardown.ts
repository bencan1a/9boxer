/**
 * Playwright Global Teardown
 *
 * NOTE: Backend servers are stopped per-worker using worker-scoped fixtures.
 * This cleanup only handles the PID/temp directory marker files.
 */

import * as path from "path";
import * as fs from "fs";

const PID_FILE = path.join(__dirname, ".backend.pid");
const TEMP_DIR_FILE = path.join(__dirname, ".test_data_dir");

/**
 * Global teardown - runs once after all tests
 *
 * Workers handle their own backend cleanup, so we just remove marker files.
 */
export default async function globalTeardown(): Promise<void> {
  console.log("\n========================================");
  console.log("Playwright Global Teardown - Cleanup");
  console.log("========================================\n");

  console.log("[Global Teardown] Workers handled backend cleanup");

  // Clean up marker files
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
  if (fs.existsSync(TEMP_DIR_FILE)) {
    fs.unlinkSync(TEMP_DIR_FILE);
  }

  console.log("[Global Teardown] ✓ Marker files removed");

  console.log("\n========================================");
  console.log("Cleanup complete");
  console.log("========================================\n");
}
