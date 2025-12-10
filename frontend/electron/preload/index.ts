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

  // For future expansion:
  // - System notifications
  // - Clipboard operations
  // - OS-specific features
} as ElectronAPI);

// Log that preload script loaded successfully
console.log('[Preload] Electron API initialized');
console.log(`[Preload] Platform: ${process.platform}`);
console.log(`[Preload] Electron Version: ${process.versions.electron}`);
