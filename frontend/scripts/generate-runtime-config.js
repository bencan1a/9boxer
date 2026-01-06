/**
 * Generate runtime configuration file for production builds.
 *
 * This script reads environment variables at BUILD TIME and writes them
 * to a config file that will be bundled with the app. This is more secure
 * than including a .env file because:
 * 1. The file is generated only during official builds
 * 2. It's not checked into git
 * 3. It can be placed in a location that's harder to find than .env
 *
 * Usage: Set environment variables before running this script
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-runtime-config.js
 */

const fs = require("fs");
const path = require("path");

const config = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  LLM_MODEL: process.env.LLM_MODEL || "claude-sonnet-4-5-20250929",
  LLM_MAX_TOKENS: process.env.LLM_MAX_TOKENS || "4096",
  // Add timestamp to verify this was generated at build time
  BUILD_TIMESTAMP: new Date().toISOString(),
};

// Write to dist-electron directory so it gets bundled
const distElectronPath = path.join(__dirname, "../dist-electron");
const configPath = path.join(distElectronPath, "runtime-config.json");

// Ensure directory exists
if (!fs.existsSync(distElectronPath)) {
  fs.mkdirSync(distElectronPath, { recursive: true });
}

// Write config file
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log("✅ Generated runtime-config.json");
console.log(
  `   ANTHROPIC_API_KEY: ${config.ANTHROPIC_API_KEY ? "***" + config.ANTHROPIC_API_KEY.slice(-8) : "(not set)"}`
);
console.log(`   LLM_MODEL: ${config.LLM_MODEL}`);
console.log(`   LLM_MAX_TOKENS: ${config.LLM_MAX_TOKENS}`);
console.log(`   BUILD_TIMESTAMP: ${config.BUILD_TIMESTAMP}`);
