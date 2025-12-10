#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Phase 3 Integration Verification\n');

let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// Test 1: Frontend build exists
test(
  'Frontend build exists',
  fs.existsSync('dist/index.html'),
  'dist/index.html found'
);

// Test 2: Electron compiled output exists
test(
  'Electron main process compiled',
  fs.existsSync('dist-electron/main/index.js'),
  'dist-electron/main/index.js found'
);

test(
  'Electron preload compiled',
  fs.existsSync('dist-electron/preload/index.js'),
  'dist-electron/preload/index.js found'
);

// Test 3: Config file exists
test(
  'Frontend config exists',
  fs.existsSync('src/config.ts'),
  'src/config.ts found'
);

// Test 4: Splash screen exists
test(
  'Splash screen exists',
  fs.existsSync('electron/renderer/splash.html'),
  'splash.html found'
);

// Test 5: electron-builder config
const ebConfig = JSON.parse(fs.readFileSync('electron-builder.json', 'utf8'));
test(
  'electron-builder has frontend in extraResources',
  ebConfig.extraResources?.some(r => r.from === 'dist'),
  'Frontend bundled in build'
);

test(
  'electron-builder has backend in extraResources',
  ebConfig.extraResources?.some(r => r.from === '../backend/dist/ninebox'),
  'Backend bundled in build'
);

// Test 6: Main process has required functions
const mainSource = fs.readFileSync('dist-electron/main/index.js', 'utf8');
test('Main process has getWindowUrl', mainSource.includes('getWindowUrl'));
test('Main process has splash screen', mainSource.includes('splash'));
test('Main process has IPC handlers', mainSource.includes('ipcMain'));

// Test 7: Preload has dialog APIs
const preloadSource = fs.readFileSync('dist-electron/preload/index.js', 'utf8');
test('Preload exposes openFileDialog', preloadSource.includes('openFileDialog'));
test('Preload exposes saveFileDialog', preloadSource.includes('saveFileDialog'));

// Summary
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
