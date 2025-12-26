/**
 * Heatmap showing distribution across grid positions by function
 */

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

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

  // Grid positions in order (9-box layout order)
  const gridPositions = ["9", "8", "7", "6", "5", "4", "3", "2", "1"];

  // Find max percentage for color scaling
  const maxPercentage = Math.max(
    ...data.flatMap((fn) =>
      gridPositions.map((pos) => fn.distribution[pos]?.percentage || 0)
    )
  );

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Get color based on percentage (gradient from light to dark)
  const getHeatmapColor = (percentage: number): string => {
    if (percentage === 0) {
      return theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100];
    }
    const intensity = percentage / maxPercentage;

    // Use theme primary color for gradient (from design tokens)
    const primaryHex =
      theme.palette.mode === "dark"
        ? theme.tokens.colors.primary.dark.main
        : theme.tokens.colors.primary.light.main;
    const primaryRgb = hexToRgb(primaryHex);

    // Interpolate from light to primary color
    const r = Math.floor(primaryRgb.r + (255 - primaryRgb.r) * (1 - intensity));
    const g = Math.floor(primaryRgb.g + (255 - primaryRgb.g) * (1 - intensity));
    const b = Math.floor(primaryRgb.b + (255 - primaryRgb.b) * (1 - intensity));

     
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Get text color based on background
  const getTextColor = (percentage: number): string => {
    const intensity = percentage / maxPercentage;
    return intensity > 0.6
      ? theme.palette.getContrastText(theme.palette.primary.main)
      : theme.palette.text.primary;
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
                fontSize: theme.tokens.typography.fontSize.caption,
                display: "flex",
                alignItems: "center",
                px: 1,
                color: theme.palette.text.primary,
              }}
            >
              {t("panel.intelligenceTab.chart.function")}
            </Box>
            {gridPositions.map((pos) => (
              <Box
                key={pos}
                sx={{
                  flex: 1,
                  minWidth: 60,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: theme.tokens.typography.fontSize.caption,
                  px: 1,
                }}
              >
                {t("panel.intelligenceTab.chart.position", { number: pos })}
              </Box>
            ))}
            <Box
              sx={{
                width: 60,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: theme.tokens.typography.fontSize.caption,
                px: 1,
              }}
            >
              {t("panel.intelligenceTab.chart.total")}
            </Box>
          </Box>

          {/* Data rows */}
          {data.map((fn) => (
            <Box
              key={fn.function}
              sx={{
                display: "flex",
                mb: 0.5,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.text.primary, 0.02),
                },
              }}
            >
              <Box
                sx={{
                  width: 150,
                  fontSize: theme.tokens.typography.fontSize.caption,
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  fontWeight: "medium",
                  color: theme.palette.text.primary,
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
                      fontSize: theme.tokens.typography.fontSize.caption,
                      px: 0.5,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: "default",
                      position: "relative",
                      "&:hover": {
                        boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`,
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
                      sx={{ fontSize: theme.tokens.typography.fontSize.caption, opacity: theme.tokens.opacity.hover, lineHeight: 1 }}
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
                  fontSize: theme.tokens.typography.fontSize.caption,
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
            {t("panel.intelligenceTab.chart.heatIntensity")}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <Box
                key={intensity}
                sx={{
                  width: 30,
                  height: 20,
                  backgroundColor: getHeatmapColor(maxPercentage * intensity),
                  border: `1px solid ${theme.palette.divider}`,
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
