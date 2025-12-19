/**
 * Build script: Copy splash screen to dist-electron directory
 *
 * This script ensures the splash.html file is copied from the source
 * electron/renderer directory to dist-electron/renderer where Electron
 * expects to find it at runtime.
 */

const fs = require('fs');
const path = require('path');

// Paths
const sourceFile = path.join(__dirname, '../electron/renderer/splash.html');
const destDir = path.join(__dirname, '../dist-electron/renderer');
const destFile = path.join(destDir, 'splash.html');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('✅ Created directory:', destDir);
}

// Copy splash screen
try {
  fs.copyFileSync(sourceFile, destFile);
  console.log('✅ Copied splash screen:', sourceFile, '→', destFile);
} catch (error) {
  console.error('❌ Failed to copy splash screen:', error.message);
  process.exit(1);
}
