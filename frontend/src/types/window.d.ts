/**
 * Type definitions for window.electronAPI
 * Defines the Electron IPC API surface exposed to the renderer process
 */

interface ElectronAPI {
  // Platform information
  platform: string;
  version: string;

  // File dialog APIs
  openFileDialog: () => Promise<string | null>;
  saveFileDialog: (defaultName: string) => Promise<string | null>;
  readFile: (filePath: string) => Promise<{
    buffer?: number[];
    fileName?: string;
    success: boolean;
    error?: string;
  }>;

  // Help & Documentation
  openUserGuide: () => Promise<{ success: boolean; error?: string }>;
  showLogs: () => Promise<{ success: boolean }>;

  // Theme detection
  theme: {
    getSystemTheme: () => Promise<"light" | "dark">;
    onSystemThemeChange: (
      callback: (theme: "light" | "dark") => void
    ) => () => void;
  };

  // Backend configuration
  backend: {
    getPort: () => Promise<number>;
    getUrl: () => Promise<string>;
    onConnectionStatusChange: (
      callback: (data: {
        status: "connected" | "reconnecting" | "disconnected";
        port?: number;
      }) => void
    ) => () => void;
  };

  // Auto-update APIs
  update: {
    checkForUpdates: () => Promise<{ success: boolean }>;
    downloadUpdate: () => Promise<{ success: boolean }>;
    installAndRestart: () => Promise<{ success: boolean }>;
    getStatus: () => Promise<{
      currentVersion: string;
      updateAvailable: boolean;
      updateVersion: string | null;
      downloadInProgress: boolean;
      updateDownloaded: boolean;
    }>;
    onUpdateAvailable: (
      callback: (info: {
        version: string;
        releaseDate: string;
        releaseNotes: string;
      }) => void
    ) => () => void;
    onDownloadProgress: (
      callback: (progress: {
        percent: number;
        bytesPerSecond: number;
        transferred: number;
        total: number;
      }) => void
    ) => () => void;
    onUpdateDownloaded: (
      callback: (info: { version: string }) => void
    ) => () => void;
    onUpdateError: (
      callback: (error: { message: string }) => void
    ) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
