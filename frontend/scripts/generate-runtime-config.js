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
 * Configuration priority:
 * 1. Environment variables (if set)
 * 2. backend/.env file (fallback for local builds)
 * 3. Default values
 *
 * Usage:
 *   # Automatic (reads from backend/.env)
 *   node scripts/generate-runtime-config.js
 *
 *   # Or override with environment variables
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-runtime-config.js
 */

const fs = require("fs");
const path = require("path");

/**
 * Read environment variables from backend/.env file.
 * This matches the logic used in electron/main/index.ts for development mode.
 */
function loadEnvFromFile() {
  const envVars = {};
  try {
    const envPath = path.join(__dirname, "../../backend/.env");

    if (!fs.existsSync(envPath)) {
      console.warn(`⚠️ Backend .env file not found at: ${envPath}`);
      return envVars;
    }

    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      // Parse KEY=VALUE format
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    }

    console.log(
      `✅ Loaded ${Object.keys(envVars).length} environment variables from backend/.env`
    );
  } catch (error) {
    console.error("❌ Failed to read backend .env file:", error);
  }

  return envVars;
}

// Load from .env file if environment variables aren't set
const envFromFile = loadEnvFromFile();

const config = {
  ANTHROPIC_API_KEY:
    process.env.ANTHROPIC_API_KEY || envFromFile.ANTHROPIC_API_KEY || "",
  LLM_MODEL:
    process.env.LLM_MODEL ||
    envFromFile.LLM_MODEL ||
    "claude-sonnet-4-5-20250929",
  LLM_MAX_TOKENS:
    process.env.LLM_MAX_TOKENS || envFromFile.LLM_MAX_TOKENS || "4096",
  // Add timestamp to verify this was generated at build time
  BUILD_TIMESTAMP: new Date().toISOString(),
};

// Validate API key format if provided
if (
  config.ANTHROPIC_API_KEY &&
  !config.ANTHROPIC_API_KEY.startsWith("sk-ant-")
) {
  console.error(
    "❌ Invalid ANTHROPIC_API_KEY format (should start with sk-ant-)"
  );
  if (process.env.CI === "true") {
    process.exit(1);
  }
}

// In CI, require API key to prevent shipping broken builds
if (!config.ANTHROPIC_API_KEY && process.env.CI === "true") {
  console.error("❌ ANTHROPIC_API_KEY is required in CI builds");
  console.error("   Set it as a repository secret in GitHub Actions");
  process.exit(1);
}

// Warn if API key is missing in local builds
if (!config.ANTHROPIC_API_KEY && process.env.CI !== "true") {
  console.warn("\n⚠️  WARNING: ANTHROPIC_API_KEY not set");
  console.warn("   AI features will be disabled in the built app");
  console.warn("   The npm build scripts should auto-load from backend/.env\n");
}

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
