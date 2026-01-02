/**
 * Manager distribution chart showing High/Medium/Low performance distribution
 * Displays as 100% stacked horizontal bar chart with baseline reference markers
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
  Cell,
  ReferenceLine,
} from "recharts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useFilterStore } from "../../store/filterStore";
import type { ManagerDeviation } from "../../types/api";

interface ManagerDistributionChartProps {
  data: ManagerDeviation[];
  title: string;
}

interface ChartDataPoint {
  manager: string;
  high: number;
  medium: number;
  low: number;
  team_size: number;
  total_deviation: number;
  is_significant: boolean;
}

export const ManagerDistributionChart: React.FC<
  ManagerDistributionChartProps
> = ({ data, title }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setReportingChainFilter } = useFilterStore();

  const handleManagerClick = (managerName: string) => {
    setReportingChainFilter(managerName);
  };

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

  // Transform data for recharts (100% stacked bar chart)
  const chartData: ChartDataPoint[] = data.map((item) => ({
    manager: item.category,
    high: Number(item.high_pct.toFixed(1)),
    medium: Number(item.medium_pct.toFixed(1)),
    low: Number(item.low_pct.toFixed(1)),
    team_size: item.team_size,
    total_deviation: item.total_deviation,
    is_significant: item.is_significant,
  }));

  // Custom Y-axis tick component to make manager names clickable
  const CustomYAxisTick = ({ x, y, payload }: any) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-5}
          y={0}
          dy={4}
          textAnchor="end"
          fill={theme.palette.primary.main}
          fontSize={theme.tokens.typography.fontSize.caption}
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => handleManagerClick(payload.value)}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      const highDiff = data.high - 20;
      const mediumDiff = data.medium - 70;
      const lowDiff = data.low - 10;

      const formatDiff = (diff: number) => {
        const sign = diff > 0 ? "+" : "";
        return `${sign}${diff.toFixed(1)}%`;
      };

      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            {data.manager}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("panel.intelligenceTab.manager.teamSize")}: {data.team_size}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.success.main }}
            >
              {t("panel.intelligenceTab.manager.high")}: {data.high}% (
              {formatDiff(highDiff)} from target)
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.warning.main }}
            >
              {t("panel.intelligenceTab.manager.medium")}: {data.medium}% (
              {formatDiff(mediumDiff)} from target)
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.error.main }}
            >
              {t("panel.intelligenceTab.manager.low")}: {data.low}% (
              {formatDiff(lowDiff)} from target)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("panel.intelligenceTab.manager.totalDeviation")}:{" "}
            {data.total_deviation.toFixed(1)}%
          </Typography>
          {data.is_significant && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.warning.main,
                mt: 0.5,
                display: "block",
              }}
            >
              ⚠ {t("panel.intelligenceTab.anomaly.significant")}
            </Typography>
          )}
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
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        {t("panel.intelligenceTab.manager.baseline")}: 20%{" "}
        {t("panel.intelligenceTab.manager.high")} / 70%{" "}
        {t("panel.intelligenceTab.manager.medium")} / 10%{" "}
        {t("panel.intelligenceTab.manager.low")}
      </Typography>
      <Box sx={{ height: Math.max(400, data.length * 50) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              label={{
                value: t("panel.intelligenceTab.chart.percentage"),
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis
              type="category"
              dataKey="manager"
              width={140}
              tick={<CustomYAxisTick />}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "10px" }}
            />

            {/* Stacked bars: Low (red), Medium (yellow), High (green) */}
            <Bar
              dataKey="low"
              stackId="a"
              fill={theme.palette.error.main}
              name={t("panel.intelligenceTab.manager.low")}
            />
            <Bar
              dataKey="medium"
              stackId="a"
              fill={theme.palette.warning.main}
              name={t("panel.intelligenceTab.manager.medium")}
            />
            <Bar
              dataKey="high"
              stackId="a"
              fill={theme.palette.success.main}
              name={t("panel.intelligenceTab.manager.high")}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  opacity={entry.is_significant ? 1.0 : 0.6}
                />
              ))}
            </Bar>

            {/* Reference lines for baseline boundaries (rendered after bars to appear on top) */}
            {/* Low/Medium boundary at 10% */}
            <ReferenceLine
              x={10}
              stroke={theme.palette.mode === "dark" ? "#ffffff" : "#000000"}
              strokeWidth={2}
              strokeOpacity={1.0}
              strokeDasharray="5 5"
            />
            {/* Medium/High boundary at 80% (10% low + 70% medium) */}
            <ReferenceLine
              x={80}
              stroke={theme.palette.mode === "dark" ? "#ffffff" : "#000000"}
              strokeWidth={2}
              strokeOpacity={1.0}
              strokeDasharray="5 5"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
