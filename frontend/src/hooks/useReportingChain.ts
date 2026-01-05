/**
 * Custom hook for fetching employee reporting chain
 *
 * Provides access to the org hierarchy API for reporting chains
 * with caching, loading states, and error handling.
 */

import { useState, useEffect } from "react";
import {
  orgHierarchyService,
  ManagerInfo,
} from "../services/orgHierarchyService";

export interface ReportingChainData {
  /** Employee's direct manager */
  directManager: string | null;
  /** Array of managers in the reporting chain (from direct manager to CEO) */
  chain: ManagerInfo[];
}

export interface UseReportingChainResult {
  /** Reporting chain data (null if not yet loaded or on error) */
  data: ReportingChainData | null;
  /** Whether the API call is in progress */
  isLoading: boolean;
  /** Error message if the API call failed */
  error: string | null;
}

/**
 * Hook for fetching an employee's reporting chain from the API
 *
 * Automatically fetches when employeeId changes. Returns loading states
 * and error information for proper UI handling.
 *
 * @param employeeId - Employee ID to fetch reporting chain for
 * @param directManager - Employee's direct manager name (from static field)
 * @returns Reporting chain data, loading state, and error state
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useReportingChain(employee.employee_id, employee.manager);
 *
 * if (isLoading) return <Spinner />;
 * if (error || !data) return <FallbackComponent />;
 *
 * // Use data.chain to render reporting hierarchy
 * ```
 */
export const useReportingChain = (
  employeeId: number | null,
  directManager: string
): UseReportingChainResult => {
  const [data, setData] = useState<ReportingChainData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when employeeId changes
    if (!employeeId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    const fetchReportingChain = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await orgHierarchyService.getReportingChain(employeeId);

        // Don't update state if component unmounted or employeeId changed
        if (isCancelled) return;

        setData({
          directManager:
            response.reporting_chain.length > 0
              ? response.reporting_chain[0].name
              : directManager || null,
          chain: response.reporting_chain,
        });
      } catch (err) {
        if (isCancelled) return;

        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to fetch reporting chain";
        setError(errorMsg);
        console.error(
          `[useReportingChain] Failed to fetch chain for employee ${employeeId}:`,
          err
        );
        setData(null);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchReportingChain();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [employeeId, directManager]);

  return { data, isLoading, error };
};
