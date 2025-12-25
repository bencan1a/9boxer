/**
 * Screenshot Comparison Script
 *
 * Compares current screenshots with committed versions to detect visual changes.
 * Used in CI to validate that screenshots are up to date after UI modifications.
 *
 * Usage:
 *   npx tsx playwright/screenshots/compare.ts
 *   npx tsx playwright/screenshots/compare.ts --fail-on-diff  # Exit 1 if differences found
 *
 * Exit codes:
 *   0 - All screenshots match (or --fail-on-diff not used)
 *   1 - Differences detected and --fail-on-diff is set
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import * as path from "path";
import { screenshotRegistry } from "./config";

interface ComparisonResult {
  screenshotId: string;
  status: "match" | "modified" | "new" | "missing";
  path: string;
}

/**
 * Compare screenshots using git diff
 */
function compareScreenshots(): ComparisonResult[] {
  const results: ComparisonResult[] = [];

  // Get list of automated screenshots
  const automatedScreenshots = Object.entries(screenshotRegistry).filter(
    ([_, meta]) => !meta.manual
  );

  for (const [screenshotId, metadata] of automatedScreenshots) {
    const screenshotPath = path.resolve(__dirname, "../../../", metadata.path);

    // Check if file exists
    if (!existsSync(screenshotPath)) {
      results.push({
        screenshotId,
        status: "missing",
        path: metadata.path,
      });
      continue;
    }

    // Check if file is modified in git
    try {
      const gitStatus = execSync(`git status --porcelain "${screenshotPath}"`, {
        encoding: "utf-8",
      }).trim();

      if (gitStatus === "") {
        // Not modified
        results.push({
          screenshotId,
          status: "match",
          path: metadata.path,
        });
      } else if (gitStatus.startsWith("??")) {
        // New untracked file
        results.push({
          screenshotId,
          status: "new",
          path: metadata.path,
        });
      } else {
        // Modified
        results.push({
          screenshotId,
          status: "modified",
          path: metadata.path,
        });
      }
    } catch (error) {
      // If git command fails, assume file is new/not tracked
      results.push({
        screenshotId,
        status: "new",
        path: metadata.path,
      });
    }
  }

  return results;
}

/**
 * Print comparison results
 */
function printResults(results: ComparisonResult[]): void {
  const matches = results.filter((r) => r.status === "match");
  const modified = results.filter((r) => r.status === "modified");
  const newFiles = results.filter((r) => r.status === "new");
  const missing = results.filter((r) => r.status === "missing");

  console.log("Screenshot Comparison Results");
  console.log("============================================================\n");

  if (matches.length > 0) {
    console.log(`✓ Matching: ${matches.length}`);
  }

  if (modified.length > 0) {
    console.log(`⚠ Modified: ${modified.length}`);
    modified.forEach((r) => {
      console.log(`  - ${r.screenshotId}: ${r.path}`);
    });
    console.log();
  }

  if (newFiles.length > 0) {
    console.log(`+ New: ${newFiles.length}`);
    newFiles.forEach((r) => {
      console.log(`  - ${r.screenshotId}: ${r.path}`);
    });
    console.log();
  }

  if (missing.length > 0) {
    console.log(`✗ Missing: ${missing.length}`);
    missing.forEach((r) => {
      console.log(`  - ${r.screenshotId}: ${r.path}`);
    });
    console.log();
  }

  console.log("============================================================");
  console.log(`Total: ${results.length} automated screenshots`);

  if (modified.length > 0 || newFiles.length > 0 || missing.length > 0) {
    console.log("\n⚠️  Changes detected!");
    console.log("\nIf these changes are intentional:");
    console.log("  1. Regenerate screenshots: npm run screenshots:generate");
    console.log("  2. Review visual changes");
    console.log("  3. Commit updated screenshots");
    console.log("\nIf UI should not have changed:");
    console.log("  1. Check for unintended visual regressions");
    console.log("  2. Fix UI code");
    console.log("  3. Re-run comparison");
  } else if (matches.length === results.length) {
    console.log("\n✓ All screenshots up to date");
  }
}

/**
 * Main execution
 */
function main(): void {
  const args = process.argv.slice(2);
  const failOnDiff = args.includes("--fail-on-diff");

  try {
    const results = compareScreenshots();
    printResults(results);

    // Exit with error if differences found and --fail-on-diff is set
    if (failOnDiff) {
      const hasChanges = results.some((r) => r.status !== "match");

      if (hasChanges) {
        console.error(
          "\n❌ Screenshot differences detected (--fail-on-diff enabled)"
        );
        process.exit(1);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error comparing screenshots:", error);
    process.exit(1);
  }
}

main();
