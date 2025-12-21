/**
 * Main dashboard page
 */

import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, IconButton, Tooltip, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";
import { AppBar } from "./AppBar";
import { FilterDrawer } from "./FilterDrawer";
import { NineBoxGrid } from "../grid/NineBoxGrid";
import { RightPanel } from "../panel/RightPanel";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { useSession } from "../../hooks/useSession";
import { useSessionStore } from "../../store/sessionStore";
import { useUiStore } from "../../store/uiStore";

const PANEL_COLLAPSE_BREAKPOINT = 1024; // Collapse panel below this width

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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
            <>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                  p: 4,
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    backgroundColor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UploadFileIcon sx={{ fontSize: 60, color: "primary.main" }} />
                </Box>

                {/* Heading */}
                <Typography variant="h4" fontWeight="500" textAlign="center">
                  No File Loaded
                </Typography>

                {/* Description */}
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 500 }}>
                  Drop an Excel file here or click Import Data to get started
                </Typography>

                {/* Import Button */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setUploadDialogOpen(true)}
                  data-testid="empty-state-import-button"
                  sx={{ mt: 2 }}
                >
                  Import Data
                </Button>

                {/* Optional: Sample data hint */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                  New to 9Boxer? Try importing the sample file from Help → User Guide
                </Typography>
              </Box>

              <FileUploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
              />
            </>
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
                    data-testid="panel-resize-handle"
                    sx={{
                      width: "8px",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "col-resize",
                      backgroundColor: theme.palette.divider,
                      transition: "background-color 0.2s",
                      "&:hover": {
                        backgroundColor: theme.palette.primary.main,
                      },
                      "&:active": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "2px",
                        height: "40px",
                        backgroundColor: theme.palette.background.paper,
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
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: 2,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
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
