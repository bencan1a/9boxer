/**
 * Axis component - displays a single axis label (Performance or Potential)
 *
 * @component
 * @example
 * ```tsx
 * // Horizontal axis (Performance)
 * <Axis orientation="horizontal" label="Performance" />
 *
 * // Vertical axis (Potential)
 * <Axis orientation="vertical" label="Potential" />
 * ```
 */

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

/**
 * Props for the Axis component
 */
export interface AxisProps {
  /** Orientation of the axis */
  orientation: "horizontal" | "vertical";
  /** Custom label text. If not provided, uses i18n translation based on orientation. */
  label?: string;
  /** Whether to show the axis label. Defaults to true. */
  showLabel?: boolean;
}

/**
 * Axis component - renders a single axis label with configurable orientation
 *
 * - Horizontal: Centered at top, used for Performance (X-axis)
 * - Vertical: Rotated text on left, used for Potential (Y-axis)
 *
 * @param props - Component props
 * @returns The rendered axis label or null if showLabel is false
 */
export const Axis: React.FC<AxisProps> = ({
  orientation,
  label,
  showLabel = true,
}) => {
  const { t } = useTranslation();

  // Default labels based on orientation
  const defaultLabel =
    orientation === "horizontal"
      ? t("grid.axes.performance")
      : t("grid.axes.potential");

  const displayLabel = label || defaultLabel;

  if (!showLabel) {
    return null;
  }

  if (orientation === "horizontal") {
    // Horizontal axis (Performance) - centered at top
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        data-testid="grid-axis-horizontal"
      >
        <Typography variant="h6" fontWeight="bold">
          {displayLabel}
        </Typography>
      </Box>
    );
  }

  // Vertical axis (Potential) - rotated text on left
  return (
    <Box
      sx={{
        width: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
      }}
      data-testid="grid-axis-vertical"
    >
      <Typography variant="h6" fontWeight="bold">
        {displayLabel}
      </Typography>
    </Box>
  );
};
