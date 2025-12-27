/**
 * Distribution statistics component - displays breakdown of distribution percentages
 */

import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { DistributionData } from "../../../types/intelligence";

export interface DistributionStatsProps {
  /**
   * Distribution data to display
   */
  data: DistributionData;

  /**
   * Whether to show ideal percentages comparison
   */
  showIdeal?: boolean;
}

/**
 * Distribution stats component
 *
 * Displays grid position distribution as percentage cards.
 *
 * @example
 * ```tsx
 * <DistributionStats data={distributionData} showIdeal />
 * ```
 */
// Threshold for highlighting significant deviations from ideal distribution (percentage points)
const SIGNIFICANT_DEVIATION_THRESHOLD = 5;

export const DistributionStats: React.FC<DistributionStatsProps> = ({
  data,
  showIdeal = true,
}) => {
  const theme = useTheme();

  // Sort segments by position for consistent display (1-9)
  const sortedSegments = React.useMemo(
    () => [...data.segments].sort((a, b) => a.position - b.position),
    [data.segments]
  );

  // Get background color based on position (matching grid colors)
  const getPositionColor = (position: number): string => {
    // High Performers: [M,H], [H,H], [H,M] = positions 8, 9, 6
    if ([6, 8, 9].includes(position)) {
      return theme.palette.gridBox.highPerformer;
    }
    // Needs Attention: [L,L], [M,L], [L,M] = positions 1, 2, 4
    if ([1, 2, 4].includes(position)) {
      return theme.palette.gridBox.needsAttention;
    }
    // Solid Performer: [M,M] = position 5
    if (position === 5) {
      return theme.palette.gridBox.solidPerformer;
    }
    // Development: [L,H], [H,L] = positions 7, 3
    if ([3, 7].includes(position)) {
      return theme.palette.gridBox.development;
    }
    return theme.palette.action.hover;
  };

  // Calculate deviation from ideal
  const getDeviation = (position: number, actual: number): number | null => {
    if (!showIdeal) return null;
    const ideal = data.idealPercentages[position.toString()];
    if (ideal === undefined) return null;
    return actual - ideal;
  };

  return (
    <Grid container spacing={1.5}>
      {sortedSegments.map((segment) => {
        const deviation = getDeviation(segment.position, segment.percentage);
        const hasSignificantDeviation =
          deviation !== null && Math.abs(deviation) > SIGNIFICANT_DEVIATION_THRESHOLD;

        return (
          <Grid item xs={6} sm={4} md={4} key={segment.position}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                backgroundColor: getPositionColor(segment.position),
                border: hasSignificantDeviation
                  ? `2px solid ${theme.palette.warning.main}`
                  : "1px solid",
                borderColor: hasSignificantDeviation
                  ? theme.palette.warning.main
                  : theme.palette.divider,
              }}
              data-testid={`dist-stat-${segment.position}`}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Position {segment.position}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {segment.percentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {segment.count} employee{segment.count !== 1 ? "s" : ""}
              </Typography>
              {deviation !== null && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        Math.abs(deviation) < SIGNIFICANT_DEVIATION_THRESHOLD
                          ? "text.secondary"
                          : deviation > 0
                            ? theme.palette.warning.dark
                            : theme.palette.info.dark,
                      fontWeight: hasSignificantDeviation ? "bold" : "normal",
                    }}
                  >
                    {deviation > 0 ? "+" : ""}
                    {deviation.toFixed(1)}% vs ideal
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};
