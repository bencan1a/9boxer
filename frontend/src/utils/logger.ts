/**
 * Logging utility with development/production awareness
 *
 * Debug logs only appear in development mode.
 * Info, warn, and error logs always appear.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Debug logging (dev only)
   *
   * Use for verbose debugging information that should not appear in production.
   *
   * @param message - The log message
   * @param args - Additional arguments to log
   *
   * @example
   * ```typescript
   * logger.debug('User clicked button', { userId: 123 });
   * ```
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Info logging (always)
   *
   * Use for important informational messages.
   *
   * @param message - The log message
   * @param args - Additional arguments to log
   *
   * @example
   * ```typescript
   * logger.info('File uploaded successfully', { filename: 'data.xlsx' });
   * ```
   */
  info: (message: string, ...args: unknown[]): void => {
    console.info(`[INFO] ${message}`, ...args);
  },

  /**
   * Warning logging (always)
   *
   * Use for warnings that don't prevent operation but should be noted.
   *
   * @param message - The log message
   * @param args - Additional arguments to log
   *
   * @example
   * ```typescript
   * logger.warn('Session expired, reloading file', { filePath });
   * ```
   */
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Error logging (always)
   *
   * Use for error conditions that need attention.
   *
   * @param message - The error message
   * @param error - The error object (optional)
   * @param args - Additional arguments to log
   *
   * @example
   * ```typescript
   * try {
   *   await apiClient.upload(file);
   * } catch (error: unknown) {
   *   logger.error('Failed to upload file', error);
   * }
   * ```
   */
  error: (message: string, error?: unknown, ...args: unknown[]): void => {
    console.error(`[ERROR] ${message}`, error, ...args);
  },

  /**
   * Group logging for related logs (dev only)
   *
   * Groups multiple log statements together with a collapsible header.
   *
   * @param label - The group label
   * @param fn - Function containing the grouped log statements
   *
   * @example
   * ```typescript
   * logger.group('Upload Details', () => {
   *   logger.debug('Filename', file.name);
   *   logger.debug('Size', file.size);
   *   logger.debug('Type', file.type);
   * });
   * ```
   */
  group: (label: string, fn: () => void): void => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },
};
