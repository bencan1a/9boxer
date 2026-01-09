import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  ipcMain,
  nativeTheme,
} from "electron";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import axios from "axios";
import { WindowStateManager } from "./windowState";
import {
  initAutoUpdater,
  startUpdateChecks,
  stopUpdateChecks,
  setupUpdateIpcHandlers,
  UpdateAnalyticsEvent,
} from "./autoUpdater";

// Global references
let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let splashWindow: BrowserWindow | null = null;
let windowStateManager: WindowStateManager | null = null;

// Mode detection (lazy to avoid accessing app before it's ready)
const getIsDev = () => !app.isPackaged;

// Debug build detection - checks if this is a production build with debug flags enabled
const getIsDebugBuild = () => {
  try {
    return app.isPackaged && require("../../package.json").debugBuild === true;
  } catch {
    return false;
  }
};

// Backend configuration
// Default to port 38000 to avoid conflicts with common services on 38000
let BACKEND_PORT = parseInt(process.env.BACKEND_PORT || "38000", 10);
let BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const BACKEND_STARTUP_TIMEOUT = 60; // seconds - increased for first launch on Windows (antivirus scans, PyInstaller init)
const PORT_DISCOVERY_TIMEOUT = 15; // seconds - increased for first launch on Windows
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

// External backend mode: skip spawning backend, connect to existing server
// Useful for devcontainer development with uvicorn
const USE_EXTERNAL_BACKEND = process.env.USE_EXTERNAL_BACKEND === "true";

// Connection monitoring state
let healthCheckInterval: NodeJS.Timeout | null = null;
let connectionStatus: "connected" | "reconnecting" | "disconnected" =
  "connected";
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 1;

/**
 * Show logs in the default text editor or open the logs folder.
 * Used by error dialogs to help users troubleshoot issues.
 */
async function showLogs(): Promise<void> {
  const { shell } = require("electron");
  const appDataPath = app.getPath("userData");
  const logFilePath = path.join(appDataPath, "backend.log");

  try {
    // Try to open the log file directly
    const result = await shell.openPath(logFilePath);
    if (result) {
      // If opening file failed, fall back to opening the folder
      console.log("Failed to open log file, opening folder instead:", result);
      await shell.openPath(appDataPath);
    }
  } catch (error) {
    console.error("Failed to show logs:", error);
    // Fall back to opening the folder
    await shell.openPath(appDataPath);
  }
}

/**
 * Get the path to the backend executable.
 * In development: Use the built backend from Phase 1
 * In production: Backend will be in Electron's resources folder
 */
function getBackendPath(): string {
  if (app.isPackaged) {
    // Production: backend is in resources
    const platform = process.platform;
    const backendName = platform === "win32" ? "ninebox.exe" : "ninebox";
    return path.join(process.resourcesPath, "backend", backendName);
  } else {
    // Development: use built backend from Phase 1
    const platform = process.platform;
    const backendName = platform === "win32" ? "ninebox.exe" : "ninebox";
    return path.join(__dirname, "../../../backend/dist/ninebox", backendName);
  }
}

/**
 * Get backend environment variables for configuration.
 *
 * In production: Reads from runtime-config.json (generated at build time with env vars baked in)
 * In development: Reads from .env file for convenience
 *
 * Security note: In production builds, sensitive values like ANTHROPIC_API_KEY
 * are baked into runtime-config.json during the build process. This config file
 * is generated from environment variables and bundled with the app.
 *
 * Returns environment variables as key-value object
 */
function getBackendEnv(): Record<string, string> {
  const envVars: Record<string, string> = {};

  if (app.isPackaged) {
    // Production: Read from runtime-config.json generated at build time
    try {
      const fs = require("fs");
      const configPath = path.join(__dirname, "../runtime-config.json");

      console.log(
        `📄 Loading backend config from build-time config: ${configPath}`
      );

      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configContent);

        if (config.ANTHROPIC_API_KEY) {
          envVars.ANTHROPIC_API_KEY = config.ANTHROPIC_API_KEY;
          console.log(
            `✅ ANTHROPIC_API_KEY loaded from build-time config (built: ${config.BUILD_TIMESTAMP || "unknown"})`
          );
        } else {
          console.warn(
            "⚠️ ANTHROPIC_API_KEY not found in config - AI features will be disabled"
          );
        }

        if (config.LLM_MODEL) {
          envVars.LLM_MODEL = config.LLM_MODEL;
        }

        if (config.LLM_MAX_TOKENS) {
          envVars.LLM_MAX_TOKENS = config.LLM_MAX_TOKENS;
        }
      } else {
        console.warn(
          `⚠️ Runtime config not found at ${configPath} - AI features will be disabled`
        );
      }
    } catch (error) {
      console.error("❌ Failed to read runtime config:", error);
    }
  } else {
    // Development: Read from .env file for convenience
    try {
      const fs = require("fs");
      const envPath = path.join(__dirname, "../../../backend/.env");

      console.log(`📄 Reading backend .env from: ${envPath}`);

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
        `✅ Loaded ${Object.keys(envVars).length} environment variables from .env`
      );
    } catch (error) {
      console.error("❌ Failed to read backend .env file:", error);
    }
  }

  return envVars;
}

/**
 * Create and display the splash screen while the backend loads.
 * Splash screen is frameless, transparent, and always on top.
 */
function createSplashScreen(): void {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Get splash screen path based on environment
  const splashPath = app.isPackaged
    ? path.join(process.resourcesPath, "splash.html")
    : path.join(__dirname, "../renderer/splash.html");

  console.log("🎨 Loading splash screen from:", splashPath);
  splashWindow.loadFile(splashPath);
  splashWindow.center();
  console.log("🎨 Splash screen created");
}

/**
 * Close and clean up the splash screen.
 */
function closeSplashScreen(): void {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
    console.log("🎨 Splash screen closed");
  }
}

/**
 * Set up logging configuration based on environment mode.
 * Logs mode information and app paths.
 */
function setupLogging(): void {
  if (getIsDev()) {
    console.log("🔧 Running in DEVELOPMENT mode");
    console.log("📁 App path:", app.getAppPath());
    console.log("📁 User data path:", app.getPath("userData"));
  } else if (getIsDebugBuild()) {
    console.log(
      "🐛 Running in DEBUG BUILD mode (production build with dev console)"
    );
    console.log("📁 App path:", app.getAppPath());
    console.log("📁 User data path:", app.getPath("userData"));
  } else {
    console.log("🚀 Running in PRODUCTION mode");
    console.log("📁 App path:", app.getAppPath());
    console.log("📁 User data path:", app.getPath("userData"));
  }
}

/**
 * Log detailed environment information for debugging.
 * Includes Node, Electron, Chrome versions and platform details.
 */
function logEnvironmentInfo(): void {
  console.log("📊 Environment Information:");
  console.log("  Node:", process.versions.node);
  console.log("  Electron:", process.versions.electron);
  console.log("  Chrome:", process.versions.chrome);
  console.log("  Platform:", process.platform);
  console.log("  Architecture:", process.arch);
  console.log("  Development:", getIsDev());
  console.log("  Packaged:", app.isPackaged);
  console.log("  Debug Build:", getIsDebugBuild());
}

/**
 * Wait for backend to be ready by polling the health endpoint.
 * Returns true if backend responds within timeout, false otherwise.
 */
async function waitForBackend(
  maxAttempts = BACKEND_STARTUP_TIMEOUT
): Promise<boolean> {
  console.log("⏳ Waiting for backend to be ready...");

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 1000,
      });
      if (response.status === 200) {
        console.log("✅ Backend ready");
        return true;
      }
    } catch (error) {
      console.log(`⏳ Waiting for backend... (${i + 1}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.error("❌ Backend failed to start within timeout");
  return false;
}

/**
 * Start the backend executable as a subprocess.
 * Waits for backend to be ready before resolving.
 * Returns the actual port the backend is using.
 */
async function startBackend(): Promise<number> {
  const backendPath = getBackendPath();
  const appDataPath = app.getPath("userData");

  console.log(`🚀 Starting backend from: ${backendPath}`);
  console.log(`📁 App data: ${appDataPath}`);
  console.log(
    `🔍 Backend executable exists: ${require("fs").existsSync(backendPath)}`
  );

  if (!require("fs").existsSync(backendPath)) {
    throw new Error(`Backend executable not found at: ${backendPath}`);
  }

  // Get backend environment variables
  const backendEnv = getBackendEnv();

  // Return a promise that resolves with the discovered port
  return new Promise<number>((resolve, reject) => {
    let portDiscovered = false;
    let discoveredPort: number | null = null;

    backendProcess = spawn(backendPath, [], {
      env: {
        ...process.env,
        ...backendEnv, // Include .env variables (ANTHROPIC_API_KEY, LLM_MODEL, etc.)
        APP_DATA_DIR: appDataPath,
        PORT: BACKEND_PORT.toString(), // Request port, backend may use alternative
      },
      stdio: ["ignore", "pipe", "pipe"], // Always pipe stdout/stderr for port discovery
      windowsHide: true, // Hide console window on Windows
    });

    // Set up port discovery timeout
    const portTimeout = setTimeout(() => {
      if (!portDiscovered) {
        console.error(
          "❌ Port discovery timeout: Backend did not report port within 5 seconds"
        );
        reject(new Error("Backend did not report port within timeout"));
      }
    }, PORT_DISCOVERY_TIMEOUT * 1000);

    // Capture stdout for port discovery AND logging
    if (backendProcess.stdout) {
      const fs = require("fs");
      const logPath = path.join(appDataPath, "backend.log");
      let logStream: any = null;

      // Create log stream for production mode
      if (!getIsDev()) {
        logStream = fs.createWriteStream(logPath, { flags: "a" });
        console.log(`📝 Backend logs will be written to: ${logPath}`);
        logStream.write(
          `\n\n=== Backend started at ${new Date().toISOString()} ===\n`
        );
      }

      backendProcess.stdout.on("data", (data: Buffer) => {
        const output = data.toString();

        // Log output for debugging (dev mode or debug build)
        if (getIsDev() || getIsDebugBuild()) {
          console.log("Backend stdout:", output);
        }

        // Write to log file (production mode)
        if (logStream) {
          logStream.write(output);
        }

        // Parse JSON port message (only once)
        if (!portDiscovered) {
          try {
            // Match JSON object with "port" and "status" fields
            const match = output.match(/\{.*"port".*"status".*\}/);
            if (match) {
              const message = JSON.parse(match[0]);
              if (message.port && message.status === "ready") {
                discoveredPort = message.port as number;
                portDiscovered = true;
                clearTimeout(portTimeout);
                console.log(`✅ Backend port discovered: ${discoveredPort}`);
                resolve(discoveredPort); // discoveredPort is guaranteed to be number here
              }
            }
          } catch (e) {
            // Not a valid JSON message, ignore
          }
        }
      });
    }

    // Capture stderr for logging
    if (backendProcess.stderr) {
      const fs = require("fs");
      const logPath = path.join(appDataPath, "backend.log");
      let errorLogStream: any = null;

      if (!getIsDev()) {
        errorLogStream = fs.createWriteStream(logPath, { flags: "a" });
      }

      backendProcess.stderr.on("data", (data: Buffer) => {
        const output = data.toString();

        // Log errors for debugging (dev mode or debug build)
        if (getIsDev() || getIsDebugBuild()) {
          console.error("Backend stderr:", output);
        }

        // Write to log file (production mode)
        if (errorLogStream) {
          errorLogStream.write(output);
        }
      });
    }

    backendProcess.on("error", (error) => {
      clearTimeout(portTimeout);
      console.error("❌ Backend process spawn error:", error);
      reject(new Error(`Backend failed to start: ${error.message}`));
    });

    backendProcess.on("exit", async (code) => {
      clearTimeout(portTimeout);
      console.log(`Backend exited with code ${code}`);

      // If backend exits before port discovery, reject the startup promise
      if (!portDiscovered) {
        if (code !== 0 && code !== null) {
          reject(
            new Error(`Backend exited with code ${code} before reporting port`)
          );
        }
      } else {
        // Backend crashed during runtime (after successful startup)
        if (code !== 0 && code !== null) {
          console.error(`❌ Backend crashed with code ${code} during runtime`);
          connectionStatus = "reconnecting";
          broadcastConnectionStatus("reconnecting");

          // Attempt automatic restart if within limits
          if (restartAttempts < MAX_RESTART_ATTEMPTS) {
            restartAttempts++;
            console.log(
              `🔄 Attempting automatic restart (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})...`
            );
            const restarted = await attemptBackendRestart();

            if (!restarted) {
              connectionStatus = "disconnected";
              broadcastConnectionStatus("disconnected");
              await showBackendDisconnectedDialog();
            }
          } else {
            console.error("❌ Max restart attempts exceeded");
            connectionStatus = "disconnected";
            broadcastConnectionStatus("disconnected");
            await showBackendDisconnectedDialog();
          }
        }
      }
    });
  });
}

/**
 * Get the URL to load in the main window.
 * Development: Loads from Vite dev server for hot reload
 * Production: Loads from bundled files via file:// protocol
 */
function getWindowUrl(): string {
  if (getIsDev() && process.env.VITE_DEV_SERVER_URL) {
    // Development mode: use Vite dev server for hot reload
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    console.log("🔥 Using Vite dev server:", devServerUrl);
    return devServerUrl;
  } else if (app.isPackaged) {
    // Production mode: load from app bundle
    const prodPath = path.join(
      process.resourcesPath,
      "app",
      "dist",
      "index.html"
    );
    console.log("📦 Using production bundle:", prodPath);
    return prodPath;
  } else {
    // Development without Vite server: use built files
    const devBuildPath = path.join(__dirname, "../../dist/index.html");
    console.log("📦 Using development build:", devBuildPath);
    return devBuildPath;
  }
}

/**
 * Broadcast connection status to all renderer windows.
 * Notifies the frontend about backend connection state changes.
 */
function broadcastConnectionStatus(
  status: "connected" | "reconnecting" | "disconnected",
  port?: number
): void {
  console.log(
    `📡 Broadcasting connection status: ${status}${port ? ` (port ${port})` : ""}`
  );
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send("backend:connection-status", { status, port });
  });
}

/**
 * Attempt to restart the backend process.
 * Returns true if restart succeeded, false otherwise.
 */
async function attemptBackendRestart(): Promise<boolean> {
  try {
    console.log("🔄 Attempting to restart backend...");

    // Kill existing process if still running
    if (backendProcess && !backendProcess.killed) {
      console.log("🛑 Killing existing backend process...");
      backendProcess.kill();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Attempt restart
    const discoveredPort = await startBackend();
    BACKEND_PORT = discoveredPort;
    BACKEND_URL = `http://localhost:${discoveredPort}`;
    console.log(`✅ Backend restarted on port ${discoveredPort}`);

    // Wait for backend health check
    const ready = await waitForBackend();
    if (ready) {
      connectionStatus = "connected";
      restartAttempts = 0; // Reset attempts on success
      broadcastConnectionStatus("connected", discoveredPort);
      return true;
    } else {
      console.error("❌ Backend restart failed: health check failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Backend restart failed:", error);
    return false;
  }
}

/**
 * Perform a health check on the backend.
 * Returns true if backend is healthy, false otherwise.
 */
async function performHealthCheck(): Promise<boolean> {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: HEALTH_CHECK_TIMEOUT,
    });
    return response.status === 200;
  } catch (error) {
    console.warn(
      "⚠️ Health check failed:",
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Start periodic health monitoring of the backend.
 * Runs every 30 seconds after initial startup.
 */
function startHealthMonitoring(): void {
  console.log("🏥 Starting health monitoring (every 30 seconds)...");

  healthCheckInterval = setInterval(async () => {
    const healthy = await performHealthCheck();

    if (healthy) {
      // Backend is healthy
      if (connectionStatus !== "connected") {
        console.log("✅ Backend recovered");
        connectionStatus = "connected";
        restartAttempts = 0;
        broadcastConnectionStatus("connected", BACKEND_PORT);
      }
    } else {
      // Backend is unhealthy
      if (connectionStatus === "connected") {
        console.warn("⚠️ Backend health check failed, attempting restart...");
        connectionStatus = "reconnecting";
        broadcastConnectionStatus("reconnecting");

        // Attempt restart if we haven't exceeded max attempts
        if (restartAttempts < MAX_RESTART_ATTEMPTS) {
          restartAttempts++;
          const restarted = await attemptBackendRestart();

          if (!restarted) {
            connectionStatus = "disconnected";
            broadcastConnectionStatus("disconnected");
            await showBackendDisconnectedDialog();
          }
        } else {
          console.error("❌ Max restart attempts exceeded");
          connectionStatus = "disconnected";
          broadcastConnectionStatus("disconnected");
          await showBackendDisconnectedDialog();
        }
      }
    }
  }, HEALTH_CHECK_INTERVAL);
}

/**
 * Stop health monitoring.
 */
function stopHealthMonitoring(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log("🏥 Health monitoring stopped");
  }
}

/**
 * Show dialog when backend disconnects and cannot be recovered.
 * Provides user-friendly error message with retry option.
 */
async function showBackendDisconnectedDialog(): Promise<void> {
  const choice = await dialog.showMessageBox({
    type: "error",
    title: "Backend Disconnected",
    message: "The backend process has stopped.",
    detail:
      "Your work has been saved. Click Retry to reconnect, or Close to exit.",
    buttons: ["Retry", "Close"],
    defaultId: 0,
    cancelId: 1,
  });

  if (choice.response === 0) {
    // Retry
    console.log("🔄 User requested retry...");
    connectionStatus = "reconnecting";
    broadcastConnectionStatus("reconnecting");
    restartAttempts = 0; // Reset attempts for manual retry
    const restarted = await attemptBackendRestart();

    if (!restarted) {
      connectionStatus = "disconnected";
      broadcastConnectionStatus("disconnected");
      // Show failed restart dialog
      await showRestartFailedDialog();
    }
  } else {
    // Close
    console.log("🛑 User chose to close application");
    app.quit();
  }
}

/**
 * Show dialog when backend restart fails.
 * Provides Show Logs option for troubleshooting.
 */
async function showRestartFailedDialog(): Promise<void> {
  const choice = await dialog.showMessageBox({
    type: "error",
    title: "Reconnection Failed",
    message: "Unable to reconnect to the backend.",
    detail:
      "Please restart the application manually. Your work has been saved.",
    buttons: ["Show Logs", "Close"],
    defaultId: 1,
    cancelId: 1,
  });

  if (choice.response === 0) {
    // Show Logs
    await showLogs();
  }

  // Always quit after showing this dialog
  app.quit();
}

/**
 * Show error dialog for startup failures.
 * Provides user-friendly error messages with optional Show Logs button.
 *
 * @param title - Short error title (3-5 words)
 * @param message - What happened in plain language
 * @param detail - Why it happened + what user should do
 * @param errorMessage - Technical error details
 * @param showLogsButton - Whether to show the Show Logs button
 */
async function showStartupErrorDialog(
  title: string,
  message: string,
  detail: string,
  errorMessage: string,
  showLogsButton: boolean
): Promise<void> {
  const fullDetail = `${detail}\n\nError: ${errorMessage}`;
  const buttons = showLogsButton ? ["Show Logs", "Quit"] : ["Quit"];

  const choice = await dialog.showMessageBox({
    type: "error",
    title,
    message,
    detail: fullDetail,
    buttons,
    defaultId: buttons.length - 1, // Default to Quit
    cancelId: buttons.length - 1,
  });

  if (showLogsButton && choice.response === 0) {
    // Show Logs
    await showLogs();
  }
}

/**
 * Set up IPC handlers for file dialogs and other main process features.
 * These handlers are invoked from the renderer process via ipcRenderer.invoke().
 */
function setupIpcHandlers(): void {
  // Handle getting system theme preference
  ipcMain.handle("theme:getSystemTheme", () => {
    console.log(
      "🎨 [Theme] System theme requested:",
      nativeTheme.shouldUseDarkColors ? "dark" : "light"
    );
    return nativeTheme.shouldUseDarkColors ? "dark" : "light";
  });

  // Handle file open dialog for importing Excel files
  ipcMain.handle("dialog:openFile", async () => {
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        { name: "Excel Files", extensions: ["xlsx", "xls"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // Handle file save dialog for exporting Excel files
  ipcMain.handle("dialog:saveFile", async (event, defaultName: string) => {
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName || "export.xlsx",
      filters: [
        { name: "Excel Files", extensions: ["xlsx"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  });

  // Handle opening logs folder
  ipcMain.handle("app:openLogsFolder", async () => {
    const { shell } = require("electron");
    const appDataPath = app.getPath("userData");
    await shell.openPath(appDataPath);
  });

  // Handle showing logs (opens log file or folder)
  ipcMain.handle("app:showLogs", async () => {
    const { shell } = require("electron");
    const appDataPath = app.getPath("userData");
    const logFilePath = path.join(appDataPath, "backend.log");

    try {
      // Try to open the log file directly (opens in default text editor)
      const result = await shell.openPath(logFilePath);
      if (result) {
        // If opening file failed, fall back to opening the folder
        console.log("Failed to open log file, opening folder instead:", result);
        await shell.openPath(appDataPath);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to show logs:", error);
      // Fall back to opening the folder
      await shell.openPath(appDataPath);
      return { success: true }; // Still return success since we opened the folder
    }
  });

  // Handle getting app paths for debugging
  ipcMain.handle("app:getPaths", async () => {
    return {
      userData: app.getPath("userData"),
      logs: path.join(app.getPath("userData"), "backend.log"),
      database: path.join(app.getPath("userData"), "ninebox.db"),
    };
  });

  // Handle reading a file from disk (for auto-reload functionality)
  ipcMain.handle("file:readFile", async (event, filePath: string) => {
    try {
      const fs = require("fs").promises;
      const buffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      return {
        buffer: Array.from(buffer), // Convert buffer to array for IPC transfer
        fileName,
        success: true,
      };
    } catch (error) {
      console.error("Failed to read file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Handle opening user guide in default browser
  ipcMain.handle("app:openUserGuide", async () => {
    try {
      const { shell } = require("electron");
      const userGuidePath = app.isPackaged
        ? path.join(process.resourcesPath, "user-guide", "index.html")
        : path.join(__dirname, "../../../resources/user-guide/site/index.html");

      console.log("📖 Opening user guide from:", userGuidePath);

      // Check if file exists
      const fs = require("fs");
      if (!fs.existsSync(userGuidePath)) {
        console.error("❌ User guide not found at:", userGuidePath);
        return { success: false, error: "User guide file not found" };
      }

      // Open in default browser
      await shell.openExternal(`file://${userGuidePath}`);
      return { success: true };
    } catch (error) {
      console.error("Failed to open user guide:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Handle getting backend port (for dynamic API client)
  ipcMain.handle("backend:getPort", () => {
    console.log("🔌 Renderer requested backend port:", BACKEND_PORT);
    return BACKEND_PORT;
  });

  // Handle getting backend URL (for dynamic API client)
  ipcMain.handle("backend:getUrl", () => {
    console.log("🔌 Renderer requested backend URL:", BACKEND_URL);
    return BACKEND_URL;
  });

  // Handle session restoration completion notification
  ipcMain.handle("app:sessionRestored", () => {
    console.log("✅ Session restoration complete, closing splash screen");
    closeSplashScreen();
    return { success: true };
  });

  // Set up auto-update IPC handlers
  setupUpdateIpcHandlers();
}

/**
 * Create the main application window.
 * Loads the frontend via file:// protocol (production) or Vite dev server (development).
 */
function createWindow(): void {
  // Initialize window state manager
  if (!windowStateManager) {
    windowStateManager = new WindowStateManager();
  }

  // Get icon path based on environment
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "icon.png")
    : path.join(__dirname, "../../build/icon.png");

  // Apply saved window bounds (or use defaults)
  const windowOptions = windowStateManager.applyBounds({
    minWidth: 1024,
    minHeight: 768,
    title: "9Boxer",
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "../preload/index.js"),
    },
    show: false, // Don't show until ready
  });

  mainWindow = new BrowserWindow(windowOptions);

  // Configure Content Security Policy (CSP)
  // This protects against XSS attacks and injection vulnerabilities
  // Note: Development mode allows inline scripts for Vite HMR; production is strict
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      const isDev = getIsDev();
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            [
              "default-src 'self'",
              // Dev: Allow inline scripts for Vite HMR
              // Prod: Strict - no inline scripts (verified: production build has none)
              isDev ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'",
              "style-src 'self' 'unsafe-inline'", // Material-UI uses CSS-in-JS (inline styles)
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:*", // Backend API (dynamic port) + Vite HMR
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          ],
        },
      });
    }
  );

  // Start tracking window state changes
  windowStateManager.track(mainWindow);

  // Load from file system or Vite dev server
  const url = getWindowUrl();
  console.log(`📄 Loading frontend from: ${url}`);

  if (url.startsWith("http")) {
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(url);
  }

  // Open DevTools in development mode or debug builds
  // Debug builds have debugBuild flag in package.json metadata
  const isDebugBuild =
    app.isPackaged && require("../../package.json").debugBuild === true;
  if (getIsDev() || isDebugBuild) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window ready to show
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ Main window finished loading");
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error(
        "❌ Main window failed to load:",
        errorCode,
        errorDescription
      );
    }
  );

  // Handle window closed event
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/**
 * Set up OS theme change listener.
 * Notifies the renderer process when the system theme preference changes.
 * This should be called after the main window is created.
 */
function setupThemeListener(): void {
  nativeTheme.on("updated", () => {
    const theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
    console.log("🎨 [Theme] System theme changed to:", theme);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("theme:systemThemeChanged", theme);
    }
  });

  console.log(
    "🎨 [Theme] Theme listener initialized, current theme:",
    nativeTheme.shouldUseDarkColors ? "dark" : "light"
  );
}

// App lifecycle events
app.on("ready", async () => {
  try {
    console.log("🚀 Starting 9Boxer...");

    // Setup logging and environment info
    setupLogging();
    logEnvironmentInfo();

    // Show splash screen first
    createSplashScreen();

    if (USE_EXTERNAL_BACKEND) {
      // External backend mode: connect to existing backend (e.g., uvicorn in devcontainer)
      console.log(`🔌 Using external backend at ${BACKEND_URL}`);
      console.log("   Set USE_EXTERNAL_BACKEND=true, skipping backend spawn");
    } else {
      // Start backend while splash is visible and capture the port
      const discoveredPort = await startBackend();

      // Update global port and URL with discovered values
      BACKEND_PORT = discoveredPort;
      BACKEND_URL = `http://localhost:${discoveredPort}`;
      console.log(`🔌 Backend URL updated to: ${BACKEND_URL}`);
    }

    // Wait for backend health check
    const ready = await waitForBackend();
    if (!ready) {
      throw new Error("Backend health check failed");
    }

    // Create main window
    createWindow();
    setupIpcHandlers();
    setupThemeListener();

    // Remove the application menu for a cleaner interface
    Menu.setApplicationMenu(null);

    // Show main window when ready, but keep splash visible until session restoration completes
    mainWindow?.once("ready-to-show", () => {
      console.log("🎉 Main window ready to show");
      // Don't close splash yet - wait for session restoration

      // Restore maximized state if needed
      if (mainWindow && windowStateManager) {
        windowStateManager.restoreMaximizedState(mainWindow);
      }

      mainWindow?.show();
      mainWindow?.focus();
      mainWindow?.moveTop();
      console.log("✅ Main window shown and focused (splash still visible)");

      // Start health monitoring after app is fully loaded
      startHealthMonitoring();

      // Initialize auto-updater (production only)
      if (!getIsDev()) {
        initAutoUpdater(async (event: UpdateAnalyticsEvent) => {
          try {
            await axios.post(
              `${BACKEND_URL}/api/analytics/update-events`,
              event
            );
          } catch (error) {
            console.error("Failed to send update analytics:", error);
          }
        });
        startUpdateChecks();
      }
    });
  } catch (error) {
    console.error("❌ Failed to start app:", error);
    closeSplashScreen();

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Categorize error and show appropriate dialog
    if (errorMessage.includes("not found")) {
      await showStartupErrorDialog(
        "Backend Executable Not Found",
        "The backend executable could not be found.",
        "Please ensure the application is properly installed.",
        errorMessage,
        false // No logs button - installation issue
      );
    } else if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("did not report port")
    ) {
      await showStartupErrorDialog(
        "Backend Not Responding",
        "The backend is not responding to health checks.",
        "This may be a configuration issue. Click Show Logs for details.",
        errorMessage,
        true // Show logs button
      );
    } else if (errorMessage.includes("exited with code")) {
      await showStartupErrorDialog(
        "Backend Crashed on Startup",
        "The backend process crashed during startup.",
        "Please check the logs for more details.",
        errorMessage,
        true // Show logs button
      );
    } else if (errorMessage.includes("health check failed")) {
      await showStartupErrorDialog(
        "Backend Not Responding",
        "The backend is not responding to health checks.",
        "This may be a configuration issue. Click Show Logs for details.",
        errorMessage,
        true // Show logs button
      );
    } else if (errorMessage.includes("failed to start")) {
      await showStartupErrorDialog(
        "Cannot Start Backend",
        "The backend executable could not be started.",
        "Please check that the application is properly installed.",
        errorMessage,
        true // Show logs button
      );
    } else {
      // Generic error
      await showStartupErrorDialog(
        "Startup Error",
        "Failed to start the application.",
        "An unexpected error occurred.",
        errorMessage,
        true // Show logs button
      );
    }

    app.quit();
  }
});

app.on("window-all-closed", () => {
  // Stop health monitoring
  stopHealthMonitoring();

  // Stop update checks
  stopUpdateChecks();

  // Kill backend before quitting (skip in external backend mode)
  if (!USE_EXTERNAL_BACKEND && backendProcess) {
    console.log("🛑 Stopping backend...");
    backendProcess.kill();
  }
  app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app quit - graceful shutdown with session preservation
app.on("before-quit", async (event) => {
  event.preventDefault();
  await gracefulShutdown();
  app.exit(0);
});

/**
 * Kill any lingering processes on specific ports.
 * Used as a fallback to ensure clean shutdown.
 */
async function killProcessesOnPorts(ports: number[]): Promise<void> {
  if (process.platform === "win32") {
    // Windows: use netstat + taskkill
    for (const port of ports) {
      try {
        const { exec } = require("child_process");
        const command = `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port} ^| findstr LISTENING') do taskkill /F /PID %a`;
        await new Promise<void>((resolve) => {
          exec(command, { shell: "cmd.exe" }, (error: any) => {
            if (error) {
              console.log(`  No processes found on port ${port}`);
            } else {
              console.log(`  Killed process on port ${port}`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error(`Failed to kill process on port ${port}:`, error);
      }
    }
  } else {
    // Unix: use lsof + kill
    for (const port of ports) {
      try {
        const { exec } = require("child_process");
        const command = `lsof -ti:${port} | xargs kill -9`;
        await new Promise<void>((resolve) => {
          exec(command, (error: any) => {
            if (error) {
              console.log(`  No processes found on port ${port}`);
            } else {
              console.log(`  Killed process on port ${port}`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error(`Failed to kill process on port ${port}:`, error);
      }
    }
  }
}

/**
 * Perform graceful shutdown of the application.
 * Ensures backend has time to save session data before terminating.
 * Also cleans up any lingering processes on known ports.
 */
async function gracefulShutdown(): Promise<void> {
  console.log("🛑 Performing graceful shutdown...");

  // Stop health monitoring first
  stopHealthMonitoring();

  // Skip backend cleanup in external backend mode
  if (USE_EXTERNAL_BACKEND) {
    console.log("🛑 External backend mode - skipping backend shutdown");
    console.log("✅ Graceful shutdown complete");
    return;
  }

  // Give backend time to save session data
  if (backendProcess && !backendProcess.killed) {
    console.log("🛑 Sending SIGTERM to backend (polite shutdown)...");
    backendProcess.kill("SIGTERM"); // Polite kill - allows cleanup

    // Wait 2 seconds for backend to save session
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Force kill if still running
    if (backendProcess && !backendProcess.killed) {
      console.log("🛑 Force killing backend process...");
      backendProcess.kill("SIGKILL");
    }
  }

  // Fallback: Kill any remaining processes on known ports
  console.log("🛑 Cleaning up processes on ports 38000 and 5173...");
  await killProcessesOnPorts([BACKEND_PORT, 5173]);

  console.log("✅ Graceful shutdown complete");
}
