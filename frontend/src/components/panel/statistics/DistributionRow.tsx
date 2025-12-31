/**
 * DistributionRow - Individual table row for distribution table
 *
 * Displays a single position's distribution data with:
 * - Position label (e.g., "9 - Star Performer")
 * - Employee count
 * - Colored percentage bar
 * - Optional grouping indicator cell
 *
 * @component
 * @example
 * ```tsx
 * <DistributionRow
 *   position={9}
 *   positionLabel="9 - Star Performer"
 *   count={12}
 *   percentage={10.8}
 * />
 * ```
 */

import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { ColoredPercentageBar } from "./ColoredPercentageBar";

export interface DistributionRowProps {
  /** Grid position (1-9) */
  position: number;
  /** Human-readable position label */
  positionLabel: string;
  /** Number of employees in this position */
  count: number;
  /** Percentage of total employees */
  percentage: number;
  /** Whether this position has zero employees */
  isEmpty?: boolean;
  /** Optional grouping indicator to render (passed from parent) */
  groupIndicator?: React.ReactNode;
  /** Test identifier for automated testing */
  "data-testid"?: string;
}

/**
 * DistributionRow Component
 *
 * A table row component that displays distribution data for a single grid position.
 *
 * **Design Tokens Used:**
 * - `theme.tokens.spacing.sm` - Gap between elements
 * - `theme.palette.mode` - Empty state background color
 *
 * **Empty State Styling:**
 * Rows with zero employees have a different background color to indicate
 * the position is unpopulated.
 *
 * **Accessibility:**
 * - Semantic table row element
 * - Font weight changes based on count (bold when > 0)
 * - Color-coded percentage bar provides visual feedback
 */
export const DistributionRow: React.FC<DistributionRowProps> = ({
  position,
  positionLabel,
  count,
  percentage,
  isEmpty = false,
  groupIndicator,
  "data-testid": testId,
}) => {
  const theme = useTheme();

  return (
    <TableRow
      data-testid={testId || `distribution-row-${position}`}
      sx={{
        backgroundColor: isEmpty
          ? theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)" // eslint-disable-line no-restricted-syntax -- Dark mode empty state fallback
            : "grey.50"
          : "transparent",
      }}
    >
      {/* Position Label */}
      <TableCell component="th" scope="row">
        <Typography
          variant="body2"
          data-testid={`${testId || `distribution-row-${position}`}-label`}
        >
          {positionLabel}
        </Typography>
      </TableCell>

      {/* Employee Count */}
      <TableCell align="right">
        <Typography
          variant="body2"
          fontWeight={count > 0 ? "medium" : "normal"}
          data-testid={`${testId || `distribution-row-${position}`}-count`}
        >
          {count}
        </Typography>
      </TableCell>

      {/* Percentage Bar */}
      <TableCell align="left">
        <ColoredPercentageBar
          percentage={percentage}
          position={position}
          showLabel={true}
          data-testid={`${testId || `distribution-row-${position}`}-bar`}
        />
      </TableCell>

      {/* Optional Grouping Indicator */}
      {groupIndicator}
    </TableRow>
  );
};
