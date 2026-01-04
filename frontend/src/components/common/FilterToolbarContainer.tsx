/**
 * FilterToolbar Container Component
 *
 * Connected version of FilterToolbar that uses real data from hooks.
 * This component wraps the presentational FilterToolbar with data from
 * useFilters and useEmployees hooks.
 */

import React, { useMemo } from "react";
import { FilterToolbar, ActiveFilter } from "./FilterToolbar";
import { useFilters } from "../../hooks/useFilters";
import { useEmployees } from "../../hooks/useEmployees";
import { useSessionStore } from "../../store/sessionStore";
import { useFilterStore } from "../../store/filterStore";
import { ErrorBoundary } from "./ErrorBoundary";
import { SimplifiedToolbar } from "./SimplifiedToolbar";

/**
 * Props for FilterToolbarContainer
 */
export interface FilterToolbarContainerProps {
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
}

/**
 * FilterToolbarContainer Component
 *
 * Container component that connects FilterToolbar to application state.
 */
export const FilterToolbarContainer: React.FC<FilterToolbarContainerProps> = ({
  onSearchChange,
}) => {
  const { employees: filteredEmployees, selectEmployee } = useEmployees();
  const { hasActiveFilters, toggleDrawer } = useFilters();

  // Get all employees from session store
  const allEmployees = useSessionStore((state) => state.employees);

  // Get filter state from filter store
  const selectedLevels = useFilterStore((state) => state.selectedLevels);
  const selectedJobFunctions = useFilterStore(
    (state) => state.selectedJobFunctions
  );
  const selectedLocations = useFilterStore((state) => state.selectedLocations);
  const selectedManagers = useFilterStore((state) => state.selectedManagers);
  const selectedFlags = useFilterStore((state) => state.selectedFlags);
  const excludedEmployeeIds = useFilterStore(
    (state) => state.excludedEmployeeIds
  );

  // Calculate counts
  const filteredCount = filteredEmployees.length;
  const totalCount = allEmployees?.length || 0;

  // Build active filters list
  const activeFilters = useMemo((): ActiveFilter[] => {
    const filters: ActiveFilter[] = [];

    if (selectedLevels.length > 0) {
      filters.push({
        type: "level",
        label: "Job Level",
        values: selectedLevels,
      });
    }

    if (selectedJobFunctions.length > 0) {
      filters.push({
        type: "function",
        label: "Function",
        values: selectedJobFunctions,
      });
    }

    if (selectedLocations.length > 0) {
      filters.push({
        type: "location",
        label: "Location",
        values: selectedLocations,
      });
    }

    if (selectedManagers.length > 0) {
      filters.push({
        type: "manager",
        label: "Manager",
        values: selectedManagers,
      });
    }

    if (selectedFlags.length > 0) {
      filters.push({
        type: "flags",
        label: "Flags",
        values: selectedFlags,
      });
    }

    if (excludedEmployeeIds.length > 0) {
      filters.push({
        type: "excluded",
        label: "Excluded",
        values: [`${excludedEmployeeIds.length} employee(s)`],
      });
    }

    return filters;
  }, [
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    selectedFlags,
    excludedEmployeeIds,
  ]);

  const handleFilterClick = () => {
    toggleDrawer();
  };

  const handleEmployeeSelect = (employeeId: number | undefined) => {
    if (employeeId !== undefined) {
      selectEmployee(employeeId);
    }
  };

  return (
    <ErrorBoundary fallback={<SimplifiedToolbar />}>
      <FilterToolbar
        activeFilters={activeFilters}
        filteredCount={filteredCount}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        onFilterClick={handleFilterClick}
        onSearchChange={onSearchChange}
        onEmployeeSelect={handleEmployeeSelect}
        employees={filteredEmployees}
        disabled={totalCount === 0}
      />
    </ErrorBoundary>
  );
};
