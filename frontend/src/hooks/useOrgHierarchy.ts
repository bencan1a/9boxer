/**
 * Custom hook for organization hierarchy operations
 *
 * Provides access to OrgService backend functionality including
 * manager lists, reporting chains, and org tree queries.
 */

import { useState, useEffect, useCallback } from "react";
import {
  orgHierarchyService,
  ManagerInfo,
} from "../services/orgHierarchyService";
import { useSession } from "./useSession";

/**
 * Hook for accessing organization hierarchy data
 *
 * Automatically fetches and caches manager list when session changes.
 * Provides methods for querying org structure using OrgService backend.
 *
 * @returns Organization hierarchy state and operations
 *
 * @example
 * ```typescript
 * const { managers, isLoading, getReportsFor } = useOrgHierarchy();
 *
 * // Use managers in FilterDrawer
 * const managerNames = managers.map(m => m.name);
 *
 * // Get team for a specific manager
 * const team = await getReportsFor(managerId);
 * ```
 */
export const useOrgHierarchy = () => {
  const { sessionId, employees } = useSession();
  const [managers, setManagers] = useState<ManagerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch managers from OrgService backend
   *
   * Automatically called when session changes (new file uploaded).
   * Uses min_team_size=1 to include all managers.
   */
  const fetchManagers = useCallback(async () => {
    if (!sessionId || employees.length === 0) {
      setManagers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await orgHierarchyService.getManagers(1);
      setManagers(response.managers);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch managers";
      setError(errorMsg);
      console.error("[useOrgHierarchy] Failed to fetch managers:", err);
      // Fallback: extract managers from employee data
      const fallbackManagers = Array.from(
        new Set(employees.map((emp) => emp.manager).filter(Boolean))
      )
        .sort()
        .map((name, index) => ({
          employee_id: -1, // Unknown ID in fallback
          name,
          team_size: employees.filter((emp) => emp.manager === name).length,
        }));
      setManagers(fallbackManagers);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, employees]);

  /**
   * Fetch managers when session changes
   */
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  /**
   * Get all reports (direct + indirect) for a manager
   *
   * @param employeeId - Employee ID of the manager
   * @returns Promise with manager's team info
   */
  const getReportsFor = useCallback(async (employeeId: number) => {
    return orgHierarchyService.getAllReports(employeeId);
  }, []);

  /**
   * Get reporting chain for an employee
   *
   * @param employeeId - Employee ID to get chain for
   * @returns Promise with reporting chain info
   */
  const getReportingChain = useCallback(async (employeeId: number) => {
    return orgHierarchyService.getReportingChain(employeeId);
  }, []);

  /**
   * Get manager info by name
   *
   * @param managerName - Name of manager to find
   * @returns Manager info or undefined if not found
   */
  const getManagerByName = useCallback(
    (managerName: string): ManagerInfo | undefined => {
      return managers.find((m) => m.name === managerName);
    },
    [managers]
  );

  /**
   * Get employee IDs for all reports under a manager
   *
   * @param employeeId - Employee ID of the manager
   * @returns Promise with array of employee IDs
   */
  const getReportIds = useCallback(async (employeeId: number) => {
    return orgHierarchyService.getReportIds(employeeId);
  }, []);

  /**
   * Refresh manager list from backend
   *
   * Useful for forcing a refresh if org structure changes.
   */
  const refreshManagers = useCallback(() => {
    fetchManagers();
  }, [fetchManagers]);

  return {
    /** List of all managers with team sizes (sorted by team size desc, then name) */
    managers,
    /** Whether managers are currently being fetched */
    isLoading,
    /** Error message if manager fetch failed */
    error,
    /** Get all reports for a manager */
    getReportsFor,
    /** Get reporting chain for an employee */
    getReportingChain,
    /** Find manager by name */
    getManagerByName,
    /** Get employee IDs for a manager's team */
    getReportIds,
    /** Refresh manager list */
    refreshManagers,
  };
};
