#!/usr/bin/env node

/**
 * Test script to verify native file dialog integration
 * Checks that IPC handlers are properly compiled and preload script exposes APIs
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Native File Dialog Integration...\n');

const checks = [];

// Test 1: Main process file exists
const mainPath = path.join(__dirname, 'dist-electron/main/index.js');
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf-8');
  
  // Check for ipcMain import
  if (mainContent.includes('ipcMain')) {
    checks.push({ name: 'ipcMain imported in main process', pass: true });
  } else {
    checks.push({ name: 'ipcMain imported in main process', pass: false });
  }

  // Check for dialog:openFile handler
  if (mainContent.includes("'dialog:openFile'") && mainContent.includes('ipcMain.handle')) {
    checks.push({ name: 'dialog:openFile IPC handler implemented', pass: true });
  } else {
    checks.push({ name: 'dialog:openFile IPC handler implemented', pass: false });
  }

  // Check for dialog:saveFile handler
  if (mainContent.includes("'dialog:saveFile'") && mainContent.includes('showSaveDialog')) {
    checks.push({ name: 'dialog:saveFile IPC handler implemented', pass: true });
  } else {
    checks.push({ name: 'dialog:saveFile IPC handler implemented', pass: false });
  }

  // Check for setupIpcHandlers call
  if (mainContent.includes('setupIpcHandlers()')) {
    checks.push({ name: 'setupIpcHandlers() called in app.on(ready)', pass: true });
  } else {
    checks.push({ name: 'setupIpcHandlers() called in app.on(ready)', pass: false });
  }

  // Check for Excel filter
  if (mainContent.includes('xlsx') && mainContent.includes('xls')) {
    checks.push({ name: 'Excel file filters configured', pass: true });
  } else {
    checks.push({ name: 'Excel file filters configured', pass: false });
  }
} else {
  checks.push({ name: 'Main process compiled', pass: false });
}

// Test 2: Preload script file exists
const preloadPath = path.join(__dirname, 'dist-electron/preload/index.js');
if (fs.existsSync(preloadPath)) {
  const preloadContent = fs.readFileSync(preloadPath, 'utf-8');

  // Check for openFileDialog exposed
  if (preloadContent.includes('openFileDialog') && preloadContent.includes('invoke')) {
    checks.push({ name: 'openFileDialog API exposed in preload', pass: true });
  } else {
    checks.push({ name: 'openFileDialog API exposed in preload', pass: false });
  }

  // Check for saveFileDialog exposed
  if (preloadContent.includes('saveFileDialog') && preloadContent.includes('invoke')) {
    checks.push({ name: 'saveFileDialog API exposed in preload', pass: true });
  } else {
    checks.push({ name: 'saveFileDialog API exposed in preload', pass: false });
  }

  // Check for dialog invocation
  if (preloadContent.includes("'dialog:openFile'") && preloadContent.includes("'dialog:saveFile'")) {
    checks.push({ name: 'Preload invokes correct IPC channels', pass: true });
  } else {
    checks.push({ name: 'Preload invokes correct IPC channels', pass: false });
  }
} else {
  checks.push({ name: 'Preload script compiled', pass: false });
}

// Test 3: TypeScript definitions
const electronDefPath = path.join(__dirname, 'src/types/electron.d.ts');
if (fs.existsSync(electronDefPath)) {
  const electronDefContent = fs.readFileSync(electronDefPath, 'utf-8');

  // Check for ElectronAPI interface
  if (electronDefContent.includes('interface ElectronAPI')) {
    checks.push({ name: 'ElectronAPI interface defined', pass: true });
  } else {
    checks.push({ name: 'ElectronAPI interface defined', pass: false });
  }

  // Check for openFileDialog method
  if (electronDefContent.includes('openFileDialog') && electronDefContent.includes('Promise')) {
    checks.push({ name: 'openFileDialog() typed in definitions', pass: true });
  } else {
    checks.push({ name: 'openFileDialog() typed in definitions', pass: false });
  }

  // Check for saveFileDialog method
  if (electronDefContent.includes('saveFileDialog') && electronDefContent.includes('Promise')) {
    checks.push({ name: 'saveFileDialog() typed in definitions', pass: true });
  } else {
    checks.push({ name: 'saveFileDialog() typed in definitions', pass: false });
  }
} else {
  checks.push({ name: 'TypeScript definitions found', pass: false });
}

// Test 4: Check file sizes
const mainStats = fs.statSync(mainPath);
const preloadStats = fs.statSync(preloadPath);
console.log('📊 File Sizes:');
console.log(`  - Main process: ${(mainStats.size / 1024).toFixed(2)} KB`);
console.log(`  - Preload script: ${(preloadStats.size / 1024).toFixed(2)} KB\n`);

// Print results
console.log('📋 Test Results:\n');
let passed = 0;
let failed = 0;

checks.forEach(check => {
  const symbol = check.pass ? '✅' : '❌';
  const status = check.pass ? 'PASS' : 'FAIL';
  console.log(`${symbol} ${check.name}: ${status}`);
  if (check.pass) passed++;
  else failed++;
});

console.log(`\n📊 Summary: ${passed} passed, ${failed} failed out of ${checks.length} checks`);

if (failed === 0) {
  console.log('\n✨ All checks passed! Native file dialog integration ready.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review the implementation.\n');
  process.exit(1);
}
