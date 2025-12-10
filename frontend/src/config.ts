/**
 * Frontend Configuration
 *
 * Centralized configuration for the React frontend application.
 * Handles environment detection (Electron vs Browser) and sets appropriate
 * API base URL and other configuration values.
 */

/**
 * Detect if running in Electron environment
 *
 * The Electron preload script exposes electronAPI via contextBridge,
 * making it available as window.electronAPI. This function checks
 * for its presence to determine if we're running in Electron.
 *
 * @returns true if running in Electron, false if running in browser
 */
export const isElectron = (): boolean => {
  return !!(window as any).electronAPI;
};

/**
 * API base URL configuration
 *
 * When running in Electron:
 * - Uses localhost:8000 (the backend server running in the same environment)
 *
 * When running in browser:
 * - Uses VITE_API_BASE_URL environment variable if set
 * - Falls back to localhost:8000 for development
 *
 * In production web deployments, set VITE_API_BASE_URL to your API server URL.
 */
export const API_BASE_URL = isElectron()
  ? "http://localhost:8000"
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Environment detection
 */
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

/**
 * Application configuration object
 *
 * Centralized configuration for use throughout the application.
 * Components and services should import from this module rather than
 * hardcoding configuration values.
 */
export const config = {
  /** API base URL for all backend requests */
  apiBaseUrl: API_BASE_URL,

  /** Whether running in Electron environment */
  isElectron: isElectron(),

  /** Whether running in development mode */
  isDevelopment,

  /** Whether running in production mode */
  isProduction,

  /** Current environment mode (e.g., 'development', 'production') */
  environment: import.meta.env.MODE,
};

export default config;
