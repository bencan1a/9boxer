#!/usr/bin/env node
/**
 * Screenshot Coverage Analysis
 *
 * Analyzes component coverage by Storybook stories and screenshots,
 * generates coverage reports for documentation health tracking.
 *
 * Usage:
 *   node .github/scripts/screenshot-coverage.js
 *
 * Outputs:
 * - .screenshot-coverage-report.json (machine-readable metrics)
 * - .screenshot-coverage-report.md (human-readable report)
 * - .screenshot-coverage-badge.json (badge data for README)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Recursively find files matching a pattern
 *
 * @param {string} dir - Directory to search
 * @param {RegExp} pattern - Pattern to match
 * @param {Array} excludeDirs - Directories to exclude
 * @returns {string[]} Array of matching file paths
 */
function findFiles(dir, pattern, excludeDirs = []) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (excludeDirs.some(excl => fullPath.includes(excl))) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Load screenshot config from TypeScript file
 * Since we can't directly import .ts files, we'll parse it as text
 */
async function loadScreenshotConfig() {
  const configPath = path.join(
    projectRoot,
    'frontend/playwright/screenshots/config.ts'
  );

  // Read the file as text
  const content = fs.readFileSync(configPath, 'utf-8');

  // Extract the screenshotConfig object
  // This is a simple regex-based extraction - works for our use case
  const match = content.match(/export const screenshotConfig[^=]*=\s*(\{[\s\S]*?\n\};)/);

  if (!match) {
    throw new Error('Could not parse screenshot config');
  }

  // Clean up the extracted object for eval
  // Remove TypeScript type annotations and convert to valid JS
  let configText = match[1];

  // Remove trailing semicolon
  configText = configText.replace(/\};$/, '}');

  // Create a function to evaluate the config safely
  // This is safe because we're only evaluating our own config file
  const configFunc = new Function('return ' + configText);
  return configFunc();
}

/**
 * Find screenshots that reference a component
 *
 * @param {string} componentPath - Component file path
 * @param {Object} screenshotConfig - Screenshot configuration
 * @returns {Array} Array of screenshot metadata
 */
function findScreenshotsForComponent(componentPath, screenshotConfig) {
  const componentName = path.basename(componentPath, '.tsx');
  const screenshots = [];

  for (const [name, metadata] of Object.entries(screenshotConfig)) {
    // Check if screenshot references this component by name or path
    const pathMatch =
      metadata.path.toLowerCase().includes(componentName.toLowerCase());
    const descMatch = metadata.description
      .toLowerCase()
      .includes(componentName.toLowerCase());
    const storyMatch =
      metadata.storyId &&
      metadata.storyId.toLowerCase().includes(componentName.toLowerCase());

    if (pathMatch || descMatch || storyMatch) {
      screenshots.push({
        name,
        source: metadata.source,
        manual: metadata.manual || false,
      });
    }
  }

  return screenshots;
}

/**
 * Analyze screenshot coverage across components and stories
 *
 * @returns {Promise<Object>} Coverage analysis results
 */
async function analyzeScreenshotCoverage() {
  const screenshotConfig = await loadScreenshotConfig();

  // Find all React components
  const componentsDir = path.join(projectRoot, 'frontend/src/components');
  const allComponents = findFiles(componentsDir, /\.tsx$/, [
    'node_modules',
    '__tests__',
  ]);

  // Filter out test and story files
  const components = allComponents.filter(
    (file) => !file.includes('.test.tsx') && !file.includes('.stories.tsx')
  );

  // Find all Storybook stories
  const srcDir = path.join(projectRoot, 'frontend/src');
  const stories = findFiles(srcDir, /\.stories\.tsx$/, ['node_modules']);

  const coverage = {
    totalComponents: components.length,
    componentsWithStories: 0,
    componentsWithScreenshots: 0,
    totalScreenshots: Object.keys(screenshotConfig).length,
    storybookScreenshots: 0,
    fullAppScreenshots: 0,
    manualScreenshots: 0,
    componentBreakdown: [],
    storyBreakdown: [],
  };

  // Analyze each component
  for (const componentPath of components) {
    const relativePath = componentPath.replace(/\\/g, '/');
    const componentName = path.basename(componentPath, '.tsx');

    // Check if component has a story
    const hasStory = stories.some((s) => {
      const storyBaseName = path.basename(s, '.stories.tsx');
      return storyBaseName === componentName;
    });

    // Find screenshots for this component
    const screenshots = findScreenshotsForComponent(
      relativePath,
      screenshotConfig
    );

    if (hasStory) coverage.componentsWithStories++;
    if (screenshots.length > 0) coverage.componentsWithScreenshots++;

    coverage.componentBreakdown.push({
      path: relativePath,
      name: componentName,
      hasStory,
      screenshotCount: screenshots.length,
      screenshots,
    });
  }

  // Analyze each story
  for (const storyPath of stories) {
    const relativePath = storyPath.replace(/\\/g, '/');
    const componentName = path.basename(storyPath, '.stories.tsx');

    // Find screenshots that use this story
    const usedInScreenshots = Object.entries(screenshotConfig)
      .filter(([_, metadata]) => {
        return (
          metadata.storyId &&
          metadata.storyId.toLowerCase().includes(componentName.toLowerCase())
        );
      })
      .map(([name, metadata]) => ({
        name,
        storyId: metadata.storyId,
      }));

    coverage.storyBreakdown.push({
      path: relativePath,
      componentName,
      usedInScreenshots: usedInScreenshots.length,
      screenshots: usedInScreenshots,
    });
  }

  // Count screenshot types
  for (const metadata of Object.values(screenshotConfig)) {
    if (metadata.manual) {
      coverage.manualScreenshots++;
    } else if (metadata.source === 'storybook') {
      coverage.storybookScreenshots++;
    } else {
      coverage.fullAppScreenshots++;
    }
  }

  return coverage;
}

/**
 * Generate Markdown coverage report
 *
 * @param {Object} coverage - Coverage analysis data
 * @returns {string} Markdown report
 */
function generateCoverageReport(coverage) {
  const storybookPercent = (
    (coverage.storybookScreenshots / coverage.totalScreenshots) *
    100
  ).toFixed(1);
  const componentStoryPercent = (
    (coverage.componentsWithStories / coverage.totalComponents) *
    100
  ).toFixed(1);
  const componentScreenshotPercent = (
    (coverage.componentsWithScreenshots / coverage.totalComponents) *
    100
  ).toFixed(1);

  // Stories used in screenshots
  const storiesWithScreenshots = coverage.storyBreakdown.filter(
    (s) => s.usedInScreenshots > 0
  );
  const storyUsagePercent =
    coverage.storyBreakdown.length > 0
      ? (
          (storiesWithScreenshots.length / coverage.storyBreakdown.length) *
          100
        ).toFixed(1)
      : '0.0';

  const timestamp = new Date().toISOString();

  return `# Screenshot Coverage Report

**Generated:** ${timestamp}

## Summary Statistics

- **Total Components:** ${coverage.totalComponents}
- **Components with Stories:** ${coverage.componentsWithStories} (${componentStoryPercent}%)
- **Components with Screenshots:** ${coverage.componentsWithScreenshots} (${componentScreenshotPercent}%)
- **Total Stories:** ${coverage.storyBreakdown.length}
- **Stories Used in Screenshots:** ${storiesWithScreenshots.length} (${storyUsagePercent}%)

## Screenshot Breakdown

- **Total Screenshots:** ${coverage.totalScreenshots}
- **Storybook Screenshots:** ${coverage.storybookScreenshots} (${storybookPercent}%)
- **Full-App Screenshots:** ${coverage.fullAppScreenshots}
- **Manual Screenshots:** ${coverage.manualScreenshots}

## Coverage Goals

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Storybook Coverage | ${storybookPercent}% | 40% | ${parseFloat(storybookPercent) >= 40 ? '✅' : '❌'} |
| Component Story Coverage | ${componentStoryPercent}% | 50% | ${parseFloat(componentStoryPercent) >= 50 ? '✅' : '❌'} |

## Components Without Stories

${
  coverage.componentBreakdown
    .filter((c) => !c.hasStory)
    .map((c) => `- ${c.path}`)
    .join('\n') || '_All components have stories!_'
}

## Components Without Screenshots

${
  coverage.componentBreakdown
    .filter((c) => c.screenshotCount === 0)
    .map((c) => `- ${c.path}`)
    .join('\n') || '_All components have screenshots!_'
}

## Top Components by Screenshot Coverage

${coverage.componentBreakdown
  .filter((c) => c.screenshotCount > 0)
  .sort((a, b) => b.screenshotCount - a.screenshotCount)
  .slice(0, 10)
  .map(
    (c) =>
      `- **${c.name}** (${c.screenshotCount} screenshot${c.screenshotCount > 1 ? 's' : ''}): ${c.screenshots.map((s) => s.name).join(', ')}`
  )
  .join('\n')}

## Stories Used in Screenshots

${
  storiesWithScreenshots.length > 0
    ? storiesWithScreenshots
        .sort((a, b) => b.usedInScreenshots - a.usedInScreenshots)
        .slice(0, 10)
        .map(
          (s) =>
            `- **${s.componentName}** (${s.usedInScreenshots} screenshot${s.usedInScreenshots > 1 ? 's' : ''}): ${s.screenshots.map((sc) => sc.name).join(', ')}`
        )
        .join('\n')
    : '_No stories are used in screenshots yet._'
}

## Recommendations

1. **Create stories for components without stories** to improve testability and documentation
2. **Add screenshot coverage** for components shown in user documentation
3. **Migrate full-app screenshots to Storybook** where possible (faster, more reliable)
4. **Target:** Reach 40% Storybook screenshot coverage (currently ${storybookPercent}%)
5. **Target:** Reach 50% component story coverage (currently ${componentStoryPercent}%)

---

*Generated by Screenshot Coverage Tracker*
`;
}

/**
 * Generate coverage badge data for README
 *
 * @param {Object} coverage - Coverage analysis data
 * @returns {Object} Badge JSON data (shields.io format)
 */
function generateBadgeData(coverage) {
  const storybookPercent = (
    (coverage.storybookScreenshots / coverage.totalScreenshots) *
    100
  ).toFixed(0);

  return {
    schemaVersion: 1,
    label: 'storybook coverage',
    message: `${storybookPercent}%`,
    color:
      parseFloat(storybookPercent) >= 40
        ? 'brightgreen'
        : parseFloat(storybookPercent) >= 20
          ? 'yellow'
          : 'red',
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 Analyzing screenshot coverage...\n');

  const coverage = await analyzeScreenshotCoverage();
  const report = generateCoverageReport(coverage);
  const badge = generateBadgeData(coverage);

  // Write reports
  const jsonPath = path.join(projectRoot, '.screenshot-coverage-report.json');
  const mdPath = path.join(projectRoot, '.screenshot-coverage-report.md');
  const badgePath = path.join(
    projectRoot,
    '.screenshot-coverage-badge.json'
  );

  fs.writeFileSync(jsonPath, JSON.stringify(coverage, null, 2));
  fs.writeFileSync(mdPath, report);
  fs.writeFileSync(badgePath, JSON.stringify(badge, null, 2));

  console.log('✅ Coverage report generated:\n');
  console.log(`  JSON: ${path.relative(projectRoot, jsonPath)}`);
  console.log(`  Markdown: ${path.relative(projectRoot, mdPath)}`);
  console.log(`  Badge: ${path.relative(projectRoot, badgePath)}\n`);

  // Print summary
  const storybookPercent = (
    (coverage.storybookScreenshots / coverage.totalScreenshots) *
    100
  ).toFixed(1);
  const componentStoryPercent = (
    (coverage.componentsWithStories / coverage.totalComponents) *
    100
  ).toFixed(1);

  console.log('📊 Summary:');
  console.log(`  Total Components: ${coverage.totalComponents}`);
  console.log(
    `  Components with Stories: ${coverage.componentsWithStories} (${componentStoryPercent}%)`
  );
  console.log(
    `  Components with Screenshots: ${coverage.componentsWithScreenshots}`
  );
  console.log(`  Total Screenshots: ${coverage.totalScreenshots}`);
  console.log(
    `  Storybook Screenshots: ${coverage.storybookScreenshots} (${storybookPercent}%)`
  );
  console.log(`  Full-App Screenshots: ${coverage.fullAppScreenshots}`);
  console.log(`  Manual Screenshots: ${coverage.manualScreenshots}`);
}

main().catch((err) => {
  console.error('❌ Coverage analysis failed:', err);
  process.exit(1);
});
