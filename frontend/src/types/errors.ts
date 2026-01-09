/**
 * Error handling types and utilities
 */

import { ApiError } from "../services/api";

/**
 * Backend error response structure
 */
export interface BackendErrorResponse {
  detail?: string;
}

/**
 * Extract error message from various error types
 *
 * Handles:
 * - ApiError from fetch-based API client
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
  // ApiError with backend response details
  if (error instanceof ApiError) {
    // Message already contains detail or formatted error
    return error.message;
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Unknown error type
  return String(error);
}
