/**
 * Organization Hierarchy Service
 *
 * This service provides frontend access to OrgService backend endpoints
 * for querying organizational hierarchies, manager lists, and reporting chains.
 */

import { apiClient } from "./api";

/**
 * Manager information with team size
 */
export interface ManagerInfo {
  employee_id: number;
  name: string;
  team_size: number;
}

/**
 * Response from /api/org-hierarchy/managers endpoint
 */
export interface ManagerListResponse {
  managers: ManagerInfo[];
  total_count: number;
}

/**
 * Employee info in org hierarchy context
 */
export interface OrgHierarchyEmployee {
  employee_id: number;
  name: string;
  job_title: string;
  job_level: string;
  job_function: string;
  manager: string;
}

/**
 * Response from /api/org-hierarchy/reports/{employee_id} endpoint
 */
export interface AllReportsResponse {
  manager_id: number;
  manager_name: string;
  direct_reports_count: number;
  total_reports_count: number;
  all_reports: OrgHierarchyEmployee[];
}

/**
 * Response from /api/org-hierarchy/reporting-chain/{employee_id} endpoint
 */
export interface ReportingChainResponse {
  employee_id: number;
  employee_name: string;
  reporting_chain: ManagerInfo[];
}

/**
 * Organization tree node with hierarchical structure
 */
export interface OrgTreeNode {
  employee_id: number;
  name: string;
  job_title: string;
  team_size: number;
  direct_reports: OrgTreeNode[];
}

/**
 * Response from /api/org-hierarchy/org-tree/{employee_id} endpoint
 */
export interface OrgTreeResponse {
  root_employee_id: number;
  root_name: string;
  tree: OrgTreeNode;
}

/**
 * Organization Hierarchy Service
 *
 * Provides methods for querying organizational structures using OrgService backend.
 * All methods use the centralized apiClient for consistent error handling and retries.
 */
export const orgHierarchyService = {
  /**
   * Get list of all managers with their team sizes
   *
   * @param minTeamSize - Minimum total team size (default: 1)
   * @returns Promise<ManagerListResponse> - List of managers sorted by team size
   *
   * @example
   * ```typescript
   * // Get all managers
   * const managers = await orgHierarchyService.getManagers();
   *
   * // Get managers with large teams (10+ employees)
   * const largeTeamManagers = await orgHierarchyService.getManagers(10);
   * ```
   */
  async getManagers(minTeamSize: number = 1): Promise<ManagerListResponse> {
    const params = new URLSearchParams();
    if (minTeamSize > 1) {
      params.append("min_team_size", minTeamSize.toString());
    }

    const url = `/api/org-hierarchy/managers${params.toString() ? `?${params.toString()}` : ""}`;
    return apiClient.get<ManagerListResponse>(url);
  },

  /**
   * Get all reports (direct + indirect) for a specific manager
   *
   * @param employeeId - Employee ID of the manager
   * @returns Promise<AllReportsResponse> - Manager info and list of all reports
   *
   * @example
   * ```typescript
   * const reports = await orgHierarchyService.getAllReports(123);
   * console.log(`Manager has ${reports.total_reports_count} total reports`);
   * console.log(`Including ${reports.direct_reports_count} direct reports`);
   * ```
   */
  async getAllReports(employeeId: number): Promise<AllReportsResponse> {
    return apiClient.get<AllReportsResponse>(
      `/api/org-hierarchy/reports/${employeeId}`
    );
  },

  /**
   * Get the upward reporting chain from an employee to the CEO
   *
   * @param employeeId - Employee ID to get reporting chain for
   * @returns Promise<ReportingChainResponse> - Employee info and their reporting chain
   *
   * @example
   * ```typescript
   * const chain = await orgHierarchyService.getReportingChain(456);
   * console.log(`Employee reports to: ${chain.reporting_chain.map(m => m.name).join(' → ')}`);
   * ```
   */
  async getReportingChain(employeeId: number): Promise<ReportingChainResponse> {
    return apiClient.get<ReportingChainResponse>(
      `/api/org-hierarchy/reporting-chain/${employeeId}`
    );
  },

  /**
   * Get manager info by name
   *
   * Helper method to find a manager by name in the manager list.
   * Useful for looking up manager IDs when clicking manager names in UI.
   *
   * @param managerName - Name of the manager to find
   * @param minTeamSize - Optional minimum team size filter
   * @returns Promise<ManagerInfo | null> - Manager info or null if not found
   *
   * @example
   * ```typescript
   * const manager = await orgHierarchyService.getManagerByName("John Smith");
   * if (manager) {
   *   const reports = await orgHierarchyService.getAllReports(manager.employee_id);
   * }
   * ```
   */
  async getManagerByName(
    managerName: string,
    minTeamSize: number = 1
  ): Promise<ManagerInfo | null> {
    const response = await this.getManagers(minTeamSize);
    const manager = response.managers.find((m) => m.name === managerName);
    return manager || null;
  },

  /**
   * Get employee IDs for all reports under a manager
   *
   * Helper method to extract just the employee IDs from a manager's team.
   * Useful for filtering operations.
   *
   * @param employeeId - Employee ID of the manager
   * @returns Promise<number[]> - Array of employee IDs
   *
   * @example
   * ```typescript
   * const teamIds = await orgHierarchyService.getReportIds(123);
   * // Use teamIds to filter employee list
   * const teamMembers = employees.filter(emp => teamIds.includes(emp.employee_id));
   * ```
   */
  async getReportIds(employeeId: number): Promise<number[]> {
    const response = await this.getAllReports(employeeId);
    return response.all_reports.map((emp) => emp.employee_id);
  },

  /**
   * Get the organizational tree starting from a specific employee
   *
   * Returns a hierarchical tree structure showing the employee and all their
   * direct and indirect reports in a nested format.
   *
   * @param employeeId - Employee ID to use as the root of the tree
   * @returns Promise<OrgTreeResponse> - Hierarchical org tree
   *
   * @example
   * ```typescript
   * const orgTree = await orgHierarchyService.getOrgTree(123);
   * console.log(`Root: ${orgTree.root_name}`);
   * console.log(`Direct reports: ${orgTree.tree.direct_reports.length}`);
   * ```
   */
  async getOrgTree(employeeId: number): Promise<OrgTreeResponse> {
    return apiClient.get<OrgTreeResponse>(
      `/api/org-hierarchy/org-tree/${employeeId}`
    );
  },
};
