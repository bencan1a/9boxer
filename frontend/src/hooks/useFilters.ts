/**
 * Custom hook for filter operations
 */

import { Employee } from "../types/employee";
import { useFilterStore } from "../store/filterStore";
import { getAllFlags, getFlagDisplayName } from "../constants/flags";

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
    selectedFlags,
    excludedEmployeeIds,
    reportingChainFilter,
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
   */
  const applyFilters = (employees: Employee[]): Employee[] => {
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

      // Filter by managers
      if (selectedManagers.length > 0) {
        if (!selectedManagers.includes(emp.manager)) return false;
      }

      // Filter by reporting chain
      if (reportingChainFilter) {
        const chainFilter = reportingChainFilter.toLowerCase();
        const hasManagerInChain =
          emp.manager?.toLowerCase() === chainFilter ||
          emp.management_chain_01?.toLowerCase() === chainFilter ||
          emp.management_chain_02?.toLowerCase() === chainFilter ||
          emp.management_chain_03?.toLowerCase() === chainFilter ||
          emp.management_chain_04?.toLowerCase() === chainFilter ||
          emp.management_chain_05?.toLowerCase() === chainFilter ||
          emp.management_chain_06?.toLowerCase() === chainFilter;
        if (!hasManagerInChain) return false;
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
  };

  /**
   * Extract unique filter options from employee data
   */
  const getAvailableOptions = (employees: Employee[]): FilterOptions => {
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
        employees.map((emp) => {
          // Extract level code (e.g., "MT2" from "MT2 - Team Lead")
          const match = emp.job_level.match(/(MT\d+)/);
          return match ? match[1] : emp.job_level;
        })
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
      new Set(employees.map((emp) => emp.manager))
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
  };

  return {
    // State
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    selectedFlags,
    excludedEmployeeIds,
    reportingChainFilter,
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
