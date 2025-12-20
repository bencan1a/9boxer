#!/usr/bin/env node
/**
 * Build user guide documentation using MkDocs Material before building
 *
 * This script runs the MkDocs build script to generate the static documentation
 * site that will be bundled with the Electron application. The documentation
 * is built to resources/user-guide/ for offline use.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '../..');
const venvDir = path.join(projectRoot, '.venv');
const scriptPath = path.join(projectRoot, 'tools', 'build_user_guide.py');

// Determine Python executable path based on platform
const pythonExe = process.platform === 'win32'
  ? path.join(venvDir, 'Scripts', 'python.exe')
  : path.join(venvDir, 'bin', 'python');

// Check if venv exists
if (!fs.existsSync(pythonExe)) {
  console.error('\x1b[31m✗ Python virtual environment not found!\x1b[0m');
  console.error(`Expected at: ${pythonExe}`);
  console.error('\nPlease set up the Python virtual environment first:');
  console.error('  python -m venv .venv');
  console.error('  .venv/Scripts/activate  # Windows');
  console.error('  # or');
  console.error('  source .venv/bin/activate  # Linux/macOS');
  console.error('  pip install -e .[dev]');
  process.exit(1);
}

// Check if build script exists
if (!fs.existsSync(scriptPath)) {
  console.error('\x1b[31m✗ Build script not found!\x1b[0m');
  console.error(`Expected at: ${scriptPath}`);
  process.exit(1);
}

console.log('\x1b[36m📄 Building user guide documentation with MkDocs...\x1b[0m');

try {
  // Run the MkDocs build script
  const output = execSync(`"${pythonExe}" "${scriptPath}"`, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: 'inherit'
  });

  console.log('\x1b[32m✓ User guide documentation built successfully\x1b[0m');
} catch (error) {
  console.error('\x1b[31m✗ Failed to build user guide documentation\x1b[0m');
  console.error(error.message);
  process.exit(1);
}
