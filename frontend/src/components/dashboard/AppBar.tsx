/**
 * Application bar component
 */

import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../../hooks/useFilters";
import { FileMenu } from "./FileMenu";
import { SettingsDialog } from "../settings/SettingsDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { logger } from "../../utils/logger";

export const AppBar: React.FC = () => {
  const theme = useTheme();
  const { sessionId } = useSessionStore();
  const {
    toggleDrawer,
    hasActiveFilters,
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
  } = useFilters();
  const { showError } = useSnackbar();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const handleOpenHelp = async () => {
    try {
      // Check if running in Electron
      if (window.electronAPI?.openUserGuide) {
        const result = await window.electronAPI.openUserGuide();
        if (!result.success) {
          showError(result.error || "Failed to open user guide");
        }
      } else {
        // Fallback for web browser (not typically used)
        showError("User guide is only available in the desktop application");
      }
    } catch (error: unknown) {
      logger.error('Failed to open user guide', error);
      showError("Failed to open user guide");
    }
  };

  // Build filter tooltip message
  const getFilterTooltip = (): string => {
    if (!hasActiveFilters) {
      return "Filter employees";
    }

    const filterParts: string[] = [];

    if (selectedLevels.length > 0) {
      filterParts.push(`Levels: ${selectedLevels.join(", ")}`);
    }
    if (selectedJobFunctions.length > 0) {
      filterParts.push(`Functions: ${selectedJobFunctions.join(", ")}`);
    }
    if (selectedLocations.length > 0) {
      filterParts.push(`Locations: ${selectedLocations.join(", ")}`);
    }
    if (selectedManagers.length > 0) {
      filterParts.push(`Managers: ${selectedManagers.join(", ")}`);
    }
    if (excludedEmployeeIds.length > 0) {
      filterParts.push(`Excluded: ${excludedEmployeeIds.length} employee(s)`);
    }

    return `Active filters:\n${filterParts.join("\n")}`;
  };

  return (
    <>
      <MuiAppBar position="static" elevation={2}>
        <Toolbar>
          {/* Left: App title with logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src="/build/icon_32x32.png"
              alt="9Boxer logo"
              style={{ width: 28, height: 28 }}
            />
            <Typography variant="h6" component="div">
              9Boxer
            </Typography>
          </Box>

          {/* Center-left: File menu */}
          <Box sx={{ ml: 4 }}>
            <FileMenu />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right: Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={getFilterTooltip()} placement="bottom">
              <span>
                <Badge
                  variant="dot"
                  invisible={!hasActiveFilters}
                  color="warning"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: -3,
                      top: 8,
                    },
                  }}
                >
                  <IconButton
                    color="inherit"
                    disabled={!sessionId}
                    onClick={toggleDrawer}
                    data-testid="filter-button"
                  >
                    <FilterListIcon />
                  </IconButton>
                </Badge>
              </span>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton
                color="inherit"
                onClick={() => setSettingsDialogOpen(true)}
                data-testid="settings-button"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Open User Guide">
              <IconButton
                color="inherit"
                onClick={handleOpenHelp}
                data-testid="help-button"
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </MuiAppBar>

      <SettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
      />
    </>
  );
};
