import { autoUpdater } from "electron-updater";
import { ipcMain, BrowserWindow, app } from "electron";
import log from "electron-log";

// Configure logging
log.transports.file.level = "debug"; // Changed to debug for better troubleshooting
autoUpdater.logger = log;

// Log updater configuration on startup
log.info("electron-updater configuration:");
log.info(`  autoDownload: ${autoUpdater.autoDownload}`);
log.info(`  autoInstallOnAppQuit: ${autoUpdater.autoInstallOnAppQuit}`);
log.info(`  channel: ${autoUpdater.channel || "latest"}`);
log.info(`  allowPrerelease: ${autoUpdater.allowPrerelease}`);

// Update check configuration
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
let updateCheckInterval: NodeJS.Timeout | null = null;

// Track update state
let downloadInProgress = false;
let updateDownloaded = false;
let latestVersion: string | null = null;

// Analytics callback (will be set by main process)
type AnalyticsCallback = (event: UpdateAnalyticsEvent) => Promise<void>;
let analyticsCallback: AnalyticsCallback | null = null;

export interface UpdateAnalyticsEvent {
  eventType:
    | "check"
    | "available"
    | "download_start"
    | "download_progress"
    | "download_complete"
    | "install"
    | "error";
  fromVersion: string;
  toVersion: string | null;
  platform: string;
  arch: string;
  errorMessage?: string;
  bytesDownloaded?: number;
  totalBytes?: number;
  percentComplete?: number;
}

/**
 * Initialize auto-updater with analytics callback
 */
export function initAutoUpdater(analyticsFunc: AnalyticsCallback): void {
  analyticsCallback = analyticsFunc;

  // Configure auto-updater
  autoUpdater.autoDownload = true; // Automatically download updates in background
  autoUpdater.autoInstallOnAppQuit = true; // Install on quit

  // Set up event listeners
  setupEventListeners();

  // Log important paths and configuration
  log.info("=== Auto-updater Initialization ===");
  log.info(`Log file location: ${log.transports.file.getFile().path}`);
  log.info(`App version: ${app.getVersion()}`);
  log.info(`Platform: ${process.platform} (${process.arch})`);
  log.info(`App path: ${app.getAppPath()}`);
  log.info(`User data: ${app.getPath("userData")}`);
  log.info("Auto-updater initialized");
}

/**
 * Set up auto-updater event listeners
 */
function setupEventListeners(): void {
  // Update available
  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
    latestVersion = info.version;

    // Send analytics
    trackEvent({
      eventType: "available",
      fromVersion: autoUpdater.currentVersion.version,
      toVersion: info.version,
      platform: process.platform,
      arch: process.arch,
    });

    // Notify renderer
    broadcastToRenderers("update:available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // No update available
  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available, current version:", info.version);

    // Send analytics
    trackEvent({
      eventType: "check",
      fromVersion: info.version,
      toVersion: null,
      platform: process.platform,
      arch: process.arch,
    });
  });

  // Download progress
  autoUpdater.on("download-progress", (progress) => {
    log.info(`Download progress: ${progress.percent.toFixed(2)}%`);

    // Send analytics (throttled to avoid spam)
    const roundedPercent = Math.round(progress.percent);
    if (roundedPercent > 0 && roundedPercent % 25 === 0) {
      trackEvent({
        eventType: "download_progress",
        fromVersion: autoUpdater.currentVersion.version,
        toVersion: latestVersion,
        platform: process.platform,
        arch: process.arch,
        bytesDownloaded: progress.transferred,
        totalBytes: progress.total,
        percentComplete: progress.percent,
      });
    }

    // Notify renderer
    broadcastToRenderers("update:download-progress", {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  // Update downloaded
  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info.version);
    updateDownloaded = true;
    downloadInProgress = false;

    // Send analytics
    trackEvent({
      eventType: "download_complete",
      fromVersion: autoUpdater.currentVersion.version,
      toVersion: info.version,
      platform: process.platform,
      arch: process.arch,
    });

    // Notify renderer
    broadcastToRenderers("update:downloaded", {
      version: info.version,
    });
  });

  // Error handling
  autoUpdater.on("error", (error) => {
    log.error("Auto-updater error:", error);
    downloadInProgress = false;

    // Categorize error for better logging
    let errorCategory = "unknown";
    if (error.message.includes("404")) {
      errorCategory = "missing_files";
      log.warn(
        "Update metadata files not found on server - this may be expected if release is still being published"
      );
    } else if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ETIMEDOUT")
    ) {
      errorCategory = "network";
      log.warn("Network error while checking for updates");
    } else if (
      error.message.includes("checksum") ||
      error.message.includes("signature")
    ) {
      errorCategory = "verification";
      log.error("Update verification failed - potential security issue");
    } else {
      log.error("Unexpected auto-updater error:", error);
    }

    // Send analytics with error category
    trackEvent({
      eventType: "error",
      fromVersion: autoUpdater.currentVersion.version,
      toVersion: latestVersion,
      platform: process.platform,
      arch: process.arch,
      errorMessage: `[${errorCategory}] ${error.message}`,
    });

    // Notify renderer with cleaned error message
    broadcastToRenderers("update:error", {
      message: error.message,
    });
  });
}

/**
 * Check for updates (manual or automatic)
 */
export async function checkForUpdates(): Promise<void> {
  try {
    log.info("=== Checking for updates ===");
    log.info(`Current version: ${autoUpdater.currentVersion.version}`);
    log.info(`Feed URL: ${autoUpdater.getFeedURL()}`);
    log.info(`Auto-download: ${autoUpdater.autoDownload}`);

    const result = await autoUpdater.checkForUpdates();

    if (result) {
      log.info(`Update check result:`, {
        updateInfo: result.updateInfo,
        downloadPromise: result.downloadPromise ? "Present" : "None",
        cancellationToken: result.cancellationToken ? "Present" : "None",
      });
    }
  } catch (error: any) {
    log.error("Failed to check for updates:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    });
  }
}

/**
 * Download update (user-triggered)
 */
export async function downloadUpdate(): Promise<void> {
  if (downloadInProgress) {
    log.warn("Download already in progress");
    return;
  }

  try {
    log.info("Starting update download...");
    downloadInProgress = true;

    // Send analytics
    trackEvent({
      eventType: "download_start",
      fromVersion: autoUpdater.currentVersion.version,
      toVersion: latestVersion,
      platform: process.platform,
      arch: process.arch,
    });

    await autoUpdater.downloadUpdate();
  } catch (error) {
    log.error("Failed to download update:", error);
    downloadInProgress = false;
  }
}

/**
 * Install update and restart app
 */
export function installUpdateAndRestart(): void {
  if (!updateDownloaded) {
    log.warn("No update downloaded, cannot install");
    return;
  }

  log.info("Installing update and restarting...");

  // Send analytics
  trackEvent({
    eventType: "install",
    fromVersion: autoUpdater.currentVersion.version,
    toVersion: latestVersion,
    platform: process.platform,
    arch: process.arch,
  });

  // Quit and install (will restart app)
  autoUpdater.quitAndInstall(false, true);
}

/**
 * Start periodic update checks
 */
export function startUpdateChecks(): void {
  // Initial check (delayed 10 seconds after app start)
  setTimeout(() => {
    checkForUpdates();
  }, 10000);

  // Periodic checks every 6 hours
  updateCheckInterval = setInterval(() => {
    checkForUpdates();
  }, CHECK_INTERVAL_MS);

  log.info("Periodic update checks started (every 6 hours)");
}

/**
 * Stop periodic update checks
 */
export function stopUpdateChecks(): void {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
    log.info("Periodic update checks stopped");
  }
}

/**
 * Broadcast message to all renderer windows
 */
function broadcastToRenderers(channel: string, data: any): void {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send(channel, data);
  });
}

/**
 * Track analytics event (async, non-blocking)
 */
async function trackEvent(event: UpdateAnalyticsEvent): Promise<void> {
  if (analyticsCallback) {
    try {
      await analyticsCallback(event);
    } catch (error) {
      log.error("Failed to track analytics event:", error);
    }
  }
}

/**
 * Set up IPC handlers for renderer communication
 */
export function setupUpdateIpcHandlers(): void {
  // Manual update check
  ipcMain.handle("update:checkForUpdates", async () => {
    await checkForUpdates();
    return { success: true };
  });

  // Download update
  ipcMain.handle("update:downloadUpdate", async () => {
    await downloadUpdate();
    return { success: true };
  });

  // Install and restart
  ipcMain.handle("update:installAndRestart", () => {
    installUpdateAndRestart();
    return { success: true };
  });

  // Get current update status
  ipcMain.handle("update:getStatus", () => {
    return {
      currentVersion: autoUpdater.currentVersion.version,
      updateAvailable: latestVersion !== null,
      updateVersion: latestVersion,
      downloadInProgress,
      updateDownloaded,
    };
  });

  // Get log file path
  ipcMain.handle("update:getLogPath", () => {
    return log.transports.file.getFile().path;
  });

  // Open log file in external editor
  ipcMain.handle("update:openLogFile", async () => {
    const { shell } = require("electron");
    const logPath = log.transports.file.getFile().path;
    await shell.openPath(logPath);
    return { success: true, path: logPath };
  });
}
