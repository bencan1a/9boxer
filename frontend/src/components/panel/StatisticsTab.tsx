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
import { DistributionChart } from "./DistributionChart";

export const StatisticsTab: React.FC = () => {
  const { statistics, isLoading, error } = useStatistics();

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

  // Sort distribution by grid_position descending (9 → 1)
  const sortedDistribution = [...statistics.distribution].sort(
    (a, b) => b.grid_position - a.grid_position
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Card variant="outlined">
            <CardContent>
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
          <Card variant="outlined">
            <CardContent>
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
          <Card variant="outlined">
            <CardContent>
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
                <TableCell align="left" sx={{ minWidth: 150 }}>
                  Percentage
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDistribution.map((row) => (
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
                </TableRow>
              ))}
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
