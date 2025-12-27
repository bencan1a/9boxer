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
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useStatistics } from "../../hooks/useStatistics";
import { useEmployees } from "../../hooks/useEmployees";
import { useSessionStore } from "../../store/sessionStore";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { EmptyState } from "../common/EmptyState";
import { DistributionChart } from "./DistributionChart";
import { getPositionLabel } from "../../constants/positionLabels";

// SVG Curly Brace Component (opening to the left like })
const CurlyBrace: React.FC<{
  height: number;
  color: string;
  percentage: string;
}> = ({ height, color, percentage }) => {
  const width = 40;
  const controlPointOffset = width * 0.3;
  const centerY = height / 2;

  // SVG path for a curly brace opening to the left (})
  const path = `
    M 0,0
    C ${controlPointOffset},${centerY * 0.3} ${controlPointOffset},${centerY * 0.5} ${width * 0.7},${centerY}
    C ${controlPointOffset},${centerY * 1.5} ${controlPointOffset},${centerY * 1.7} 0,${height}
  `;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        height: `${height}px`,
      }}
    >
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <Typography variant="body2" fontWeight="bold" sx={{ color }}>
        {percentage}
      </Typography>
    </Box>
  );
};

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
      <Box sx={{ p: 2 }}>
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

  // Sort distribution with custom grouping order: 9,8,6, 7,5,3, 4,2,1
  const customOrder = [9, 8, 6, 7, 5, 3, 4, 2, 1];
  const sortedDistribution = [...statistics.distribution]
    .map((row) => ({
      ...row,
      position_label: getPositionLabel(row.grid_position),
    }))
    .sort(
      (a, b) =>
        customOrder.indexOf(a.grid_position) -
        customOrder.indexOf(b.grid_position)
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent
              sx={{
                height: "100%",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" color="primary" gutterBottom>
                {statistics.total_employees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("panel.statisticsTab.totalEmployees")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent
              sx={{
                height: "100%",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" color="warning.main" gutterBottom>
                {statistics.modified_employees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("panel.statisticsTab.modified")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent
              sx={{
                height: "100%",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" color="success.main" gutterBottom>
                {statistics.high_performers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("panel.statisticsTab.highPerformers")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Distribution Table */}
      <Box>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          {t("panel.statisticsTab.distributionByPosition")}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("panel.statisticsTab.position")}</TableCell>
                <TableCell align="right">
                  {t("panel.statisticsTab.count")}
                </TableCell>
                <TableCell align="left" sx={{ minWidth: 200 }}>
                  {t("panel.statisticsTab.percentage")}
                </TableCell>
                <TableCell align="center" sx={{ width: 120 }}>
                  {t("panel.statisticsTab.groupPercentage")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDistribution.map((row) => {
                const isHighGroupStart = row.grid_position === 9;
                const isLowGroupStart = row.grid_position === 4;
                const rowHeight = 53; // Approximate height of each table row

                return (
                  <TableRow
                    key={row.grid_position}
                    sx={{
                      backgroundColor:
                        row.count > 0
                          ? "transparent"
                          : theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "grey.50",
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {getPositionLabel(row.grid_position)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={row.count > 0 ? "medium" : "normal"}
                      >
                        {row.count}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={row.percentage}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 45 }}>
                          {row.percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Brace column with rowspan for grouped percentages */}
                    {isHighGroupStart && statistics.groupedStats && (
                      <TableCell
                        align="center"
                        rowSpan={3}
                        sx={{
                          width: 120,
                          verticalAlign: "middle",
                          borderBottom: "none",
                        }}
                      >
                        <CurlyBrace
                          height={rowHeight * 3}
                          color={theme.palette.success.main}
                          percentage={`${statistics.groupedStats.highPerformers.percentage.toFixed(1)}%`}
                        />
                      </TableCell>
                    )}
                    {isLowGroupStart && statistics.groupedStats && (
                      <TableCell
                        align="center"
                        rowSpan={3}
                        sx={{
                          width: 120,
                          verticalAlign: "middle",
                          borderBottom: "none",
                        }}
                      >
                        <CurlyBrace
                          height={rowHeight * 3}
                          color={theme.palette.warning.main}
                          percentage={`${statistics.groupedStats.lowPerformers.percentage.toFixed(1)}%`}
                        />
                      </TableCell>
                    )}
                    {/* Empty cell for non-grouped rows */}
                    {!isHighGroupStart &&
                      !isLowGroupStart &&
                      row.grid_position !== 8 &&
                      row.grid_position !== 6 &&
                      row.grid_position !== 2 &&
                      row.grid_position !== 1 && (
                        <TableCell
                          sx={{
                            width: 120,
                            borderBottom: "none",
                          }}
                        />
                      )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Distribution Chart */}
      <Box>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          {t("panel.statisticsTab.visualDistribution")}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <DistributionChart data={statistics.distribution} />
        </Paper>
      </Box>
    </Box>
  );
};
