/**
 * Main dashboard page
 */

import React, { useEffect, useState, useRef } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useTranslation } from "react-i18next";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import { AppBarContainer } from "./AppBarContainer";
import { FilterDrawer } from "./FilterDrawer";
import { NineBoxGrid } from "../grid/NineBoxGrid";
import { RightPanel } from "../panel/RightPanel";
import { FileUploadDialog } from "../common/FileUploadDialog";
import { ViewControls } from "../common/ViewControls";
import { EmptyState } from "../common/EmptyState";
import { useSession } from "../../hooks/useSession";
import { useSessionStore } from "../../store/sessionStore";
import { useUiStore } from "../../store/uiStore";

const PANEL_COLLAPSE_BREAKPOINT = 1024; // Collapse panel below this width

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
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
      else if (
        width >= PANEL_COLLAPSE_BREAKPOINT &&
        isRightPanelCollapsed &&
        wasAutoCollapsed
      ) {
        setRightPanelCollapsed(false, false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Check initial width
    if (windowWidth < PANEL_COLLAPSE_BREAKPOINT && !isRightPanelCollapsed) {
      setRightPanelCollapsed(true, true);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [
    windowWidth,
    isRightPanelCollapsed,
    wasAutoCollapsed,
    setRightPanelCollapsed,
  ]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBarContainer />

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
              <EmptyState
                icon={<UploadFileIcon />}
                title={t("dashboard.dashboardPage.noFileLoaded")}
                description={t("dashboard.dashboardPage.emptyStateDescription")}
                action={{
                  label: t("dashboard.dashboardPage.importData"),
                  onClick: () => setUploadDialogOpen(true),
                  icon: <UploadFileIcon />,
                  variant: "contained",
                }}
                hint={t("dashboard.dashboardPage.sampleFileHint")}
              />

              <FileUploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
              />
            </>
          ) : (
            <Box
              sx={{ height: "100%", width: "100%", p: 2, position: "relative" }}
            >
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
                  <Box
                    sx={{
                      height: "100%",
                      width: "100%",
                      overflow: "auto",
                      pr: 1,
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                  >
                    <NineBoxGrid />
                    {/* View Controls (view mode + zoom + fullscreen) */}
                    <ViewControls />
                  </Box>
                </Panel>

                <PanelResizeHandle>
                  <Box
                    data-testid="panel-resize-handle"
                    sx={{
                      position: "relative",
                      width: theme.tokens.spacing.sm,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "col-resize",
                      backgroundColor: theme.palette.divider,
                      transition: `background-color ${theme.tokens.duration.fast}`,
                      "&:hover:not(:has(button:hover))": {
                        backgroundColor: theme.palette.primary.main,
                      },
                      "&:active:not(:has(button:active))": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: `${theme.tokens.spacing.xs / 2}px`,
                        height: `${theme.tokens.spacing.xl + theme.tokens.spacing.sm}px`,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: `${theme.tokens.radius.sm / 4}px`,
                        pointerEvents: "none",
                      }}
                    />
                    {/* Toggle button integrated into resize handle */}
                    <Tooltip
                      title={
                        isRightPanelCollapsed
                          ? t("dashboard.dashboardPage.showPanel")
                          : t("dashboard.dashboardPage.hidePanel")
                      }
                      placement="left"
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRightPanel();
                        }}
                        data-testid="panel-toggle-button"
                        sx={{
                          position: isRightPanelCollapsed
                            ? "fixed"
                            : "absolute",
                          top: isRightPanelCollapsed
                            ? `calc(50vh + ${theme.tokens.dimensions.appBar.height / 2}px)`
                            : "50%",
                          left: isRightPanelCollapsed ? "auto" : "50%",
                          right: isRightPanelCollapsed ? 16 : "auto",
                          transform: isRightPanelCollapsed
                            ? "translateY(-50%)"
                            : "translate(-50%, -50%)",
                          zIndex: 10,
                          pointerEvents: "auto",
                          isolation: "isolate",
                          width: theme.tokens.spacing.sm,
                          height: 48,
                          borderRadius: isRightPanelCollapsed
                            ? `${theme.tokens.radius.md}px`
                            : `${theme.tokens.radius.sm}px`,
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: 2,
                          transition: `all ${theme.tokens.duration.normal}`,
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        {isRightPanelCollapsed ? (
                          <ChevronLeftIcon fontSize="small" />
                        ) : (
                          <ChevronRightIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
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
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
