/**
 * AppBar container component
 * Connects the pure AppBar to application state and handles logic
 */

import React, { useState } from "react";
import { PureAppBar } from "./PureAppBar";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../../hooks/useFilters";
import { SettingsDialog } from "../settings/SettingsDialog";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { apiClient } from "../../services/api";
import { extractErrorMessage } from "../../types/errors";
import { logger } from "../../utils/logger";
import { useTranslation } from "react-i18next";

/**
 * AppBarContainer component
 * 
 * Container component that manages state and connects the pure AppBar
 * to the application's session store and other contexts.
 */
export const AppBarContainer: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId, filename, events } = useSessionStore();
  const {
    toggleDrawer,
    hasActiveFilters,
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
  } = useFilters();
  const { showSuccess, showError } = useSnackbar();

  // Local state for dialogs and menus
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle import
  const handleImportClick = () => {
    setUploadDialogOpen(true);
  };

  // Handle export
  const handleExportClick = async () => {
    if (!sessionId) {
      showError(t("dashboard.fileMenu.noActiveSession"));
      return;
    }

    setIsExporting(true);
    try {
      const blob = await apiClient.exportSession();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `modified_${filename || "employees.xlsx"}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess(
        t("dashboard.fileMenu.exportSuccess", {
          count: events.length,
          filename,
        })
      );
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Export failed", error);
      showError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle help menu
  const handleUserGuideClick = async () => {
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

  const handleAboutClick = () => {
    // Future: Open about dialog
    logger.info("About clicked");
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
      <PureAppBar
        fileName={filename || undefined}
        changeCount={events.length}
        hasActiveFilters={hasActiveFilters}
        filterTooltip={getFilterTooltip()}
        isFilterDisabled={!sessionId}
        isExporting={isExporting}
        onImportClick={handleImportClick}
        onExportClick={handleExportClick}
        onFilterClick={toggleDrawer}
        onSettingsClick={() => setSettingsDialogOpen(true)}
        onUserGuideClick={handleUserGuideClick}
        onAboutClick={handleAboutClick}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
      />

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </>
  );
};
