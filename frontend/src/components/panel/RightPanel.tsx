/**
 * Right panel container with tab system
 */

import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import { DetailsTab } from "./DetailsTab";
import { StatisticsTab } from "./StatisticsTab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`panel-tabpanel-${index}`}
      aria-labelledby={`panel-tab-${index}`}
      style={{ height: "100%", overflow: "auto" }}
    >
      {value === index && <Box sx={{ p: 2, height: "100%" }}>{children}</Box>}
    </div>
  );
};

export const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="panel tabs"
          variant="fullWidth"
        >
          <Tab label="Details" id="panel-tab-0" aria-controls="panel-tabpanel-0" />
          <Tab label="Statistics" id="panel-tab-1" aria-controls="panel-tabpanel-1" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <TabPanel value={activeTab} index={0}>
          <DetailsTab />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <StatisticsTab />
        </TabPanel>
      </Box>
    </Paper>
  );
};
