/**
 * Distribution section component - displays talent distribution chart and stats
 */

import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import { SectionHeader } from "../atoms/SectionHeader";
import { DistributionStats } from "../atoms/DistributionStats";
import PieChartIcon from "@mui/icons-material/PieChart";
import type { DistributionData } from "../../../types/intelligence";

export interface DistributionSectionProps {
  data: DistributionData;
  chartComponent?: React.ReactNode;
  showIdeal?: boolean;
}

export const DistributionSection: React.FC<DistributionSectionProps> = ({
  data,
  chartComponent,
  showIdeal = true,
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          title="Talent Distribution"
          tooltip="Overview of how employees are distributed across the 9-box grid"
          icon={<PieChartIcon />}
        />

        {chartComponent && (
          <Box sx={{ mb: 3 }}>
            {chartComponent}
          </Box>
        )}

        <DistributionStats data={data} showIdeal={showIdeal} />

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Box component="span" sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
            Total Employees: {data.total}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
