/**
 * Filter Toolbar Component
 *
 * Provides filtering controls positioned to the left of the 9-box grid axis.
 * Includes filter button with badge, employee count, active filters display, and search.
 * Modeled after ViewControls/ZoomControls UX patterns.
 *
 * @component
 * @screenshots
 *   - filter-toolbar-compact: Compact variant with all elements inline
 */

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import { Employee } from "../../types/employee";
import {
  useEmployeeSearch,
  EmployeeSearchResult,
} from "../../hooks/useEmployeeSearch";
import { SearchHighlight } from "./SearchHighlight";
import { useDebounced } from "../../hooks/useDebounced";

/**
 * Active filter information
 */
export interface ActiveFilter {
  type: string;
  label: string;
  values: string[];
}

/**
 * Props for FilterToolbar component
 */
export interface FilterToolbarProps {
  /** List of active filters with details */
  activeFilters?: ActiveFilter[];
  /** Number of filtered employees */
  filteredCount: number;
  /** Total number of employees */
  totalCount: number;
  /** Whether filters are active */
  hasActiveFilters?: boolean;
  /** Callback when filter button is clicked */
  onFilterClick: () => void;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Callback when an employee is selected from search */
  onEmployeeSelect?: (employeeId: number | undefined) => void;
  /** List of employees to search through (filtered list) */
  employees?: Employee[];
  /** Whether the toolbar is disabled */
  disabled?: boolean;
}

/**
 * FilterToolbar Component
 *
 * A toolbar for filtering controls positioned to the left of the grid axis.
 */
export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  activeFilters = [],
  filteredCount,
  totalCount,
  hasActiveFilters = false,
  onFilterClick,
  onSearchChange,
  onEmployeeSelect,
  employees = [],
  disabled = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");

  // Debounce search input to prevent excessive search operations
  const debouncedSearchValue = useDebounced(searchValue, 300);

  // Initialize employee search with fuzzy matching
  const { search, isReady, error } = useEmployeeSearch({
    employees,
    threshold: 0.3,
    resultLimit: 10,
  });

  // Perform search and memoize results with match data
  const searchResults = useMemo(() => {
    if (!debouncedSearchValue || !isReady) return [];
    return search(debouncedSearchValue);
  }, [debouncedSearchValue, isReady, search]);

  // Collapse state for compact variant (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem("filterToolbarCollapsed");
      return stored === "true";
    } catch {
      return false; // Default to expanded if localStorage unavailable
    }
  });

  // Hide on small screens (< 600px width)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Build employee count text
  const employeeCountText = useMemo(() => {
    if (!hasActiveFilters || filteredCount === totalCount) {
      return `${totalCount}`;
    }
    return `${filteredCount} ${t("grid.employeeCount.of")} ${totalCount}`;
  }, [hasActiveFilters, filteredCount, totalCount, t]);

  // Build filter summary text
  const filterSummaryText = useMemo(() => {
    if (!hasActiveFilters || activeFilters.length === 0) {
      return t("filters.noActiveFilters", "No filters active");
    }
    const parts = activeFilters.map((filter) => {
      const valueText =
        filter.values.length > 2
          ? `${filter.values.slice(0, 2).join(", ")} +${filter.values.length - 2}`
          : filter.values.join(", ");
      return `${filter.label}: ${valueText}`;
    });
    return parts.join(" • ");
  }, [hasActiveFilters, activeFilters, t]);

  // Memoized employee search autocomplete (used in all variants to eliminate duplication)
  const employeeSearchAutocomplete = useMemo(() => {
    // Show error message if search initialization failed
    if (error) {
      return (
        <Alert
          severity="error"
          sx={{
            py: 0,
            fontSize: "0.75rem",
            "& .MuiAlert-message": {
              fontSize: "0.75rem",
            },
          }}
          data-testid="employee-search-error"
        >
          {t("filters.searchUnavailable", "Search unavailable")}:{" "}
          {error.message}
        </Alert>
      );
    }

    return (
      <Autocomplete<EmployeeSearchResult>
        options={searchResults}
        getOptionLabel={(option) => option.employee.name}
        filterOptions={(options) => options} // No additional filtering - already filtered by fuzzy search
        onChange={(_, value) => {
          if (onEmployeeSelect) {
            onEmployeeSelect(value?.employee.employee_id);
          }
        }}
        inputValue={searchValue}
        onInputChange={(_, newValue) => {
          setSearchValue(newValue);
          if (onSearchChange) {
            onSearchChange(newValue);
          }
        }}
        size="small"
        disabled={disabled || !isReady}
        data-testid="employee-search-autocomplete"
        noOptionsText={t("filters.noEmployeesFound", "No employees found")}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t("filters.searchPlaceholder", "Search employees...")}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, result) => {
          const { key, ...otherProps } =
            props as React.HTMLAttributes<HTMLLIElement> & { key: string };

          // Extract match indices for each field
          const nameMatches = result.matches?.find(
            (m) => m.key === "name"
          )?.indices;
          const levelMatches = result.matches?.find(
            (m) => m.key === "job_level"
          )?.indices;
          const managerMatches = result.matches?.find(
            (m) => m.key === "manager"
          )?.indices;

          return (
            <li key={key} {...otherProps}>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Typography variant="body2">
                  <SearchHighlight
                    text={result.employee.name}
                    matches={nameMatches}
                  />
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <SearchHighlight
                    text={result.employee.job_level}
                    matches={levelMatches}
                  />{" "}
                  •{" "}
                  <SearchHighlight
                    text={result.employee.manager}
                    matches={managerMatches}
                  />
                </Typography>
              </Box>
            </li>
          );
        }}
        sx={{
          width: "180px",
          "& .MuiOutlinedInput-root": {
            height: "32px",
            fontSize: "0.875rem",
            paddingTop: "0px",
            paddingBottom: "0px",
          },
          "& .MuiAutocomplete-input": {
            padding: "0px 4px",
          },
        }}
      />
    );
  }, [
    searchResults,
    searchValue,
    disabled,
    isReady,
    onEmployeeSelect,
    onSearchChange,
    t,
    error,
  ]);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    try {
      localStorage.setItem("filterToolbarCollapsed", String(newState));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  };

  // Don't render on small screens
  if (isSmallScreen) {
    return null;
  }

  return (
    <Box
      data-testid="filter-toolbar"
      sx={{
        position: "absolute",
        top: `-${theme.tokens.dimensions.gridContainer.padding}px`,
        left: 0,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 0.5,
        maxWidth: isCollapsed ? "auto" : "600px",
        transition: theme.transitions.create(["max-width"], {
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      {/* Filter Button with highlight when active */}
      <Tooltip
        title={t("dashboard.appBar.filters", "Filters")}
        placement="bottom"
      >
        <IconButton
          onClick={onFilterClick}
          disabled={disabled}
          data-testid="filter-button"
          size="small"
          sx={{
            borderRadius: 1,
            border: "1px solid",
            borderColor: hasActiveFilters ? "secondary.main" : "divider",
            backgroundColor: hasActiveFilters
              ? "secondary.main"
              : "transparent",
            color: hasActiveFilters ? "secondary.contrastText" : "inherit",
            "&:hover": {
              backgroundColor: hasActiveFilters
                ? "secondary.dark"
                : "action.hover",
              borderColor: hasActiveFilters ? "secondary.dark" : "divider",
            },
          }}
        >
          <FilterListIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Collapsible Content */}
      <Collapse
        in={!isCollapsed}
        orientation="horizontal"
        timeout={theme.transitions.duration.standard}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Employee Count */}
          <Typography
            variant="caption"
            data-testid="employee-count"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.secondary,
              whiteSpace: "nowrap",
            }}
          >
            {employeeCountText}
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Filter Info Display */}
          {hasActiveFilters && (
            <Tooltip
              title={
                <Box sx={{ py: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}
                  >
                    {t("filters.activeFilters", "Active Filters")}
                  </Typography>
                  {activeFilters.map((filter, index) => (
                    <Box key={index} sx={{ mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "bold", display: "block" }}
                      >
                        {filter.label}:
                      </Typography>
                      <Typography variant="caption" sx={{ pl: 1 }}>
                        {filter.values.join(", ")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              }
              placement="bottom"
            >
              <Typography
                variant="caption"
                data-testid="filter-info"
                sx={{
                  color: theme.palette.text.secondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "200px",
                  cursor: "help",
                }}
              >
                {filterSummaryText}
              </Typography>
            </Tooltip>
          )}

          {hasActiveFilters && (
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          )}

          {/* Employee Search Autocomplete */}
          {employeeSearchAutocomplete}
        </Box>
      </Collapse>

      {/* Toggle Collapse/Expand Button */}
      <Tooltip
        title={
          isCollapsed
            ? t("filters.expandToolbar", "Expand toolbar")
            : t("filters.collapseToolbar", "Collapse toolbar")
        }
        placement="bottom"
      >
        <IconButton
          onClick={handleToggleCollapse}
          size="small"
          data-testid="toolbar-toggle-button"
          sx={{
            ml: isCollapsed ? 0 : 0.5,
            px: 0.25,
            minWidth: "auto",
            flexShrink: 0,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              borderColor: "divider",
            },
          }}
        >
          {isCollapsed ? (
            <ChevronRightIcon fontSize="small" />
          ) : (
            <ChevronLeftIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
