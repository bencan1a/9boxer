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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import { useSessionStore } from "../../store/sessionStore";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { apiClient } from "../../services/api";
import { extractErrorMessage } from "../../types/errors";
import { logger } from "../../utils/logger";
import { useTranslation } from "react-i18next";

/**
 * FileMenu component that provides file operations in a dropdown
 */
export const FileMenu: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { sessionId, filename, changes } = useSessionStore();
  const { showSuccess, showError } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const open = Boolean(anchorEl);
  const hasChanges = changes.length > 0;

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
          count: changes.length,
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

  // Button label based on session state
  const buttonLabel =
    sessionId && filename ? filename : t("dashboard.fileMenu.noFileSelected");

  // Build ARIA label
  const ariaLabel = sessionId
    ? t("dashboard.fileMenu.fileMenuAriaLabel", {
        filename,
        count: changes.length,
      })
    : t("dashboard.fileMenu.fileMenuAriaLabelNoFile");

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Badge
          badgeContent={hasChanges ? `${changes.length}` : 0}
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
              maxWidth: { xs: "150px", sm: "200px", md: "250px" },
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: sessionId ? 500 : 400,
              }}
            >
              {buttonLabel}
            </Typography>
          </Button>
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
            : t("dashboard.fileMenu.exportChanges", { count: changes.length })}
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
    </>
  );
};
