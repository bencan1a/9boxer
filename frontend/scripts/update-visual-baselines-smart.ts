#!/usr/bin/env tsx
/**
 * Smart Visual Baseline Updater
 *
 * This script selectively updates visual regression baselines for specific snapshots.
 * It's designed to work with the scope analyzer to only update in-scope failures.
 *
 * Usage:
 *   npx tsx scripts/update-visual-baselines-smart.ts <snapshot1.png> <snapshot2.png> ...
 *   npx tsx scripts/update-visual-baselines-smart.ts --from-file snapshots.txt
 *
 * Features:
 * - Updates only specified snapshots (not all baselines)
 * - Validates updated files are valid PNGs
 * - Detects corruption (0-byte files, invalid images)
 * - Reports updated files for git commit
 *
 * Output: JSON with update results
 * {
 *   "success": true,
 *   "updatedFiles": ["path/to/snapshot1.png", ...],
 *   "failedUpdates": [],
 *   "validationErrors": []
 * }
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Configuration
const FRONTEND_DIR = process.cwd();
const VISUAL_TEST_DIR = path.join(FRONTEND_DIR, "playwright", "visual");
const MIN_FILE_SIZE = 100; // Minimum valid PNG size in bytes

interface UpdateResult {
  success: boolean;
  updatedFiles: string[];
  failedUpdates: string[];
  validationErrors: string[];
  metadata: {
    totalRequested: number;
    successCount: number;
    failureCount: number;
  };
}

/**
 * Extract test name from snapshot filename
 * Example: "employee-tile-default-light.png" -> "employee-tile"
 */
function snapshotToTestPattern(snapshotName: string): string {
  // Remove theme suffix and extension
  const baseName = snapshotName
    .replace(/-(light|dark)\.png$/, "")
    .replace(/\.png$/, "");

  // Try to extract the component/test name
  // Patterns like "employee-tile-default" -> "employee-tile"
  const parts = baseName.split("-");

  // Take first 2-3 parts as the likely test identifier
  if (parts.length >= 2) {
    return parts.slice(0, 2).join("-");
  }

  return baseName;
}

/**
 * Find test spec file that likely contains the snapshot
 */
function findTestSpecForSnapshot(snapshotName: string): string | null {
  const testPattern = snapshotToTestPattern(snapshotName);

  // Try to find matching spec file
  const possibleFiles = [
    `${testPattern}.spec.ts`,
    `${testPattern}.visual.spec.ts`,
  ];

  for (const file of possibleFiles) {
    const fullPath = path.join(VISUAL_TEST_DIR, file);
    if (fs.existsSync(fullPath)) {
      return file;
    }
  }

  // Fallback: search all spec files
  try {
    const specFiles = fs
      .readdirSync(VISUAL_TEST_DIR)
      .filter((f) => f.endsWith(".spec.ts"));

    for (const specFile of specFiles) {
      const content = fs.readFileSync(
        path.join(VISUAL_TEST_DIR, specFile),
        "utf-8"
      );

      // Check if the spec file references this snapshot
      if (content.includes(snapshotName.replace(/-(light|dark)\.png$/, ""))) {
        return specFile;
      }
    }
  } catch (error) {
    console.warn("Error searching for spec file:", error);
  }

  return null;
}

/**
 * Validate that a file is a valid PNG
 */
function validatePNG(filePath: string): { valid: boolean; error?: string } {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: "File does not exist" };
    }

    const stats = fs.statSync(filePath);

    // Check file size
    if (stats.size === 0) {
      return { valid: false, error: "File is empty (0 bytes)" };
    }

    if (stats.size < MIN_FILE_SIZE) {
      return { valid: false, error: `File too small (${stats.size} bytes)` };
    }

    // Check PNG magic number (first 8 bytes)
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const pngMagic = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    if (!buffer.equals(pngMagic)) {
      return { valid: false, error: "Invalid PNG magic number" };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Find baseline file path for a snapshot
 */
function findBaselinePath(snapshotName: string): string | null {
  // Baselines are stored in playwright/visual/<test-name>.spec.ts-snapshots/
  const testSpec = findTestSpecForSnapshot(snapshotName);

  if (!testSpec) {
    return null;
  }

  const snapshotDir = path.join(VISUAL_TEST_DIR, `${testSpec}-snapshots`);

  const baselinePath = path.join(snapshotDir, snapshotName);

  return baselinePath;
}

/**
 * Update baselines for specific snapshots
 */
async function updateBaselines(snapshots: string[]): Promise<UpdateResult> {
  const result: UpdateResult = {
    success: true,
    updatedFiles: [],
    failedUpdates: [],
    validationErrors: [],
    metadata: {
      totalRequested: snapshots.length,
      successCount: 0,
      failureCount: 0,
    },
  };

  // Group snapshots by their test spec
  const snapshotsBySpec = new Map<string, string[]>();

  for (const snapshot of snapshots) {
    const spec = findTestSpecForSnapshot(snapshot);
    if (spec) {
      if (!snapshotsBySpec.has(spec)) {
        snapshotsBySpec.set(spec, []);
      }
      snapshotsBySpec.get(spec)!.push(snapshot);
    } else {
      result.failedUpdates.push(snapshot);
      result.validationErrors.push(
        `Could not find test spec for snapshot: ${snapshot}`
      );
    }
  }

  // Update snapshots for each test spec
  for (const [spec, specSnapshots] of snapshotsBySpec) {
    console.error(`Updating baselines for ${spec}...`);

    try {
      // Run Playwright update for this specific test file
      execSync(
        `npx playwright test --project=visual --update-snapshots ${spec}`,
        {
          cwd: FRONTEND_DIR,
          // Inherit stdin but fully suppress stdout/stderr so Playwright output
          // cannot interfere with this script's JSON output on stdout.
          stdio: ["inherit", "ignore", "ignore"],
        }
      );

      // Validate each updated snapshot
      for (const snapshot of specSnapshots) {
        const baselinePath = findBaselinePath(snapshot);

        if (!baselinePath) {
          result.failedUpdates.push(snapshot);
          result.validationErrors.push(
            `Could not find baseline path for: ${snapshot}`
          );
          continue;
        }

        const validation = validatePNG(baselinePath);

        if (validation.valid) {
          result.updatedFiles.push(baselinePath);
          result.metadata.successCount++;
        } else {
          result.failedUpdates.push(snapshot);
          result.validationErrors.push(`${snapshot}: ${validation.error}`);
          result.metadata.failureCount++;
        }
      }
    } catch (error) {
      console.error(`Error updating ${spec}:`, error);

      for (const snapshot of specSnapshots) {
        result.failedUpdates.push(snapshot);
        result.validationErrors.push(
          `${snapshot}: Test execution failed - ${error instanceof Error ? error.message : String(error)}`
        );
        result.metadata.failureCount++;
      }
    }
  }

  result.success = result.failedUpdates.length === 0;
  return result;
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      "Usage: update-visual-baselines-smart <snapshot1.png> [snapshot2.png ...]"
    );
    console.error(
      "  or:  update-visual-baselines-smart --from-file <file.txt>"
    );
    process.exit(1);
  }

  let snapshots: string[] = [];

  // Check if reading from file
  if (args[0] === "--from-file" && args[1]) {
    const filePath = args[1];
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      snapshots = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && line.endsWith(".png"));
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      process.exit(1);
    }
  } else {
    // Snapshots provided as arguments
    snapshots = args.filter((arg) => arg.endsWith(".png"));
  }

  if (snapshots.length === 0) {
    console.error("No snapshots provided to update");
    process.exit(1);
  }

  console.error(`Updating ${snapshots.length} baseline(s)...`);

  // Update baselines
  const result = await updateBaselines(snapshots);

  // Output JSON result
  console.log(JSON.stringify(result, null, 2));

  // Exit with appropriate code
  if (result.success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
