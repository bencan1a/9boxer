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
