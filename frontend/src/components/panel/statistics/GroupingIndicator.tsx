/**
 * GroupingIndicator - CSS-based grouping indicator for distribution table
 *
 * Displays a colored vertical bar with group label and percentage to indicate
 * three performance tiers: High Performers, Middle Tier, and Low Performers.
 *
 * Replaces the previous SVG curly brace approach with a cleaner CSS solution
 * using colored borders and background tints.
 *
 * @component
 * @example
 * ```tsx
 * <GroupingIndicator
 *   groupType="high"
 *   percentage={32.5}
 *   rowSpan={3}
 * />
 * ```
 */

import React from "react";
import TableCell from "@mui/material/TableCell";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/system";
import { useTheme } from "@mui/material/styles";

export interface GroupingIndicatorProps {
  /** Type of performance group */
  groupType: "high" | "middle" | "low";
  /** Total percentage for this group */
  percentage: number;
  /** Number of table rows to span */
  rowSpan?: number;
  /** Test identifier for automated testing */
  "data-testid"?: string;
}

/**
 * Get the group label based on type
 */
const getGroupLabel = (groupType: "high" | "middle" | "low"): string => {
  switch (groupType) {
    case "high":
      return "High Performers";
    case "middle":
      return "Middle Tier";
    case "low":
      return "Low Performers";
  }
};

/**
 * GroupingIndicator Component
 *
 * A CSS-based grouping indicator that uses colored borders and background tints
 * to show performance tier groupings in the distribution table.
 *
 * **Color Logic:**
 * - High Performers (9, 8, 6): Green (balanced 25-35%), Orange (<20% too low), Blue (>40% too high)
 * - Middle Tier (7, 5, 3): Blue (balanced 30-40%), Orange (outside 25-45%)
 * - Low Performers (4, 2, 1): Green (balanced 15-25%), Blue (<10% good), Red (>30% too many)
 *
 * **Design Tokens Used:**
 * - `theme.tokens.spacing.sm` - Gap between label and percentage
 * - `theme.palette.*` - Dynamic color based on groupType and percentage
 * - `alpha()` - Background tint transparency
 *
 * **Accessibility:**
 * - Semantic TableCell element
 * - Color is not the only indicator (label + percentage provide context)
 * - Proper text contrast ratios
 */
export const GroupingIndicator: React.FC<GroupingIndicatorProps> = ({
  groupType,
  percentage,
  rowSpan = 3,
  "data-testid": testId,
}) => {
  const theme = useTheme();

  /**
   * Determine color based on groupType and percentage
   * Color indicates if distribution is balanced, skewed, or concerning
   */
  const getGroupColor = (): string => {
    switch (groupType) {
      case "high":
        // High performers (positions 9, 8, 6)
        if (percentage < 20) return theme.palette.warning.main; // Too low - orange
        if (percentage > 40) return theme.palette.info.main; // Too high - blue
        return theme.palette.success.main; // Balanced - green

      case "middle":
        // Middle tier (positions 7, 5, 3)
        if (percentage < 25 || percentage > 45)
          return theme.palette.warning.main; // Out of range - orange
        return theme.palette.info.main; // Balanced - blue

      case "low":
        // Low performers (positions 4, 2, 1)
        if (percentage < 10) return theme.palette.info.main; // Very few - blue (good)
        if (percentage > 30) return theme.palette.error.main; // Too many - red (concerning)
        return theme.palette.success.main; // Balanced - green
    }
  };

  const groupColor = getGroupColor();
  const groupLabel = getGroupLabel(groupType);

  return (
    <TableCell
      rowSpan={rowSpan}
      align="center"
      data-testid={testId || `grouping-indicator-${groupType}`}
      sx={{
        position: "relative",
        width: 120,
        borderLeft: `4px solid ${groupColor}`,
        backgroundColor: alpha(groupColor, 0.05),
        verticalAlign: "middle",
        borderBottom: "none", // Remove bottom border for cleaner rowSpan appearance
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.tokens.spacing.sm / 8, // Convert 8px to MUI units (1)
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: groupColor,
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.65rem",
          }}
          data-testid={`${testId || `grouping-indicator-${groupType}`}-label`}
        >
          {groupLabel}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: groupColor,
            fontWeight: "bold",
          }}
          data-testid={`${testId || `grouping-indicator-${groupType}`}-percentage`}
        >
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
    </TableCell>
  );
};
