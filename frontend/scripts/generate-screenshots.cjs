#!/usr/bin/env node
/**
 * Generate documentation screenshots
 *
 * This script activates the Python virtual environment and runs
 * the screenshot generation tool (tools/generate_docs_screenshots.py)
 *
 * Usage:
 *   npm run generate:screenshots
 *   npm run generate:screenshots -- --screenshots grid-normal,donut-mode
 *   npm run generate:screenshots -- --format webp --quality 85
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes
const colors = {
  blue: '\x1b[94m',
  green: '\x1b[92m',
  yellow: '\x1b[93m',
  red: '\x1b[91m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Determine project root (parent of frontend directory)
const projectRoot = path.resolve(__dirname, '../..');

// Determine Python executable path based on platform
const isWindows = process.platform === 'win32';
const pythonPath = isWindows
  ? path.join(projectRoot, '.venv', 'Scripts', 'python.exe')
  : path.join(projectRoot, '.venv', 'bin', 'python');

// Verify Python executable exists
if (!fs.existsSync(pythonPath)) {
  console.error(`${colors.red}Error:${colors.reset} Python virtual environment not found`);
  console.error(`Expected at: ${pythonPath}`);
  console.error('');
  console.error('Please set up the virtual environment:');
  console.error(`  cd ${projectRoot}`);
  console.error('  python -m venv .venv');
  console.error(isWindows ? '  .venv\\Scripts\\activate' : '  source .venv/bin/activate');
  console.error('  pip install uv');
  console.error("  uv pip install --system -e '.[dev]'");
  process.exit(1);
}

// Path to screenshot generator script
const scriptPath = path.join(projectRoot, 'tools', 'generate_docs_screenshots.py');

// Verify script exists
if (!fs.existsSync(scriptPath)) {
  console.error(`${colors.red}Error:${colors.reset} Screenshot generator not found`);
  console.error(`Expected at: ${scriptPath}`);
  process.exit(1);
}

// Get any additional command-line arguments (after --)
const additionalArgs = process.argv.slice(2).join(' ');

// Build command
const command = `"${pythonPath}" "${scriptPath}" ${additionalArgs}`;

console.log(`${colors.blue}[Info]${colors.reset} Generating documentation screenshots...`);
console.log(`${colors.blue}[Info]${colors.reset} Python: ${pythonPath}`);
console.log(`${colors.blue}[Info]${colors.reset} Script: ${scriptPath}`);

if (additionalArgs) {
  console.log(`${colors.blue}[Info]${colors.reset} Args: ${additionalArgs}`);
}

console.log('');

try {
  // Run the screenshot generator
  execSync(command, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      PYTHONPATH: path.join(projectRoot, 'backend', 'src'),
    },
  });

  console.log('');
  console.log(`${colors.green}${colors.bold}Screenshot generation complete!${colors.reset}`);
  process.exit(0);
} catch (error) {
  console.error('');
  console.error(`${colors.red}${colors.bold}Screenshot generation failed${colors.reset}`);
  process.exit(error.status || 1);
}
