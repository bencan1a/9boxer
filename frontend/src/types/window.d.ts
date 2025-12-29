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
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
