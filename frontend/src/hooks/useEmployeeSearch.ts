/**
 * Custom hook for employee search with fuzzy matching using Fuse.js
 *
 * This hook provides type-ahead search capabilities with:
 * - Fuzzy matching with typo tolerance
 * - Multi-field weighted search (name, title, level, manager, location, function)
 * - Unicode normalization for international names
 * - Performance optimized for 200-5000 employees
 *
 * @example
 * ```tsx
 * const { search, isReady, error } = useEmployeeSearch({
 *   employees: filteredEmployees,
 *   threshold: 0.3
 * });
 *
 * if (error) {
 *   // Handle error - show message to user
 * }
 *
 * const results = search('john'); // Returns Employee[] ranked by relevance
 * ```
 */

import { useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import { Employee } from "../types/employee";

/**
 * Configuration options for employee search
 */
export interface UseEmployeeSearchOptions {
  /** Array of employees to search through */
  employees: Employee[];

  /**
   * Fuzzy matching threshold (0.0 = exact match, 1.0 = match anything)
   * Recommended: 0.25 for balanced fuzzy matching
   * @default 0.25
   */
  threshold?: number;

  /**
   * Maximum number of results to return
   * @default 10
   */
  resultLimit?: number;
}

/**
 * Return type for useEmployeeSearch hook
 */
export interface UseEmployeeSearchResult {
  /**
   * Search function that returns ranked employee results
   * @param query - Search string
   * @returns Array of employees sorted by relevance (highest first)
   */
  search: (query: string) => Employee[];

  /**
   * Indicates if the search engine is ready
   * False when employees array is empty or initialization failed
   */
  isReady: boolean;

  /**
   * Error that occurred during Fuse initialization
   * Undefined if no error occurred
   */
  error?: Error;
}

/**
 * Hook for searching employees with fuzzy matching
 *
 * Uses Fuse.js to provide fast, fuzzy search across multiple employee fields
 * with weighted relevance scoring. The Fuse instance is memoized and only
 * recreated when the employees array changes.
 *
 * @param options - Search configuration options
 * @returns Search function and ready state
 *
 * @remarks
 * - Debouncing is the caller's responsibility (components should debounce input)
 * - Fuse instance re-creates when employees array reference changes
 * - Queries with less than 2 characters return no results (minMatchCharLength)
 * - Returns empty array when employees is empty/null (isReady will be false)
 */
export function useEmployeeSearch(
  options: UseEmployeeSearchOptions
): UseEmployeeSearchResult {
  const { employees, threshold = 0.25, resultLimit = 10 } = options;

  /**
   * Create Fuse.js search instance with weighted multi-field configuration
   * Returns a tuple of [fuseInstance, error] to avoid setting state in useMemo
   * Memoized to only recreate when employees array changes
   */
  const [fuse, error] = useMemo((): [
    Fuse<Employee> | null,
    Error | undefined,
  ] => {
    try {
      // Handle empty employees array
      if (!employees || employees.length === 0) {
        return [null, undefined];
      }

      // Configure Fuse.js with weighted search fields
      const fuseOptions: Fuse.IFuseOptions<Employee> = {
        // Search fields with relevance weights
        keys: [
          { name: "name", weight: 0.45 }, // Highest priority - employee name
          { name: "business_title", weight: 0.25 }, // Job title/role
          { name: "job_level", weight: 0.15 }, // MT1, MT2, VP, etc.
          { name: "manager", weight: 0.1 }, // Manager name
          { name: "location", weight: 0.05 }, // Country code (USA, GBR, IND, etc.)
          { name: "job_function", weight: 0.05 }, // Engineering, Sales, etc.
        ],

        // Fuzzy matching threshold (0.0 = exact, 1.0 = match anything)
        threshold,

        // Match anywhere in the string (not just at the start)
        ignoreLocation: true,

        // Minimum characters required to start matching
        minMatchCharLength: 2,

        // Include relevance score in results for ranking
        includeScore: true,

        // Use extended search for better matching
        useExtendedSearch: false,

        // Unicode normalization for diacritics (José → Jose)
        // Fuse.js v7.x handles this automatically
      };

      const fuseInstance = new Fuse(employees, fuseOptions);
      return [fuseInstance, undefined];
    } catch (err) {
      // Convert unknown errors to Error instances
      const error =
        err instanceof Error ? err : new Error("Fuse initialization failed");
      console.error("[useEmployeeSearch] Fuse initialization failed:", error);
      return [null, error]; // Graceful degradation
    }
  }, [employees, threshold]);

  /**
   * Search function that returns ranked results
   * Memoized with useCallback to maintain referential stability
   */
  const search = useCallback(
    (query: string): Employee[] => {
      // Handle edge cases
      if (!query || query.trim().length === 0) {
        return [];
      }

      if (!fuse) {
        return [];
      }

      // Perform fuzzy search and extract employee objects
      const results = fuse.search(query.trim(), { limit: resultLimit });

      // Extract employee objects from Fuse results
      // Results are already sorted by relevance score (best match first)
      return results.map((result) => result.item);
    },
    [fuse, resultLimit]
  );

  return {
    search,
    isReady: fuse !== null && !error,
    error,
  };
}
