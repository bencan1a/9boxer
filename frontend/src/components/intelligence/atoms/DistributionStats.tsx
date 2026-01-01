/**
 * Distribution statistics component - displays breakdown of distribution percentages
 */

import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
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

/** Threshold for highlighting significant deviations from ideal distribution (percentage points) */
const SIGNIFICANT_DEVIATION_THRESHOLD = 5;

/**
 * Displays talent distribution statistics across all nine box positions.
 *
 * Shows percentage breakdown for each grid position with employee counts, color-coded
 * backgrounds matching grid colors, and optional comparison to ideal distribution percentages.
 * Highlights significant deviations from ideal with warning borders.
 *
 * @component
 * @example
 * ```tsx
 * <DistributionStats
 *   data={{
 *     segments: [
 *       { position: 1, count: 5, percentage: 10.5, label: 'Low/Low' },
 *       { position: 2, count: 8, percentage: 16.8, label: 'Medium/Low' },
 *       // ... other positions
 *     ],
 *     total: 48,
 *     idealPercentages: {
 *       '1': 5.0,
 *       '2': 10.0,
 *       // ... other positions
 *     }
 *   }}
 *   showIdeal={true}
 * />
 * ```
 *
 * @param {DistributionStatsProps} props - Component props
 * @param {DistributionData} props.data - Distribution data with segments and ideal percentages
 * @param {boolean} [props.showIdeal=true] - Whether to show deviation from ideal percentages
 *
 * @accessibility
 * - Each position card has data-testid for testing
 * - Color-coded backgrounds with sufficient contrast
 * - Text labels provide context for visual information
 * - Employee counts include proper pluralization
 *
 * @i18n
 * - Uses English text for position labels and employee counts
 * - "Position N" label format
 * - "N employee(s)" label with pluralization
 * - "±X% vs ideal" deviation label
 *
 * @see DistributionSection
 * @see DistributionData type definition
 */

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

  /**
   * Gets the background color for a grid position, matching the main grid colors.
   *
   * @param {number} position - Grid position (1-9)
   * @returns {string} Theme color for the position
   */
  const getPositionColor = (position: number): string => {
    // High Performers: [M,H], [H,H], [H,M] = positions 8, 9, 6
    if ([6, 8, 9].includes(position)) {
      return (
        theme.palette.gridBox?.highPerformer || theme.palette.success.light
      );
    }
    // Needs Attention: [L,L], [M,L], [L,M] = positions 1, 2, 4
    if ([1, 2, 4].includes(position)) {
      return theme.palette.gridBox?.needsAttention || theme.palette.error.light;
    }
    // Solid Performer: [M,M] = position 5
    if (position === 5) {
      return theme.palette.gridBox?.solidPerformer || theme.palette.info.light;
    }
    // Development: [L,H], [H,L] = positions 7, 3
    if ([3, 7].includes(position)) {
      return theme.palette.gridBox?.development || theme.palette.warning.light;
    }
    return theme.palette.action.hover;
  };

  /**
   * Calculates the deviation from ideal distribution percentage.
   *
   * @param {number} position - Grid position (1-9)
   * @param {number} actual - Actual percentage for this position
   * @returns {number | null} Deviation in percentage points, or null if not showing ideal
   */
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
          deviation !== null &&
          Math.abs(deviation) > SIGNIFICANT_DEVIATION_THRESHOLD;

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
