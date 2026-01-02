/**
 * Organization hierarchy helper functions
 *
 * Utilities for working with org hierarchies, including building
 * manager-to-reports mappings and traversing the org tree.
 */

import { Employee } from "../types/employee";

/**
 * Get all employee IDs that report to a manager (recursively)
 *
 * This includes both direct reports and indirect reports (reports of reports, etc.)
 *
 * @param managerName - Name of the manager
 * @param employees - All employees in the organization
 * @returns Array of employee IDs that report to this manager (directly or indirectly)
 *
 * @example
 * ```typescript
 * const reportIds = getAllReportsForManager("Jane Smith", employees);
 * // Returns [101, 102, 103, 104, ...] - all employee IDs under Jane
 * ```
 */
export const getAllReportsForManager = (
  managerName: string,
  employees: Employee[]
): number[] => {
  // Build a map of manager name -> direct reports
  const managerToReports = new Map<string, Employee[]>();

  employees.forEach((emp) => {
    const manager = emp.manager;
    if (manager) {
      if (!managerToReports.has(manager)) {
        managerToReports.set(manager, []);
      }
      managerToReports.get(manager)!.push(emp);
    }
  });

  // Recursive function to collect all reports
  const collectReports = (manager: string, visited: Set<string>): number[] => {
    // Prevent infinite loops from circular references
    if (visited.has(manager)) {
      console.warn(`Circular reference detected for manager: ${manager}`);
      return [];
    }
    visited.add(manager);

    const directReports = managerToReports.get(manager) || [];
    const allReportIds: number[] = [];

    directReports.forEach((report) => {
      // Add this employee
      allReportIds.push(report.employee_id);

      // Recursively add their reports (if they are also a manager)
      if (managerToReports.has(report.name)) {
        const subReports = collectReports(report.name, new Set(visited));
        allReportIds.push(...subReports);
      }
    });

    return allReportIds;
  };

  return collectReports(managerName, new Set());
};

/**
 * Build a map of all managers to their report IDs
 *
 * This is useful for batch operations where you need report IDs for multiple managers.
 *
 * @param managerNames - List of manager names
 * @param employees - All employees in the organization
 * @returns Map of manager name to array of employee IDs
 *
 * @example
 * ```typescript
 * const managerReports = buildManagerToReportsMap(["Jane Smith", "John Doe"], employees);
 * // Returns Map { "Jane Smith" => [101, 102, ...], "John Doe" => [201, 202, ...] }
 * ```
 */
export const buildManagerToReportsMap = (
  managerNames: string[],
  employees: Employee[]
): Map<string, number[]> => {
  const map = new Map<string, number[]>();

  managerNames.forEach((managerName) => {
    map.set(managerName, getAllReportsForManager(managerName, employees));
  });

  return map;
};
