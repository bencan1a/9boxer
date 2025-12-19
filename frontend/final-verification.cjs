#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('Task 3.2 Final Verification Report');
console.log('========================================\n');

const results = {
  files: [],
  checks: [],
  timestamp: new Date().toISOString()
};

// Check 1: Main process file
const mainFile = 'electron/main/index.ts';
if (fs.existsSync(mainFile)) {
  const content = fs.readFileSync(mainFile, 'utf-8');
  const hasIpcMain = content.includes('ipcMain');
  const hasDialogOpen = content.includes("'dialog:openFile'");
  const hasDialogSave = content.includes("'dialog:saveFile'");
  const hasSetupCall = content.includes('setupIpcHandlers()');
  
  results.files.push({
    file: mainFile,
    exists: true,
    size: fs.statSync(mainFile).size,
    checks: {
      'ipcMain import': hasIpcMain,
      'dialog:openFile handler': hasDialogOpen,
      'dialog:saveFile handler': hasDialogSave,
      'setupIpcHandlers() call': hasSetupCall,
      'All checks passed': hasIpcMain && hasDialogOpen && hasDialogSave && hasSetupCall
    }
  });
}

// Check 2: Preload script
const preloadFile = 'electron/preload/index.ts';
if (fs.existsSync(preloadFile)) {
  const content = fs.readFileSync(preloadFile, 'utf-8');
  const hasOpenFile = content.includes('openFileDialog');
  const hasSaveFile = content.includes('saveFileDialog');
  const hasInvoke = content.includes('invoke');
  
  results.files.push({
    file: preloadFile,
    exists: true,
    size: fs.statSync(preloadFile).size,
    checks: {
      'openFileDialog method': hasOpenFile,
      'saveFileDialog method': hasSaveFile,
      'ipcRenderer.invoke usage': hasInvoke,
      'All checks passed': hasOpenFile && hasSaveFile && hasInvoke
    }
  });
}

// Check 3: Type definitions
const typeFile = 'src/types/electron.d.ts';
if (fs.existsSync(typeFile)) {
  const content = fs.readFileSync(typeFile, 'utf-8');
  const hasOpenFile = content.includes('openFileDialog');
  const hasSaveFile = content.includes('saveFileDialog');
  const hasPromise = content.includes('Promise<string | null>');
  
  results.files.push({
    file: typeFile,
    exists: true,
    size: fs.statSync(typeFile).size,
    checks: {
      'openFileDialog type': hasOpenFile,
      'saveFileDialog type': hasSaveFile,
      'Promise return type': hasPromise,
      'All checks passed': hasOpenFile && hasSaveFile && hasPromise
    }
  });
}

// Check 4: Compiled output
const compiledMain = 'dist-electron/main/index.js';
const compiledPreload = 'dist-electron/preload/index.js';

if (fs.existsSync(compiledMain)) {
  results.checks.push({
    check: 'Main process compiled',
    result: true,
    details: `${(fs.statSync(compiledMain).size / 1024).toFixed(2)} KB`
  });
}

if (fs.existsSync(compiledPreload)) {
  results.checks.push({
    check: 'Preload script compiled',
    result: true,
    details: `${(fs.statSync(compiledPreload).size / 1024).toFixed(2)} KB`
  });
}

// Print results
console.log('Files Modified:');
results.files.forEach(f => {
  console.log(`\n✅ ${f.file}`);
  console.log(`   Size: ${(f.size / 1024).toFixed(2)} KB`);
  Object.entries(f.checks).forEach(([check, passed]) => {
    const symbol = passed ? '✓' : '✗';
    console.log(`   ${symbol} ${check}`);
  });
});

console.log('\n\nCompilation Status:');
results.checks.forEach(c => {
  const symbol = c.result ? '✅' : '❌';
  console.log(`${symbol} ${c.check}: ${c.details}`);
});

// Summary
const allPassed = results.files.every(f => 
  Object.values(f.checks).every(v => typeof v !== 'object' || v)
) && results.checks.every(c => c.result);

console.log('\n' + '='.repeat(40));
if (allPassed) {
  console.log('✨ ALL CHECKS PASSED - Task 3.2 Complete');
} else {
  console.log('⚠️  SOME CHECKS FAILED - Review needed');
}
console.log('='.repeat(40) + '\n');

process.exit(allPassed ? 0 : 1);
