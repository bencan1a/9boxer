/**
 * Distribution bar chart component
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { PositionDistribution } from "../../types/api";

interface DistributionChartProps {
  data: PositionDistribution[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("panel.intelligenceTab.chart.noDataAvailable")}
        </Typography>
      </Box>
    );
  }

  // Sort data by grid_position for consistent display (9 → 1)
  const sortedData = [...data].sort(
    (a, b) => b.grid_position - a.grid_position
  );

  // Color based on count (higher count = darker blue)
  const maxCount = Math.max(...sortedData.map((d) => d.count));

  const getBarColor = (count: number): string => {
    if (count === 0) return theme.palette.action.disabledBackground;
    const intensity = count / maxCount;
    // Use primary color with varying opacity
    const primary = theme.palette.primary.main;
    const rgb = primary.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.3 + intensity * 0.7})`;
    }
    return primary;
  };

  return (
    <Box sx={{ width: "100%", height: 300, mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.charts.gridLines}
          />
          <XAxis
            dataKey="position_label"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            style={{ fontSize: "12px" }}
            stroke={theme.palette.text.secondary}
          />
          <YAxis
            label={{
              value: t("panel.statisticsTab.employeeCount"),
              angle: -90,
              position: "insideLeft",
            }}
            stroke={theme.palette.text.secondary}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.charts.tooltip,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "4px",
            }}
            formatter={(value: number) => [
              t("panel.statisticsTab.employeesCount", { count: value }),
              t("panel.statisticsTab.countLabel"),
            ]}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
