/**
 * Custom hook for safe Electron API access with feature detection
 *
 * This hook provides centralized error handling for Electron-specific features
 * and graceful degradation when running in web mode.
 *
 * @example
 * ```typescript
 * const { isElectron, saveFileDialog, openFileDialog } = useElectronAPI();
 *
 * if (isElectron) {
 *   const path = await saveFileDialog('export.xlsx');
 * }
 * ```
 */

import { useCallback } from "react";

export interface UseElectronAPIReturn {
  /** True if running in Electron, false if running in web browser */
  isElectron: boolean;

  /**
   * Open a native save file dialog
   * @param defaultName - Default filename (e.g., 'export.xlsx')
   * @returns File path if selected, null if canceled
   * @throws Error if not running in Electron
   */
  saveFileDialog: (defaultName: string) => Promise<string | null>;

  /**
   * Open a native open file dialog
   * @returns File path if selected, null if canceled
   * @throws Error if not running in Electron
   */
  openFileDialog: () => Promise<string | null>;

  /**
   * Read a file from the file system
   * @param filePath - Absolute path to the file
   * @returns File data if successful
   * @throws Error if not running in Electron or read fails
   */
  readFile: (filePath: string) => Promise<{
    buffer?: number[];
    fileName?: string;
    success: boolean;
    error?: string;
  }>;

  /**
   * Open the user guide
   * @returns Success status
   * @throws Error if not running in Electron
   */
  openUserGuide: () => Promise<{ success: boolean; error?: string }>;

  /**
   * Get system theme preference
   * @returns 'light' or 'dark'
   * @throws Error if not running in Electron
   */
  getSystemTheme: () => Promise<"light" | "dark">;

  /**
   * Get backend URL
   * @returns Backend URL (e.g., 'http://localhost:38000')
   * @throws Error if not running in Electron
   */
  getBackendUrl: () => Promise<string>;

  /**
   * Get backend port
   * @returns Backend port number
   * @throws Error if not running in Electron
   */
  getBackendPort: () => Promise<number>;
}

/**
 * Hook for safe access to Electron APIs
 *
 * Provides feature detection and error handling for Electron-specific functionality.
 * All methods throw descriptive errors when accessed in web mode.
 */
export const useElectronAPI = (): UseElectronAPIReturn => {
  const isElectron = !!window.electronAPI;

  const saveFileDialog = useCallback(
    async (defaultName: string): Promise<string | null> => {
      if (!window.electronAPI?.saveFileDialog) {
        throw new Error(
          "Save dialog is not available in web mode. This feature requires the Electron desktop application."
        );
      }
      return window.electronAPI.saveFileDialog(defaultName);
    },
    []
  );

  const openFileDialog = useCallback(async (): Promise<string | null> => {
    if (!window.electronAPI?.openFileDialog) {
      throw new Error(
        "Open file dialog is not available in web mode. This feature requires the Electron desktop application."
      );
    }
    return window.electronAPI.openFileDialog();
  }, []);

  const readFile = useCallback(
    async (
      filePath: string
    ): Promise<{
      buffer?: number[];
      fileName?: string;
      success: boolean;
      error?: string;
    }> => {
      if (!window.electronAPI?.readFile) {
        throw new Error(
          "File system access is not available in web mode. This feature requires the Electron desktop application."
        );
      }
      return window.electronAPI.readFile(filePath);
    },
    []
  );

  const openUserGuide = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!window.electronAPI?.openUserGuide) {
      throw new Error(
        "User guide is not available in web mode. This feature requires the Electron desktop application."
      );
    }
    return window.electronAPI.openUserGuide();
  }, []);

  const getSystemTheme = useCallback(async (): Promise<"light" | "dark"> => {
    if (!window.electronAPI?.theme?.getSystemTheme) {
      throw new Error(
        "System theme detection is not available in web mode. This feature requires the Electron desktop application."
      );
    }
    return window.electronAPI.theme.getSystemTheme();
  }, []);

  const getBackendUrl = useCallback(async (): Promise<string> => {
    if (!window.electronAPI?.backend?.getUrl) {
      throw new Error(
        "Backend URL is not available in web mode. This feature requires the Electron desktop application."
      );
    }
    return window.electronAPI.backend.getUrl();
  }, []);

  const getBackendPort = useCallback(async (): Promise<number> => {
    if (!window.electronAPI?.backend?.getPort) {
      throw new Error(
        "Backend port is not available in web mode. This feature requires the Electron desktop application."
      );
    }
    return window.electronAPI.backend.getPort();
  }, []);

  return {
    isElectron,
    saveFileDialog,
    openFileDialog,
    readFile,
    openUserGuide,
    getSystemTheme,
    getBackendUrl,
    getBackendPort,
  };
};
