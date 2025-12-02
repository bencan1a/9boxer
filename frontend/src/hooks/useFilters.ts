/**
 * Custom hook for filter operations
 */

import { Employee } from "../types/employee";
import { useFilterStore } from "../store/filterStore";

export interface FilterOptions {
  levels: string[];
  managers: string[];
  chainLevels: string[];
}

export const useFilters = () => {
  const {
    selectedLevels,
    selectedManagers,
    selectedChainLevels,
    excludedEmployeeIds,
    isDrawerOpen,
    toggleLevel,
    toggleManager,
    toggleChainLevel,
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

      // Filter by managers
      if (selectedManagers.length > 0) {
        if (!selectedManagers.includes(emp.manager)) return false;
      }

      // Filter by management chain levels
      if (selectedChainLevels.length > 0) {
        const hasSelectedChainLevel = selectedChainLevels.some((level) => {
          switch (level) {
            case "04":
              return emp.management_chain_04 !== null;
            case "05":
              return emp.management_chain_05 !== null;
            case "06":
              return emp.management_chain_06 !== null;
            default:
              return false;
          }
        });
        if (!hasSelectedChainLevel) return false;
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

    // Extract unique managers
    const managers = Array.from(
      new Set(employees.map((emp) => emp.manager))
    ).sort();

    // Extract available chain levels
    const chainLevels: string[] = [];
    if (employees.some((emp) => emp.management_chain_04 !== null)) {
      chainLevels.push("04");
    }
    if (employees.some((emp) => emp.management_chain_05 !== null)) {
      chainLevels.push("05");
    }
    if (employees.some((emp) => emp.management_chain_06 !== null)) {
      chainLevels.push("06");
    }

    return {
      levels,
      managers,
      chainLevels,
    };
  };

  return {
    // State
    selectedLevels,
    selectedManagers,
    selectedChainLevels,
    excludedEmployeeIds,
    isDrawerOpen,
    hasActiveFilters: hasActiveFilters(),

    // Actions
    toggleLevel,
    toggleManager,
    toggleChainLevel,
    setExcludedIds,
    clearAllFilters,
    toggleDrawer,

    // Operations
    applyFilters,
    getAvailableOptions,
  };
};
