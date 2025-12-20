/**
 * Type definitions for Electron API exposed to renderer
 *
 * This file defines the TypeScript interface for the Electron APIs
 * that are safely exposed to the renderer process through the preload script.
 *
 * These APIs are exposed via contextBridge.exposeInMainWorld('electronAPI', {...})
 * in the preload script, making them available as window.electronAPI in the renderer.
 */

/**
 * ElectronAPI - Safe APIs exposed to renderer process
 *
 * This is the only bridge between the main process (Node.js) and
 * the renderer process (web content). All communication goes through
 * this interface to maintain security.
 */
export interface ElectronAPI {
  /** Platform string (e.g., 'win32', 'darwin', 'linux') */
  platform: string;

  /** Electron version string */
  version: string;

  /**
   * Open a native file dialog to select an Excel file for import.
   * Returns the file path if a file was selected, null if canceled.
   */
  openFileDialog: () => Promise<string | null>;

  /**
   * Open a native file dialog to save an Excel file for export.
   * @param defaultName - Default filename (e.g., 'export.xlsx')
   * Returns the file path where the file should be saved, null if canceled.
   */
  saveFileDialog: (defaultName: string) => Promise<string | null>;

  /**
   * Read a file from the file system.
   * Used for auto-reload functionality to read previously loaded files.
   * @param filePath - Absolute path to the file to read
   * Returns file buffer and metadata if successful, error otherwise.
   */
  readFile: (filePath: string) => Promise<{
    buffer?: number[];
    fileName?: string;
    success: boolean;
    error?: string;
  }>;

  /**
   * Open the user guide in the default browser.
   * Returns success status and error message if failed.
   */
  openUserGuide: () => Promise<{ success: boolean; error?: string }>;

  /**
   * OS theme detection and change notifications.
   */
  theme: {
    /**
     * Get the current system theme preference.
     * Reads the OS-level theme setting (dark mode vs light mode).
     *
     * @returns Promise resolving to 'light' or 'dark'
     *
     * @example
     * ```typescript
     * const theme = await window.electronAPI.theme.getSystemTheme();
     * console.log('System theme:', theme); // 'light' or 'dark'
     * ```
     */
    getSystemTheme: () => Promise<'light' | 'dark'>;

    /**
     * Register a callback for system theme changes.
     * The callback will be invoked whenever the OS theme preference changes.
     * Returns a cleanup function to remove the listener.
     *
     * @param callback - Function to call with new theme ('light' or 'dark')
     * @returns Cleanup function to remove the listener
     *
     * @example
     * ```typescript
     * // In a React component
     * useEffect(() => {
     *   const cleanup = window.electronAPI?.theme.onSystemThemeChange((theme) => {
     *     console.log('System theme changed to:', theme);
     *     setThemeMode(theme);
     *   });
     *
     *   return cleanup; // Cleanup on unmount
     * }, []);
     * ```
     */
    onSystemThemeChange: (callback: (theme: 'light' | 'dark') => void) => () => void;
  };

  // Future APIs that could be added:
  // showNotification(title: string, options?: NotificationOptions): void;
  // getClipboardText(): Promise<string>;
  // setClipboardText(text: string): Promise<void>;
}

declare global {
  interface Window {
    /**
     * Electron API object exposed by preload script
     *
     * Only available when running in Electron. In a web browser,
     * this will be undefined. Check with:
     *
     * ```typescript
     * if (window.electronAPI) {
     *   // Running in Electron
     * } else {
     *   // Running in web browser
     * }
     * ```
     */
    electronAPI?: ElectronAPI;
  }
}

export {};
