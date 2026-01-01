#!/usr/bin/env node
/**
 * Bundle Size Regression Check
 *
 * Validates that production bundle sizes stay within acceptable limits.
 * Run during pre-push to catch bundle size regressions early.
 *
 * Usage:
 *   node scripts/check-bundle-size.js              # Check current build
 *   node scripts/check-bundle-size.js --save       # Save current as baseline
 *   node scripts/check-bundle-size.js --skip-build # Skip build, check existing dist
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { globSync } from "glob";
import { gzipSync } from "zlib";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_FILE = join(__dirname, "../bundle-baseline.json");

// Bundle size limits (in bytes, gzipped)
const LIMITS = {
  main: 500 * 1024, // 500KB - main application bundle
  vendor: 300 * 1024, // 300KB - React, Zustand, etc.
  "mui-core": 200 * 1024, // 200KB - Material-UI components
  total: 1000 * 1024, // 1MB - total bundle size
};

// Tolerance for regression (10% increase allowed)
const REGRESSION_THRESHOLD = 0.1;

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const saveBaseline = args.includes("--save");

function log(symbol, message, color = "") {
  const colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    reset: "\x1b[0m",
  };
  console.log(`${colors[color] || ""}${symbol} ${message}${colors.reset}`);
}

function getBundleSizes() {
  const distPath = join(__dirname, "../dist/assets");
  if (!existsSync(distPath)) {
    log("❌", "dist/assets not found. Run `npm run build` first.", "red");
    process.exit(1);
  }

  const jsFiles = globSync("*.js", { cwd: distPath, absolute: true });
  const sizes = {};
  let totalSize = 0;

  for (const file of jsFiles) {
    const content = readFileSync(file);
    const gzipped = gzipSync(content);
    const size = gzipped.length;
    const fileName = file.split(/[\\/]/).pop();

    // Extract chunk name based on Vite's bundle structure
    let chunkName = null;
    if (fileName.startsWith("index-")) {
      chunkName = "main";
    } else if (fileName.startsWith("vendor-mui-")) {
      chunkName = "mui-core";
    } else if (fileName.startsWith("vendor-")) {
      chunkName = "vendor";
    } else if (fileName.startsWith("translation-")) {
      // Skip lazy-loaded language files (not part of initial bundle)
      continue;
    }

    if (chunkName) {
      sizes[chunkName] = (sizes[chunkName] || 0) + size;
      totalSize += size;
    }
  }

  sizes.total = totalSize;
  return sizes;
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function checkSizes(sizes) {
  let hasError = false;
  const baseline = existsSync(BASELINE_FILE)
    ? JSON.parse(readFileSync(BASELINE_FILE, "utf-8"))
    : null;

  console.log("\n📦 Bundle Size Report\n");
  console.log("Chunk         | Current  | Limit    | Baseline | Status");
  console.log("------------- | -------- | -------- | -------- | ------");

  for (const [chunk, size] of Object.entries(sizes)) {
    const limit = LIMITS[chunk];
    if (!limit) continue; // Skip unknown chunks

    const baselineSize = baseline?.[chunk];
    const regression = baselineSize ? (size - baselineSize) / baselineSize : 0;
    const exceedsLimit = size > limit;
    const hasRegression = regression > REGRESSION_THRESHOLD;

    let status = "✅";
    if (exceedsLimit) {
      status = "❌ Exceeds limit";
      hasError = true;
    } else if (hasRegression) {
      status = `⚠️  +${(regression * 100).toFixed(1)}%`;
    }

    const baselineSizeStr = baselineSize ? formatSize(baselineSize) : "-";
    console.log(
      `${chunk.padEnd(13)} | ${formatSize(size).padEnd(8)} | ${formatSize(limit).padEnd(8)} | ${baselineSizeStr.padEnd(8)} | ${status}`
    );
  }

  console.log("");

  if (hasError) {
    log("❌", "Bundle size check FAILED", "red");
    console.log("\nPossible fixes:");
    console.log(
      '  1. Check for barrel imports: import { X } from "@mui/material" (use named imports)'
    );
    console.log("  2. Use React.lazy() for large components");
    console.log("  3. Review dependencies added in this commit");
    console.log(
      "  4. Run `npm run build:analyze` to visualize bundle composition\n"
    );
    process.exit(1);
  } else {
    log("✅", "Bundle size check PASSED", "green");
  }

  return sizes;
}

async function main() {
  try {
    if (!skipBuild) {
      log("🔨", "Building production bundle...", "yellow");
      execSync("npm run build", {
        stdio: "inherit",
        cwd: join(__dirname, ".."),
      });
    }

    const sizes = getBundleSizes();

    if (saveBaseline) {
      writeFileSync(BASELINE_FILE, JSON.stringify(sizes, null, 2));
      log("💾", `Baseline saved to ${BASELINE_FILE}`, "green");
      console.log("\nCurrent sizes:", sizes);
    } else {
      checkSizes(sizes);
    }
  } catch (error) {
    log("❌", `Error: ${error.message}`, "red");
    process.exit(1);
  }
}

main();
