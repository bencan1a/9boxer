/**
 * Stacked bar chart showing performance distribution by job level
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Box, Typography } from "@mui/material";

interface LevelDistribution {
  level: string;
  low_pct: number;
  low_count: number;
  medium_pct: number;
  medium_count: number;
  high_pct: number;
  high_count: number;
  total: number;
}

interface LevelDistributionChartProps {
  data: LevelDistribution[];
  title: string;
  baselineHighPct?: number;
}

interface ChartDataPoint {
  level: string;
  low: number;
  medium: number;
  high: number;
  total: number;
  low_count: number;
  medium_count: number;
  high_count: number;
}

export const LevelDistributionChart: React.FC<LevelDistributionChartProps> = ({
  data,
  title,
  baselineHighPct = 25,
}) => {
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
          No data available
        </Typography>
      </Box>
    );
  }

  // Transform data for recharts
  const chartData: ChartDataPoint[] = data.map((item) => ({
    level: item.level,
    low: Number(item.low_pct.toFixed(1)),
    medium: Number(item.medium_pct.toFixed(1)),
    high: Number(item.high_pct.toFixed(1)),
    total: item.total,
    low_count: item.low_count,
    medium_count: item.medium_count,
    high_count: item.high_count,
  }));

  // Performance category colors (traffic light system)
  const colors = {
    low: "#f44336", // Red
    medium: "#ff9800", // Yellow/Orange
    high: "#4caf50", // Green
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <Box
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            p: 1.5,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Level: {data.level}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.high }}>
            High: {data.high}% ({data.high_count})
          </Typography>
          <Typography variant="body2" sx={{ color: colors.medium }}>
            Medium: {data.medium}% ({data.medium_count})
          </Typography>
          <Typography variant="body2" sx={{ color: colors.low }}>
            Low: {data.low}% ({data.low_count})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Total: {data.total}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="level"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              label={{
                value: "Percentage (%)",
                angle: -90,
                position: "insideLeft",
              }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "10px" }}
            />

            {/* Baseline reference line */}
            <ReferenceLine
              y={baselineHighPct / 100}
              stroke="#666"
              strokeDasharray="5 5"
              label={{
                value: `Baseline (${baselineHighPct}%)`,
                position: "right",
                fontSize: 11,
                fill: "#666",
              }}
            />

            {/* Stacked bars */}
            <Bar
              dataKey="low"
              stackId="a"
              fill={colors.low}
              name="Low Performance"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="medium"
              stackId="a"
              fill={colors.medium}
              name="Medium Performance"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="high"
              stackId="a"
              fill={colors.high}
              name="High Performance"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Additional info */}
      <Box sx={{ mt: 1, px: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Note: Baseline represents overall average high performance percentage
          across all levels. Significant deviations may indicate calibration issues.
        </Typography>
      </Box>
    </Box>
  );
};
