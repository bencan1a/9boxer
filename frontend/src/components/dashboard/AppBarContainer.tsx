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
import { LoadSampleDialog } from "../dialogs/LoadSampleDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { apiClient } from "../../services/api";
import { sampleDataService } from "../../services/sampleDataService";
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
  const {
    sessionId,
    filename,
    events,
    employees,
    clearSession,
    loadEmployees,
  } = useSessionStore();
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
  const [loadSampleDialogOpen, setLoadSampleDialogOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle import
  const handleImportClick = () => {
    setFileMenuOpen(false); // Close file menu
    setUploadDialogOpen(true);
  };

  // Handle load sample dataset
  const handleLoadSampleClick = () => {
    setFileMenuOpen(false); // Close file menu
    setLoadSampleDialogOpen(true);
  };

  const handleLoadSampleConfirm = async () => {
    try {
      // Clear existing session if there is one
      if (sessionId) {
        await clearSession();
      }

      // Generate sample data via API (this creates a session automatically)
      const response = await sampleDataService.generateSampleDataset({
        size: 200,
        include_bias: true,
      });

      // Store session ID in localStorage so the backend knows which session to use
      localStorage.setItem("session_id", response.session_id);

      // Reload employees to sync frontend state with the new session
      await loadEmployees();

      // Close dialog and show success message
      setLoadSampleDialogOpen(false);
      showSuccess(
        `Successfully loaded ${response.metadata.total} sample employees`
      );

      logger.info("Sample data loaded", {
        total: response.metadata.total,
        locations: response.metadata.locations,
        functions: response.metadata.functions,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to load sample data", error);
      showError(errorMessage);
      throw error; // Re-throw to let dialog handle error display
    }
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
        isFileMenuOpen={fileMenuOpen}
        onFileMenuToggle={() => setFileMenuOpen(!fileMenuOpen)}
        onImportClick={handleImportClick}
        onLoadSampleClick={handleLoadSampleClick}
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

      <LoadSampleDialog
        open={loadSampleDialogOpen}
        onClose={() => setLoadSampleDialogOpen(false)}
        onConfirm={handleLoadSampleConfirm}
        hasExistingData={employees.length > 0}
      />
    </>
  );
};
