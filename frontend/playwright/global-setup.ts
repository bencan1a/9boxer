/**
 * Playwright Global Setup
 *
 * Starts the backend server once before all tests run.
 * This avoids the flaky webServer configuration and gives us full control.
 */

import { spawn, ChildProcess } from "child_process";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";

const BACKEND_URL = "http://localhost:8000";
const HEALTH_CHECK_URL = `${BACKEND_URL}/health`;
const MAX_RETRIES = 60; // 60 seconds max wait
const RETRY_INTERVAL = 1000; // 1 second between retries
const PID_FILE = path.join(__dirname, ".backend.pid");

/**
 * Wait for backend health check to respond
 */
async function waitForBackend(): Promise<void> {
  console.log(`[Global Setup] Waiting for backend at ${HEALTH_CHECK_URL}...`);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.get(HEALTH_CHECK_URL, { timeout: 2000 });
      if (response.status === 200) {
        console.log("[Global Setup] ✓ Backend is healthy and ready");
        return;
      }
    } catch (error) {
      // Backend not ready yet, continue waiting
      if (i % 5 === 0 && i > 0) {
        console.log(
          `[Global Setup] Still waiting for backend... (${i}s elapsed)`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  throw new Error(
    `Backend failed to start within ${MAX_RETRIES} seconds. ` +
      `Check backend logs above for errors.`
  );
}

/**
 * Check if port is already in use
 */
async function isPortInUse(port: number): Promise<boolean> {
  try {
    const response = await axios.get(`http://localhost:${port}/health`, {
      timeout: 1000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Start backend server
 */
async function startBackend(): Promise<ChildProcess> {
  // Determine paths based on platform
  const projectRoot = path.resolve(__dirname, "../..");
  const backendDir = path.join(projectRoot, "backend");

  // Python executable path (use forward slashes on all platforms)
  const pythonPath = process.env.CI
    ? "python"
    : process.platform === "win32"
      ? path.join(projectRoot, ".venv/Scripts/python.exe")
      : path.join(projectRoot, ".venv/bin/python");

  // Verify Python executable exists (skip check in CI)
  if (!process.env.CI && !fs.existsSync(pythonPath)) {
    throw new Error(
      `Python executable not found at: ${pythonPath}\n` +
        `Please ensure the virtual environment is set up:\n` +
        `  cd ${projectRoot}\n` +
        `  python -m venv .venv\n` +
        `  .venv\\Scripts\\activate (Windows) or source .venv/bin/activate (Unix)\n` +
        `  pip install -e '.[dev]'`
    );
  }

  console.log("[Global Setup] Starting backend server...");
  console.log(`[Global Setup] Python: ${pythonPath}`);
  console.log(`[Global Setup] Working directory: ${backendDir}`);

  // Spawn backend process
  const backend = spawn(
    pythonPath,
    [
      "-m",
      "uvicorn",
      "ninebox.main:app",
      "--host",
      "127.0.0.1",
      "--port",
      "8000",
    ],
    {
      cwd: backendDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PYTHONPATH: path.join(backendDir, "src"),
      },
      // On Windows, use shell: false to avoid escaping issues
      shell: false,
    }
  );

  // Capture stdout for debugging
  backend.stdout?.on("data", (data) => {
    const message = data.toString().trim();
    if (message) {
      console.log(`[Backend] ${message}`);
    }
  });

  // Capture stderr for debugging
  backend.stderr?.on("data", (data) => {
    const message = data.toString().trim();
    if (message) {
      console.error(`[Backend Error] ${message}`);
    }
  });

  // Handle process errors
  backend.on("error", (error) => {
    console.error("[Global Setup] Failed to start backend process:", error);
    throw error;
  });

  backend.on("exit", (code, signal) => {
    if (code !== null && code !== 0) {
      console.error(`[Global Setup] Backend process exited with code ${code}`);
    } else if (signal) {
      console.log(
        `[Global Setup] Backend process killed with signal ${signal}`
      );
    }
  });

  return backend;
}

/**
 * Global setup - runs once before all tests
 */
export default async function globalSetup(): Promise<void> {
  console.log("\n========================================");
  console.log("Playwright Global Setup - Backend Server");
  console.log("========================================\n");

  // Check if backend is already running
  if (await isPortInUse(8000)) {
    console.log("[Global Setup] ⚠️  Backend already running on port 8000");
    console.log("[Global Setup] Using existing backend server");

    // Save PID as 0 to indicate we didn't start it
    fs.writeFileSync(PID_FILE, "0");
    return;
  }

  // Start backend
  const backend = await startBackend();

  // Save PID for cleanup
  if (backend.pid) {
    fs.writeFileSync(PID_FILE, backend.pid.toString());
    console.log(`[Global Setup] Backend PID: ${backend.pid}`);
  }

  // Wait for backend to be ready
  await waitForBackend();

  console.log("\n========================================");
  console.log("Backend is ready! Starting tests...");
  console.log("========================================\n");
}
