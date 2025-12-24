/**
 * EmployeeCount component - Displays filtered and total employee counts
 *
 * Shows "X of Y employees" when filters are active, or "Y employees" when no filters.
 * Includes tooltip with filter breakdown when filters are active.
 */

import React, { useMemo } from "react";
import { Typography, Tooltip, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useEmployees } from "../../hooks/useEmployees";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../../hooks/useFilters";

export const EmployeeCount: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
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
      return `${totalCount} ${t('grid.employeeCount.employee', { count: totalCount })}`;
    }
    return `${filteredCount} ${t('grid.employeeCount.of')} ${totalCount} ${t('grid.employeeCount.employee', { count: totalCount })}`;
  }, [hasActiveFilters, filteredCount, totalCount, t]);

  // Build tooltip content
  const tooltipContent = useMemo(() => {
    if (!hasActiveFilters) {
      return t('grid.employeeCount.totalEmployeesInSession');
    }

    const filterParts: string[] = [
      t('grid.employeeCount.showingCount', { filteredCount, totalCount }), 
      "", 
      t('grid.employeeCount.activeFilters')
    ];

    if (selectedLevels.length > 0) {
      filterParts.push(`  • ${t('grid.employeeCount.jobLevel')}: ${selectedLevels.join(", ")}`);
    }
    if (selectedJobFunctions.length > 0) {
      filterParts.push(`  • ${t('grid.employeeCount.jobFunction')}: ${selectedJobFunctions.join(", ")}`);
    }
    if (selectedLocations.length > 0) {
      filterParts.push(`  • ${t('grid.employeeCount.location')}: ${selectedLocations.join(", ")}`);
    }
    if (selectedManagers.length > 0) {
      filterParts.push(`  • ${t('grid.employeeCount.manager')}: ${selectedManagers.join(", ")}`);
    }
    if (excludedEmployeeIds.length > 0) {
      filterParts.push(`  • ${t('grid.employeeCount.excluded')}: ${excludedEmployeeIds.length} ${t('grid.employeeCount.employee', { count: excludedEmployeeIds.length })}`);
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
    t,
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
        aria-label={t('grid.employeeCount.ariaLabelNoEmployees')}
        data-testid="employee-count"
      >
        {t('grid.employeeCount.noEmployees')}
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
            ? t('grid.employeeCount.ariaLabelFiltered', { filteredCount, totalCount })
            : t('grid.employeeCount.ariaLabel', { count: totalCount })
        }
        data-testid="employee-count"
      >
        {displayText}
      </Typography>
    </Tooltip>
  );
};
