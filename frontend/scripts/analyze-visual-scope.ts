#!/usr/bin/env tsx
/**
 * Visual Regression Scope Analyzer
 *
 * This script analyzes git diff to determine which visual regression test failures
 * are "in-scope" (expected due to intentional changes) vs "out-of-scope" (unexpected
 * cross-component pollution that indicates a real regression).
 *
 * Usage:
 *   npx tsx scripts/analyze-visual-scope.ts <base-branch> <failed-snapshots...>
 *   npx tsx scripts/analyze-visual-scope.ts origin/main snapshot1.png snapshot2.png
 *
 * Output: JSON with categorized failures
 * {
 *   "inScope": ["employee-tile-default-light.png", ...],
 *   "outOfScope": ["grid-box-full-light.png", ...],
 *   "confidence": "high|medium|low",
 *   "modifiedFiles": [...],
 *   "affectedStoryPatterns": [...],
 *   "globalChangeDetected": false
 * }
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Configuration
const FRONTEND_DIR = process.cwd();
const SRC_DIR = path.join(FRONTEND_DIR, "src");
const COMPONENTS_DIR = path.join(SRC_DIR, "components");

// Global change patterns that affect all components
const GLOBAL_FILE_PATTERNS = [
  /theme\.(ts|tsx|js|jsx)$/,
  /tokens\.(ts|tsx|js|jsx)$/,
  /global\.(css|scss|sass)$/,
  /\.storybook\//,
  /storybook-helpers\.(ts|tsx)$/,
  /_app\.(ts|tsx)$/,
  /main\.(ts|tsx)$/,
  /index\.(css|scss)$/,
];

interface ScopeAnalysisResult {
  inScope: string[];
  outOfScope: string[];
  confidence: "high" | "medium" | "low";
  modifiedFiles: string[];
  affectedStoryPatterns: string[];
  globalChangeDetected: boolean;
  metadata: {
    totalFailures: number;
    inScopeCount: number;
    outOfScopeCount: number;
    globalChangeRatio: number;
  };
}

/**
 * Validate and sanitize branch name to prevent command injection
 * Only allows alphanumeric characters, forward slashes, hyphens, underscores, and dots
 */
function sanitizeBranchName(branchName: string): string {
  if (!branchName || typeof branchName !== "string") {
    throw new Error("Branch name must be a non-empty string");
  }

  // Only allow safe characters: alphanumeric, forward slash, hyphen, underscore, dot
  const safePattern = /^[a-zA-Z0-9/_.-]+$/;
  if (!safePattern.test(branchName)) {
    throw new Error(
      `Invalid branch name: "${branchName}". Branch names can only contain alphanumeric characters, forward slashes, hyphens, underscores, and dots.`
    );
  }

  // Additional check: prevent path traversal attempts
  if (branchName.includes("..") || branchName.startsWith("/")) {
    throw new Error(
      `Invalid branch name: "${branchName}". Path traversal patterns are not allowed.`
    );
  }

  return branchName;
}

/**
 * Get list of modified files from git diff
 */
function getModifiedFiles(baseBranch: string): string[] {
  try {
    // Sanitize branch name to prevent command injection
    const safeBranch = sanitizeBranchName(baseBranch);

    const gitDiff = execSync(`git diff --name-only ${safeBranch}...HEAD`, {
      encoding: "utf-8",
      cwd: FRONTEND_DIR,
    }).trim();

    if (!gitDiff) {
      return [];
    }

    return gitDiff
      .split("\n")
      .filter((file) => file.startsWith("frontend/"))
      .map((file) => file.replace(/^frontend\//, ""));
  } catch (error) {
    console.error("Error getting git diff:", error);
    return [];
  }
}

/**
 * Check if a file is a global change (affects all components)
 */
function isGlobalChange(filePath: string): boolean {
  return GLOBAL_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Extract component name from file path
 * Examples:
 *   src/components/grid/EmployeeTile.tsx -> EmployeeTile
 *   src/components/panel/statistics/StatisticCard.tsx -> StatisticCard
 */
function extractComponentName(filePath: string): string | null {
  // Match component files (tsx/ts/jsx/js files, excluding test files)
  const match = filePath.match(/\/([A-Z][a-zA-Z0-9]+)\.(tsx?|jsx?)$/);
  if (
    match &&
    !filePath.includes("__tests__") &&
    !filePath.includes(".test.")
  ) {
    return match[1];
  }
  return null;
}

/**
 * Extract story title from .stories.tsx file
 * Reads the file and parses the meta.title field
 */
function extractStoryTitleFromFile(filePath: string): string | null {
  try {
    const fullPath = path.join(FRONTEND_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const content = fs.readFileSync(fullPath, "utf-8");

    // Match: title: "App/Grid/EmployeeTile"
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    if (titleMatch) {
      return titleMatch[1];
    }

    return null;
  } catch (error) {
    console.warn(`Warning: Could not read story file ${filePath}:`, error);
    return null;
  }
}

/**
 * Convert story title to story ID pattern
 * "App/Grid/EmployeeTile" -> "app-grid-employeetile--*"
 */
function storyTitleToPattern(title: string): string {
  return title.toLowerCase().replace(/\//g, "-") + "--*";
}

/**
 * Map modified files to affected story ID patterns
 */
function mapFilesToStoryPatterns(modifiedFiles: string[]): {
  patterns: string[];
  hasGlobalChange: boolean;
  confidence: "high" | "medium" | "low";
} {
  const patterns = new Set<string>();
  let hasGlobalChange = false;
  let confidence: "high" | "medium" | "low" = "high";

  for (const file of modifiedFiles) {
    // Check for global changes
    if (isGlobalChange(file)) {
      hasGlobalChange = true;
      confidence = "low";
      continue;
    }

    // If it's a .stories.tsx file, extract the story title directly
    if (file.endsWith(".stories.tsx") || file.endsWith(".stories.ts")) {
      const storyTitle = extractStoryTitleFromFile(file);
      if (storyTitle) {
        patterns.add(storyTitleToPattern(storyTitle));
      }
      continue;
    }

    // If it's a component file, look for corresponding .stories.tsx
    const componentName = extractComponentName(file);
    if (componentName) {
      // Try to find the .stories.tsx file in the same directory
      const dir = path.dirname(file);
      const storiesPath = path.join(dir, `${componentName}.stories.tsx`);

      const storyTitle = extractStoryTitleFromFile(storiesPath);
      if (storyTitle) {
        patterns.add(storyTitleToPattern(storyTitle));
      } else {
        // Fallback: component was modified but no story file found
        // This could affect tests, mark as medium confidence
        confidence = confidence === "high" ? "medium" : confidence;
      }
    }

    // Check for shared/common components (affects many stories)
    if (file.includes("/common/") || file.includes("/shared/")) {
      confidence = "medium";
    }
  }

  return {
    patterns: Array.from(patterns),
    hasGlobalChange,
    confidence,
  };
}

/**
 * Check if a snapshot name matches any of the affected story patterns
 * Uses a more precise matching strategy to reduce false positives
 */
function isSnapshotInScope(
  snapshotName: string,
  storyPatterns: string[]
): boolean {
  // Extract story ID from snapshot name
  // Example: "employee-tile-default-light.png" -> need to find matching pattern
  // Snapshot names follow the format: <story-id-based-name>-<theme>.png

  // Remove theme suffix (-light.png, -dark.png) and file extension
  const nameWithoutTheme = snapshotName.replace(/-(light|dark)\.png$/, "");

  for (const pattern of storyPatterns) {
    // Pattern is like "app-grid-employeetile--*"
    // Extract the base pattern without the wildcard
    const patternPrefix = pattern.replace(/--\*$/, "");

    // Strategy 1: Exact prefix match (most reliable)
    // The snapshot should start with the story pattern prefix
    if (nameWithoutTheme.startsWith(patternPrefix)) {
      return true;
    }

    // Strategy 2: Regex match with strict boundaries
    // Convert to regex: ^app-grid-employeetile--.*$
    // This ensures we match the complete pattern structure
    const patternRegex = new RegExp(
      "^" + patternPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "--.*$"
    );
    if (patternRegex.test(nameWithoutTheme)) {
      return true;
    }

    // Strategy 3: Component name match with context (reduced false positives)
    // Only match if the component name appears with common story delimiters
    // This prevents "tile" from matching "employeetile"
    const componentPart = patternPrefix.split("-").pop();
    if (componentPart && componentPart.length > 3) {
      // Only use this for longer component names
      // Match component name with word boundaries or delimiters
      const componentRegex = new RegExp(
        `(^|[-_])${componentPart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([-_]|$)`,
        "i"
      );
      if (componentRegex.test(nameWithoutTheme)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Analyze visual regression scope
 */
export function analyzeScope(
  baseBranch: string,
  failedSnapshots: string[]
): ScopeAnalysisResult {
  // Get modified files from git diff
  const modifiedFiles = getModifiedFiles(baseBranch);

  // Map modified files to story patterns
  const { patterns, hasGlobalChange, confidence } =
    mapFilesToStoryPatterns(modifiedFiles);

  // Categorize failed snapshots
  const inScope: string[] = [];
  const outOfScope: string[] = [];

  for (const snapshot of failedSnapshots) {
    if (isSnapshotInScope(snapshot, patterns)) {
      inScope.push(snapshot);
    } else {
      outOfScope.push(snapshot);
    }
  }

  // Calculate global change ratio
  const globalChangeRatio =
    failedSnapshots.length > 0 ? outOfScope.length / failedSnapshots.length : 0;

  // Adjust confidence based on results
  let finalConfidence = confidence;
  if (globalChangeRatio > 0.5 && outOfScope.length > 5) {
    // More than 50% of failures are out-of-scope with significant count
    finalConfidence = "low";
  }

  return {
    inScope,
    outOfScope,
    confidence: finalConfidence,
    modifiedFiles,
    affectedStoryPatterns: patterns,
    globalChangeDetected: hasGlobalChange,
    metadata: {
      totalFailures: failedSnapshots.length,
      inScopeCount: inScope.length,
      outOfScopeCount: outOfScope.length,
      globalChangeRatio,
    },
  };
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      "Usage: analyze-visual-scope <base-branch> [snapshot1.png snapshot2.png ...]"
    );
    console.error(
      "  or:  analyze-visual-scope <base-branch> --from-file <file.txt>"
    );
    process.exit(1);
  }

  const baseBranch = args[0];
  let failedSnapshots: string[] = [];

  // Check if reading from file
  if (args[1] === "--from-file" && args[2]) {
    const filePath = args[2];
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      failedSnapshots = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && line.endsWith(".png"));
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      process.exit(1);
    }
  } else {
    // Snapshots provided as arguments
    failedSnapshots = args.slice(1).filter((arg) => arg.endsWith(".png"));
  }

  // Analyze scope
  const result = analyzeScope(baseBranch, failedSnapshots);

  // Output JSON result
  console.log(JSON.stringify(result, null, 2));

  // Exit with appropriate code
  // 0 = success (all in-scope or no failures)
  // 1 = out-of-scope failures detected
  // 2 = global change detected (explicitly flagged)
  if (result.globalChangeDetected) {
    process.exit(2);
  } else if (result.outOfScope.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
