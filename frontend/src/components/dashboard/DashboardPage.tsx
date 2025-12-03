/**
 * Main dashboard page
 */

import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppBar } from "./AppBar";
import { FilterDrawer } from "./FilterDrawer";
import { NineBoxGrid } from "../grid/NineBoxGrid";
import { RightPanel } from "../panel/RightPanel";
import { useSession } from "../../hooks/useSession";
import { useSessionStore } from "../../store/sessionStore";

export const DashboardPage: React.FC = () => {
  const { sessionId } = useSession();
  const restoreSession = useSessionStore((state) => state.restoreSession);

  // Restore session from localStorage on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

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
            <Box sx={{ height: "100%", width: "100%", p: 2 }}>
              <PanelGroup direction="horizontal">
                <Panel defaultSize={65} minSize={30}>
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
                <Panel defaultSize={35} minSize={20}>
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
