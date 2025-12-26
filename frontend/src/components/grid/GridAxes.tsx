/**
 * Grid axes component - displays X (Performance) and Y (Potential) axis labels
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface GridAxesProps {
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLabels?: boolean;
}

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
