#!/usr/bin/env node
/**
 * Extract screenshot metadata from component JSDoc comments
 *
 * This script parses @screenshots annotations from React component files
 * and generates a mapping file that shows which components affect which screenshots.
 * This enables automated change detection: when a component changes, we can
 * automatically identify which screenshots need regeneration.
 *
 * Usage:
 *   node .github/scripts/extract-screenshot-metadata.js [--strict]
 *
 * Options:
 *   --strict  Fail if validation errors are found
 *
 * Outputs:
 *   .github/component-screenshot-map.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Recursively find all files matching pattern
 *
 * @param {string} dir - Directory to search
 * @param {RegExp} pattern - File pattern to match
 * @param {string[]} ignore - Directories to ignore
 * @returns {string[]} Array of matching file paths
 */
export function findFiles(dir, pattern, ignore = []) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      // Skip ignored directories
      if (entry.isDirectory()) {
        if (!ignore.some((ig) => fullPath.includes(ig))) {
          walk(fullPath);
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Parse @screenshots annotation from JSDoc comment
 *
 * Expects format:
 * /**
 *  * @screenshots
 *  *   - screenshot-name: Description of screenshot
 *  *   - another-screenshot: Another description
 *  *\/
 *
 * @param {string} content - File content
 * @returns {string[]} Array of screenshot names
 */
export function parseScreenshotsAnnotation(content) {
  // Match @screenshots section in JSDoc comment
  // This regex captures everything from @screenshots to the next @ tag or closing */
  const screenshotMatch = content.match(
    /@screenshots\s*\n([\s\S]*?)(?:\n\s*\*\s*@|\n\s*\*\/)/m
  );

  if (!screenshotMatch) {
    return [];
  }

  // Extract screenshot lines (format: " *   - screenshot-name: description")
  const screenshotLines = screenshotMatch[1]
    .split('\n')
    .map((line) => {
      // Extract screenshot name (everything before first colon)
      // Format: " *   - screenshot-name: description"
      // More specific pattern to avoid false matches
      const match = line.match(/^\s*\*\s+-\s+([a-z0-9-]+):/i);
      return match ? match[1].trim() : null;
    })
    .filter(Boolean);

  // Validate screenshot names (kebab-case only)
  const validScreenshots = screenshotLines.filter((name) =>
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)
  );

  if (validScreenshots.length !== screenshotLines.length) {
    const invalid = screenshotLines.filter(
      (name) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)
    );
    console.warn(
      `⚠️  Invalid screenshot names found and ignored: ${invalid.join(', ')}`
    );
  }

  return validScreenshots;
}

/**
 * Extract component name from file path or export statement
 *
 * @param {string} filePath - Component file path
 * @param {string} content - File content
 * @returns {string} Component name
 */
export function extractComponentName(filePath, content) {
  // Try to find export name from file content
  const exportMatch = content.match(
    /export\s+(?:const|function)\s+(\w+)\s*[:=]/
  );
  if (exportMatch) {
    return exportMatch[1];
  }

  // Fall back to filename (without extension)
  const filename = path.basename(filePath, path.extname(filePath));
  return filename;
}

/**
 * Load screenshot configuration from config.ts
 *
 * @returns {Set<string>} Set of valid screenshot names
 */
export function loadScreenshotConfig() {
  const configPath = path.join(
    PROJECT_ROOT,
    'frontend/playwright/screenshots/config.ts'
  );

  if (!fs.existsSync(configPath)) {
    console.warn('⚠️  Screenshot config not found, skipping validation');
    return null;
  }

  // Extract screenshot IDs from config.ts using regex (avoid TypeScript compilation)
  const content = fs.readFileSync(configPath, 'utf-8');
  const screenshots = new Set();

  // Match: "screenshot-name": { or 'screenshot-name': {
  const regex = /["']([a-z0-9-]+)["']:\s*{/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    screenshots.add(match[1]);
  }

  return screenshots;
}

/**
 * Validate screenshot names against config.ts
 *
 * @param {Object} mapping - Component to screenshots mapping
 * @returns {Object} Validation result with errors array
 */
export function validateAgainstConfig(mapping) {
  const validScreenshots = loadScreenshotConfig();

  if (!validScreenshots) {
    return { valid: true, errors: [], totalValid: 0 };
  }

  // Validate all screenshot references
  const errors = [];
  for (const [filePath, data] of Object.entries(mapping)) {
    for (const screenshot of data.screenshots) {
      if (!validScreenshots.has(screenshot)) {
        errors.push({
          component: filePath,
          screenshot,
          message: `Screenshot "${screenshot}" not found in config.ts`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    totalValid: validScreenshots.size,
  };
}

/**
 * Build bidirectional mapping
 *
 * @param {Object} componentMapping - Component to screenshots mapping
 * @returns {Object} Bidirectional mapping with metadata
 */
export function buildBidirectionalMapping(componentMapping) {
  const screenshotToComponents = {};

  for (const [filePath, data] of Object.entries(componentMapping)) {
    for (const screenshot of data.screenshots) {
      if (!screenshotToComponents[screenshot]) {
        screenshotToComponents[screenshot] = [];
      }
      screenshotToComponents[screenshot].push(filePath);
    }
  }

  return {
    componentToScreenshots: componentMapping,
    screenshotToComponents,
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'extract-screenshot-metadata.js',
      version: '1.0.0',
      totalComponents: Object.keys(componentMapping).length,
      totalScreenshots: Object.keys(screenshotToComponents).length,
      totalMappings: Object.values(componentMapping).reduce(
        (sum, data) => sum + data.screenshots.length,
        0
      ),
    },
  };
}

/**
 * Extract screenshot metadata from all component files
 *
 * @returns {Object} Mapping of component paths to screenshot names
 */
export function extractScreenshotMetadata() {
  console.log('Scanning component files for @screenshots annotations...\n');

  // Validate directory exists
  const componentDir = path.join(PROJECT_ROOT, 'frontend/src');
  if (!fs.existsSync(componentDir)) {
    console.error(`❌ Error: Directory not found: ${componentDir}`);
    process.exit(1);
  }

  // Find all TypeScript/TSX files in components directory
  const componentFiles = findFiles(componentDir, /\.(ts|tsx)$/, [
    'node_modules',
    '.test.',
    '.spec.',
    '.stories.',
    'test',
    '__tests__',
  ]);

  if (componentFiles.length === 0) {
    console.warn('⚠️  No TypeScript files found to scan');
    return {};
  }

  const mapping = {};
  let totalComponents = 0;
  let componentsWithScreenshots = 0;
  let totalScreenshots = 0;
  const errors = [];

  for (const fullPath of componentFiles) {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Parse @screenshots annotation
      const screenshots = parseScreenshotsAnnotation(content);

      if (screenshots.length > 0) {
        const relativePath = path.relative(
          path.join(PROJECT_ROOT, 'frontend/src'),
          fullPath
        );
        const componentName = extractComponentName(fullPath, content);

        mapping[relativePath] = {
          component: componentName,
          screenshots: screenshots,
        };

        componentsWithScreenshots++;
        totalScreenshots += screenshots.length;

        console.log(`✅ ${relativePath}`);
        console.log(`   Component: ${componentName}`);
        console.log(`   Screenshots: ${screenshots.join(', ')}`);
        console.log();
      }

      totalComponents++;
    } catch (error) {
      errors.push({ file: path.basename(fullPath), error: error.message });
      console.error(
        `❌ Error processing ${path.basename(fullPath)}: ${error.message}`
      );
    }
  }

  // Validate screenshot names against config.ts
  const validation = validateAgainstConfig(mapping);

  if (!validation.valid) {
    console.error('\n❌ Validation errors found:');
    validation.errors.forEach((err) => {
      console.error(`   ${err.component}: ${err.message}`);
    });

    const shouldFail = process.argv.includes('--strict');
    if (shouldFail) {
      console.error('\nFailing due to --strict flag');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Warning: Invalid screenshot references found.');
      console.warn('Run with --strict to fail on validation errors.\n');
    }
  } else if (validation.totalValid > 0) {
    console.log(`✅ All screenshot references are valid\n`);
  }

  // Build bidirectional mapping
  const bidirectionalMapping = buildBidirectionalMapping(mapping);

  // Write mapping to file with error handling
  const outputPath = path.join(
    PROJECT_ROOT,
    '.github/component-screenshot-map.json'
  );

  try {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(bidirectionalMapping, null, 2)
    );
  } catch (error) {
    console.error(`❌ Failed to write output file: ${error.message}`);
    process.exit(1);
  }

  // Print summary
  console.log('─'.repeat(60));
  console.log('Summary:');
  console.log(`  Total components scanned: ${totalComponents}`);
  console.log(`  Components with @screenshots: ${componentsWithScreenshots}`);
  console.log(`  Total screenshot mappings: ${totalScreenshots}`);
  console.log(
    `  Valid screenshots in config.ts: ${validation.totalValid || 'N/A'}`
  );
  console.log(`  Output: ${path.relative(PROJECT_ROOT, outputPath)}`);

  if (errors.length > 0) {
    console.log(`  ⚠️  Errors encountered: ${errors.length}`);
  }

  console.log('─'.repeat(60));

  if (errors.length > 0) {
    console.warn('\n⚠️  Some files could not be processed. Review errors above.');
  }

  return mapping;
}

// Only run if executed directly (not imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  extractScreenshotMetadata();
}
