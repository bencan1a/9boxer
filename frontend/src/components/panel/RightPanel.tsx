/**
 * Right panel container with tab system
 */

import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { DetailsTab } from "./DetailsTab";
import { ChangeTrackerTab } from "./ChangeTrackerTab";
import { StatisticsTab } from "./StatisticsTab";
import { IntelligenceTab } from "./IntelligenceTab";
import {
  useUiStore,
  selectActiveTab,
  selectSetActiveTab,
} from "../../store/uiStore";

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
      data-testid={`tab-panel-${index}`}
      style={{ height: "100%" }}
    >
      {value === index && (
        <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>{children}</Box>
      )}
    </div>
  );
};

export const RightPanel: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const activeTab = useUiStore(selectActiveTab);
  const setActiveTab = useUiStore(selectSetActiveTab);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper
      elevation={2}
      data-testid="right-panel"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="panel tabs"
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              color: theme.palette.text.secondary,
            },
            "& .Mui-selected": {
              color: theme.palette.primary.main,
            },
          }}
        >
          <Tab
            label={t("panel.tabs.details")}
            id="panel-tab-0"
            aria-controls="panel-tabpanel-0"
            data-testid="details-tab"
          />
          <Tab
            label={t("panel.tabs.changes")}
            id="panel-tab-1"
            aria-controls="panel-tabpanel-1"
            data-testid="changes-tab"
          />
          <Tab
            label={t("panel.tabs.statistics")}
            id="panel-tab-2"
            aria-controls="panel-tabpanel-2"
            data-testid="statistics-tab"
          />
          <Tab
            label={t("panel.tabs.intelligence")}
            id="panel-tab-3"
            aria-controls="panel-tabpanel-3"
            data-testid="intelligence-tab"
          />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <TabPanel value={activeTab} index={0}>
          <DetailsTab />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ChangeTrackerTab />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <StatisticsTab />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <IntelligenceTab />
        </TabPanel>
      </Box>
    </Paper>
  );
};
