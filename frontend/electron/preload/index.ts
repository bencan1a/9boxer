import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload Script for Electron Renderer Process
 *
 * This script acts as a secure bridge between the main process (Node.js)
 * and the renderer process (Chromium/Browser). It uses context isolation
 * to prevent direct access to Node.js APIs from the web content.
 *
 * Security Principles:
 * - Only expose safe, minimal APIs to the renderer
 * - Never expose full ipcRenderer or require() to renderer
 * - Keep context isolation enabled
 * - Validate all IPC messages
 *
 * Note: This app primarily uses HTTP (localhost:8000) for communication,
 * so we don't need many IPC APIs. This is a placeholder for future expansion.
 */

// Define the API surface exposed to the renderer process
interface ElectronAPI {
  platform: string;
  version: string;
  openFileDialog: () => Promise<string | null>;
  saveFileDialog: (defaultName: string) => Promise<string | null>;
  readFile: (filePath: string) => Promise<{
    buffer?: number[];
    fileName?: string;
    success: boolean;
    error?: string;
  }>;
  openUserGuide: () => Promise<{ success: boolean; error?: string }>;
  showLogs: () => Promise<{ success: boolean }>;
  theme: {
    /**
     * Get the current system theme preference.
     * Returns 'light' or 'dark' based on OS settings.
     */
    getSystemTheme: () => Promise<'light' | 'dark'>;
    /**
     * Listen for system theme changes.
     * Returns a cleanup function to remove the listener.
     * @param callback - Function to call when theme changes
     * @returns Cleanup function to remove the listener
     */
    onSystemThemeChange: (callback: (theme: 'light' | 'dark') => void) => () => void;
  };
  backend: {
    /**
     * Get the actual port the backend is running on.
     * This may differ from the default port 8000 if there was a port conflict.
     * @returns Promise resolving to the backend port number
     */
    getPort: () => Promise<number>;
    /**
     * Get the full backend URL (e.g., "http://localhost:8001").
     * Use this to initialize the API client with the correct port.
     * @returns Promise resolving to the backend URL
     */
    getUrl: () => Promise<string>;
    /**
     * Listen for backend connection status changes.
     * The callback will be invoked whenever the backend connection status changes.
     *
     * @param callback - Function to call with new status and optional port
     * @returns Cleanup function to remove the listener
     *
     * @example
     * ```typescript
     * const cleanup = window.electronAPI.backend.onConnectionStatusChange((data) => {
     *   console.log('Backend status:', data.status);
     *   if (data.port) {
     *     console.log('Backend port:', data.port);
     *   }
     * });
     *
     * // Later, when component unmounts:
     * cleanup();
     * ```
     */
    onConnectionStatusChange: (
      callback: (data: { status: 'connected' | 'reconnecting' | 'disconnected'; port?: number }) => void
    ) => () => void;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information (read-only, safe to expose)
  platform: process.platform,
  version: process.versions.electron,

  // File dialog APIs for Excel import/export
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultName: string) =>
    ipcRenderer.invoke('dialog:saveFile', defaultName),

  // File system APIs for auto-reload functionality
  readFile: (filePath: string) => ipcRenderer.invoke('file:readFile', filePath),

  // Help & Documentation
  openUserGuide: () => ipcRenderer.invoke('app:openUserGuide'),

  /**
   * Open the backend logs in the default text editor or file explorer.
   * Useful for troubleshooting backend issues.
   *
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * await window.electronAPI.showLogs();
   * ```
   */
  showLogs: (): Promise<{ success: boolean }> => ipcRenderer.invoke('app:showLogs'),

  // OS Theme Detection
  theme: {
    /**
     * Get the current system theme preference.
     * @returns Promise resolving to 'light' or 'dark'
     */
    getSystemTheme: (): Promise<'light' | 'dark'> =>
      ipcRenderer.invoke('theme:getSystemTheme'),

    /**
     * Register a callback for system theme changes.
     * The callback will be invoked whenever the OS theme preference changes.
     *
     * @param callback - Function to call with new theme ('light' or 'dark')
     * @returns Cleanup function to remove the listener
     *
     * @example
     * ```typescript
     * const cleanup = window.electronAPI.theme.onSystemThemeChange((theme) => {
     *   console.log('System theme changed to:', theme);
     *   // Update your app's theme accordingly
     * });
     *
     * // Later, when component unmounts:
     * cleanup();
     * ```
     */
    onSystemThemeChange: (callback: (theme: 'light' | 'dark') => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, theme: 'light' | 'dark') => {
        callback(theme);
      };

      ipcRenderer.on('theme:systemThemeChanged', listener);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener('theme:systemThemeChanged', listener);
      };
    },
  },

  // Backend Configuration
  backend: {
    /**
     * Get the actual port the backend is running on.
     * This may differ from the default port 8000 if there was a port conflict.
     *
     * @returns Promise resolving to the backend port number
     *
     * @example
     * ```typescript
     * const port = await window.electronAPI.backend.getPort();
     * console.log('Backend is running on port:', port);
     * ```
     */
    getPort: (): Promise<number> => ipcRenderer.invoke('backend:getPort'),

    /**
     * Get the full backend URL (e.g., "http://localhost:8001").
     * Use this to initialize the API client with the correct port.
     *
     * @returns Promise resolving to the backend URL
     *
     * @example
     * ```typescript
     * const url = await window.electronAPI.backend.getUrl();
     * console.log('Backend URL:', url);
     * // Use this URL to configure API client
     * axios.defaults.baseURL = url;
     * ```
     */
    getUrl: (): Promise<string> => ipcRenderer.invoke('backend:getUrl'),

    /**
     * Register a callback for backend connection status changes.
     * The callback will be invoked whenever the backend connection status changes.
     *
     * @param callback - Function to call with new status and optional port
     * @returns Cleanup function to remove the listener
     *
     * @example
     * ```typescript
     * const cleanup = window.electronAPI.backend.onConnectionStatusChange((data) => {
     *   console.log('Backend status:', data.status);
     *   if (data.port) {
     *     console.log('Backend port changed to:', data.port);
     *   }
     * });
     *
     * // Later, when component unmounts:
     * cleanup();
     * ```
     */
    onConnectionStatusChange: (
      callback: (data: { status: 'connected' | 'reconnecting' | 'disconnected'; port?: number }) => void
    ): (() => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        data: { status: 'connected' | 'reconnecting' | 'disconnected'; port?: number }
      ) => {
        callback(data);
      };

      ipcRenderer.on('backend:connection-status', listener);

      // Return cleanup function
      return () => {
        ipcRenderer.removeListener('backend:connection-status', listener);
      };
    },
  },

  // For future expansion:
  // - System notifications
  // - Clipboard operations
  // - OS-specific features
} as ElectronAPI);

// Log that preload script loaded successfully
console.log('[Preload] Electron API initialized');
console.log(`[Preload] Platform: ${process.platform}`);
console.log(`[Preload] Electron Version: ${process.versions.electron}`);
