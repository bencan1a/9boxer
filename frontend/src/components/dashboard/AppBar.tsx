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
import FilterListIcon from "@mui/icons-material/FilterList";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../../hooks/useFilters";
import { FileMenu } from "./FileMenu";
import { SettingsDialog } from "../settings/SettingsDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { logger } from "../../utils/logger";
import { LanguageSelector } from "../common/LanguageSelector";
import { useTranslation } from "react-i18next";

export const AppBar: React.FC = () => {
  const { t } = useTranslation();
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
          showError(result.error || t("dashboard.appBar.userGuideError"));
        }
      } else {
        // Fallback for web browser (not typically used)
        showError(t("dashboard.appBar.userGuideOnlyDesktop"));
      }
    } catch (error: unknown) {
      logger.error("Failed to open user guide", error);
      showError(t("dashboard.appBar.userGuideError"));
    }
  };

  // Build filter tooltip message
  const getFilterTooltip = (): string => {
    if (!hasActiveFilters) {
      return t("dashboard.appBar.filterEmployees");
    }

    const filterParts: string[] = [];

    if (selectedLevels.length > 0) {
      filterParts.push(
        `${t("dashboard.appBar.levels")}: ${selectedLevels.join(", ")}`
      );
    }
    if (selectedJobFunctions.length > 0) {
      filterParts.push(
        `${t("dashboard.appBar.functions")}: ${selectedJobFunctions.join(", ")}`
      );
    }
    if (selectedLocations.length > 0) {
      filterParts.push(
        `${t("dashboard.appBar.locations")}: ${selectedLocations.join(", ")}`
      );
    }
    if (selectedManagers.length > 0) {
      filterParts.push(
        `${t("dashboard.appBar.managers")}: ${selectedManagers.join(", ")}`
      );
    }
    if (excludedEmployeeIds.length > 0) {
      filterParts.push(
        `${t("dashboard.appBar.excluded")}: ${excludedEmployeeIds.length} ${t("dashboard.appBar.employees")}`
      );
    }

    return `${t("dashboard.appBar.activeFilters")}\n${filterParts.join("\n")}`;
  };

  return (
    <>
      <MuiAppBar position="static" elevation={2} data-testid="app-bar">
        <Toolbar>
          {/* Left: App title with logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src="/build/icon_32x32.png"
              alt={t("app.logoAlt")}
              style={{ width: 28, height: 28 }}
            />
            <Typography variant="h6" component="div">
              {t("app.title")}
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
                  data-testid="filter-badge"
                  sx={{
                    "& .MuiBadge-badge": {
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

            <Tooltip title={t("dashboard.appBar.settings")}>
              <IconButton
                color="inherit"
                onClick={() => setSettingsDialogOpen(true)}
                data-testid="settings-button"
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={t("dashboard.appBar.help")}>
              <IconButton
                color="inherit"
                onClick={handleOpenHelp}
                data-testid="help-button"
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ ml: 2 }}>
              <LanguageSelector />
            </Box>
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
