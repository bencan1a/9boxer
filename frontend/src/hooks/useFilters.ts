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
    console.log('🔍 getAvailableOptions called');
    console.log('  - employees type:', typeof employees);
    console.log('  - employees is array?', Array.isArray(employees));
    console.log('  - employees length:', employees?.length ?? 'undefined');

    // Handle empty or undefined employees array
    if (!employees || employees.length === 0) {
      console.warn('⚠️  Returning empty filter options - employees array is empty or undefined');
      return {
        levels: [],
        jobFunctions: [],
        locations: [],
        managers: [],
      };
    }

    console.log('✅ Processing', employees.length, 'employees for filter options');

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
    const rawJobFunctions = employees.map((emp) => emp.job_function);
    console.log('📋 Raw job functions (all):', rawJobFunctions);
    console.log('  - Sample employee structure:', employees[0]);
    const filteredJobFunctions = rawJobFunctions.filter(Boolean);
    console.log('  - After filter(Boolean):', filteredJobFunctions);
    const jobFunctions = Array.from(
      new Set(filteredJobFunctions)
    ).sort();
    console.log('  - Final unique job functions:', jobFunctions);

    // Extract unique locations and map to display names
    const rawLocations = employees.map((emp) => emp.location);
    console.log('🌍 Raw locations (all):', rawLocations);
    const filteredLocations = rawLocations.filter(Boolean);
    console.log('  - After filter(Boolean):', filteredLocations);
    const mappedLocations = filteredLocations.map((location) => mapLocationToDisplay(location));
    console.log('  - After mapping to display names:', mappedLocations);
    const locations = Array.from(
      new Set(mappedLocations)
    ).sort();
    console.log('  - Final unique locations:', locations);

    // Extract unique managers
    const managers = Array.from(
      new Set(employees.map((emp) => emp.manager))
    ).sort();

    const result = {
      levels,
      jobFunctions,
      locations,
      managers,
    };

    console.log('📊 Final filter options result:', result);
    console.log('  - Job functions count:', jobFunctions.length);
    console.log('  - Locations count:', locations.length);

    return result;
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
