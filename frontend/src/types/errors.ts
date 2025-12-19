/**
 * Error handling types and utilities
 */

import type { AxiosError } from 'axios';

/**
 * Backend error response structure
 */
export interface BackendErrorResponse {
  detail?: string;
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError<BackendErrorResponse> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  );
}

/**
 * Extract error message from various error types
 *
 * Handles:
 * - Axios errors with backend response
 * - HTTP status errors
 * - Network errors
 * - Standard Error objects
 * - Unknown error types
 *
 * @param error - The error to extract a message from
 * @returns A human-readable error message
 *
 * @example
 * ```typescript
 * try {
 *   await apiClient.upload(file);
 * } catch (error: unknown) {
 *   const message = extractErrorMessage(error);
 *   console.error(message);
 * }
 * ```
 */
export function extractErrorMessage(error: unknown): string {
  // Axios error with backend response
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (detail) return detail;

    // HTTP status error
    if (error.response?.status) {
      return `Request failed with status ${error.response.status}`;
    }

    // Network error
    if (error.request) {
      return 'Network error: Unable to reach server';
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Unknown error type
  return String(error);
}
