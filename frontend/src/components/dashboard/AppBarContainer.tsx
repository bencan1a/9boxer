/**
 * AppBar container component
 * Connects the pure AppBar to application state and handles logic
 */

import React, { useState, useEffect } from "react";
import { PureAppBar } from "./PureAppBar";
import { useSessionStore } from "../../store/sessionStore";
import { useUiStore } from "../../store/uiStore";
import { useFilters } from "../../hooks/useFilters";
import { SettingsDialog } from "../settings/SettingsDialog";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { LoadSampleDialog } from "../dialogs/LoadSampleDialog";
import { ApplyChangesDialog } from "../dialogs/ApplyChangesDialog";
import { UnsavedChangesDialog } from "../dialogs/UnsavedChangesDialog";
import { AboutDialog } from "../dialogs/AboutDialog";
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
    hasSampleData,
    clearSession,
    closeSession,
    loadEmployees,
    uploadFile,
  } = useSessionStore();
  const {
    toggleDrawer,
    hasActiveFilters,
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    selectedFlags,
    excludedEmployeeIds,
  } = useFilters();
  const { showSuccess, showError } = useSnackbar();
  const recentFiles = useUiStore((state) => state.recentFiles);
  const loadRecentFiles = useUiStore((state) => state.loadRecentFiles);
  const clearRecentFiles = useUiStore((state) => state.clearRecentFiles);

  // Local state for dialogs and menus
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loadSampleDialogOpen, setLoadSampleDialogOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [applyChangesDialogOpen, setApplyChangesDialogOpen] = useState(false);
  const [applyError, setApplyError] = useState<string | undefined>(undefined);
  const [isApplying, setIsApplying] = useState(false);
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] =
    useState(false);
  const [pendingAction, setPendingAction] = useState<
    "import" | "sample" | "close" | "recent" | null
  >(null);
  const [pendingRecentFilePath, setPendingRecentFilePath] = useState<
    string | null
  >(null);

  // Load recent files on mount
  useEffect(() => {
    loadRecentFiles();
  }, [loadRecentFiles]);

  // Helper to check for unsaved changes before destructive operations
  const checkUnsavedChanges = (
    action: "import" | "sample" | "close" | "recent",
    recentFilePath?: string
  ): boolean => {
    if (events.length > 0) {
      setPendingAction(action);
      if (recentFilePath) setPendingRecentFilePath(recentFilePath);
      setUnsavedChangesDialogOpen(true);
      return true; // Has unsaved changes
    }
    return false; // No unsaved changes, proceed
  };

  // Handle import
  const handleImportClick = () => {
    if (checkUnsavedChanges("import")) return;
    setFileMenuOpen(false); // Close file menu
    setUploadDialogOpen(true);
  };

  // Handle load sample dataset
  const handleLoadSampleClick = () => {
    if (checkUnsavedChanges("sample")) return;
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

      // Set filename and hasSampleData flag in session store
      useSessionStore.setState({
        filename: response.filename,
        hasSampleData: true,
      });

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

  // Handle export - show ApplyChangesDialog
  const handleExportClick = () => {
    if (!sessionId) {
      showError(t("dashboard.fileMenu.noActiveSession"));
      return;
    }
    setFileMenuOpen(false);
    setApplyChangesDialogOpen(true);
  };

  // Handle apply changes from dialog
  const handleApplyChanges = async (
    mode: "update_original" | "save_new",
    newPath?: string
  ) => {
    setIsApplying(true);
    setApplyError(undefined);

    try {
      // Call new export API with mode
      const response = await apiClient.exportSession({
        mode,
        new_path: newPath,
      });

      if (response.success) {
        // Reload employees and session status to sync with updated backend baseline
        // Backend has cleared events and reset modified flags
        await loadEmployees();

        // Reload session status to get cleared events and updated filename
        const sessionStatus = await apiClient.getSessionStatus();
        useSessionStore.setState({
          events: sessionStatus.events,
          filename: sessionStatus.uploaded_filename,
          filePath: response.file_path, // Update file path from export response
          hasSampleData: false, // Clear flag after successful export
        });

        // Update localStorage with new file path when saving to new location
        if (mode === "save_new" && response.file_path) {
          localStorage.setItem("last_file_path", response.file_path);
        }

        // Show success message
        showSuccess(
          response.message ||
            t("dashboard.fileMenu.exportSuccess", {
              count: events.length,
              filename: filename || "employees.xlsx",
            })
        );

        // Close dialog
        setApplyChangesDialogOpen(false);

        // Execute pending action after successful apply (Issue #114)
        if (pendingAction === "import") {
          setFileMenuOpen(false);
          setUploadDialogOpen(true);
        } else if (pendingAction === "sample") {
          setFileMenuOpen(false);
          setLoadSampleDialogOpen(true);
        } else if (pendingAction === "close") {
          await closeSession();
        } else if (pendingAction === "recent" && pendingRecentFilePath) {
          await loadRecentFile(pendingRecentFilePath);
        }

        // Clear pending state
        setPendingAction(null);
        setPendingRecentFilePath(null);
      } else {
        // Check if backend suggests fallback to save_new mode
        if (response.fallback_to_save_new) {
          // Show error message with fallback suggestion
          setApplyError(response.error || t("dashboard.fileMenu.exportError"));

          // Auto-trigger save dialog after a brief delay for user to read error
          setTimeout(async () => {
            const newPath = await window.electronAPI?.saveFileDialog(
              filename || "employees.xlsx"
            );

            if (newPath) {
              // Retry export with save_new mode
              await handleApplyChanges("save_new", newPath);
            }
          }, 1000);
        } else {
          // Regular error without fallback suggestion
          setApplyError(
            response.error ||
              response.message ||
              t("dashboard.fileMenu.exportError")
          );
        }
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Apply changes failed", error);
      setApplyError(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  // Handle close file
  const handleCloseFile = async () => {
    if (checkUnsavedChanges("close")) return;
    try {
      await closeSession();
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to close file", error);
      showError(errorMessage);
      // Error already set in session store
    }
  };

  // Handle recent file click
  const handleRecentFileClick = async (filePath: string) => {
    if (checkUnsavedChanges("recent", filePath)) return;
    // No unsaved changes, proceed with loading
    setFileMenuOpen(false); // Close menu
    await loadRecentFile(filePath);
  };

  // Handle clear recent files
  const handleClearRecentFiles = async () => {
    try {
      await clearRecentFiles();
      showSuccess(
        t("dashboard.fileMenu.recentFilesCleared", "Recent files cleared")
      );
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to clear recent files", error);
      showError(errorMessage);
    }
  };

  // Handle unsaved changes dialog - Apply Changes
  const handleApplyUnsavedChanges = async () => {
    // Close unsaved changes dialog and open apply changes dialog
    setUnsavedChangesDialogOpen(false);
    setApplyChangesDialogOpen(true);
  };

  // Handle unsaved changes dialog - Discard Changes
  const handleDiscardChanges = async () => {
    setUnsavedChangesDialogOpen(false);
    // Execute the pending action
    if (pendingAction === "import") {
      setFileMenuOpen(false);
      setUploadDialogOpen(true);
    } else if (pendingAction === "sample") {
      setFileMenuOpen(false);
      setLoadSampleDialogOpen(true);
    } else if (pendingAction === "close") {
      await closeSession();
    } else if (pendingAction === "recent" && pendingRecentFilePath) {
      // Load recent file - implemented in Chunk 3C
      await loadRecentFile(pendingRecentFilePath);
    }
    // Clear pending state
    setPendingAction(null);
    setPendingRecentFilePath(null);
  };

  // Load recent file - helper function (Chunk 3C)
  const loadRecentFile = async (filePath: string) => {
    try {
      const fileName = filePath.split(/[\\/]/).pop() || "file.xlsx";

      // Read the file using Electron API (same as FileUploadDialog)
      if (!window.electronAPI?.readFile) {
        showError(t("dashboard.fileMenu.electronApiRequired"));
        return;
      }

      const fileResult = await window.electronAPI.readFile(filePath);
      if (!fileResult.success || !fileResult.buffer || !fileResult.fileName) {
        showError(fileResult.error || t("common.fileUpload.failedToRead"));
        return;
      }

      // Convert buffer to File object (same as FileUploadDialog)
      const uint8Array = new Uint8Array(fileResult.buffer);
      const blob = new Blob([uint8Array], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const file = new File([blob], fileResult.fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Clear existing session
      if (sessionId) {
        await clearSession();
      }

      // Upload file using the normal upload flow (same as FileUploadDialog)
      await uploadFile(file, filePath);

      showSuccess(t("dashboard.fileMenu.fileLoaded", { filename: fileName }));
      logger.info("Recent file loaded", { filePath, fileName });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to load recent file", error);
      showError(errorMessage);
    }
  };

  // Handle unsaved changes dialog - Cancel
  const handleCancelUnsavedChanges = () => {
    setUnsavedChangesDialogOpen(false);
    setPendingAction(null);
    setPendingRecentFilePath(null);
  };

  // Handle help menu
  const handleUserGuideClick = async () => {
    setHelpMenuOpen(false); // Close help menu
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
    setHelpMenuOpen(false); // Close help menu before opening dialog
    setAboutDialogOpen(true);
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
    if (selectedFlags.length > 0) {
      filterParts.push(
        `${t("dashboard.filterDrawer.flags")}: ${selectedFlags.join(", ")}`
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
        hasSampleData={hasSampleData}
        hasActiveFilters={hasActiveFilters}
        filterTooltip={getFilterTooltip()}
        isFilterDisabled={!sessionId}
        isExporting={isApplying}
        isFileMenuOpen={fileMenuOpen}
        isHelpMenuOpen={helpMenuOpen}
        recentFiles={recentFiles}
        onFileMenuToggle={() => setFileMenuOpen(!fileMenuOpen)}
        onHelpMenuToggle={() => setHelpMenuOpen(!helpMenuOpen)}
        onImportClick={handleImportClick}
        onLoadSampleClick={handleLoadSampleClick}
        onExportClick={handleExportClick}
        onCloseFile={handleCloseFile}
        onRecentFileClick={handleRecentFileClick}
        onClearRecentFiles={handleClearRecentFiles}
        onFilterClick={toggleDrawer}
        onSettingsClick={() => setSettingsDialogOpen(true)}
        onUserGuideClick={handleUserGuideClick}
        onAboutClick={handleAboutClick}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
      />

      <AboutDialog
        open={aboutDialogOpen}
        onClose={() => setAboutDialogOpen(false)}
        variant="compact"
        onUserGuideClick={handleUserGuideClick}
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

      <ApplyChangesDialog
        open={applyChangesDialogOpen}
        filename={filename || "employees.xlsx"}
        error={applyError}
        isLoading={isApplying}
        onApply={handleApplyChanges}
        onCancel={() => {
          setApplyChangesDialogOpen(false);
          setApplyError(undefined);
        }}
      />

      <UnsavedChangesDialog
        open={unsavedChangesDialogOpen}
        changeCount={events.length}
        onApply={handleApplyUnsavedChanges}
        onDiscard={handleDiscardChanges}
        onCancel={handleCancelUnsavedChanges}
      />
    </>
  );
};
