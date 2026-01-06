/**
 * Main dashboard page
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
import { EmptyState } from "./DashboardEmptyState";
import { LoadSampleDialog } from "../dialogs/LoadSampleDialog";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useSession } from "../../hooks/useSession";
import {
  useSessionStore,
  selectRestoreSession,
  selectClearSession,
  selectLoadEmployees,
  selectEmployees,
  selectIsRestoringSession,
} from "../../store/sessionStore";
import {
  useUiStore,
  selectIsRightPanelCollapsed,
  selectRightPanelSize,
  selectWasAutoCollapsed,
  selectToggleRightPanel,
  selectSetRightPanelCollapsed,
  selectSetRightPanelSize,
} from "../../store/uiStore";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { GridZoomProvider } from "../../contexts/GridZoomContext";
import { sampleDataService } from "../../services/sampleDataService";
import { extractErrorMessage } from "../../types/errors";
import { logger } from "../../utils/logger";

const PANEL_COLLAPSE_BREAKPOINT = 1024; // Collapse panel below this width

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { sessionId } = useSession();

  // Use granular selectors to minimize re-renders
  const restoreSession = useSessionStore(selectRestoreSession);
  const clearSession = useSessionStore(selectClearSession);
  const loadEmployees = useSessionStore(selectLoadEmployees);
  const employees = useSessionStore(selectEmployees);
  const isRestoringSession = useSessionStore(selectIsRestoringSession);

  const isRightPanelCollapsed = useUiStore(selectIsRightPanelCollapsed);
  const rightPanelSize = useUiStore(selectRightPanelSize);
  const wasAutoCollapsed = useUiStore(selectWasAutoCollapsed);
  const toggleRightPanel = useUiStore(selectToggleRightPanel);
  const setRightPanelCollapsed = useUiStore(selectSetRightPanelCollapsed);
  const setRightPanelSize = useUiStore(selectSetRightPanelSize);

  const { showSuccess, showError } = useSnackbar();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loadSampleDialogOpen, setLoadSampleDialogOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const rafIdRef = useRef<number>();
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Cleanup RAF and timeouts on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Throttled resize handler using requestAnimationFrame
  const handlePanelResize = useCallback(
    (sizes: number[]) => {
      // Skip resize handling if panel is collapsed or sizes are invalid
      if (sizes.length !== 2) {
        return;
      }

      const rightSize = sizes[1];

      // Skip if panel is collapsed/collapsing (size near 0) or if state says collapsed
      // This prevents resize handling during the collapse/expand animation
      if (isRightPanelCollapsed || rightSize < 1) {
        return;
      }

      // Set resizing state using functional update to avoid stale closure
      setIsResizing((prev) => {
        if (!prev) return true; // Only update if not already resizing
        return prev; // Keep current value
      });

      // Cancel previous RAF if still pending
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Clear previous timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Schedule update on next animation frame (60fps max)
      rafIdRef.current = requestAnimationFrame(() => {
        // Guard against unmounted component
        if (!isMountedRef.current) return;

        // Track panel size changes
        if (rightSize !== rightPanelSize) {
          setRightPanelSize(rightSize);
        }

        // Guard again before setting timeout
        if (!isMountedRef.current) return;

        // Set timeout to end resize state after resize stops
        resizeTimeoutRef.current = setTimeout(() => {
          // Guard in timeout callback
          if (!isMountedRef.current) return;
          setIsResizing(false);
        }, 150); // 150ms debounce for resize end
      });
    },
    [isRightPanelCollapsed, rightPanelSize, setRightPanelSize]
  );

  // Restore session from localStorage on mount
  useEffect(() => {
    const initializeSession = async () => {
      await restoreSession();
      // Notify Electron that session restoration is complete so splash screen can close
      if (window.electronAPI?.notifySessionRestored) {
        await window.electronAPI.notifySessionRestored();
      }
    };
    initializeSession();
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
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce window resize to avoid excessive checks
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
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
      }, 150); // Debounce 150ms
    };

    window.addEventListener("resize", handleResize);

    // Check initial width
    if (windowWidth < PANEL_COLLAPSE_BREAKPOINT && !isRightPanelCollapsed) {
      setRightPanelCollapsed(true, true);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [
    windowWidth,
    isRightPanelCollapsed,
    wasAutoCollapsed,
    setRightPanelCollapsed,
  ]);

  // Handle load sample data click
  const handleLoadSampleClick = () => {
    setLoadSampleDialogOpen(true);
  };

  // Handle load sample data confirmation
  const handleLoadSampleConfirm = async () => {
    setIsLoadingSample(true);
    try {
      // Clear existing session if there is one
      if (sessionId) {
        await clearSession();
      }

      // Generate sample data via API (this creates a session automatically)
      const response = await sampleDataService.generateSampleDataset({
        size: 200,
        include_bias: true,
      });

      // Store session ID in localStorage so the backend knows which session to use
      localStorage.setItem("session_id", response.session_id);

      // Reload employees to sync frontend state with the new session
      await loadEmployees();

      // Set filename and hasSampleData flag in session store
      useSessionStore.setState({
        filename: response.filename,
        hasSampleData: true,
      });

      // Close dialog and show success message
      setLoadSampleDialogOpen(false);
      showSuccess(
        `Successfully loaded ${response.metadata.total} sample employees`
      );

      logger.info("Sample data loaded", {
        total: response.metadata.total,
        locations: response.metadata.locations,
        functions: response.metadata.functions,
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      logger.error("Failed to load sample data", error);
      showError(errorMessage);
      throw error; // Re-throw to let dialog handle error display
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Handle upload file click
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

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
          {isRestoringSession ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LoadingSpinner message={t("common.loading")} size={60} />
            </Box>
          ) : !sessionId ? (
            <>
              <EmptyState
                onLoadSampleData={handleLoadSampleClick}
                onUploadFile={handleUploadClick}
                isLoading={isLoadingSample}
              />

              <FileUploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
              />

              <LoadSampleDialog
                open={loadSampleDialogOpen}
                onClose={() => setLoadSampleDialogOpen(false)}
                onConfirm={handleLoadSampleConfirm}
                hasExistingData={employees.length > 0}
              />
            </>
          ) : (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                pt: 1,
                px: 2,
                pb: 2,
                position: "relative",
              }}
            >
              <PanelGroup direction="horizontal" onLayout={handlePanelResize}>
                <Panel defaultSize={100 - rightPanelSize} minSize={30}>
                  <Box
                    sx={{
                      height: "100%",
                      width: "100%",
                      overflow: "hidden",
                      pr: 1,
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                  >
                    <GridZoomProvider
                      isResizing={isResizing}
                      setIsResizing={setIsResizing}
                    >
                      <NineBoxGrid />
                    </GridZoomProvider>
                  </Box>
                </Panel>

                <PanelResizeHandle>
                  <Box
                    data-testid="panel-resize-handle"
                    sx={{
                      position: "relative",
                      width: isRightPanelCollapsed
                        ? theme.tokens.spacing.md
                        : theme.tokens.spacing.sm,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "col-resize",
                      backgroundColor: theme.palette.divider,
                      transition: `background-color ${theme.tokens.duration.fast}, width ${theme.tokens.duration.normal}`,
                      "&:hover:not(:has(button:hover))": {
                        backgroundColor: theme.palette.primary.main,
                      },
                      "&:active:not(:has(button:active))": {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {/* Toggle button serves as both visual element and interactive control */}
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
                          width: isRightPanelCollapsed
                            ? theme.tokens.spacing.md
                            : theme.tokens.spacing.sm,
                          height: 48,
                          padding: 0,
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
