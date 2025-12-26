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
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

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
    low: theme.palette.error.main, // Red
    medium: theme.palette.warning.main, // Yellow/Orange
    high: theme.palette.success.main, // Green
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {t("panel.intelligenceTab.chart.level")}: {data.level}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.high }}>
            {t("panel.intelligenceTab.chart.high")}: {data.high}% (
            {data.high_count})
          </Typography>
          <Typography variant="body2" sx={{ color: colors.medium }}>
            {t("panel.intelligenceTab.chart.medium")}: {data.medium}% (
            {data.medium_count})
          </Typography>
          <Typography variant="body2" sx={{ color: colors.low }}>
            {t("panel.intelligenceTab.chart.low")}: {data.low}% (
            {data.low_count})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("panel.intelligenceTab.chart.total")}: {data.total}
          </Typography>
        </Paper>
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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.charts.gridLines}
            />
            <XAxis
              dataKey="level"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              style={{ fontSize: theme.tokens.typography.fontSize.caption }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              label={{
                value: t("panel.intelligenceTab.chart.percentage"),
                angle: -90,
                position: "insideLeft",
              }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              stroke={theme.palette.text.secondary}
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
              stroke={theme.palette.text.secondary}
              strokeDasharray="5 5"
              label={{
                value: t("panel.intelligenceTab.chart.baseline", {
                  percent: baselineHighPct,
                }),
                position: "right",
                fontSize: 11,
                fill: theme.palette.text.secondary,
              }}
            />

            {/* Stacked bars */}
            <Bar
              dataKey="low"
              stackId="a"
              fill={colors.low}
              name={t("panel.intelligenceTab.performanceLevel.low")}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="medium"
              stackId="a"
              fill={colors.medium}
              name={t("panel.intelligenceTab.performanceLevel.medium")}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="high"
              stackId="a"
              fill={colors.high}
              name={t("panel.intelligenceTab.performanceLevel.high")}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Additional info */}
      <Box sx={{ mt: 1, px: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {t("panel.intelligenceTab.chart.baselineNote")}
        </Typography>
      </Box>
    </Box>
  );
};
