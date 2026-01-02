/**
 * Left sidebar filter panel
 *
 * Comprehensive filtering controls including job levels, functions,
 * locations, managers, flags, and reporting chain filters.
 *
 * @component
 * @screenshots
 *   - filters-panel-expanded: Filter panel expanded showing all filter options
 *   - filters-clear-all-button: Filter drawer with Clear All button highlighted
 *   - calibration-filters-panel: Filters panel with active filter selections applied
 *   - filters-overview: Complete FilterDrawer anatomy showing all sections
 *   - filters-multiple-active: FilterDrawer with multiple filter types active
 *   - filters-flags-section: Flags section showing all 8 flag types with checkboxes
 *   - filters-reporting-chain: Reporting Chain section with active manager filter chip
 *   - details-flag-filtering: FilterDrawer showing Flags section with active selections
 *   - details-reporting-chain-filter-active: Active reporting chain filter in FilterDrawer
 */

import React, { useState, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";
import { useFilters } from "../../hooks/useFilters";
import { useSession } from "../../hooks/useSession";
import { useOrgHierarchy } from "../../hooks/useOrgHierarchy";
import { ExclusionDialog } from "./ExclusionDialog";
import {
  FilterSection,
  FlagFilters,
  OrgTreeFilter,
  ReportingChainFilter,
} from "./filters";

// Helper function to create valid test IDs from values
const sanitizeTestId = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

export const FilterDrawer: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { employees } = useSession();
  const { managers: orgManagers, getReportIds } = useOrgHierarchy(); // Get managers from OrgService
  const {
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    selectedFlags,
    excludedEmployeeIds,
    reportingChainFilter,
    isDrawerOpen,
    toggleLevel,
    toggleJobFunction,
    toggleLocation,
    toggleManager,
    toggleFlag,
    clearReportingChainFilter,
    clearAllFilters,
    toggleDrawer,
    getAvailableOptions,
  } = useFilters();

  const [exclusionDialogOpen, setExclusionDialogOpen] = useState(false);

  /**
   * Handle manager toggle - fetch employee IDs from org service
   * This ensures we use the same backend org hierarchy logic as the intelligence panel
   */
  const handleToggleManager = async (managerName: string) => {
    // Find the manager in the org managers list to get their employee ID
    const manager = orgManagers.find((m) => m.name === managerName);
    if (!manager) {
      console.warn(`Manager "${managerName}" not found in org hierarchy`);
      toggleManager(managerName, []);
      return;
    }

    try {
      // Fetch employee IDs from org service (same as intelligence panel)
      const employeeIds = await getReportIds(manager.employee_id);
      toggleManager(managerName, employeeIds);
    } catch (error) {
      console.error(
        `Failed to fetch employee IDs for manager ${managerName}:`,
        error
      );
      // Fallback to empty array on error
      toggleManager(managerName, []);
    }
  };

  // Track expanded state for each filter section
  const [expandedSections, setExpandedSections] = useState({
    levels: true,
    jobFunctions: true,
    locations: true,
    managers: false,
    flags: false,
    exclusions: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get available filter options from current employee data
  // Memoize to avoid reprocessing on every render (e.g., when drawer opens/closes)
  const filterOptions = useMemo(() => {
    return getAvailableOptions(employees);
  }, [employees, getAvailableOptions]);

  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        data-testid="filter-drawer"
        sx={{
          width: theme.tokens.dimensions.drawer.width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: theme.tokens.dimensions.drawer.width,
            boxSizing: "border-box",
            top: `${theme.tokens.dimensions.appBar.height}px`,
            height: `calc(100% - ${theme.tokens.dimensions.appBar.height}px)`,
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box
          sx={{
            p: theme.tokens.spacing.md / 8, // Convert 16px to MUI spacing units (16/8 = 2)
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: theme.tokens.spacing.md / 8,
            }}
          >
            {" "}
            {/* Convert 16px to 2 */}
            <FilterListIcon sx={{ mr: 1, color: theme.palette.text.primary }} />
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, color: theme.palette.text.primary }}
            >
              {t("dashboard.filterDrawer.title")}
            </Typography>
            <IconButton
              size="small"
              onClick={toggleDrawer}
              data-testid="filter-close-button"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: theme.tokens.spacing.md / 8 }} />{" "}
          {/* Convert 16px to 2 */}
          {/* Scrollable content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {/* Job Levels Section */}
            <FilterSection
              title={t("dashboard.filterDrawer.jobLevels")}
              count={selectedLevels.length}
              expanded={expandedSections.levels}
              onToggle={() => toggleSection("levels")}
              testId="filter-accordion-job-levels"
            >
              <FormGroup>
                {filterOptions.levels.map((level) => (
                  <FormControlLabel
                    key={level}
                    control={
                      <Checkbox
                        checked={selectedLevels.includes(level)}
                        onChange={() => toggleLevel(level)}
                        size="small"
                        data-testid={`filter-checkbox-job-levels-${sanitizeTestId(level)}`}
                      />
                    }
                    label={level}
                  />
                ))}
              </FormGroup>
            </FilterSection>
            {/* Job Functions Section */}
            <FilterSection
              title={t("dashboard.filterDrawer.jobFunctions")}
              count={selectedJobFunctions.length}
              expanded={expandedSections.jobFunctions}
              onToggle={() => toggleSection("jobFunctions")}
              testId="filter-accordion-job-functions"
            >
              <FormGroup>
                {filterOptions.jobFunctions.map((jobFunction) => (
                  <FormControlLabel
                    key={jobFunction}
                    control={
                      <Checkbox
                        checked={selectedJobFunctions.includes(jobFunction)}
                        onChange={() => toggleJobFunction(jobFunction)}
                        size="small"
                        data-testid={`filter-checkbox-job-functions-${sanitizeTestId(jobFunction)}`}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                        {jobFunction}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </FilterSection>
            {/* Locations Section */}
            <FilterSection
              title={t("dashboard.filterDrawer.locations")}
              count={selectedLocations.length}
              expanded={expandedSections.locations}
              onToggle={() => toggleSection("locations")}
              testId="filter-accordion-locations"
            >
              <FormGroup>
                {filterOptions.locations.map((location) => (
                  <FormControlLabel
                    key={location}
                    control={
                      <Checkbox
                        checked={selectedLocations.includes(location)}
                        onChange={() => toggleLocation(location)}
                        size="small"
                        data-testid={`filter-checkbox-locations-${sanitizeTestId(location)}`}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                        {location}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </FilterSection>
            {/* Managers Section - Org Hierarchy Tree */}
            <FilterSection
              title={t("dashboard.filterDrawer.managers")}
              count={selectedManagers.length}
              expanded={expandedSections.managers}
              onToggle={() => toggleSection("managers")}
              testId="filter-accordion-managers"
            >
              <OrgTreeFilter
                managers={orgManagers}
                employees={employees}
                selectedManagers={selectedManagers}
                onToggleManager={handleToggleManager}
              />
            </FilterSection>
            {/* Flags Section */}
            <FilterSection
              title={`🏷️ ${t("dashboard.filterDrawer.flags")}`}
              count={selectedFlags.length}
              expanded={expandedSections.flags}
              onToggle={() => toggleSection("flags")}
              testId="filter-accordion-flags"
            >
              <FlagFilters
                selectedFlags={selectedFlags}
                flagOptions={filterOptions.flags}
                onFlagToggle={toggleFlag}
              />
            </FilterSection>
            <Divider sx={{ my: theme.tokens.spacing.md / 8 }} />{" "}
            {/* Convert 16px to 2 */}
            {/* Reporting Chain Filter Section */}
            {reportingChainFilter && (
              <Box sx={{ mb: theme.tokens.spacing.md / 8 }}>
                {" "}
                {/* Convert 16px to 2 */}
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{
                    color: theme.palette.text.primary,
                    mb: theme.tokens.spacing.sm / 8, // Convert 8px to 1
                  }}
                >
                  {t("dashboard.filterDrawer.reportingChain")}
                </Typography>
                <ReportingChainFilter
                  managerName={reportingChainFilter}
                  onClear={clearReportingChainFilter}
                />
              </Box>
            )}
            {/* Exclusions Section */}
            <FilterSection
              title={t("dashboard.filterDrawer.exclusions")}
              count={excludedEmployeeIds.length}
              expanded={expandedSections.exclusions}
              onToggle={() => toggleSection("exclusions")}
              testId="filter-accordion-exclusions"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => setExclusionDialogOpen(true)}
                  data-testid="exclude-employees-button"
                >
                  {t("dashboard.filterDrawer.excludeEmployees")}
                </Button>
              </Box>
            </FilterSection>
          </Box>
          {/* Footer - Clear All Button */}
          <Box
            sx={{
              pt: theme.tokens.spacing.md / 8,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {" "}
            {/* Convert 16px to 2 */}
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={clearAllFilters}
              data-testid="clear-filter-button"
            >
              {t("dashboard.filterDrawer.clearAllFilters")}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Exclusion Dialog */}
      <ExclusionDialog
        open={exclusionDialogOpen}
        onClose={() => setExclusionDialogOpen(false)}
      />
    </>
  );
};
