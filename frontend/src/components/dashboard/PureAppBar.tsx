/**
 * Pure AppBar component (presentational)
 * Displays the application bar with file menu, filter, settings, and help buttons
 *
 * @component
 * @screenshots
 *   - quickstart-file-menu-button: File menu button showing "No file selected" empty state
 *   - view-controls-simplified-appbar: Simplified AppBar showing Logo, File menu, Help, Settings
 *   - view-controls-main-interface: Main dashboard showing AppBar and floating ViewControls
 *   - calibration-file-import: File menu open with Import Data menu item highlighted
 */

import React from "react";
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
import SettingsIcon from "@mui/icons-material/Settings";
import { FileMenuButton, RecentFile } from "./FileMenuButton";
import { HelpButton } from "./HelpButton";
import { Logo } from "../branding/Logo";
import { useTranslation } from "react-i18next";

/**
 * Props for the pure AppBar component
 */
export interface PureAppBarProps {
  /** Current file name, or undefined if no file loaded */
  fileName?: string;
  /** Number of unsaved changes */
  changeCount: number;
  /** Whether the file menu is open */
  isFileMenuOpen?: boolean;
  /** Whether the help menu is open */
  isHelpMenuOpen?: boolean;
  /** Whether there are active filters */
  hasActiveFilters: boolean;
  /** Filter tooltip message */
  filterTooltip: string;
  /** Whether filter button is disabled (no session) */
  isFilterDisabled: boolean;
  /** Whether export is in progress */
  isExporting?: boolean;
  /** Recent files to display */
  recentFiles?: RecentFile[];

  // Callbacks
  /** Callback when file menu toggle is requested */
  onFileMenuToggle?: () => void;
  /** Callback when import is clicked */
  onImportClick: () => void;
  /** Callback when load sample dataset is clicked */
  onLoadSampleClick: () => void;
  /** Callback when export is clicked */
  onExportClick: () => void;
  /** Callback when close file is clicked */
  onCloseFile?: () => void;
  /** Callback when a recent file is clicked */
  onRecentFileClick?: (filePath: string) => void;
  /** Callback when clear recent files is clicked */
  onClearRecentFiles?: () => void;
  /** Callback when filter button is clicked */
  onFilterClick: () => void;
  /** Callback when settings button is clicked */
  onSettingsClick: () => void;
  /** Callback when help menu toggle is requested */
  onHelpMenuToggle?: () => void;
  /** Callback when user guide is clicked */
  onUserGuideClick: () => void;
  /** Callback when about is clicked */
  onAboutClick: () => void;
}

/**
 * Pure AppBar component
 *
 * A presentational component that displays the application toolbar.
 * All state and logic should be managed by the container component.
 *
 * @example
 * ```tsx
 * <PureAppBar
 *   fileName="employees.xlsx"
 *   changeCount={3}
 *   hasActiveFilters={false}
 *   filterTooltip="Filter employees"
 *   isFilterDisabled={false}
 *   onImportClick={() => {}}
 *   onExportClick={() => {}}
 *   onFilterClick={() => {}}
 *   onSettingsClick={() => {}}
 *   onUserGuideClick={() => {}}
 *   onAboutClick={() => {}}
 * />
 * ```
 */
export const PureAppBar: React.FC<PureAppBarProps> = ({
  fileName,
  changeCount,
  isFileMenuOpen,
  isHelpMenuOpen,
  hasActiveFilters,
  filterTooltip,
  isFilterDisabled,
  isExporting = false,
  recentFiles,
  onFileMenuToggle,
  onImportClick,
  onLoadSampleClick,
  onExportClick,
  onCloseFile,
  onRecentFileClick,
  onClearRecentFiles,
  onFilterClick,
  onSettingsClick,
  onHelpMenuToggle,
  onUserGuideClick,
  onAboutClick,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <MuiAppBar position="static" elevation={2} data-testid="app-bar">
      <Toolbar>
        {/* Left: App title with logo - fixed width to prevent overflow */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: theme.tokens.spacing.sm / 8 /* Convert 8px to 1 */,
            flexShrink: 0 /* Prevent shrinking */,
            minWidth: "fit-content",
          }}
        >
          <Logo
            variant="gradient-bordered"
            size={theme.tokens.dimensions.appBar.logoSize}
          />
          <Typography variant="h6" component="div" noWrap>
            {t("app.title")}
          </Typography>
        </Box>

        {/* Center-left: File menu - with responsive margin */}
        <Box
          sx={{
            ml: {
              xs: theme.tokens.spacing.md / 8,
              md: theme.tokens.spacing.xl / 8,
            } /* Convert 16px/32px to 2/4 */,
            flexShrink: 1 /* Allow shrinking */,
            minWidth: 0 /* Allow flex child to shrink below content size */,
          }}
        >
          <FileMenuButton
            fileName={fileName}
            changeCount={changeCount}
            isOpen={isFileMenuOpen}
            onToggle={onFileMenuToggle}
            onImportClick={onImportClick}
            onLoadSampleClick={onLoadSampleClick}
            onExportClick={onExportClick}
            recentFiles={recentFiles}
            onRecentFileClick={onRecentFileClick}
            onCloseFile={onCloseFile}
            onClearRecentFiles={onClearRecentFiles}
            isExporting={isExporting}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right: Action buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: theme.tokens.spacing.sm / 8,
          }}
        >
          {" "}
          {/* Convert 8px to 1 */}
          <Tooltip title={filterTooltip} placement="bottom">
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
                  disabled={isFilterDisabled}
                  onClick={onFilterClick}
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
              onClick={onSettingsClick}
              data-testid="settings-button"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <HelpButton
            isOpen={isHelpMenuOpen}
            onToggle={onHelpMenuToggle}
            onUserGuideClick={onUserGuideClick}
            onAboutClick={onAboutClick}
          />
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};
