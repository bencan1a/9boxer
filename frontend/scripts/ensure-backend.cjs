#!/usr/bin/env node

/**
 * Backend Build Validation Script
 *
 * This script checks if the backend executable has been built before
 * running Electron builds. It prevents build failures by ensuring
 * the backend exists.
 *
 * Usage: Run automatically via npm prebuild hook
 */

const fs = require('fs');
const path = require('path');

// Get platform-specific backend executable name
const platform = process.platform;
const backendName = platform === 'win32' ? 'ninebox.exe' : 'ninebox';

// Construct path to backend executable
const backendPath = path.join(__dirname, '../../backend/dist/ninebox', backendName);

console.log('🔍 Checking for backend executable...');
console.log(`   Platform: ${platform}`);
console.log(`   Expected: ${backendPath}`);

// Check if backend exists
if (!fs.existsSync(backendPath)) {
  console.error('\n❌ Backend executable not found!');
  console.error('\n⚠️  You must build the backend first:\n');

  if (platform === 'win32') {
    console.error('   Windows:');
    console.error('   cd backend');
    console.error('   scripts\\build_executable.bat\n');
  } else {
    console.error('   Linux/macOS:');
    console.error('   cd backend');
    console.error('   ./scripts/build_executable.sh\n');
  }
  process.exit(1);
}

// Get file stats
const stats = fs.statSync(backendPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

console.log(`✅ Backend found (${sizeMB} MB)`);
console.log('✅ Ready to build Electron app\n');

process.exit(0);
