/**
 * Zoom Controls Component
 *
 * Provides zoom in/out/reset controls and full-screen toggle.
 * Positioned in bottom-left of the grid area, hidden on small screens.
 *
 * @component
 * @screenshots
 *   - zoom-controls: Zoom controls showing +/- buttons, percentage, and fullscreen toggle
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  ButtonGroup,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useTranslation } from "react-i18next";
import {
  zoomIn,
  zoomOut,
  resetZoom,
  getCurrentZoomPercentage,
  canZoomIn,
  canZoomOut,
  isAtDefaultZoom,
  saveZoomLevel,
  loadSavedZoom,
} from "../../services/zoomService";

export const ZoomControls: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  // State
  const [zoomPercentage, setZoomPercentage] = useState(
    getCurrentZoomPercentage()
  );
  const [canZoomInState, setCanZoomInState] = useState(canZoomIn());
  const [canZoomOutState, setCanZoomOutState] = useState(canZoomOut());
  const [isDefault, setIsDefault] = useState(isAtDefaultZoom());
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Hide on small screens (< 600px width)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  /**
   * Update zoom state after any zoom operation.
   */
  const updateZoomState = useCallback(() => {
    setZoomPercentage(getCurrentZoomPercentage());
    setCanZoomInState(canZoomIn());
    setCanZoomOutState(canZoomOut());
    setIsDefault(isAtDefaultZoom());
    saveZoomLevel();
  }, []);

  /**
   * Handle zoom in click.
   */
  const handleZoomIn = useCallback(() => {
    zoomIn();
    updateZoomState();
  }, [updateZoomState]);

  /**
   * Handle zoom out click.
   */
  const handleZoomOut = useCallback(() => {
    zoomOut();
    updateZoomState();
  }, [updateZoomState]);

  /**
   * Handle reset zoom click.
   */
  const handleResetZoom = useCallback(() => {
    resetZoom();
    updateZoomState();
  }, [updateZoomState]);

  /**
   * Handle full-screen toggle.
   */
  const handleToggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter full-screen
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("[ZoomControls] Failed to enter full-screen:", err);
      });
    } else {
      // Exit full-screen
      document.exitFullscreen().catch((err) => {
        console.error("[ZoomControls] Failed to exit full-screen:", err);
      });
    }
  }, []);

  /**
   * Keyboard shortcuts handler.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Plus (Zoom In)
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        handleZoomIn();
      }
      // Ctrl/Cmd + Minus (Zoom Out)
      else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
      // Ctrl/Cmd + 0 (Reset Zoom)
      else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      }
      // F11 (Toggle Full-Screen)
      else if (e.key === "F11") {
        e.preventDefault();
        handleToggleFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom, handleToggleFullScreen]);

  /**
   * Mouse wheel handler (Ctrl+Scroll).
   */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          // Scroll up = Zoom In
          handleZoomIn();
        } else if (e.deltaY > 0) {
          // Scroll down = Zoom Out
          handleZoomOut();
        }
      }
    };

    // Use capture phase to intercept before browser's default zoom
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleZoomIn, handleZoomOut]);

  /**
   * Full-screen change listener.
   */
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  /**
   * Load saved zoom on mount.
   */
  useEffect(() => {
    loadSavedZoom();
    updateZoomState();
  }, [updateZoomState]);

  // Don't render on small screens
  if (isSmallScreen) {
    return null;
  }

  return (
    <Box
      data-testid="zoom-controls"
      sx={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 0.5,
      }}
    >
      {/* Zoom Controls */}
      <ButtonGroup variant="outlined" size="small">
        <Tooltip title={t("zoom.zoomOut", "Zoom Out (Ctrl+-)")}>
          <span>
            <IconButton
              onClick={handleZoomOut}
              disabled={!canZoomOutState}
              data-testid="zoom-out-button"
              size="small"
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("zoom.resetZoom", "Reset Zoom (Ctrl+0)")}>
          <span>
            <IconButton
              onClick={handleResetZoom}
              disabled={isDefault}
              data-testid="zoom-reset-button"
              size="small"
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("zoom.zoomIn", "Zoom In (Ctrl++)")}>
          <span>
            <IconButton
              onClick={handleZoomIn}
              disabled={!canZoomInState}
              data-testid="zoom-in-button"
              size="small"
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </ButtonGroup>

      {/* Zoom Percentage Display */}
      <Typography
        variant="caption"
        data-testid="zoom-percentage"
        sx={{
          minWidth: "45px",
          textAlign: "center",
          fontWeight: 500,
          color: "text.secondary",
        }}
      >
        {zoomPercentage}
      </Typography>

      {/* Full-Screen Toggle */}
      <Tooltip
        title={
          isFullScreen
            ? t("zoom.exitFullScreen", "Exit Full-Screen (F11)")
            : t("zoom.enterFullScreen", "Full-Screen (F11)")
        }
      >
        <IconButton
          onClick={handleToggleFullScreen}
          data-testid="fullscreen-toggle-button"
          size="small"
          sx={{ ml: 0.5 }}
        >
          {isFullScreen ? (
            <FullscreenExitIcon fontSize="small" />
          ) : (
            <FullscreenIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
