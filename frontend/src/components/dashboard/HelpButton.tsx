/**
 * Help button component
 * Provides help menu with user guide and about options
 */

import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import InfoIcon from "@mui/icons-material/Info";
import { useTranslation } from "react-i18next";

/**
 * Props for the HelpButton component
 */
export interface HelpButtonProps {
  /** Whether the menu is currently open */
  isOpen?: boolean;
  /** Callback when the menu should be toggled */
  onToggle?: () => void;
  /** Callback when user guide is clicked */
  onUserGuideClick: () => void;
  /** Callback when about is clicked */
  onAboutClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * HelpButton component
 * 
 * A button with dropdown menu for help-related actions.
 * 
 * @example
 * ```tsx
 * <HelpButton
 *   onUserGuideClick={() => console.log('guide')}
 *   onAboutClick={() => console.log('about')}
 * />
 * ```
 */
export const HelpButton: React.FC<HelpButtonProps> = ({
  isOpen: controlledIsOpen,
  onToggle,
  onUserGuideClick,
  onAboutClick,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onToggle) {
      onToggle();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    if (onToggle) {
      onToggle();
    } else {
      setAnchorEl(null);
    }
  };

  const handleUserGuideClick = () => {
    handleClose();
    onUserGuideClick();
  };

  const handleAboutClick = () => {
    handleClose();
    onAboutClick();
  };

  return (
    <>
      <Tooltip title={t("dashboard.appBar.help")}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          disabled={disabled}
          aria-label={t("dashboard.appBar.help")}
          aria-controls={isOpen ? "help-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isOpen ? "true" : undefined}
          data-testid="help-button"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id="help-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "help-button",
        }}
        data-testid="help-menu"
      >
        <MenuItem
          onClick={handleUserGuideClick}
          data-testid="user-guide-menu-item"
        >
          <MenuBookIcon sx={{ mr: 1 }} fontSize="small" />
          {t("dashboard.appBar.userGuide")}
        </MenuItem>

        <MenuItem
          onClick={handleAboutClick}
          data-testid="about-menu-item"
        >
          <InfoIcon sx={{ mr: 1 }} fontSize="small" />
          {t("dashboard.appBar.about")}
        </MenuItem>
      </Menu>
    </>
  );
};
