/**
 * FilterToolbar Container Component
 *
 * Connected version of FilterToolbar that uses real data from hooks.
 * This component wraps the presentational FilterToolbar with data from
 * useFilters and useEmployees hooks.
 */

import React, { useMemo } from "react";
import {
  FilterToolbar,
  FilterToolbarVariant,
  ActiveFilter,
} from "./FilterToolbar";
import { useFilters } from "../../hooks/useFilters";
import { useEmployees } from "../../hooks/useEmployees";
import { useSessionStore } from "../../store/sessionStore";
import { useFilterStore } from "../../store/filterStore";

/**
 * Props for FilterToolbarContainer
 */
export interface FilterToolbarContainerProps {
  /** Display variant of the toolbar */
  variant?: FilterToolbarVariant;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
}

/**
 * FilterToolbarContainer Component
 *
 * Container component that connects FilterToolbar to application state.
 */
export const FilterToolbarContainer: React.FC<FilterToolbarContainerProps> = ({
  variant = "compact",
  onSearchChange,
}) => {
  const { employees: filteredEmployees } = useEmployees();
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
  const reportingChainFilter = useFilterStore(
    (state) => state.reportingChainFilter
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

    if (reportingChainFilter) {
      filters.push({
        type: "reporting",
        label: "Reporting Chain",
        values: [reportingChainFilter],
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
    reportingChainFilter,
  ]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += selectedLevels.length;
    count += selectedJobFunctions.length;
    count += selectedLocations.length;
    count += selectedManagers.length;
    count += selectedFlags.length;
    if (excludedEmployeeIds.length > 0) count += 1;
    if (reportingChainFilter) count += 1;
    return count;
  }, [
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    selectedFlags,
    excludedEmployeeIds,
    reportingChainFilter,
  ]);

  const handleFilterClick = () => {
    toggleDrawer();
  };

  return (
    <FilterToolbar
      variant={variant}
      activeFilterCount={activeFilterCount}
      activeFilters={activeFilters}
      filteredCount={filteredCount}
      totalCount={totalCount}
      hasActiveFilters={hasActiveFilters}
      onFilterClick={handleFilterClick}
      onSearchChange={onSearchChange}
      disabled={totalCount === 0}
    />
  );
};
