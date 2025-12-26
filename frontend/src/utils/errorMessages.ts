/**
 * Centralized error messages catalog for user-facing errors.
 *
 * Error Message Standards:
 * - Title: Short, descriptive (3-5 words)
 * - Message: What happened in plain language
 * - Detail: Why it happened + what user should do
 * - Buttons: Clear action labels (not just "OK")
 */

export interface ErrorMessageConfig {
  title: string;
  message: string;
  detail: string;
  buttons?: readonly string[];
  type?: "info" | "warning" | "error";
}

/**
 * Standard error messages for backend connection issues.
 * Use these to ensure consistent, user-friendly error messaging.
 */
export const ERROR_MESSAGES = {
  /**
   * Port conflict detected during startup.
   * Backend will automatically use an alternate port.
   */
  portConflict: {
    title: "Trying Alternate Port",
    message: "Port 8000 is already in use.",
    detail: "The application will use an alternate port automatically.",
    buttons: ["OK"],
    type: "info" as const,
  },

  /**
   * Backend process crashed during runtime.
   * Session data has been saved, user can retry.
   */
  backendCrash: {
    title: "Backend Disconnected",
    message: "The backend process has stopped.",
    detail:
      "Your work has been saved. Click Retry to reconnect, or Close to exit.",
    buttons: ["Retry", "Close"],
    type: "error" as const,
  },

  /**
   * Backend started but not responding to health checks.
   * Likely a configuration issue.
   */
  healthCheckTimeout: {
    title: "Backend Not Responding",
    message: "The backend is not responding to health checks.",
    detail: "This may be a configuration issue. Click Show Logs for details.",
    buttons: ["Show Logs", "Quit"],
    type: "error" as const,
  },

  /**
   * Backend executable could not be started.
   * Installation or permission issue.
   */
  spawnFailure: {
    title: "Cannot Start Backend",
    message: "The backend executable could not be started.",
    detail: "Please check that the application is properly installed.",
    buttons: ["Show Logs", "Quit"],
    type: "error" as const,
  },

  /**
   * Backend restart failed after crash.
   * User must restart manually.
   */
  restartFailed: {
    title: "Reconnection Failed",
    message: "Unable to reconnect to the backend.",
    detail:
      "Please restart the application manually. Your work has been saved.",
    buttons: ["Close"],
    type: "error" as const,
  },

  /**
   * Backend exited during startup with non-zero code.
   * Check logs for details.
   */
  startupCrash: {
    title: "Backend Crashed on Startup",
    message: "The backend process crashed during startup.",
    detail: "Please check the logs for more details.",
    buttons: ["Show Logs", "Quit"],
    type: "error" as const,
  },

  /**
   * Backend executable not found at expected path.
   * Installation issue.
   */
  executableNotFound: {
    title: "Backend Executable Not Found",
    message: "The backend executable could not be found.",
    detail: "Please ensure the application is properly installed.",
    buttons: ["Quit"],
    type: "error" as const,
  },
} as const;

/**
 * Get an error message configuration with custom error details interpolated.
 *
 * @param messageKey - Key from ERROR_MESSAGES
 * @param errorDetails - Optional error details to append
 * @returns Error message configuration with interpolated details
 *
 * @example
 * ```typescript
 * const config = getErrorMessage('spawnFailure', 'ENOENT: file not found');
 * // config.detail will include the error message
 * ```
 */
export function getErrorMessage(
  messageKey: keyof typeof ERROR_MESSAGES,
  errorDetails?: string
): ErrorMessageConfig {
  const baseConfig = ERROR_MESSAGES[messageKey];

  if (!errorDetails) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    detail: `${baseConfig.detail}\n\nError: ${errorDetails}`,
  };
}
