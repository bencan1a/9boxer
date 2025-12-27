#!/usr/bin/env node
/**
 * Generate Visual Diff Report for Documentation Screenshots
 *
 * This script processes Playwright visual regression test results and generates
 * a comprehensive HTML report showing visual differences in screenshots.
 *
 * Phase: 3.2 - Visual Diff Report Generation
 * Related: Issue #56, #61
 *
 * Usage:
 *   node .github/scripts/generate-visual-diff-report.js [options]
 *
 * Options:
 *   --test-results-dir <path>  Path to Playwright test-results directory
 *   --output <path>            Output path for HTML report (default: visual-diff-report.html)
 *   --json                     Also output JSON summary
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    testResultsDir: path.join(PROJECT_ROOT, "frontend/test-results"),
    output: "visual-diff-report.html",
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--test-results-dir":
        options.testResultsDir = args[++i];
        break;
      case "--output":
        options.output = args[++i];
        break;
      case "--json":
        options.json = true;
        break;
      case "--help":
        console.log(`
Usage: node generate-visual-diff-report.js [options]

Options:
  --test-results-dir <path>  Path to Playwright test-results directory
  --output <path>            Output path for HTML report (default: visual-diff-report.html)
  --json                     Also output JSON summary
  --help                     Show this help message
        `);
        process.exit(0);
    }
  }

  return options;
}

/**
 * Find all visual diff images in test results
 *
 * @param {string} testResultsDir - Path to test-results directory
 * @returns {Array} Array of diff result objects
 */
function findVisualDiffs(testResultsDir) {
  const diffs = [];

  if (!fs.existsSync(testResultsDir)) {
    console.log(
      `⚠️  Test results directory not found: ${testResultsDir}`
    );
    return diffs;
  }

  // Recursively find all *-diff.png files
  function scanDirectory(dir, basePath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.name.endsWith("-diff.png")) {
        // Found a diff image
        const testName = entry.name.replace("-diff.png", "");
        const actualPath = path.join(dir, `${testName}-actual.png`);
        const expectedPath = path.join(dir, `${testName}-expected.png`);

        diffs.push({
          name: testName,
          diffPath: fullPath,
          actualPath: fs.existsSync(actualPath) ? actualPath : null,
          expectedPath: fs.existsSync(expectedPath) ? expectedPath : null,
          relativeDiffPath: relativePath,
          relativeActualPath: fs.existsSync(actualPath)
            ? path.join(basePath, `${testName}-actual.png`)
            : null,
          relativeExpectedPath: fs.existsSync(expectedPath)
            ? path.join(basePath, `${testName}-expected.png`)
            : null,
        });
      }
    }
  }

  scanDirectory(testResultsDir);
  return diffs;
}

/**
 * Calculate diff statistics
 *
 * @param {Array} diffs - Array of diff objects
 * @returns {Object} Statistics object
 */
function calculateStats(diffs) {
  return {
    totalDiffs: diffs.length,
    hasActual: diffs.filter((d) => d.actualPath).length,
    hasExpected: diffs.filter((d) => d.expectedPath).length,
    hasComparison: diffs.filter((d) => d.actualPath && d.expectedPath).length,
  };
}

/**
 * Convert absolute paths to relative paths for HTML
 *
 * @param {string} absolutePath - Absolute file path
 * @param {string} htmlOutputPath - Path where HTML will be saved
 * @returns {string} Relative path
 */
function makeRelativePath(absolutePath, htmlOutputPath) {
  if (!absolutePath) return null;
  return path.relative(path.dirname(htmlOutputPath), absolutePath);
}

/**
 * Generate HTML report
 *
 * @param {Array} diffs - Array of diff objects
 * @param {Object} stats - Statistics object
 * @param {string} outputPath - Where the HTML will be saved
 * @returns {string} HTML content
 */
function generateHTMLReport(diffs, stats, outputPath) {
  const timestamp = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Diff Report - Documentation Screenshots</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #24292e;
      background: #f6f8fa;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      border-radius: 6px;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 6px 6px 0 0;
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .subtitle {
      opacity: 0.9;
      font-size: 14px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f6f8fa;
      border-bottom: 1px solid #e1e4e8;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 6px;
      border: 1px solid #e1e4e8;
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: #586069;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content {
      padding: 30px;
    }

    .no-diffs {
      text-align: center;
      padding: 60px 30px;
      color: #28a745;
    }

    .no-diffs svg {
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      fill: #28a745;
    }

    .no-diffs h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .diff-item {
      margin-bottom: 40px;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
      overflow: hidden;
    }

    .diff-header {
      background: #f6f8fa;
      padding: 15px 20px;
      border-bottom: 1px solid #e1e4e8;
    }

    .diff-title {
      font-size: 18px;
      font-weight: 600;
      color: #24292e;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .diff-images {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1px;
      background: #e1e4e8;
    }

    .image-panel {
      background: white;
      padding: 20px;
    }

    .image-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #586069;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .label-expected { color: #28a745; }
    .label-actual { color: #0366d6; }
    .label-diff { color: #d73a49; }

    .label-icon {
      width: 16px;
      height: 16px;
    }

    .screenshot {
      width: 100%;
      border: 1px solid #e1e4e8;
      border-radius: 3px;
      display: block;
      cursor: zoom-in;
    }

    .screenshot:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .no-image {
      padding: 40px;
      text-align: center;
      color: #959da5;
      background: #fafbfc;
      border: 1px dashed #d1d5da;
      border-radius: 3px;
    }

    footer {
      background: #f6f8fa;
      padding: 20px 30px;
      border-top: 1px solid #e1e4e8;
      text-align: center;
      color: #586069;
      font-size: 12px;
      border-radius: 0 0 6px 6px;
    }

    /* Modal for zoomed images */
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      cursor: zoom-out;
    }

    .modal-content {
      max-width: 95%;
      max-height: 95%;
      margin: auto;
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    @media (max-width: 768px) {
      .diff-images {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📸 Visual Diff Report</h1>
      <div class="subtitle">Documentation Screenshot Changes • Generated ${new Date(
        timestamp
      ).toLocaleString()}</div>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${stats.totalDiffs}</div>
        <div class="stat-label">Visual Differences</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.hasComparison}</div>
        <div class="stat-label">Full Comparisons</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.hasActual}</div>
        <div class="stat-label">Actual Screenshots</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.hasExpected}</div>
        <div class="stat-label">Expected Screenshots</div>
      </div>
    </div>

    <div class="content">
      ${
        diffs.length === 0
          ? `
        <div class="no-diffs">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
          </svg>
          <h2>No Visual Differences Detected</h2>
          <p>All screenshots match their baselines.</p>
        </div>
      `
          : diffs
              .map(
                (diff) => `
        <div class="diff-item">
          <div class="diff-header">
            <div class="diff-title">${diff.name}</div>
          </div>
          <div class="diff-images">
            <div class="image-panel">
              <div class="image-label label-expected">
                <svg class="label-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
                Expected (Baseline)
              </div>
              ${
                diff.expectedPath
                  ? `<img src="${makeRelativePath(
                      diff.expectedPath,
                      outputPath
                    )}" alt="Expected: ${
                      diff.name
                    }" class="screenshot" onclick="showModal(this.src)">`
                  : '<div class="no-image">No baseline image</div>'
              }
            </div>
            <div class="image-panel">
              <div class="image-label label-actual">
                <svg class="label-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M8 0a8 8 0 110 16A8 8 0 018 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
                  <path d="M8 3.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM4 8a4 4 0 118 0 4 4 0 01-8 0z"/>
                </svg>
                Actual (Current)
              </div>
              ${
                diff.actualPath
                  ? `<img src="${makeRelativePath(
                      diff.actualPath,
                      outputPath
                    )}" alt="Actual: ${
                      diff.name
                    }" class="screenshot" onclick="showModal(this.src)">`
                  : '<div class="no-image">No actual image</div>'
              }
            </div>
            <div class="image-panel">
              <div class="image-label label-diff">
                <svg class="label-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M8 1a.75.75 0 01.75.75v6.5h6.5a.75.75 0 010 1.5h-6.5v6.5a.75.75 0 01-1.5 0v-6.5h-6.5a.75.75 0 010-1.5h6.5v-6.5A.75.75 0 018 1z"/>
                </svg>
                Visual Difference
              </div>
              <img src="${makeRelativePath(
                diff.diffPath,
                outputPath
              )}" alt="Diff: ${
                  diff.name
                }" class="screenshot" onclick="showModal(this.src)">
            </div>
          </div>
        </div>
      `
              )
              .join("")
      }
    </div>

    <footer>
      Generated by Visual Diff Report Generator • Phase 3.2 - Self-Managing Documentation System
    </footer>
  </div>

  <!-- Modal for zoomed images -->
  <div id="modal" class="modal" onclick="closeModal()">
    <img id="modal-img" class="modal-content">
  </div>

  <script>
    function showModal(src) {
      const modal = document.getElementById('modal');
      const modalImg = document.getElementById('modal-img');
      modal.style.display = 'block';
      modalImg.src = src;
    }

    function closeModal() {
      document.getElementById('modal').style.display = 'none';
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Main function
 */
function main() {
  console.log("📊 Generating Visual Diff Report...\n");

  const options = parseArgs();

  // Find all visual diffs
  console.log(`📁 Scanning: ${options.testResultsDir}`);
  const diffs = findVisualDiffs(options.testResultsDir);
  console.log(`   Found ${diffs.length} visual difference(s)\n`);

  // Calculate statistics
  const stats = calculateStats(diffs);

  // Generate HTML report
  const outputPath = path.join(PROJECT_ROOT, "frontend", options.output);
  const html = generateHTMLReport(diffs, stats, outputPath);
  fs.writeFileSync(outputPath, html, "utf-8");
  console.log(`✅ HTML report generated: ${outputPath}`);

  // Generate JSON summary if requested
  if (options.json) {
    const jsonPath = outputPath.replace(".html", ".json");
    const summary = {
      timestamp: new Date().toISOString(),
      stats,
      diffs: diffs.map((d) => ({
        name: d.name,
        hasDiff: true,
        hasActual: !!d.actualPath,
        hasExpected: !!d.expectedPath,
      })),
    };
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), "utf-8");
    console.log(`✅ JSON summary generated: ${jsonPath}`);
  }

  // Summary
  console.log("\n📊 Summary:");
  console.log(`   Total Diffs: ${stats.totalDiffs}`);
  console.log(`   Full Comparisons: ${stats.hasComparison}`);
  console.log(`   Has Actual: ${stats.hasActual}`);
  console.log(`   Has Expected: ${stats.hasExpected}`);

  if (stats.totalDiffs === 0) {
    console.log("\n✅ No visual differences detected - all screenshots match baselines!");
  } else {
    console.log(
      `\n⚠️  Visual differences detected. Review the report at: ${outputPath}`
    );
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { findVisualDiffs, calculateStats, generateHTMLReport };
