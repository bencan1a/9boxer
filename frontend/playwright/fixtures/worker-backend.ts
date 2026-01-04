/**
 * Worker-scoped fixtures for isolated backend servers
 * Each Playwright worker gets its own backend server on a unique port with isolated database
 */

import { test as base } from "@playwright/test";
import { spawn, ChildProcess } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import axios from "axios";

const MAX_RETRIES = 60; // 60 seconds max wait
const RETRY_INTERVAL = 1000; // 1 second between retries

type WorkerFixtures = {
  workerBackendPort: number;
  workerDataDir: string;
  workerBackendUrl: string;
};

type TestFixtures = {
  // Auto-setup page routing to worker backend
  setupBackendRouting: void;
};

/**
 * Wait for backend health check to respond
 */
async function waitForBackend(url: string, workerIndex: number): Promise<void> {
  const healthUrl = `${url}/health`;
  console.log(`[Worker ${workerIndex}] Waiting for backend at ${healthUrl}...`);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.get(healthUrl, { timeout: 2000 });
      if (response.status === 200) {
        console.log(`[Worker ${workerIndex}] ✓ Backend is healthy and ready`);
        return;
      }
    } catch (error) {
      // Backend not ready yet, continue waiting
      if (i % 5 === 0 && i > 0) {
        console.log(
          `[Worker ${workerIndex}] Still waiting for backend... (${i}s elapsed)`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  throw new Error(
    `[Worker ${workerIndex}] Backend failed to start within ${MAX_RETRIES} seconds`
  );
}

/**
 * Start backend server for a worker
 */
async function startWorkerBackend(
  port: number,
  dataDir: string,
  workerIndex: number
): Promise<ChildProcess> {
  const projectRoot = path.resolve(__dirname, "../../..");
  const backendDir = path.join(projectRoot, "backend");

  // Python executable path
  let pythonPath: string;
  if (process.env.CI) {
    pythonPath = "python";
  } else {
    pythonPath =
      process.platform === "win32"
        ? path.join(projectRoot, ".venv/Scripts/python.exe")
        : path.join(projectRoot, ".venv/bin/python");

    if (!fs.existsSync(pythonPath)) {
      throw new Error(
        `Python executable not found at: ${pythonPath}\n` +
          `Please ensure the virtual environment is set up.`
      );
    }
  }

  console.log(
    `[Worker ${workerIndex}] Starting backend server on port ${port}...`
  );
  console.log(`[Worker ${workerIndex}] Data directory: ${dataDir}`);

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
      port.toString(),
    ],
    {
      cwd: backendDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PYTHONPATH: path.join(backendDir, "src"),
        APP_DATA_DIR: dataDir, // Isolated database for this worker
      },
      shell: false,
    }
  );

  // Capture stdout (only show errors/warnings)
  backend.stdout?.on("data", (data) => {
    const message = data.toString().trim();
    if (message) {
      const logLevelMatch = message.match(/ - (ERROR|WARNING|CRITICAL) - /);
      if (
        logLevelMatch ||
        message.includes('"port"') ||
        message.includes("Uvicorn running")
      ) {
        console.log(`[Worker ${workerIndex} Backend] ${message}`);
      }
    }
  });

  // Capture stderr
  backend.stderr?.on("data", (data) => {
    const message = data.toString().trim();
    if (message) {
      const logLevelMatch = message.match(/ - (ERROR|WARNING|CRITICAL) - /);
      if (logLevelMatch) {
        console.error(`[Worker ${workerIndex} Backend Error] ${message}`);
      }
    }
  });

  // Handle process errors
  backend.on("error", (error) => {
    console.error(`[Worker ${workerIndex}] Failed to start backend:`, error);
    throw error;
  });

  return backend;
}

/**
 * Kill backend process
 */
function killBackend(backend: ChildProcess, workerIndex: number): void {
  if (backend.pid) {
    console.log(
      `[Worker ${workerIndex}] Stopping backend (PID: ${backend.pid})...`
    );
    backend.kill("SIGTERM");
  }
}

/**
 * Extended test with worker-scoped backend and automatic request routing
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Each worker gets a unique port
  workerBackendPort: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const port = 38000 + workerInfo.workerIndex;
      await use(port);
    },
    { scope: "worker", auto: true },
  ],

  // Each worker gets an isolated data directory
  workerDataDir: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const tempDir = path.join(
        os.tmpdir(),
        `ninebox-e2e-worker-${workerInfo.workerIndex}-${Date.now()}`
      );
      fs.mkdirSync(tempDir, { recursive: true });
      console.log(
        `[Worker ${workerInfo.workerIndex}] Created data directory: ${tempDir}`
      );

      await use(tempDir);

      // Cleanup after worker is done
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(
          `[Worker ${workerInfo.workerIndex}] Cleaned up data directory`
        );
      } catch (error) {
        console.warn(
          `[Worker ${workerInfo.workerIndex}] Failed to cleanup: ${error}`
        );
      }
    },
    { scope: "worker", auto: true },
  ],

  // Each worker gets its own backend URL
  workerBackendUrl: [
    async ({ workerBackendPort, workerDataDir }, use, workerInfo) => {
      const url = `http://localhost:${workerBackendPort}`;

      // Start backend for this worker
      const backend = await startWorkerBackend(
        workerBackendPort,
        workerDataDir,
        workerInfo.workerIndex
      );

      // Wait for backend to be ready
      await waitForBackend(url, workerInfo.workerIndex);

      console.log(`[Worker ${workerInfo.workerIndex}] Backend ready at ${url}`);

      // Provide the URL to tests
      await use(url);

      // Cleanup: kill backend after all tests in this worker complete
      killBackend(backend, workerInfo.workerIndex);
    },
    { scope: "worker", auto: true },
  ],

  // Auto-setup request routing to worker backend (per-test)
  setupBackendRouting: [
    async ({ page, workerBackendUrl }, use) => {
      // Intercept all API requests and route to worker's backend
      await page.route("**/api/**", async (route) => {
        const request = route.request();
        const url = request.url();

        // Replace the default backend port (38000) with worker's port
        const newUrl = url.replace(
          /http:\/\/localhost:38000/,
          workerBackendUrl
        );

        // Continue with modified URL
        await route.continue({ url: newUrl });
      });

      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
