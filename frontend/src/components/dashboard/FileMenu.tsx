/**
 * File menu component for file operations
 * Consolidates import and export functionality into a dropdown menu
 */

import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Badge,
  CircularProgress,
  Divider,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import { useSessionStore } from "../../store/sessionStore";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { LoadSampleDialog } from "../dialogs/LoadSampleDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { apiClient } from "../../services/api";
import { sampleDataService } from "../../services/sampleDataService";
import { extractErrorMessage } from "../../types/errors";
import { logger } from "../../utils/logger";
import { useTranslation } from "react-i18next";

/**
 * FileMenu component that provides file operations in a dropdown
 */
export const FileMenu: React.FC = () => {
  console.log(
    "🔍 FileMenu component loaded - Load Sample Dataset should be visible!"
  );
  const theme = useTheme();
  const { t } = useTranslation();
  const { sessionId, filename, events, employees, clearSession } =
    useSessionStore();
  const { showSuccess, showError } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loadSampleDialogOpen, setLoadSampleDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const open = Boolean(anchorEl);
  const hasChanges = events.length > 0;
  const hasExistingData = employees.length > 0;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleImportClick = () => {
    handleClose();
    setUploadDialogOpen(true);
  };

  const handleExportClick = async () => {
    handleClose();

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

  const handleRecentFileClick = () => {
    handleClose();
    // Future enhancement: Implement recent file selection
  };

  const handleLoadSampleClick = () => {
    handleClose();
    setLoadSampleDialogOpen(true);
  };

  const handleLoadSampleConfirm = async () => {
    try {
      // Clear existing session if there is one
      if (sessionId) {
        await clearSession();
      }

      // Generate sample data via API
      // The API endpoint (implemented by Agent B) will create a new session
      // and populate it with sample employees
      const response = await sampleDataService.generateSampleDataset({
        size: 200,
        include_bias: true,
      });

      // After sample data is generated, the backend should have created a session
      // We need to reload the session to get the session ID and employees
      // This will be handled by the session store's restoreSession or similar
      // For now, we'll manually trigger a session reload by calling getSessionStatus
      // and getEmployees to sync the frontend state

      // Note: The exact session handling will depend on Agent B's API implementation
      // The API should return a session_id that we can use to initialize the session
      // For now, we just reload employees which will pick up the new session
      await apiClient.getEmployees();

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

  // Button label based on session state
  const buttonLabel =
    sessionId && filename ? filename : t("dashboard.fileMenu.noFileSelected");

  // Tooltip text includes change indicator if applicable
  const tooltipText = hasChanges && filename ? `${filename} *` : buttonLabel;

  // Build ARIA label
  const ariaLabel = sessionId
    ? t("dashboard.fileMenu.fileMenuAriaLabel", {
        filename,
        count: events.length,
      })
    : t("dashboard.fileMenu.fileMenuAriaLabelNoFile");

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Badge
          badgeContent={hasChanges ? `${events.length}` : 0}
          color="success"
          invisible={!hasChanges}
          data-testid="file-menu-badge"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              fontSize: "0.7rem",
            },
          }}
        >
          <Tooltip title={tooltipText} arrow placement="bottom">
            <Button
              color="inherit"
              startIcon={<FolderOpenIcon />}
              endIcon={<ExpandMoreIcon />}
              onClick={handleClick}
              aria-label={ariaLabel}
              aria-controls={open ? "file-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              data-testid="file-menu-button"
              sx={{
                textTransform: "none",
                minWidth: { xs: "150px", sm: "200px", md: "250px" },
                maxWidth: { xs: "150px", sm: "200px", md: "250px" },
                width: { xs: "150px", sm: "200px", md: "250px" },
                justifyContent: "flex-start", // Left-align content to prevent overflow
                "& .MuiButton-startIcon": {
                  marginRight: 1,
                },
                "& .MuiButton-endIcon": {
                  marginLeft: "auto", // Push end icon to the right
                },
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  minWidth: 0, // Allow flex child to shrink below content size
                  flex: 1, // Take available space
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: sessionId ? 500 : 400,
                    maxWidth: "100%", // Respect parent container width
                  }}
                >
                  {buttonLabel}
                </Typography>
              </Box>
            </Button>
          </Tooltip>
        </Badge>
      </Box>

      <Menu
        id="file-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "file-menu-button",
        }}
        data-testid="file-menu"
      >
        <MenuItem
          onClick={handleImportClick}
          data-testid="import-data-menu-item"
        >
          <UploadFileIcon sx={{ mr: 1 }} fontSize="small" />
          {t("dashboard.fileMenu.importData")}
        </MenuItem>

        <MenuItem
          onClick={handleLoadSampleClick}
          data-testid="load-sample-menu-item"
        >
          <ScienceIcon sx={{ mr: 1 }} fontSize="small" />
          Load Sample Dataset...
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleExportClick}
          disabled={!hasChanges || isExporting}
          data-testid="export-changes-menu-item"
        >
          {isExporting ? (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          ) : (
            <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          )}
          {isExporting
            ? t("dashboard.fileMenu.exporting")
            : t("dashboard.fileMenu.exportChanges", { count: events.length })}
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleRecentFileClick}
          disabled
          data-testid="recent-file-menu-item"
        >
          <HistoryIcon sx={{ mr: 1 }} fontSize="small" />
          {t("dashboard.fileMenu.openRecentFile")}
          <Typography
            variant="caption"
            sx={{ ml: 1, fontStyle: "italic", opacity: 0.6 }}
          >
            {t("dashboard.fileMenu.comingSoon")}
          </Typography>
        </MenuItem>
      </Menu>

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />

      <LoadSampleDialog
        open={loadSampleDialogOpen}
        onClose={() => setLoadSampleDialogOpen(false)}
        onConfirm={handleLoadSampleConfirm}
        hasExistingData={hasExistingData}
      />
    </>
  );
};
