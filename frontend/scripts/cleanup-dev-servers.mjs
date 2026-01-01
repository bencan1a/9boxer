#!/usr/bin/env node

/**
 * Cleanup script for Playwright test servers
 *
 * This script kills any processes running on ports 5173 (Vite) and 6006 (Storybook)
 * to prevent "DLL initialization failed" errors when Playwright tries to start webServers.
 *
 * Usage:
 *   npm run test:cleanup
 *
 * Windows-specific:
 * - Uses PowerShell to find and kill processes by port
 * - Handles the case where no processes are running (silently continues)
 */

const { execSync } = require("child_process");
const os = require("os");

const PORTS = [5173, 6006]; // Vite dev server, Storybook

console.log("🧹 Cleaning up development servers...\n");

if (os.platform() === "win32") {
  // Windows: Use PowerShell to find and kill processes
  for (const port of PORTS) {
    try {
      const command = `powershell.exe -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`;
      execSync(command, { stdio: "inherit" });
      console.log(`✓ Cleaned up port ${port}`);
    } catch (error) {
      // Ignore errors (likely means no process was running)
      console.log(`  Port ${port} is already free`);
    }
  }
} else {
  // Unix-like systems: Use lsof and kill
  for (const port of PORTS) {
    try {
      const pid = execSync(`lsof -ti :${port}`, { encoding: "utf-8" }).trim();
      if (pid) {
        execSync(`kill -9 ${pid}`);
        console.log(`✓ Cleaned up port ${port} (PID: ${pid})`);
      }
    } catch (error) {
      // Ignore errors (likely means no process was running)
      console.log(`  Port ${port} is already free`);
    }
  }
}

console.log("\n✅ Cleanup complete! You can now run Playwright tests.\n");
