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

/**
 * Auto-detect Python executable
 * Tries venv first (for local dev), falls back to system Python (for CI)
 */
function findPythonExecutable() {
  // Try venv first (local development)
  const venvPython = process.platform === 'win32'
    ? path.join(venvDir, 'Scripts', 'python.exe')
    : path.join(venvDir, 'bin', 'python');

  if (fs.existsSync(venvPython)) {
    console.log(`\x1b[36m📍 Using Python from venv: ${venvPython}\x1b[0m`);
    return venvPython;
  }

  // Fall back to system Python (CI environments)
  try {
    // Test if python3 or python is available in PATH
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    execSync(`${pythonCmd} --version`, { stdio: 'pipe' });
    console.log(`\x1b[36m📍 Using system Python: ${pythonCmd}\x1b[0m`);
    return pythonCmd;
  } catch (error) {
    console.error('\x1b[31m✗ Python not found!\x1b[0m');
    console.error('\nPlease install Python or set up the virtual environment:');
    console.error('  python -m venv .venv');
    console.error('  .venv/Scripts/activate  # Windows');
    console.error('  source .venv/bin/activate  # Linux/macOS');
    console.error('  pip install -e .[dev]');
    process.exit(1);
  }
}

const pythonExe = findPythonExecutable();

// Check if build script exists
if (!fs.existsSync(scriptPath)) {
  console.error('\x1b[31m✗ Build script not found!\x1b[0m');
  console.error(`Expected at: ${scriptPath}`);
  process.exit(1);
}

console.log('\x1b[36m📄 Building user guide documentation with MkDocs...\x1b[0m');

try {
  // Run the MkDocs build script
  // Quote paths only if they contain spaces or are absolute paths
  const pythonCmd = pythonExe.includes(path.sep) ? `"${pythonExe}"` : pythonExe;
  const output = execSync(`${pythonCmd} "${scriptPath}"`, {
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
