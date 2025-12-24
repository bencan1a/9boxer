/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 *
 * This file extends the Vite client types with custom environment variables
 * used in the application. Vite's built-in types already define BASE_URL, MODE,
 * DEV, and PROD, so we only add custom variables here.
 */

interface ImportMetaEnv {
  /**
   * API base URL for web browser mode
   * Default: http://localhost:8000
   *
   * This is used when running the app in a web browser (not Electron).
   * In Electron mode, the URL is obtained dynamically from the main process.
   */
  readonly VITE_API_BASE_URL?: string;
}
