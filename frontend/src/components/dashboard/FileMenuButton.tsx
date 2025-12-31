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
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
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
  /** Whether sample data has been loaded but not yet saved */
  hasSampleData?: boolean;
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
  /** Callback when close file is clicked */
  onCloseFile?: () => void;
  /** Callback when clear recent files is clicked */
  onClearRecentFiles?: () => void;
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
  hasSampleData = false,
  isOpen: controlledIsOpen,
  onToggle,
  onImportClick,
  onLoadSampleClick,
  onExportClick,
  recentFiles = [],
  onRecentFileClick,
  onCloseFile,
  onClearRecentFiles,
  disabled = false,
  isExporting = false,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : Boolean(anchorEl);
  const hasChanges = changeCount > 0;
  const showSampleDataBadge = hasSampleData && changeCount === 0;

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

  const handleCloseFileClick = () => {
    handleClose();
    if (onCloseFile) {
      onCloseFile();
    }
  };

  const handleClearRecentFilesClick = () => {
    handleClose();
    if (onClearRecentFiles) {
      onClearRecentFiles();
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
          showDot={showSampleDataBadge}
          invisible={!hasChanges && !showSampleDataBadge}
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
        {/* Group 1: File Input Actions */}
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
          {t("dashboard.fileMenu.loadSampleDataset", "Load Sample Dataset...")}
        </MenuItem>

        {/* Divider: Separates input actions from file management */}
        {(hasChanges || hasSampleData || fileName) && <Divider />}

        {/* Group 2: File Management Actions (conditional) */}
        {hasChanges && (
          <MenuItem
            onClick={handleExportClick}
            disabled={isExporting}
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
        )}

        {showSampleDataBadge && (
          <MenuItem
            onClick={handleExportClick}
            disabled={isExporting}
            data-testid="save-sample-data-menu-item"
          >
            {isExporting ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
            )}
            {isExporting
              ? t("dashboard.fileMenu.exporting")
              : t("dashboard.fileMenu.saveSampleData")}
          </MenuItem>
        )}

        {fileName && (
          <MenuItem
            onClick={handleCloseFileClick}
            data-testid="close-file-menu-item"
          >
            <CloseIcon sx={{ mr: 1 }} fontSize="small" />
            {t("dashboard.fileMenu.closeFile", "Close File")}
          </MenuItem>
        )}

        {/* Group 3: Recent Files (conditional) */}
        {recentFiles && recentFiles.length > 0 && (
          <>
            {/* Only show divider if there are file management items above */}
            {(hasChanges || hasSampleData || fileName) && <Divider />}

            <ListSubheader sx={{ lineHeight: "32px" }}>
              {t("dashboard.fileMenu.recentFiles", "Recent Files")}
            </ListSubheader>

            {recentFiles.slice(0, 5).map((file) => (
              <MenuItem
                key={file.path}
                onClick={() => handleRecentFileClick(file.path)}
                data-testid={`recent-file-${file.name}`}
              >
                <ListItemIcon>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={new Date(file.lastAccessed).toLocaleDateString()}
                  primaryTypographyProps={{ noWrap: true }}
                />
              </MenuItem>
            ))}

            {onClearRecentFiles && (
              <>
                <Divider />
                <MenuItem
                  onClick={handleClearRecentFilesClick}
                  data-testid="clear-recent-files-menu-item"
                >
                  <DeleteSweepIcon sx={{ mr: 1 }} fontSize="small" />
                  {t(
                    "dashboard.fileMenu.clearRecentFiles",
                    "Clear Recent Files"
                  )}
                </MenuItem>
              </>
            )}
          </>
        )}
      </Menu>
    </>
  );
};
