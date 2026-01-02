import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { IntelligenceSummary } from "../intelligence/IntelligenceSummary";
import { mockNeedsAttentionIntelligence } from "../../mocks/mockIntelligence";

/**
 * Mock tab panel component for showing just the tab bar
 * without rendering the full child components.
 */
interface TabOnlyPanelProps {
  initialTab?: number;
  showLabels?: boolean;
  showRealContent?: boolean;
}

/**
 * TabOnlyPanel - A simplified version showing just tabs
 * This avoids loading heavy child components that require store context.
 */
const TabOnlyPanel = ({
  initialTab = 0,
  showLabels = true,
  showRealContent = false,
}: TabOnlyPanelProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabLabels = showLabels
    ? [
        t("panel.tabs.details"),
        t("panel.tabs.changes"),
        t("panel.tabs.statistics"),
        t("panel.tabs.intelligence"),
      ]
    : ["Details", "Changes", "Statistics", "Intelligence"];

  const renderTabContent = () => {
    if (showRealContent && activeTab === 3) {
      return <IntelligenceSummary data={mockNeedsAttentionIntelligence} />;
    }
    return (
      <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
        {activeTab === 0 && "Details tab content (employee information)"}
        {activeTab === 1 && "Changes tab content (session modifications)"}
        {activeTab === 2 && "Statistics tab content (distribution data)"}
        {activeTab === 3 && "Intelligence tab content (anomaly detection)"}
      </Box>
    );
  };

  return (
    <Paper
      elevation={2}
      data-testid="right-panel-tabs"
      sx={{
        width: showRealContent ? 480 : 400,
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
            label={tabLabels[0]}
            id="panel-tab-0"
            aria-controls="panel-tabpanel-0"
            data-testid="details-tab"
          />
          <Tab
            label={tabLabels[1]}
            id="panel-tab-1"
            aria-controls="panel-tabpanel-1"
            data-testid="changes-tab"
          />
          <Tab
            label={tabLabels[2]}
            id="panel-tab-2"
            aria-controls="panel-tabpanel-2"
            data-testid="statistics-tab"
          />
          <Tab
            label={tabLabels[3]}
            id="panel-tab-3"
            aria-controls="panel-tabpanel-3"
            data-testid="intelligence-tab"
          />
        </Tabs>
      </Box>
      <Box sx={{ p: 2, minHeight: 100 }}>{renderTabContent()}</Box>
    </Paper>
  );
};

/**
 * RightPanel tabs navigation component.
 *
 * Shows the four-tab navigation system:
 * - Details: Selected employee information
 * - Changes: Session modifications tracker
 * - Statistics: Distribution and grouping analysis
 * - Intelligence: Anomaly detection and quality scores
 *
 * **Use Cases:**
 * - Documentation screenshots showing tab locations
 * - Visual reference for tab navigation
 */
const meta: Meta<typeof TabOnlyPanel> = {
  title: "App/Right Panel/Tabs",
  component: TabOnlyPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    initialTab: {
      control: { type: "number", min: 0, max: 3 },
      description: "Initial selected tab index (0-3)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabOnlyPanel>;

/**
 * Details tab selected (default view).
 * Shows the Details tab as active, first tab in the navigation.
 */
export const DetailsSelected: Story = {
  args: {
    initialTab: 0,
  },
};

/**
 * Changes tab selected.
 * Shows the Changes tab as active, second tab for tracking modifications.
 */
export const ChangesSelected: Story = {
  args: {
    initialTab: 1,
  },
};

/**
 * Statistics tab selected.
 * Shows the Statistics tab as active, third tab for distribution analysis.
 * Used for documentation screenshot: statistics-tab-location
 */
export const StatisticsSelected: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "statistics-tab-location" },
  },
  args: {
    initialTab: 2,
  },
};

/**
 * Intelligence tab selected with real content.
 * Shows the Intelligence tab as active with actual IntelligenceSummary content,
 * demonstrating the quality score, anomaly counts, and status cards.
 * Used for documentation screenshot: intelligence-tab-location
 */
export const IntelligenceSelected: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-tab-location" },
  },
  args: {
    initialTab: 3,
    showRealContent: true,
  },
};
