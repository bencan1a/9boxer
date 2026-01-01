#!/usr/bin/env node

/**
 * Test script to verify menu compilation and structure
 */

const fs = require("fs");
const path = require("path");

console.log("🧪 Testing Menu Module...\n");

// Test 1: Check if menu.ts exists
const menuTsPath = path.join(__dirname, "electron/main/menu.ts");
if (fs.existsSync(menuTsPath)) {
  console.log("✅ menu.ts file exists");
} else {
  console.error("❌ menu.ts file not found");
  process.exit(1);
}

// Test 2: Check if menu.js compiled
const menuJsPath = path.join(__dirname, "dist-electron/main/menu.js");
if (fs.existsSync(menuJsPath)) {
  console.log("✅ menu.js compiled file exists");
} else {
  console.error("❌ menu.js compiled file not found");
  process.exit(1);
}

// Test 3: Check file size
const stats = fs.statSync(menuJsPath);
console.log(`✅ menu.js size: ${(stats.size / 1024).toFixed(1)} KB`);

// Test 4: Verify compiled output contains key functions
const menuJs = fs.readFileSync(menuJsPath, "utf8");
const checks = [
  { name: "createMenu function", pattern: "function createMenu" },
  { name: "isMac check", pattern: "process.platform === 'darwin'" },
  { name: "File menu", pattern: "'File'" },
  { name: "Edit menu", pattern: "'Edit'" },
  { name: "View menu", pattern: "'View'" },
  { name: "Window menu", pattern: "'Window'" },
  { name: "Help menu", pattern: "'Help'" },
  { name: "About dialog", pattern: "showMessageBox" },
  { name: "Menu template", pattern: "buildFromTemplate" },
];

let allChecks = true;
checks.forEach((check) => {
  if (menuJs.includes(check.pattern)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.error(`❌ ${check.name} - pattern not found: ${check.pattern}`);
    allChecks = false;
  }
});

// Test 5: Check main index.ts includes menu
const mainTsPath = path.join(__dirname, "electron/main/index.ts");
const mainTs = fs.readFileSync(mainTsPath, "utf8");
if (mainTs.includes("import { createMenu } from './menu'")) {
  console.log("✅ Menu import in main process");
} else {
  console.error("❌ Menu import missing in main process");
  allChecks = false;
}

if (mainTs.includes("Menu.setApplicationMenu(menu)")) {
  console.log("✅ Menu.setApplicationMenu call");
} else {
  console.error("❌ Menu.setApplicationMenu call missing");
  allChecks = false;
}

// Test 6: Check main index.js compiled
const mainJsPath = path.join(__dirname, "dist-electron/main/index.js");
if (fs.existsSync(mainJsPath)) {
  console.log("✅ main index.js compiled");

  const mainJs = fs.readFileSync(mainJsPath, "utf8");
  if (mainJs.includes("createMenu") && mainJs.includes("setApplicationMenu")) {
    console.log("✅ Menu setup in compiled main process");
  } else {
    console.error("❌ Menu setup missing in compiled main process");
    allChecks = false;
  }
} else {
  console.error("❌ main index.js not found");
  allChecks = false;
}

if (allChecks) {
  console.log("\n✨ All menu tests passed!\n");
  process.exit(0);
} else {
  console.log("\n❌ Some tests failed\n");
  process.exit(1);
}
