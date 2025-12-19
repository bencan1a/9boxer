/**
 * Statistics tab with summary cards, distribution table, and chart
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
  CircularProgress,
  Alert,
} from "@mui/material";
import { useStatistics } from "../../hooks/useStatistics";
import { useEmployees } from "../../hooks/useEmployees";
import { DistributionChart } from "./DistributionChart";

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
  const { employees } = useEmployees(); // Get filtered employees
  const { statistics, isLoading, error } = useStatistics(employees);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
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
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No statistics available
        </Typography>
      </Box>
    );
  }

  // Sort distribution with custom grouping order: 9,8,6, 7,5,3, 4,2,1
  const customOrder = [9, 8, 6, 7, 5, 3, 4, 2, 1];
  const sortedDistribution = [...statistics.distribution].sort(
    (a, b) => customOrder.indexOf(a.grid_position) - customOrder.indexOf(b.grid_position)
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {statistics.total_employees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {statistics.modified_employees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Modified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {statistics.high_performers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Performers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Distribution Table */}
      <Box>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Distribution by Position
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="left" sx={{ minWidth: 200 }}>
                  Percentage
                </TableCell>
                <TableCell align="center" sx={{ width: 120 }}>
                  Group %
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
                      backgroundColor: row.count > 0 ? "transparent" : "grey.50",
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.position_label}
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                          color="#2e7d32"
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
                          color="#ed6c02"
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
          Visual Distribution
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <DistributionChart data={statistics.distribution} />
        </Paper>
      </Box>
    </Box>
  );
};
