/**
 * Deviation chart showing expected vs actual percentages with significance indicators
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
} from "recharts";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

interface AnomalyDeviation {
  category: string;
  observed_high_pct: number;
  expected_high_pct: number;
  z_score: number;
  p_value?: number;
  sample_size: number;
  is_significant: boolean;
}

interface DeviationChartProps {
  data: AnomalyDeviation[];
  title: string;
}

interface ChartDataPoint {
  category: string;
  expected: number;
  actual: number;
  z_score: number;
  p_value?: number;
  sample_size: number;
  is_significant: boolean;
}

export const DeviationChart: React.FC<DeviationChartProps> = ({
  data,
  title,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

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
    category: item.category,
    expected: Number(item.expected_high_pct.toFixed(1)),
    actual: Number(item.observed_high_pct.toFixed(1)),
    z_score: item.z_score,
    p_value: item.p_value,
    sample_size: item.sample_size,
    is_significant: item.is_significant,
  }));

  // Get color based on significance
  const getBarColor = (item: ChartDataPoint): string => {
    if (!item.is_significant) return theme.palette.success.main; // Green - not significant
    if (item.p_value !== undefined && item.p_value < 0.01)
      return theme.palette.error.main; // Red - highly significant
    return theme.palette.warning.main; // Yellow - moderately significant
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
            {data.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("panel.intelligenceTab.chart.actual")}: {data.actual}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("panel.intelligenceTab.chart.expected")}: {data.expected}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("panel.intelligenceTab.chart.zScore")}: {data.z_score.toFixed(2)}
          </Typography>
          {data.p_value !== undefined && (
            <Typography variant="body2" color="text.secondary">
              {t("panel.intelligenceTab.chart.pValue")}:{" "}
              {data.p_value < 0.001 ? "<0.001" : data.p_value.toFixed(3)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {t("panel.intelligenceTab.chart.sampleSize")}: {data.sample_size}
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
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              label={{
                value: t("panel.intelligenceTab.chart.percentage"),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "10px" }}
            />
            <Bar
              dataKey="expected"
              fill={theme.palette.action.disabled}
              name={t("panel.intelligenceTab.chart.expectedPercent")}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              name={t("panel.intelligenceTab.chart.actualPercent")}
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
