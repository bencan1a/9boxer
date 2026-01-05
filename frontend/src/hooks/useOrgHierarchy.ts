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
  OrgTreeNode,
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
  const [orgTree, setOrgTree] = useState<OrgTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch managers and org tree from OrgService backend
   *
   * Automatically called when session changes (new file uploaded).
   * Uses min_team_size=1 to include all managers.
   * Fetches both managers list and org tree in parallel for efficiency.
   */
  const fetchManagers = useCallback(async () => {
    if (!sessionId || employees.length === 0) {
      setManagers([]);
      setOrgTree([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch both managers list and org tree in parallel
      const [managersResponse, treeResponse] = await Promise.all([
        orgHierarchyService.getManagers(1),
        orgHierarchyService.getOrgTree(1),
      ]);

      setManagers(managersResponse.managers);
      setOrgTree(treeResponse.roots);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch managers";
      setError(errorMsg);
      console.error(
        "[useOrgHierarchy] Failed to fetch managers and org tree:",
        err
      );
      // Fallback: extract managers from employee data
      const fallbackManagers = Array.from(
        new Set(employees.map((emp) => emp.manager).filter(Boolean))
      )
        .map((name, index) => ({
          employee_id: -1 - index, // Synthetic unique ID in fallback
          name,
          team_size: employees.filter((emp) => emp.manager === name).length,
        }))
        .sort(
          (a, b) => b.team_size - a.team_size || a.name.localeCompare(b.name)
        );
      setManagers(fallbackManagers);
      setOrgTree([]);
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
    /** Hierarchical org tree structure with root managers and nested reports */
    orgTree,
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

/**
 * Traverse an organization tree and collect employee IDs
 *
 * This function safely traverses a tree of org nodes, detecting and handling
 * circular references to prevent infinite loops.
 *
 * IMPORTANT: Uses for...of loop (not forEach) to allow proper control flow.
 * When a circular reference is detected, 'continue' skips that node and its
 * children, preventing infinite traversal.
 *
 * @param nodes - Array of org tree nodes to traverse
 * @param rootId - Root employee ID (for logging context)
 * @param visited - Set of already-visited employee IDs (required parameter)
 * @returns Array of employee IDs found in the tree
 *
 * @example
 * ```typescript
 * const visited = new Set<number>();
 * const ids = traverseTree(orgTree.direct_reports, managerId, visited);
 * ```
 */
export const traverseTree = (
  nodes: OrgTreeNode[],
  rootId: number,
  visited: Set<number>
): number[] => {
  const employeeIds: number[] = [];

  // Use for...of instead of forEach to allow continue statement
  for (const node of nodes) {
    // Detect circular reference - skip this node and its children
    if (visited.has(node.employee_id)) {
      console.warn(
        `Circular reference detected: ${node.name} (ID: ${node.employee_id}) already visited in tree rooted at ${rootId}`
      );
      continue; // Skip to next node
    }

    // Mark as visited
    visited.add(node.employee_id);

    // Collect this employee's ID
    employeeIds.push(node.employee_id);

    // Recursively traverse children
    if (node.direct_reports && node.direct_reports.length > 0) {
      const childIds = traverseTree(node.direct_reports, rootId, visited);
      employeeIds.push(...childIds);
    }
  }

  return employeeIds;
};
