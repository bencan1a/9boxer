/**
 * File menu button component
 * Provides a dropdown menu for file operations (import, export, recent files)
 */

import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import { useTranslation } from "react-i18next";
import { ChangeIndicator } from "./ChangeIndicator";
import { FileNameDisplay } from "./FileNameDisplay";

/**
 * Recent file entry
 */
export interface RecentFile {
  /** File path */
  path: string;
  /** Display name */
  name: string;
  /** Last accessed timestamp */
  lastAccessed: number;
}

/**
 * Props for the FileMenuButton component
 */
export interface FileMenuButtonProps {
  /** The name of the currently loaded file */
  fileName?: string;
  /** Number of unsaved changes */
  changeCount: number;
  /** Whether the menu is currently open */
  isOpen?: boolean;
  /** Callback when the menu should be toggled */
  onToggle?: () => void;
  /** Callback when import is clicked */
  onImportClick: () => void;
  /** Callback when load sample dataset is clicked */
  onLoadSampleClick: () => void;
  /** Callback when export is clicked */
  onExportClick: () => void;
  /** Recent files to display */
  recentFiles?: RecentFile[];
  /** Callback when a recent file is clicked */
  onRecentFileClick?: (filePath: string) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether export is currently in progress */
  isExporting?: boolean;
}

/**
 * FileMenuButton component
 *
 * A button with dropdown menu for file operations.
 * Shows file name with change indicator badge.
 *
 * @example
 * ```tsx
 * <FileMenuButton
 *   fileName="employees.xlsx"
 *   changeCount={3}
 *   onImportClick={() => console.log('import')}
 *   onExportClick={() => console.log('export')}
 * />
 * ```
 */
export const FileMenuButton: React.FC<FileMenuButtonProps> = ({
  fileName,
  changeCount,
  isOpen: controlledIsOpen,
  onToggle,
  onImportClick,
  onLoadSampleClick,
  onExportClick,
  recentFiles = [],
  onRecentFileClick,
  disabled = false,
  isExporting = false,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : Boolean(anchorEl);
  const hasChanges = changeCount > 0;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Always capture the button element for menu anchoring,
    // even when the open state is controlled via onToggle.
    setAnchorEl(event.currentTarget);

    if (onToggle) {
      onToggle();
    }
  };

  const handleClose = () => {
    if (onToggle) {
      onToggle();
    } else {
      setAnchorEl(null);
    }
  };

  const handleImportClick = () => {
    handleClose();
    onImportClick();
  };

  const handleLoadSampleClick = () => {
    handleClose();
    onLoadSampleClick();
  };

  const handleExportClick = () => {
    handleClose();
    onExportClick();
  };

  const handleRecentFileClick = (filePath: string) => {
    handleClose();
    if (onRecentFileClick) {
      onRecentFileClick(filePath);
    }
  };

  // Build ARIA label
  const ariaLabel = fileName
    ? t("dashboard.fileMenu.fileMenuAriaLabel", {
        filename: fileName,
        count: changeCount,
      })
    : t("dashboard.fileMenu.fileMenuAriaLabelNoFile");

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <ChangeIndicator
          count={changeCount}
          invisible={!hasChanges}
          testId="file-menu-badge"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "success.main",
              color: "success.contrastText",
            },
          }}
        >
          <Button
            color="inherit"
            startIcon={<FolderOpenIcon />}
            endIcon={<ExpandMoreIcon />}
            onClick={handleClick}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-controls={isOpen ? "file-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isOpen ? "true" : undefined}
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
            <FileNameDisplay
              fileName={fileName}
              hasUnsavedChanges={hasChanges}
            />
          </Button>
        </ChangeIndicator>
      </Box>

      <Menu
        id="file-menu"
        anchorEl={anchorEl}
        open={isOpen}
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
            : t("dashboard.fileMenu.exportChanges", { count: changeCount })}
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => handleRecentFileClick("")}
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
    </>
  );
};
