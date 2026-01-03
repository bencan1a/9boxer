#!/usr/bin/env node
/**
 * New Feature Detection for PRs
 *
 * Detects new user-facing features added in a PR by analyzing git diff.
 * Triggers documentation reminders when new features are detected.
 *
 * This complements detect-doc-impact.js which detects CHANGES to existing components.
 * This script detects NEW components, props, routes, and UI elements.
 *
 * Usage:
 *   node .github/scripts/detect-new-features.js [--base=main]
 *
 * Options:
 *   --base=BRANCH  Base branch to compare against (default: main)
 *
 * Outputs:
 *   - Sets GitHub Actions outputs: new_features_detected, features (JSON)
 *   - Writes .new-features.json for reference
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Fetch origin to ensure remote refs are available
 *
 * @param {string} baseBranch - Base branch to fetch
 */
function fetchOrigin(baseBranch) {
  try {
    console.log(`📥 Fetching origin/${baseBranch}...`);
    execSync(`git fetch origin ${baseBranch} --depth=1`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log('✅ Fetch successful');
  } catch (error) {
    console.warn('⚠️ Warning: Could not fetch origin:', error.message);
    // Continue anyway - the ref might already exist locally
  }
}

/**
 * Get git diff for this PR
 *
 * @param {string} baseBranch - Base branch to compare against
 * @returns {string} Git diff output
 */
function getGitDiff(baseBranch) {
  // Ensure we have the latest remote refs
  fetchOrigin(baseBranch);

  try {
    const output = execSync(`git diff origin/${baseBranch}...HEAD`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large diffs
    });
    return output;
  } catch (error) {
    console.error('❌ Failed to get git diff:', error.message);
    // Fallback: try without origin/ prefix
    try {
      const output = execSync(`git diff ${baseBranch}...HEAD`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });
      return output;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      return '';
    }
  }
}

/**
 * Detect new React components exported
 *
 * @param {string} diff - Git diff content
 * @returns {Array} Array of new component features
 */
function detectNewComponents(diff) {
  const newFeatures = [];

  // Pattern for new exported components
  // Matches: export const ComponentName: React.FC
  //          export function ComponentName
  //          export default function ComponentName
  const exportPatterns = [
    /^\+\s*export\s+(?:const|function)\s+(\w+)(?::\s*React\.FC|Component|\s*=)/gm,
    /^\+\s*export\s+default\s+function\s+(\w+)/gm,
  ];

  for (const pattern of exportPatterns) {
    let match;
    while ((match = pattern.exec(diff)) !== null) {
      const componentName = match[1];

      // Filter out common non-component names
      if (
        componentName &&
        !componentName.startsWith('use') && // Not a hook
        !componentName.includes('Type') && // Not a type
        !componentName.includes('Props') && // Not a props interface
        componentName[0] === componentName[0].toUpperCase() // PascalCase
      ) {
        newFeatures.push({
          name: componentName,
          type: 'component',
          category: 'New Component',
        });
      }
    }
  }

  return newFeatures;
}

/**
 * Detect new props in component interfaces
 *
 * @param {string} diff - Git diff content
 * @returns {Array} Array of new prop features
 */
function detectNewProps(diff) {
  const newFeatures = [];

  // Pattern for new props in interfaces
  // Matches lines like: +  newProp: string;
  //                     +  newProp?: boolean;
  const propPattern = /^\+\s+(\w+)[\?:]:\s*(\w+)/gm;

  let match;
  while ((match = propPattern.exec(diff)) !== null) {
    const propName = match[1];
    const propType = match[2];

    // Find the interface this prop belongs to
    const beforeMatch = diff.substring(0, match.index);
    const interfaceMatch = beforeMatch.match(/interface\s+(\w+Props)\s*\{[^}]*$/);

    if (interfaceMatch) {
      const interfaceName = interfaceMatch[1];
      const componentName = interfaceName.replace('Props', '');

      newFeatures.push({
        name: `${componentName}.${propName}`,
        type: 'prop',
        category: 'New Feature',
        component: componentName,
        details: `New prop: ${propName} (${propType})`,
      });
    }
  }

  return newFeatures;
}

/**
 * Detect new routes added
 *
 * @param {string} diff - Git diff content
 * @returns {Array} Array of new route features
 */
function detectNewRoutes(diff) {
  const newFeatures = [];

  // Pattern for new routes
  // Matches: <Route path="/new-path"
  const routePattern = /^\+.*<Route\s+path=["']([^"']+)["']/gm;

  let match;
  while ((match = routePattern.exec(diff)) !== null) {
    const routePath = match[1];

    newFeatures.push({
      name: routePath,
      type: 'route',
      category: 'New Page/Route',
      details: `New route: ${routePath}`,
    });
  }

  return newFeatures;
}

/**
 * Detect new menu items or buttons
 *
 * @param {string} diff - Git diff content
 * @returns {Array} Array of new UI element features
 */
function detectNewUIElements(diff) {
  const newFeatures = [];

  // Pattern for new menu items or buttons with user-visible labels
  // Matches: <Button>New Action</Button>
  //          <MenuItem>New Option</MenuItem>
  const uiPatterns = [
    /^\+.*<Button[^>]*>([^<]+)<\/Button>/gm,
    /^\+.*<MenuItem[^>]*>([^<]+)<\/MenuItem>/gm,
    /^\+.*<Tab[^>]*>([^<]+)<\/Tab>/gm,
  ];

  for (const pattern of uiPatterns) {
    let match;
    while ((match = pattern.exec(diff)) !== null) {
      const label = match[1].trim();

      // Filter out variable interpolations and common non-features
      if (
        label &&
        !label.startsWith('{') &&
        !label.includes('...') &&
        label.length > 2 &&
        label.length < 50
      ) {
        newFeatures.push({
          name: label,
          type: 'ui-element',
          category: 'New UI Element',
          details: `New UI element: "${label}"`,
        });
      }
    }
  }

  return newFeatures;
}

/**
 * Detect all new features from git diff
 *
 * @param {string} diff - Git diff content
 * @returns {Array} Array of all detected features
 */
function detectNewFeatures(diff) {
  console.log('🔍 Analyzing diff for new user-facing features...\n');

  const features = [
    ...detectNewComponents(diff),
    ...detectNewProps(diff),
    ...detectNewRoutes(diff),
    ...detectNewUIElements(diff),
  ];

  // Deduplicate by name
  const uniqueFeatures = Array.from(
    new Map(features.map((f) => [f.name, f])).values()
  );

  return uniqueFeatures;
}

/**
 * Set GitHub Actions outputs
 *
 * @param {Array} features - Array of detected features
 */
function setGitHubOutputs(features) {
  const outputFile = process.env.GITHUB_OUTPUT;

  if (!outputFile) {
    console.log('\n⚠️  GITHUB_OUTPUT not set - skipping GitHub Actions outputs');
    return;
  }

  try {
    const outputs = [
      `new_features_detected=${features.length > 0}`,
      `features=${JSON.stringify(features)}`,
      `feature_count=${features.length}`,
    ];

    fs.appendFileSync(outputFile, outputs.join('\n') + '\n');
    console.log('\n✅ GitHub Actions outputs set');
  } catch (error) {
    console.error('❌ Failed to set GitHub Actions outputs:', error.message);
  }
}

/**
 * Save detected features to file
 *
 * @param {Array} features - Array of detected features
 */
function saveFeatures(features) {
  const outputPath = path.join(PROJECT_ROOT, '.new-features.json');

  const data = {
    features,
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'detect-new-features.js',
      totalFeatures: features.length,
    },
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(
      `\n💾 Saved detected features to: ${path.relative(PROJECT_ROOT, outputPath)}`
    );
  } catch (error) {
    console.error('❌ Failed to save features:', error.message);
  }
}

/**
 * Print summary
 *
 * @param {Array} features - Array of detected features
 */
function printSummary(features) {
  console.log('\n' + '─'.repeat(60));
  console.log('📊 New Feature Detection Summary');
  console.log('─'.repeat(60));

  if (features.length === 0) {
    console.log('\n✅ No new user-facing features detected');
  } else {
    console.log(`\n🆕 Detected ${features.length} new feature(s):\n`);

    // Group by category
    const byCategory = features.reduce((acc, feature) => {
      const category = feature.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(feature);
      return acc;
    }, {});

    for (const [category, items] of Object.entries(byCategory)) {
      console.log(`\n${category}:`);
      items.forEach((item) => {
        console.log(`  - ${item.name}`);
        if (item.details) {
          console.log(`    ${item.details}`);
        }
      });
    }
  }

  console.log('\n' + '─'.repeat(60));
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Detecting new user-facing features in PR...\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const baseArg = args.find((arg) => arg.startsWith('--base='));
  const baseBranch =
    baseArg?.split('=')[1] || process.env.GITHUB_BASE_REF || 'main';

  // Validate baseBranch
  if (!baseBranch || baseBranch.trim() === '') {
    console.error('❌ Invalid base branch (empty)');
    process.exit(1);
  }
  if (!/^[a-zA-Z0-9/_-]+$/.test(baseBranch)) {
    console.error('❌ Invalid base branch name (contains invalid characters)');
    process.exit(1);
  }

  console.log(`📌 Base branch: ${baseBranch}`);

  // Get git diff
  const diff = getGitDiff(baseBranch);

  if (!diff) {
    console.log('\n⚠️  No git diff available');
    setGitHubOutputs([]);
    process.exit(0);
  }

  // Detect new features
  const features = detectNewFeatures(diff);

  // Save results
  saveFeatures(features);

  // Set GitHub Actions outputs
  setGitHubOutputs(features);

  // Print summary
  printSummary(features);

  // Exit
  if (features.length > 0) {
    console.log('\n⚠️  New features detected - documentation reminder will be posted');
  } else {
    console.log('\n✅ No new features requiring documentation');
  }

  process.exit(0);
}

// Only run if executed directly (not imported as a module)
const isMainModule =
  import.meta.url.replace('file:///', '') ===
  process.argv[1].replace(/\\/g, '/');

if (isMainModule || process.argv[1].includes('detect-new-features.js')) {
  main();
}

// Export functions for testing
export {
  fetchOrigin,
  getGitDiff,
  detectNewComponents,
  detectNewProps,
  detectNewRoutes,
  detectNewUIElements,
  detectNewFeatures,
};
