/**
 * Main dashboard page
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import { AppBar } from "./AppBar";
import { FilterDrawer } from "./FilterDrawer";
import { NineBoxGrid } from "../grid/NineBoxGrid";
import { RightPanel } from "../panel/RightPanel";
import { useSession } from "../../hooks/useSession";
import { useFilters } from "../../hooks/useFilters";

const DRAWER_WIDTH = 280;

export const DashboardPage: React.FC = () => {
  const { sessionId } = useSession();
  const { isDrawerOpen } = useFilters();

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
            marginLeft: isDrawerOpen ? `${DRAWER_WIDTH}px` : 0,
            transition: "margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms",
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
            <Box
              sx={{
                display: "flex",
                gap: 2,
                height: "100%",
                p: 2,
              }}
            >
              <Box sx={{ flex: "0 0 65%", overflow: "auto" }}>
                <NineBoxGrid />
              </Box>
              <Box sx={{ flex: "0 0 35%", overflow: "hidden" }}>
                <RightPanel />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
