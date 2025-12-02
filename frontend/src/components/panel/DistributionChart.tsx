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
import { PositionDistribution } from "../../types/api";

interface DistributionChartProps {
  data: PositionDistribution[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data }) => {
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

  // Sort data by grid_position for consistent display (9 → 1)
  const sortedData = [...data].sort((a, b) => b.grid_position - a.grid_position);

  // Color based on count (higher count = darker blue)
  const maxCount = Math.max(...sortedData.map((d) => d.count));

  const getBarColor = (count: number): string => {
    if (count === 0) return "#e0e0e0";
    const intensity = count / maxCount;
    // Scale from light blue to dark blue
    const blue = Math.floor(255 - intensity * 100);
    return `rgb(25, ${blue}, 210)`;
  };

  return (
    <Box sx={{ width: "100%", height: 300, mt: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="position_label"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            label={{ value: "Employee Count", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            formatter={(value: number) => [`${value} employees`, "Count"]}
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
