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
 *   - filter-toolbar-expandable: Expandable variant with collapsible info
 *   - filter-toolbar-chips: Chip-based variant showing active filters as chips
 *   - filter-toolbar-dropdown: Dropdown variant with filter details in menu
 *   - filter-toolbar-split: Split variant separating filter controls from search
 */

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import { Employee } from "../../types/employee";
import { useEmployeeSearch } from "../../hooks/useEmployeeSearch";

/**
 * Display variant for the filter toolbar
 */
export type FilterToolbarVariant =
  | "compact"
  | "expandable"
  | "chips"
  | "dropdown"
  | "split";

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
  /** Display variant of the toolbar */
  variant?: FilterToolbarVariant;
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
 * Supports multiple display variants for different UX approaches.
 */
export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  variant = "compact",
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Initialize employee search with fuzzy matching
  const { search, isReady, error } = useEmployeeSearch({
    employees,
    threshold: 0.3,
    resultLimit: 10,
  });

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
      return `${totalCount} ${t("grid.employeeCount.employee", { count: totalCount })}`;
    }
    return `${filteredCount} ${t("grid.employeeCount.of")} ${totalCount} ${t("grid.employeeCount.employee", { count: totalCount })}`;
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
      <Autocomplete<Employee>
        options={employees}
        getOptionLabel={(option) => option.name}
        filterOptions={(_, { inputValue }) => {
          // Use fuzzy search instead of default filtering
          if (!inputValue || !isReady) return [];
          return search(inputValue);
        }}
        onChange={(_, value) => {
          if (onEmployeeSelect) {
            onEmployeeSelect(value?.employee_id);
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
        renderOption={(props, employee) => {
          const { key, ...otherProps } =
            props as React.HTMLAttributes<HTMLLIElement> & { key: string };
          return (
            <li key={key} {...otherProps}>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                <Typography variant="body2">{employee.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {employee.job_level} • {employee.manager}
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
    employees,
    search,
    isReady,
    searchValue,
    disabled,
    onEmployeeSelect,
    onSearchChange,
    t,
    error,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleInfoClick = (event: React.MouseEvent<HTMLElement>) => {
    if (variant === "dropdown") {
      setAnchorEl(event.currentTarget);
    } else if (variant === "expandable") {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  // Render compact variant (all inline with collapse/expand)
  if (variant === "compact") {
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
  }

  // Render expandable variant (info expands on click)
  if (variant === "expandable") {
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
          flexDirection: "column",
          maxWidth: "500px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
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

          {/* Info Toggle Button */}
          {hasActiveFilters && (
            <>
              <Tooltip
                title={
                  isExpanded
                    ? t("filters.hideDetails", "Hide details")
                    : t("filters.showDetails", "Show details")
                }
              >
                <IconButton
                  onClick={handleInfoClick}
                  size="small"
                  data-testid="info-toggle-button"
                >
                  {isExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            </>
          )}

          {/* Employee Search Autocomplete */}
          {employeeSearchAutocomplete}
        </Box>

        {/* Expandable Filter Details */}
        <Collapse in={isExpanded}>
          <Box
            sx={{
              p: 1,
              pt: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            {activeFilters.map((filter, index) => (
              <Typography
                key={index}
                variant="caption"
                sx={{
                  display: "block",
                  color: theme.palette.text.secondary,
                  mb: 0.5,
                }}
              >
                <strong>{filter.label}:</strong> {filter.values.join(", ")}
              </Typography>
            ))}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // Render chips variant (active filters as dismissible chips)
  if (variant === "chips") {
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
          flexDirection: "column",
          maxWidth: "600px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
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

          {/* Employee Search Autocomplete */}
          {employeeSearchAutocomplete}
        </Box>

        {/* Filter Chips */}
        {hasActiveFilters && activeFilters.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              p: 0.5,
              pt: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            {activeFilters.map((filter, index) =>
              filter.values.map((value, valueIndex) => (
                <Chip
                  key={`${index}-${valueIndex}`}
                  label={`${filter.label}: ${value}`}
                  size="small"
                  onDelete={() => {
                    /* TODO: wire up delete handler */
                  }}
                  deleteIcon={<CloseIcon />}
                  sx={{
                    fontSize: "0.75rem",
                    height: "24px",
                  }}
                />
              ))
            )}
          </Box>
        )}
      </Box>
    );
  }

  // Render dropdown variant (filter details in menu)
  if (variant === "dropdown") {
    return (
      <>
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

          {/* Info Button (opens dropdown) */}
          {hasActiveFilters && (
            <>
              <Tooltip
                title={t("filters.viewActiveFilters", "View active filters")}
              >
                <IconButton
                  onClick={handleInfoClick}
                  size="small"
                  data-testid="info-button"
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            </>
          )}

          {/* Employee Search Autocomplete */}
          {employeeSearchAutocomplete}
        </Box>

        {/* Filter Details Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          data-testid="filter-menu"
        >
          {activeFilters.map((filter, index) => (
            <MenuItem key={index} disabled>
              <Box>
                <Typography variant="caption" fontWeight="bold">
                  {filter.label}
                </Typography>
                <Typography variant="caption" display="block">
                  {filter.values.join(", ")}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Render split variant (filter button and count separate from search)
  if (variant === "split") {
    return (
      <Box
        data-testid="filter-toolbar"
        sx={{
          position: "absolute",
          top: `-${theme.tokens.dimensions.gridContainer.padding}px`,
          left: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Left Group: Filter controls */}
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 0.5,
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

          {/* Filter Info (if active) */}
          {hasActiveFilters && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
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
                    maxWidth: "150px",
                    cursor: "help",
                  }}
                >
                  {filterSummaryText}
                </Typography>
              </Tooltip>
            </>
          )}
        </Box>

        {/* Right Group: Search */}
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: 3,
            p: 0.5,
          }}
        >
          {employeeSearchAutocomplete}
        </Box>
      </Box>
    );
  }

  // Default fallback (shouldn't reach here)
  return null;
};
