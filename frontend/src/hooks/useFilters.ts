/**
 * Custom hook for filter operations
 */

import { Employee } from "../types/employee";
import { useFilterStore } from "../store/filterStore";

export interface FilterOptions {
  levels: string[];
  jobFunctions: string[];
  locations: string[];
  managers: string[];
}

// European country codes (ISO 3166-1 alpha-3)
const EUROPEAN_COUNTRIES = new Set([
  "GBR", "FRA", "DEU", "ITA", "ESP", "NLD", "BEL", "SWE", "NOR", "DNK",
  "FIN", "POL", "AUT", "CHE", "IRL", "PRT", "GRC", "CZE", "HUN", "ROU",
  "BGR", "HRV", "SVK", "SVN", "LTU", "LVA", "EST", "LUX", "MLT", "CYP"
]);

/**
 * Map location code to display name
 */
const mapLocationToDisplay = (locationCode: string): string => {
  if (EUROPEAN_COUNTRIES.has(locationCode)) {
    return "Europe";
  }

  const locationMap: Record<string, string> = {
    "AUS": "Australia",
    "IND": "India",
    "USA": "USA",
    "CAN": "Canada",
  };

  return locationMap[locationCode] || locationCode;
};

export const useFilters = () => {
  const {
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
    isDrawerOpen,
    toggleLevel,
    toggleJobFunction,
    toggleLocation,
    toggleManager,
    setExcludedIds,
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
      new Set(
        employees
          .map((emp) => emp.job_function)
          .filter(Boolean)
      )
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

    return {
      levels,
      jobFunctions,
      locations,
      managers,
    };
  };

  return {
    // State
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
    isDrawerOpen,
    hasActiveFilters: hasActiveFilters(),

    // Actions
    toggleLevel,
    toggleJobFunction,
    toggleLocation,
    toggleManager,
    setExcludedIds,
    clearAllFilters,
    toggleDrawer,

    // Operations
    applyFilters,
    getAvailableOptions,
  };
};
