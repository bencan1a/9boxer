/**
 * ColoredPercentageBar - Colored progress bar with position-based logic
 *
 * Displays a LinearProgress bar with dynamic color based on grid position
 * and percentage value. Colors indicate if the distribution for that position
 * is healthy (green), concerning (red/orange), or informational (blue).
 *
 * @component
 * @example
 * ```tsx
 * <ColoredPercentageBar
 *   percentage={25.5}
 *   position={9}
 *   showLabel={true}
 * />
 * ```
 */

import React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { PERFORMANCE_BUCKETS } from "../../../constants/performanceBuckets";

export interface ColoredPercentageBarProps {
  /** Percentage value (0-100) */
  percentage: number;
  /** Grid position (1-9) for color logic */
  position: number;
  /** Whether to show percentage label next to bar */
  showLabel?: boolean;
  /** Test identifier for automated testing */
  "data-testid"?: string;
}

/**
 * ColoredPercentageBar Component
 *
 * A progress bar that changes color based on grid position and percentage value
 * to provide visual feedback about distribution health.
 *
 * **Color Logic:**
 * - **High Performers (9, 8, 6):** Green when ≥8% (healthy), Orange when <8% (too low)
 * - **Middle Tier (7, 5, 3):** Blue when 8-15% (balanced), Orange otherwise (skewed)
 * - **Low Performers (4, 2, 1):** Green when ≤8% (healthy), Red when >8% (concerning)
 *
 * **Design Tokens Used:**
 * - `theme.tokens.radius.sm` - Border radius (4px)
 * - `theme.palette.*` - Dynamic colors based on logic
 * - Height: 8px (specific to progress bars)
 *
 * **Accessibility:**
 * - Progress bar indicates completion percentage
 * - Text label provides exact value
 * - Color is supplementary (not sole indicator)
 */
export const ColoredPercentageBar: React.FC<ColoredPercentageBarProps> = ({
  percentage,
  position,
  showLabel = true,
  "data-testid": testId,
}) => {
  const theme = useTheme();

  /**
   * Determine bar color based on grid position and percentage
   *
   * Color indicates distribution health:
   * - Green: Healthy/balanced distribution
   * - Orange/Warning: Needs attention
   * - Red/Error: Concerning (too many low performers)
   * - Blue/Info: Informational
   */
  const getPercentageBarColor = (): string => {
    // High performers (9, 8, 6) - Want these positions to be well-populated
    if (PERFORMANCE_BUCKETS.High.includes(position)) {
      return percentage >= 8
        ? theme.palette.success.main // Green - good representation
        : theme.palette.warning.main; // Orange - underrepresented
    }

    // Middle tier (7, 5, 3) - Want balanced distribution (not too high or low)
    if (PERFORMANCE_BUCKETS.Medium.includes(position)) {
      return percentage >= 8 && percentage <= 15
        ? theme.palette.info.main // Blue - balanced
        : theme.palette.warning.main; // Orange - skewed
    }

    // Low performers (4, 2, 1) - Want these positions to be minimal
    if (PERFORMANCE_BUCKETS.Low.includes(position)) {
      return percentage <= 8
        ? theme.palette.success.main // Green - few low performers (good)
        : theme.palette.error.main; // Red - too many low performers (concerning)
    }

    // Fallback for any edge cases
    return theme.palette.primary.main;
  };

  const barColor = getPercentageBarColor();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
      }}
      data-testid={testId || "colored-percentage-bar"}
    >
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: theme.tokens.dimensions.progressBar.height,
            borderRadius: theme.tokens.radius.sm / 8, // Convert 4px to MUI units (0.5)
            backgroundColor: theme.palette.action.hover,
            "& .MuiLinearProgress-bar": {
              backgroundColor: barColor,
              borderRadius: theme.tokens.radius.sm / 8,
            },
          }}
          data-testid={`${testId || "colored-percentage-bar"}-progress`}
        />
      </Box>

      {showLabel && (
        <Typography
          variant="body2"
          sx={{
            minWidth: theme.tokens.dimensions.progressBar.labelMinWidth,
            textAlign: "right",
          }}
          data-testid={`${testId || "colored-percentage-bar"}-label`}
        >
          {percentage.toFixed(1)}%
        </Typography>
      )}
    </Box>
  );
};
