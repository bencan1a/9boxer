/**
 * Custom hook for filter operations
 */

import { useCallback, useMemo } from "react";
import { Employee } from "../types/employee";
import { useFilterStore } from "../store/filterStore";
import { getAllFlags } from "../constants/flags";

export interface FilterOptions {
  levels: string[];
  jobFunctions: string[];
  locations: string[];
  managers: string[];
  flags: Array<{ key: string; displayName: string; count: number }>;
}

// European country codes (ISO 3166-1 alpha-3)
const EUROPEAN_COUNTRIES = new Set([
  "GBR",
  "FRA",
  "DEU",
  "ITA",
  "ESP",
  "NLD",
  "BEL",
  "SWE",
  "NOR",
  "DNK",
  "FIN",
  "POL",
  "AUT",
  "CHE",
  "IRL",
  "PRT",
  "GRC",
  "CZE",
  "HUN",
  "ROU",
  "BGR",
  "HRV",
  "SVK",
  "SVN",
  "LTU",
  "LVA",
  "EST",
  "LUX",
  "MLT",
  "CYP",
]);

/**
 * Map location code to display name
 */
const mapLocationToDisplay = (locationCode: string): string => {
  if (EUROPEAN_COUNTRIES.has(locationCode)) {
    return "Europe";
  }

  const locationMap: Record<string, string> = {
    AUS: "Australia",
    IND: "India",
    USA: "USA",
    CAN: "Canada",
  };

  return locationMap[locationCode] || locationCode;
};

export const useFilters = () => {
  const {
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    selectedManagerEmployeeIds,
    selectedFlags,
    excludedEmployeeIds,
    reportingChainFilter,
    reportingChainEmployeeIds,
    isDrawerOpen,
    toggleLevel,
    toggleJobFunction,
    toggleLocation,
    toggleManager,
    toggleFlag,
    setExcludedIds,
    setReportingChainFilter,
    clearReportingChainFilter,
    clearAllFilters,
    toggleDrawer,
    hasActiveFilters,
  } = useFilterStore();

  /**
   * Apply all active filters to employee list
   * Memoized to prevent unnecessary recalculations during drag operations
   */
  const applyFilters = useCallback(
    (employees: Employee[]): Employee[] => {
      return employees.filter((emp) => {
        // Filter by job levels
        if (selectedLevels.length > 0) {
          const hasSelectedLevel = selectedLevels.some((level) =>
            emp.job_level.includes(level)
          );
          if (!hasSelectedLevel) return false;
        }

        // Filter by job functions
        if (selectedJobFunctions.length > 0) {
          if (!selectedJobFunctions.includes(emp.job_function)) return false;
        }

        // Filter by locations (map employee location to display name)
        if (selectedLocations.length > 0) {
          const displayLocation = mapLocationToDisplay(emp.location);
          if (!selectedLocations.includes(displayLocation)) return false;
        }

        // Filter by managers (using employee IDs from org service)
        // This uses the same backend org hierarchy logic as the intelligence panel
        if (
          selectedManagers.length > 0 &&
          selectedManagerEmployeeIds.size > 0
        ) {
          // Check if this employee is in any of the selected managers' org hierarchies
          let isUnderSelectedManager = false;
          for (const [_, reportIds] of selectedManagerEmployeeIds) {
            if (reportIds.includes(emp.employee_id)) {
              isUnderSelectedManager = true;
              break;
            }
          }
          if (!isUnderSelectedManager) return false;
        }

        // Filter by reporting chain (using employee IDs from org service)
        if (reportingChainFilter && reportingChainEmployeeIds.length > 0) {
          if (!reportingChainEmployeeIds.includes(emp.employee_id))
            return false;
        }

        // Filter by flags (employee must have ALL selected flags)
        if (selectedFlags.length > 0) {
          const employeeFlags = emp.flags || [];
          const hasAllSelectedFlags = selectedFlags.every((flag) =>
            employeeFlags.includes(flag)
          );
          if (!hasAllSelectedFlags) return false;
        }

        // Exclude employees by ID
        if (excludedEmployeeIds.includes(emp.employee_id)) return false;

        return true;
      });
    },
    [
      selectedLevels,
      selectedJobFunctions,
      selectedLocations,
      selectedManagers,
      selectedManagerEmployeeIds,
      selectedFlags,
      excludedEmployeeIds,
      reportingChainFilter,
      reportingChainEmployeeIds,
    ]
  );

  /**
   * Extract unique filter options from employee data
   * Memoized with useCallback to prevent unnecessary recalculations
   */
  const getAvailableOptions = useCallback(
    (employees: Employee[]): FilterOptions => {
      // Handle empty or undefined employees array
      if (!employees || employees.length === 0) {
        return {
          levels: [],
          jobFunctions: [],
          locations: [],
          managers: [],
          flags: [],
        };
      }

      // Extract unique job levels
      const levels = Array.from(
        new Set(
          employees
            .map((emp) => {
              // Skip employees without job_level
              if (!emp.job_level) return null;
              // Extract level code (e.g., "MT2" from "MT2 - Team Lead")
              const match = emp.job_level.match(/(MT\d+)/);
              return match ? match[1] : emp.job_level;
            })
            .filter((level): level is string => Boolean(level))
        )
      ).sort();

      // Extract unique job functions
      const jobFunctions = Array.from(
        new Set(employees.map((emp) => emp.job_function).filter(Boolean))
      ).sort();

      // Extract unique locations and map to display names
      const locations = Array.from(
        new Set(
          employees
            .map((emp) => emp.location)
            .filter(Boolean)
            .map((location) => mapLocationToDisplay(location))
        )
      ).sort();

      // Extract unique managers
      const managers = Array.from(
        new Set(employees.map((emp) => emp.manager).filter(Boolean))
      ).sort();

      // Extract flags with counts (only flags that exist in the dataset)
      const flagCounts = new Map<string, number>();
      employees.forEach((emp) => {
        if (emp.flags && emp.flags.length > 0) {
          emp.flags.forEach((flag) => {
            flagCounts.set(flag, (flagCounts.get(flag) || 0) + 1);
          });
        }
      });

      // Build flags array with display names and counts
      const flags = getAllFlags()
        .filter((flagDef) => flagCounts.has(flagDef.key))
        .map((flagDef) => ({
          key: flagDef.key,
          displayName: flagDef.displayName,
          count: flagCounts.get(flagDef.key) || 0,
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

      return {
        levels,
        jobFunctions,
        locations,
        managers,
        flags,
      };
    },
    [] // No dependencies - function is stable
  );

  return {
    // State
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    selectedFlags,
    excludedEmployeeIds,
    reportingChainFilter,
    reportingChainEmployeeIds,
    isDrawerOpen,
    hasActiveFilters: hasActiveFilters(),

    // Actions
    toggleLevel,
    toggleJobFunction,
    toggleLocation,
    toggleManager,
    toggleFlag,
    setExcludedIds,
    setReportingChainFilter,
    clearReportingChainFilter,
    clearAllFilters,
    toggleDrawer,

    // Operations
    applyFilters,
    getAvailableOptions,
  };
};
