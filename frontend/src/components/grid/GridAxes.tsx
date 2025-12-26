/**
 * Grid axes component - displays X (Performance) and Y (Potential) axis labels
 * 
 * @component
 * @example
 * ```tsx
 * <GridAxes 
 *   xAxisLabel="Performance" 
 *   yAxisLabel="Potential" 
 *   showLabels={true} 
 * />
 * ```
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Props for the GridAxes component
 */
export interface GridAxesProps {
  /** Custom label for the X-axis (Performance). Defaults to i18n translation. */
  xAxisLabel?: string;
  /** Custom label for the Y-axis (Potential). Defaults to i18n translation. */
  yAxisLabel?: string;
  /** Whether to show axis labels. Defaults to true. */
  showLabels?: boolean;
}

/**
 * GridAxes component - displays axis labels for the nine-box grid
 * 
 * Renders the X-axis (Performance) and Y-axis (Potential) labels with 
 * proper spacing and vertical text rotation for the Y-axis.
 * 
 * @param props - Component props
 * @returns The rendered axis labels or null if showLabels is false
 */
export const GridAxes: React.FC<GridAxesProps> = ({
  xAxisLabel,
  yAxisLabel,
  showLabels = true,
}) => {
  const { t } = useTranslation();

  const xLabel = xAxisLabel || t("grid.axes.performance");
  const yLabel = yAxisLabel || t("grid.axes.potential");

  if (!showLabels) {
    return null;
  }

  return (
    <>
      {/* Left axis label (Potential) */}
      <Box
        sx={{
          width: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
        data-testid="grid-y-axis"
      >
        <Typography variant="h6" fontWeight="bold">
          {yLabel}
        </Typography>
      </Box>
    </>
  );
};
