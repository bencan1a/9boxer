/**
 * Application bar component
 */

import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Badge,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../../hooks/useFilters";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { apiClient } from "../../services/api";

export const AppBar: React.FC = () => {
  const { sessionId, employees, filename, changes } = useSessionStore();
  const {
    toggleDrawer,
    hasActiveFilters,
    applyFilters,
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
  } = useFilters();
  const { showSuccess, showError } = useSnackbar();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!sessionId) return;

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

      showSuccess(`Successfully exported ${changes.length} change(s) to ${filename}`);
    } catch (error: any) {
      console.error("Export failed:", error);
      const errorMessage = error.response?.data?.detail || "Failed to export file";
      showError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

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
    } catch (error: any) {
      console.error("Failed to open user guide:", error);
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

  // Get filtered employee count
  const filteredEmployees = applyFilters(employees);
  const displayedCount = filteredEmployees.length;

  // Build employee count label
  const employeeCountLabel =
    hasActiveFilters && displayedCount < employees.length
      ? `${displayedCount} of ${employees.length} employees`
      : `${employees.length} employees`;

  // Check if there are modifications to export
  const hasModifications = changes.length > 0;

  return (
    <>
      <MuiAppBar position="static" elevation={2}>
        <Toolbar>
          {/* Left: App title */}
          <Typography variant="h6" component="div">
            9Boxer
          </Typography>

          {/* Center: Status information */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            {sessionId && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={filename || "Session Active"}
                  color="secondary"
                  size="small"
                  variant="outlined"
                  sx={{ color: "white", borderColor: "white" }}
                />
                <Chip
                  label={employeeCountLabel}
                  color="secondary"
                  size="small"
                  sx={{ color: "white" }}
                  data-testid="employee-count"
                />
              </Box>
            )}
          </Box>

          {/* Right: Action buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                minWidth: "120px", // Reserve space for indicator to prevent shifting
              }}
            >
              <Tooltip title={getFilterTooltip()} placement="bottom">
                <Button
                  color="inherit"
                  startIcon={<FilterListIcon />}
                  disabled={!sessionId}
                  onClick={toggleDrawer}
                  data-testid="filter-button"
                >
                  Filters
                </Button>
              </Tooltip>
              {hasActiveFilters && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#ffa726",
                  }}
                />
              )}
            </Box>

            <Button
              color="inherit"
              startIcon={<UploadFileIcon />}
              onClick={() => setUploadDialogOpen(true)}
              data-testid="upload-button"
            >
              Import
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Button
                color="inherit"
                startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                disabled={!sessionId || !hasModifications || isExporting}
                onClick={handleExport}
                data-testid="export-button"
              >
                {isExporting ? "Exporting..." : "Apply"}
              </Button>
              {hasModifications && (
                <Tooltip title={`${changes.length} change(s) will be applied on export`}>
                  <Chip
                    label={changes.length}
                    size="small"
                    sx={{
                      backgroundColor: "#4caf50",
                      color: "white",
                      height: 20,
                      fontSize: "0.7rem",
                    }}
                  />
                </Tooltip>
              )}
            </Box>

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

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </>
  );
};
