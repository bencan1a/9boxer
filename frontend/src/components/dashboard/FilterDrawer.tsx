/**
 * Left sidebar filter panel
 */

import React, { useState, useMemo } from "react";
import {
  Drawer,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { useFilters } from "../../hooks/useFilters";
import { useSession } from "../../hooks/useSession";
import { ExclusionDialog } from "./ExclusionDialog";

const DRAWER_WIDTH = 280;

// Helper function to create valid test IDs from values
const sanitizeTestId = (value: string): string => {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

export const FilterDrawer: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { employees } = useSession();
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
    clearAllFilters,
    toggleDrawer,
    getAvailableOptions,
  } = useFilters();

  const [exclusionDialogOpen, setExclusionDialogOpen] = useState(false);

  // Get available filter options from current employee data
  // Memoize to avoid reprocessing on every render (e.g., when drawer opens/closes)
  const filterOptions = useMemo(() => {
    return getAvailableOptions(employees);
  }, [employees]);

  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        data-testid="filter-drawer"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            top: "64px", // Height of AppBar
            height: "calc(100% - 64px)",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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

          <Divider sx={{ mb: 2 }} />

          {/* Scrollable content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {/* Job Levels Section */}
            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              data-testid="filter-accordion-job-levels"
              sx={{
                backgroundColor: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("dashboard.filterDrawer.jobLevels")}
                  {selectedLevels.length > 0 && (
                    <Chip
                      label={selectedLevels.length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
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
              </AccordionDetails>
            </Accordion>

            {/* Job Functions Section */}
            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              data-testid="filter-accordion-job-functions"
              sx={{
                backgroundColor: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("dashboard.filterDrawer.jobFunctions")}
                  {selectedJobFunctions.length > 0 && (
                    <Chip
                      label={selectedJobFunctions.length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
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
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {jobFunction}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Locations Section */}
            <Accordion
              defaultExpanded
              disableGutters
              elevation={0}
              data-testid="filter-accordion-locations"
              sx={{
                backgroundColor: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("dashboard.filterDrawer.locations")}
                  {selectedLocations.length > 0 && (
                    <Chip
                      label={selectedLocations.length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
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
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {location}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            {/* Managers Section */}
            <Accordion
              disableGutters
              elevation={0}
              data-testid="filter-accordion-managers"
              sx={{
                backgroundColor: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("dashboard.filterDrawer.managers")}
                  {selectedManagers.length > 0 && (
                    <Chip
                      label={selectedManagers.length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <FormGroup>
                  {filterOptions.managers.map((manager) => (
                    <FormControlLabel
                      key={manager}
                      control={
                        <Checkbox
                          checked={selectedManagers.includes(manager)}
                          onChange={() => toggleManager(manager)}
                          size="small"
                          data-testid={`filter-checkbox-managers-${sanitizeTestId(manager)}`}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {manager}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 2 }} />

            {/* Exclusions Section */}
            <Accordion
              disableGutters
              elevation={0}
              data-testid="filter-accordion-exclusions"
              sx={{
                backgroundColor: "transparent",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("dashboard.filterDrawer.exclusions")}
                  {excludedEmployeeIds.length > 0 && (
                    <Chip
                      label={excludedEmployeeIds.length}
                      size="small"
                      color="warning"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
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
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Footer - Clear All Button */}
          <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
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
