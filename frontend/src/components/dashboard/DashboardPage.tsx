/**
 * Main dashboard page
 */

import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";
import { AppBar } from "./AppBar";
import { FilterDrawer } from "./FilterDrawer";
import { NineBoxGrid } from "../grid/NineBoxGrid";
import { RightPanel } from "../panel/RightPanel";
import { useSession } from "../../hooks/useSession";
import { useSessionStore } from "../../store/sessionStore";
import { useUiStore } from "../../store/uiStore";

const PANEL_COLLAPSE_BREAKPOINT = 1024; // Collapse panel below this width

export const DashboardPage: React.FC = () => {
  const { sessionId } = useSession();
  const restoreSession = useSessionStore((state) => state.restoreSession);
  const {
    isRightPanelCollapsed,
    rightPanelSize,
    wasAutoCollapsed,
    toggleRightPanel,
    setRightPanelCollapsed,
    setRightPanelSize,
  } = useUiStore();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const [isPanelMounted, setIsPanelMounted] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Initialize panel state on mount
  useEffect(() => {
    const panel = rightPanelRef.current;
    if (panel && !isPanelMounted) {
      setIsPanelMounted(true);
      // Set initial state without animation
      if (isRightPanelCollapsed) {
        panel.collapse();
      }
    }
  }, [isPanelMounted, isRightPanelCollapsed]);

  // Control panel collapse/expand via ref when state changes
  useEffect(() => {
    const panel = rightPanelRef.current;
    if (panel && isPanelMounted) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (isRightPanelCollapsed) {
          panel.collapse();
        } else {
          panel.expand();
        }
      });
    }
  }, [isRightPanelCollapsed, isPanelMounted]);

  // Track window resize and auto-collapse/reopen panel based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // Auto-collapse if window becomes too small and panel is open
      if (width < PANEL_COLLAPSE_BREAKPOINT && !isRightPanelCollapsed) {
        setRightPanelCollapsed(true, true); // true = isAutoCollapse
      }
      // Auto-reopen if window becomes large enough and panel was auto-collapsed
      else if (width >= PANEL_COLLAPSE_BREAKPOINT && isRightPanelCollapsed && wasAutoCollapsed) {
        setRightPanelCollapsed(false, false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Check initial width
    if (windowWidth < PANEL_COLLAPSE_BREAKPOINT && !isRightPanelCollapsed) {
      setRightPanelCollapsed(true, true);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth, isRightPanelCollapsed, wasAutoCollapsed, setRightPanelCollapsed]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Filter Drawer */}
        <FilterDrawer />

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
          }}
        >
          {!sessionId ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h5" color="text.secondary">
                Upload an Excel file to begin
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: "100%", width: "100%", p: 2, position: "relative" }}>
              <PanelGroup
                direction="horizontal"
                onLayout={(sizes) => {
                  // Track panel size changes (only when panel is visible)
                  if (!isRightPanelCollapsed && sizes.length === 2) {
                    const rightSize = sizes[1];
                    if (rightSize !== rightPanelSize) {
                      setRightPanelSize(rightSize);
                    }
                  }
                }}
              >
                <Panel defaultSize={100 - rightPanelSize} minSize={30}>
                  <Box sx={{ height: "100%", width: "100%", overflow: "auto", pr: 1 }}>
                    <NineBoxGrid />
                  </Box>
                </Panel>

                <PanelResizeHandle>
                  <Box
                    sx={{
                      width: "8px",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "col-resize",
                      backgroundColor: "divider",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "primary.main",
                      },
                      "&:active": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "2px",
                        height: "40px",
                        backgroundColor: "background.paper",
                        borderRadius: "1px",
                      }}
                    />
                  </Box>
                </PanelResizeHandle>

                <Panel
                  ref={rightPanelRef}
                  defaultSize={rightPanelSize}
                  minSize={20}
                  collapsible={true}
                  collapsedSize={0}
                  onCollapse={() => {
                    if (!isRightPanelCollapsed) {
                      setRightPanelCollapsed(true, false);
                    }
                  }}
                  onExpand={() => {
                    if (isRightPanelCollapsed) {
                      setRightPanelCollapsed(false, false);
                    }
                  }}
                >
                  <Box sx={{ height: "100%", overflow: "hidden", pl: 1 }}>
                    <RightPanel />
                  </Box>
                </Panel>
              </PanelGroup>

              {/* Toggle button */}
              <Tooltip title={isRightPanelCollapsed ? "Show panel" : "Hide panel"} placement="left">
                <IconButton
                  onClick={toggleRightPanel}
                  data-testid="panel-toggle-button"
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: 16,
                    zIndex: 10,
                    backgroundColor: "background.paper",
                    boxShadow: 2,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {isRightPanelCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
