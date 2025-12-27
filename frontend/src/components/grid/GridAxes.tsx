/**
 * Grid axes component - displays Y-axis (Potential) label for the nine-box grid
 * 
 * Note: This component only renders the Y-axis label. The X-axis label is rendered
 * separately by NineBoxGrid in its header section.
 * 
 * @component
 * @example
 * ```tsx
 * <GridAxes 
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
  /** Custom label for the Y-axis (Potential). Defaults to i18n translation. */
  yAxisLabel?: string;
  /** Whether to show axis labels. Defaults to true. */
  showLabels?: boolean;
}

/**
 * GridAxes component - displays Y-axis label for the nine-box grid
 * 
 * Renders only the Y-axis (Potential) label with vertical text rotation.
 * The X-axis (Performance) label is rendered separately by NineBoxGrid.
 * 
 * @param props - Component props
 * @returns The rendered Y-axis label or null if showLabels is false
 */
export const GridAxes: React.FC<GridAxesProps> = ({
  yAxisLabel,
  showLabels = true,
}) => {
  const { t } = useTranslation();

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
