/**
 * Distribution section component - displays talent distribution chart and stats
 */

import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../atoms/SectionHeader";
import { DistributionStats } from "../atoms/DistributionStats";
import PieChartIcon from "@mui/icons-material/PieChart";
import type { DistributionData } from "../../../types/intelligence";

export interface DistributionSectionProps {
  /**
   * Distribution data with segments and ideal percentages
   */
  data: DistributionData;

  /**
   * Optional chart component to display above statistics
   */
  chartComponent?: React.ReactNode;

  /**
   * Whether to show ideal percentage comparisons
   */
  showIdeal?: boolean;
}

/**
 * Container section for displaying talent distribution analysis.
 *
 * Shows an optional chart visualization followed by detailed distribution statistics
 * for each grid position. Displays total employee count and optional comparison to
 * ideal distribution percentages with deviation highlighting.
 *
 * @component
 * @example
 * ```tsx
 * <DistributionSection
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
 *   chartComponent={<PieChart data={data} />}
 *   showIdeal={true}
 * />
 * ```
 *
 * @param {DistributionSectionProps} props - Component props
 * @param {DistributionData} props.data - Distribution data with segments and ideal percentages
 * @param {React.ReactNode} [props.chartComponent] - Optional chart to display above stats
 * @param {boolean} [props.showIdeal=true] - Whether to show ideal percentage comparisons
 *
 * @accessibility
 * - Section header provides context
 * - Total employee count clearly displayed
 * - Color-coded statistics match grid colors
 * - All interactive elements keyboard accessible
 *
 * @i18n
 * - intelligence.distribution.title - Section title
 * - intelligence.distribution.tooltip - Section explanatory tooltip
 * - intelligence.distribution.totalEmployees - Total employee count with pluralization
 *
 * @see DistributionStats
 * @see SectionHeader
 */
export const DistributionSection: React.FC<DistributionSectionProps> = ({
  data,
  chartComponent,
  showIdeal = true,
}) => {
  const { t } = useTranslation();

  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          title={t("intelligence.distribution.title")}
          tooltip={t("intelligence.distribution.tooltip")}
          icon={<PieChartIcon />}
        />

        {chartComponent && <Box sx={{ mb: 3 }}>{chartComponent}</Box>}

        <DistributionStats data={data} showIdeal={showIdeal} />

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Box
            component="span"
            sx={{ fontSize: "0.875rem", color: "text.secondary" }}
          >
            {t("intelligence.distribution.totalEmployees", {
              count: data.total,
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
