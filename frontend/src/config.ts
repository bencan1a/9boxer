/**
 * Frontend Configuration
 *
 * Centralized configuration for the React frontend application.
 * Handles environment detection (Electron vs Browser) and sets appropriate
 * API base URL and other configuration values.
 *
 * When running in Electron mode with dynamic port selection, this module
 * queries the main process for the actual backend URL before initializing
 * the API client.
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
 * Dynamic API base URL - initialized at runtime
 *
 * In Electron mode: Gets the actual backend URL from the main process
 * In browser mode: Uses VITE_API_BASE_URL or defaults to localhost:8000
 *
 * This variable is set by initializeConfig() and should not be directly modified.
 */
let API_BASE_URL = "http://localhost:8000"; // Default fallback

/**
 * Initialize configuration by detecting backend URL
 *
 * In Electron mode:
 * - Queries the main process for the actual backend URL via IPC
 * - Backend may use a different port than 8000 if there's a port conflict
 *
 * In browser mode:
 * - Uses VITE_API_BASE_URL environment variable if set
 * - Falls back to localhost:8000 for development
 *
 * This function should be called once during app initialization,
 * before making any API requests.
 *
 * @returns Promise that resolves when configuration is initialized
 *
 * @example
 * ```typescript
 * // In App.tsx
 * useEffect(() => {
 *   initializeConfig().then(() => setReady(true));
 * }, []);
 * ```
 */
export async function initializeConfig(): Promise<void> {
  if (isElectron() && window.electronAPI?.backend) {
    try {
      // Get dynamic backend URL from main process
      const backendUrl = await window.electronAPI.backend.getUrl();
      API_BASE_URL = backendUrl;
      console.log(
        `[Config] API initialized with dynamic backend URL: ${API_BASE_URL}`
      );
    } catch (error) {
      console.error(
        "[Config] Failed to get backend URL from main process:",
        error
      );
      console.warn("[Config] Using default URL: http://localhost:8000");
      // Keep default URL as fallback
    }
  } else if (!isElectron()) {
    // Browser mode: use environment variable or default
    API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    console.log(`[Config] API initialized with browser URL: ${API_BASE_URL}`);
  } else {
    console.warn(
      "[Config] Running in Electron mode but backend IPC not available"
    );
    console.warn("[Config] Using default URL: http://localhost:8000");
  }
}

/**
 * Get the current API base URL
 *
 * Returns the API base URL after initialization. If initializeConfig()
 * has not been called yet, returns the default fallback URL.
 *
 * @returns The current API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

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
 *
 * Note: apiBaseUrl is dynamic and set by initializeConfig().
 * Call initializeConfig() before accessing config.apiBaseUrl.
 */
export const config = {
  /** API base URL for all backend requests (dynamic, set by initializeConfig) */
  get apiBaseUrl() {
    return API_BASE_URL;
  },

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
