/**
 * Left sidebar filter panel
 */

import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useFilters } from "../../hooks/useFilters";
import { useSession } from "../../hooks/useSession";
import { ExclusionDialog } from "./ExclusionDialog";

const DRAWER_WIDTH = 280;

export const FilterDrawer: React.FC = () => {
  const { employees } = useSession();
  const {
    selectedLevels,
    selectedManagers,
    selectedChainLevels,
    excludedEmployeeIds,
    isDrawerOpen,
    toggleLevel,
    toggleManager,
    toggleChainLevel,
    clearAllFilters,
    toggleDrawer,
    getAvailableOptions,
  } = useFilters();

  const [exclusionDialogOpen, setExclusionDialogOpen] = useState(false);

  // Get available filter options from current employee data
  const filterOptions = getAvailableOptions(employees);

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={isDrawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            top: "64px", // Height of AppBar
            height: "calc(100% - 64px)",
          },
        }}
      >
        <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Filters
            </Typography>
            <IconButton size="small" onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Scrollable content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {/* Job Levels Section */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Job Levels
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
              {filterOptions.levels.map((level) => (
                <FormControlLabel
                  key={level}
                  control={
                    <Checkbox
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                      size="small"
                    />
                  }
                  label={level}
                />
              ))}
            </FormGroup>

            <Divider sx={{ mb: 2 }} />

            {/* Managers Section */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Managers
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
              {filterOptions.managers.map((manager) => (
                <FormControlLabel
                  key={manager}
                  control={
                    <Checkbox
                      checked={selectedManagers.includes(manager)}
                      onChange={() => toggleManager(manager)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                      {manager}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>

            <Divider sx={{ mb: 2 }} />

            {/* Management Chain Section */}
            {filterOptions.chainLevels.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Management Chain
                </Typography>
                <FormGroup sx={{ mb: 3 }}>
                  {filterOptions.chainLevels.map((level) => (
                    <FormControlLabel
                      key={level}
                      control={
                        <Checkbox
                          checked={selectedChainLevels.includes(level)}
                          onChange={() => toggleChainLevel(level)}
                          size="small"
                        />
                      }
                      label={`Level ${level}`}
                    />
                  ))}
                </FormGroup>

                <Divider sx={{ mb: 2 }} />
              </>
            )}

            {/* Exclusions Section */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Exclusions
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setExclusionDialogOpen(true)}
              >
                Exclude Employees
              </Button>
            </Box>
            {excludedEmployeeIds.length > 0 && (
              <Chip
                label={`${excludedEmployeeIds.length} excluded`}
                color="warning"
                size="small"
                sx={{ mb: 2 }}
              />
            )}
          </Box>

          {/* Footer - Clear All Button */}
          <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={clearAllFilters}
            >
              Clear All Filters
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
