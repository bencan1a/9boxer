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
import Badge from "@mui/material/Badge";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

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
  /** Number of active filters */
  activeFilterCount?: number;
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
  activeFilterCount = 0,
  activeFilters = [],
  filteredCount,
  totalCount,
  hasActiveFilters = false,
  onFilterClick,
  onSearchChange,
  disabled = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  // Don't render on small screens
  if (isSmallScreen) {
    return null;
  }

  // Render compact variant (all inline)
  if (variant === "compact") {
    return (
      <Box
        data-testid="filter-toolbar"
        sx={{
          position: "absolute",
          top: 0,
          left: 24,
          zIndex: 10,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          boxShadow: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 0.5,
          maxWidth: "600px",
        }}
      >
        {/* Filter Button with Badge */}
        <Tooltip
          title={t("dashboard.appBar.filters", "Filters")}
          placement="bottom"
        >
          <span>
            <Badge
              badgeContent={activeFilterCount}
              color="warning"
              invisible={!hasActiveFilters}
              data-testid="filter-badge"
            >
              <IconButton
                onClick={onFilterClick}
                disabled={disabled}
                data-testid="filter-button"
                size="small"
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Badge>
          </span>
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

        {/* Filter Info Display */}
        {hasActiveFilters && (
          <Typography
            variant="caption"
            data-testid="filter-info"
            sx={{
              color: theme.palette.text.secondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
            }}
          >
            {filterSummaryText}
          </Typography>
        )}

        {hasActiveFilters && (
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        )}

        {/* Search Box */}
        <TextField
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={t("filters.searchPlaceholder", "Search employees...")}
          size="small"
          disabled={disabled}
          data-testid="search-input"
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />,
          }}
          sx={{
            width: "180px",
            "& .MuiOutlinedInput-root": {
              height: "32px",
              fontSize: "0.875rem",
            },
          }}
        />
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
          top: 0,
          left: 24,
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
          {/* Filter Button with Badge */}
          <Tooltip
            title={t("dashboard.appBar.filters", "Filters")}
            placement="bottom"
          >
            <span>
              <Badge
                badgeContent={activeFilterCount}
                color="warning"
                invisible={!hasActiveFilters}
                data-testid="filter-badge"
              >
                <IconButton
                  onClick={onFilterClick}
                  disabled={disabled}
                  data-testid="filter-button"
                  size="small"
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Badge>
            </span>
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

          {/* Search Box */}
          <TextField
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={t("filters.searchPlaceholder", "Search employees...")}
            size="small"
            disabled={disabled}
            data-testid="search-input"
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />,
            }}
            sx={{
              width: "180px",
              "& .MuiOutlinedInput-root": {
                height: "32px",
                fontSize: "0.875rem",
              },
            }}
          />
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
          top: 0,
          left: 24,
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
          {/* Filter Button with Badge */}
          <Tooltip
            title={t("dashboard.appBar.filters", "Filters")}
            placement="bottom"
          >
            <span>
              <Badge
                badgeContent={activeFilterCount}
                color="warning"
                invisible={!hasActiveFilters}
                data-testid="filter-badge"
              >
                <IconButton
                  onClick={onFilterClick}
                  disabled={disabled}
                  data-testid="filter-button"
                  size="small"
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Badge>
            </span>
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

          {/* Search Box */}
          <TextField
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={t("filters.searchPlaceholder", "Search employees...")}
            size="small"
            disabled={disabled}
            data-testid="search-input"
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />,
            }}
            sx={{
              width: "180px",
              "& .MuiOutlinedInput-root": {
                height: "32px",
                fontSize: "0.875rem",
              },
            }}
          />
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
            top: 0,
            left: 24,
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
          {/* Filter Button with Badge */}
          <Tooltip
            title={t("dashboard.appBar.filters", "Filters")}
            placement="bottom"
          >
            <span>
              <Badge
                badgeContent={activeFilterCount}
                color="warning"
                invisible={!hasActiveFilters}
                data-testid="filter-badge"
              >
                <IconButton
                  onClick={onFilterClick}
                  disabled={disabled}
                  data-testid="filter-button"
                  size="small"
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Badge>
            </span>
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

          {/* Search Box */}
          <TextField
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={t("filters.searchPlaceholder", "Search employees...")}
            size="small"
            disabled={disabled}
            data-testid="search-input"
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />,
            }}
            sx={{
              width: "180px",
              "& .MuiOutlinedInput-root": {
                height: "32px",
                fontSize: "0.875rem",
              },
            }}
          />
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
          top: 0,
          left: 24,
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
          {/* Filter Button with Badge */}
          <Tooltip
            title={t("dashboard.appBar.filters", "Filters")}
            placement="bottom"
          >
            <span>
              <Badge
                badgeContent={activeFilterCount}
                color="warning"
                invisible={!hasActiveFilters}
                data-testid="filter-badge"
              >
                <IconButton
                  onClick={onFilterClick}
                  disabled={disabled}
                  data-testid="filter-button"
                  size="small"
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Badge>
            </span>
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
              <Typography
                variant="caption"
                data-testid="filter-info"
                sx={{
                  color: theme.palette.text.secondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                }}
              >
                {filterSummaryText}
              </Typography>
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
          <TextField
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={t("filters.searchPlaceholder", "Search employees...")}
            size="small"
            disabled={disabled}
            data-testid="search-input"
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />,
            }}
            sx={{
              width: "180px",
              "& .MuiOutlinedInput-root": {
                height: "32px",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>
      </Box>
    );
  }

  // Default fallback (shouldn't reach here)
  return null;
};
