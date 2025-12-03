/**
 * Heatmap showing distribution across grid positions by function
 */

import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface FunctionDistribution {
  function: string;
  distribution: {
    [position: string]: {
      percentage: number;
      count: number;
    };
  };
  total: number;
}

interface DistributionHeatmapProps {
  data: FunctionDistribution[];
  title: string;
}

export const DistributionHeatmap: React.FC<DistributionHeatmapProps> = ({
  data,
  title,
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

  // Grid positions in order (9-box layout order)
  const gridPositions = ["9", "8", "7", "6", "5", "4", "3", "2", "1"];

  // Find max percentage for color scaling
  const maxPercentage = Math.max(
    ...data.flatMap((fn) =>
      gridPositions.map((pos) => fn.distribution[pos]?.percentage || 0)
    )
  );

  // Get color based on percentage (gradient from light to dark)
  const getHeatmapColor = (percentage: number): string => {
    if (percentage === 0) return "#f5f5f5";
    const intensity = percentage / maxPercentage;
    // Scale from light blue to dark blue
    const blue = Math.floor(255 - intensity * 155);
    const green = Math.floor(200 - intensity * 100);
    return `rgb(25, ${green}, ${blue})`;
  };

  // Get text color based on background
  const getTextColor = (percentage: number): string => {
    const intensity = percentage / maxPercentage;
    return intensity > 0.6 ? "#ffffff" : "#000000";
  };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, overflowX: "auto" }}>
        <Box sx={{ minWidth: 600 }}>
          {/* Header row */}
          <Box sx={{ display: "flex", mb: 1 }}>
            <Box
              sx={{
                width: 150,
                fontWeight: "bold",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                px: 1,
              }}
            >
              Function
            </Box>
            {gridPositions.map((pos) => (
              <Box
                key={pos}
                sx={{
                  flex: 1,
                  minWidth: 60,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "12px",
                  px: 1,
                }}
              >
                Pos {pos}
              </Box>
            ))}
            <Box
              sx={{
                width: 60,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "12px",
                px: 1,
              }}
            >
              Total
            </Box>
          </Box>

          {/* Data rows */}
          {data.map((fn) => (
            <Box
              key={fn.function}
              sx={{
                display: "flex",
                mb: 0.5,
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
              }}
            >
              <Box
                sx={{
                  width: 150,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  fontWeight: "medium",
                }}
              >
                {fn.function}
              </Box>
              {gridPositions.map((pos) => {
                const cellData = fn.distribution[pos];
                const percentage = cellData?.percentage || 0;
                const count = cellData?.count || 0;

                return (
                  <Box
                    key={pos}
                    sx={{
                      flex: 1,
                      minWidth: 60,
                      minHeight: 50,
                      backgroundColor: getHeatmapColor(percentage),
                      color: getTextColor(percentage),
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "11px",
                      px: 0.5,
                      border: "1px solid #e0e0e0",
                      cursor: "default",
                      position: "relative",
                      "&:hover": {
                        boxShadow: "inset 0 0 0 2px #1976d2",
                      },
                    }}
                    title={`${fn.function} - Position ${pos}\n${percentage.toFixed(1)}% (${count} employees)`}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {percentage.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "10px", opacity: 0.8, lineHeight: 1 }}
                    >
                      ({count})
                    </Typography>
                  </Box>
                );
              })}
              <Box
                sx={{
                  width: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "medium",
                  px: 1,
                }}
              >
                {fn.total}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Heat intensity:
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <Box
                key={intensity}
                sx={{
                  width: 30,
                  height: 20,
                  backgroundColor: getHeatmapColor(maxPercentage * intensity),
                  border: "1px solid #e0e0e0",
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            0% - {maxPercentage.toFixed(1)}%
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
