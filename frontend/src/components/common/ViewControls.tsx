/**
 * Unified View Controls Component
 *
 * Consolidates all view manipulation controls into a single floating toolbar:
 * - View mode toggle (Grid ⇄ Donut)
 * - Zoom controls (In/Out/Reset/Percentage)
 * - Fullscreen toggle
 *
 * Positioned at top-right of viewport, above grid content.
 * Replaces separate floating controls for better UX consistency.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  ButtonGroup,
  IconButton,
  Tooltip,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GridViewIcon from "@mui/icons-material/GridView";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
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

export const ViewControls: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { sessionId, donutModeActive, toggleDonutMode } = useSessionStore();

  // Zoom state
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
        console.error("[ViewControls] Failed to enter full-screen:", err);
      });
    } else {
      // Exit full-screen
      document.exitFullscreen().catch((err) => {
        console.error("[ViewControls] Failed to exit full-screen:", err);
      });
    }
  }, []);

  /**
   * Handle view mode change (grid/donut).
   */
  const handleViewModeChange = async (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "grid" | "donut" | null
  ) => {
    // Prevent deselecting both buttons (null value)
    if (newMode === null) return;

    // Toggle donut mode based on selection
    const shouldEnableDonut = newMode === "donut";
    if (shouldEnableDonut !== donutModeActive) {
      try {
        await toggleDonutMode(shouldEnableDonut);
      } catch (error) {
        console.error("[ViewControls] Failed to toggle view mode:", error);
      }
    }
  };

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
      // D (Toggle Donut Mode)
      else if (
        sessionId &&
        e.key.toLowerCase() === "d" &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey &&
        !e.metaKey
      ) {
        // Check if focus is on an input element
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement?.getAttribute("contenteditable") === "true";

        if (!isInputFocused) {
          e.preventDefault();
          toggleDonutMode(!donutModeActive);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    sessionId,
    donutModeActive,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleToggleFullScreen,
    toggleDonutMode,
  ]);

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

  const currentMode: "grid" | "donut" = donutModeActive ? "donut" : "grid";
  const viewModeTooltip = donutModeActive
    ? t("grid.viewModeToggle.donutViewActive")
    : t("grid.viewModeToggle.gridViewActive");

  return (
    <Box
      data-testid="view-controls"
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
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
      {/* View Mode Toggle */}
      <Tooltip title={viewModeTooltip} placement="bottom">
        <span>
          <ToggleButtonGroup
            value={currentMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            disabled={!sessionId}
            data-testid="view-mode-toggle"
            aria-label={t("grid.viewModeToggle.ariaLabelToggle")}
            sx={{
              "& .MuiToggleButton-root": {
                "&.Mui-selected": {
                  backgroundColor: "secondary.main",
                  color: "secondary.contrastText",
                  "&:hover": {
                    backgroundColor: "secondary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton
              value="grid"
              aria-label={t("grid.viewModeToggle.ariaLabelGrid")}
              aria-pressed={!donutModeActive}
              data-testid="grid-view-button"
            >
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="donut"
              aria-label={t("grid.viewModeToggle.ariaLabelDonut")}
              aria-pressed={donutModeActive}
              data-testid="donut-view-button"
            >
              <DonutLargeIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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
