/**
 * Playwright Global Setup
 *
 * NOTE: Backend servers are now started per-worker using worker-scoped fixtures.
 * This provides database isolation between parallel test files.
 * See playwright/fixtures/worker-backend.ts for implementation.
 */

import * as path from "path";
import * as fs from "fs";

const PID_FILE = path.join(__dirname, ".backend.pid");
const TEMP_DIR_FILE = path.join(__dirname, ".test_data_dir");

/**
 * Global setup - runs once before all tests
 *
 * Backend servers are started per-worker using worker-scoped fixtures.
 * This provides database isolation between parallel test files.
 */
export default async function globalSetup(): Promise<void> {
  console.log("\n========================================");
  console.log("Playwright Global Setup");
  console.log("========================================\n");

  console.log("[Global Setup] Using per-worker backend isolation");
  console.log("[Global Setup] Each worker will start its own backend server");
  console.log("[Global Setup] Workers: auto-detect based on CPU cores\n");

  // No backend startup needed - workers will handle it
  // Save PID as 0 to indicate no global backend
  fs.writeFileSync(PID_FILE, "0");
  fs.writeFileSync(TEMP_DIR_FILE, ""); // Empty - workers create their own

  console.log("========================================");
  console.log("Ready! Starting tests with worker backends...");
  console.log("========================================\n");
}
