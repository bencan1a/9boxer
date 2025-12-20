/**
 * EmployeeCount component - Displays filtered and total employee counts
 *
 * Shows "X of Y employees" when filters are active, or "Y employees" when no filters.
 * Includes tooltip with filter breakdown when filters are active.
 */

import React, { useMemo } from "react";
import { Typography, Tooltip, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEmployees } from "../../hooks/useEmployees";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../../hooks/useFilters";

export const EmployeeCount: React.FC = () => {
  const theme = useTheme();
  const { employees: filteredEmployees } = useEmployees();
  const { employees: allEmployees } = useSessionStore();
  const {
    hasActiveFilters,
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
  } = useFilters();

  // Calculate counts
  const filteredCount = filteredEmployees.length;
  const totalCount = allEmployees.length;

  // Build display text
  const displayText = useMemo(() => {
    if (!hasActiveFilters || filteredCount === totalCount) {
      return `${totalCount} employee${totalCount === 1 ? "" : "s"}`;
    }
    return `${filteredCount} of ${totalCount} employee${totalCount === 1 ? "" : "s"}`;
  }, [hasActiveFilters, filteredCount, totalCount]);

  // Build tooltip content
  const tooltipContent = useMemo(() => {
    if (!hasActiveFilters) {
      return "Total employees in session";
    }

    const filterParts: string[] = [`Showing ${filteredCount} of ${totalCount} employees`, "", "Active filters:"];

    if (selectedLevels.length > 0) {
      filterParts.push(`  • Job Level: ${selectedLevels.join(", ")}`);
    }
    if (selectedJobFunctions.length > 0) {
      filterParts.push(`  • Job Function: ${selectedJobFunctions.join(", ")}`);
    }
    if (selectedLocations.length > 0) {
      filterParts.push(`  • Location: ${selectedLocations.join(", ")}`);
    }
    if (selectedManagers.length > 0) {
      filterParts.push(`  • Manager: ${selectedManagers.join(", ")}`);
    }
    if (excludedEmployeeIds.length > 0) {
      filterParts.push(`  • Excluded: ${excludedEmployeeIds.length} employee(s)`);
    }

    return filterParts.join("\n");
  }, [
    hasActiveFilters,
    filteredCount,
    totalCount,
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
  ]);

  // Handle edge case: no employees
  if (totalCount === 0) {
    return (
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.text.secondary,
          userSelect: "none",
        }}
        aria-label="No employees in session"
        data-testid="employee-count"
      >
        No employees
      </Typography>
    );
  }

  return (
    <Tooltip
      title={
        <Box sx={{ whiteSpace: "pre-line" }}>
          {tooltipContent}
        </Box>
      }
      placement="top"
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.text.secondary,
          userSelect: "none",
          cursor: "default",
        }}
        aria-label={
          hasActiveFilters
            ? `Showing ${filteredCount} of ${totalCount} employees with active filters`
            : `${totalCount} total employees`
        }
        data-testid="employee-count"
      >
        {displayText}
      </Typography>
    </Tooltip>
  );
};
