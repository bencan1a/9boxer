/**
 * Statistics tab with summary cards, distribution table, and chart
 *
 * Shows employee distribution across performance/potential levels,
 * trend indicators, and statistical summaries.
 *
 * @component
 * @screenshots
 *   - statistics-panel-distribution: Statistics panel showing distribution pie charts
 *   - statistics-trend-indicators: Statistics tab with trend indicators and percentages
 */

import React from "react";
import { Box, Paper, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useStatistics } from "../../hooks/useStatistics";
import { useEmployees } from "../../hooks/useEmployees";
import { useSessionStore } from "../../store/sessionStore";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { EmptyState } from "../common/EmptyState";
import { DistributionChart } from "./DistributionChart";
import { StatisticsSummary } from "./statistics/StatisticsSummary";
import { DistributionTable } from "./statistics/DistributionTable";
import { getPositionLabel } from "../../constants/positionLabels";

export const StatisticsTab: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { employees } = useEmployees(); // Get filtered employees
  const donutModeActive = useSessionStore((state) => state.donutModeActive);
  const { statistics, isLoading, error } = useStatistics(
    employees,
    donutModeActive
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }} data-testid="statistics-tab-error">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <EmptyState
        title={t("panel.statisticsTab.noStatisticsAvailable")}
        iconSize="medium"
      />
    );
  }

  // Prepare distribution data with position labels
  const distributionWithLabels = statistics.distribution.map((row) => ({
    ...row,
    position_label: getPositionLabel(row.grid_position),
  }));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.tokens.spacing.lg / 8,
      }}
      data-testid="statistics-tab-content"
    >
      {/* Summary Cards */}
      <Box data-testid="statistics-summary-section">
        <StatisticsSummary
          totalEmployees={statistics.total_employees}
          modifiedEmployees={statistics.modified_employees}
          highPerformers={statistics.high_performers}
        />
      </Box>

      {/* Distribution Table */}
      <Box data-testid="distribution-table-section">
        <DistributionTable
          distribution={distributionWithLabels}
          groupedStats={statistics.groupedStats}
        />
      </Box>

      {/* Distribution Chart */}
      <Box data-testid="distribution-chart-section">
        <Paper variant="outlined" sx={{ p: theme.tokens.spacing.md / 8 }}>
          <DistributionChart data={statistics.distribution} />
        </Paper>
      </Box>
    </Box>
  );
};
