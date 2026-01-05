/**
 * DistributionTable - Complete distribution table with grouping indicators
 *
 * Displays employee distribution across all 9 grid positions with:
 * - Custom sort order (9,8,6, 7,5,3, 4,2,1)
 * - Colored percentage bars based on position
 * - Three-tier grouping indicators (High, Middle, Low performers)
 * - Empty state styling for unpopulated positions
 *
 * @component
 * @example
 * ```tsx
 * <DistributionTable
 *   distribution={[...]}
 *   groupedStats={{
 *     highPerformers: { count: 41, percentage: 32.5 },
 *     middleTier: { count: 48, percentage: 38.1 },
 *     lowPerformers: { count: 37, percentage: 29.4 }
 *   }}
 * />
 * ```
 */

import React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { DistributionRow } from "./DistributionRow";
import { GroupingIndicator } from "./GroupingIndicator";
import type { PositionDistribution } from "../../../types/api";
import { getPositionName } from "../../../constants/positionLabels";

export interface DistributionTableProps {
  /** Array of position distribution data */
  distribution: PositionDistribution[];
  /** Grouped statistics for high/middle/low performers */
  groupedStats?: {
    highPerformers: { count: number; percentage: number };
    middleTier: { count: number; percentage: number };
    lowPerformers: { count: number; percentage: number };
  };
  /** Test identifier for automated testing */
  "data-testid"?: string;
}

/**
 * DistributionTable Component
 *
 * Orchestrates the complete distribution table with custom sorting, grouping,
 * and visual indicators for distribution health.
 *
 * **Custom Sort Order:**
 * Positions are grouped by performance tier:
 * - High Performers: 9, 8, 6
 * - Middle Tier: 7, 5, 3
 * - Low Performers: 4, 2, 1
 *
 * **Design Tokens Used:**
 * - `theme.tokens.spacing.md` - Table padding
 * - `theme.palette.divider` - Border colors
 *
 * **Accessibility:**
 * - Semantic table structure
 * - Table headers with proper scope
 * - Grouping indicators use rowSpan for semantic grouping
 */
export const DistributionTable: React.FC<DistributionTableProps> = ({
  distribution,
  groupedStats,
  "data-testid": testId,
}) => {
  const { t } = useTranslation();

  // Custom sort order: High (9,8,6), Middle (7,5,3), Low (4,2,1)
  const customOrder = [9, 8, 6, 7, 5, 3, 4, 2, 1];

  // Sort distribution by custom order
  const sortedDistribution = [...distribution].sort(
    (a, b) =>
      customOrder.indexOf(a.grid_position) -
      customOrder.indexOf(b.grid_position)
  );

  /**
   * Determine if a position is the first in its group
   * (for rendering GroupingIndicator with rowSpan=3)
   */
  const isGroupStart = (position: number): boolean => {
    return position === 9 || position === 7 || position === 4;
  };

  /**
   * Get grouping indicator for a position if it's a group start
   */
  const getGroupIndicator = (position: number): React.ReactNode => {
    if (!groupedStats) return null;

    if (position === 9) {
      // High performers group (9, 8, 6)
      return (
        <GroupingIndicator
          groupType="high"
          percentage={groupedStats.highPerformers.percentage}
          rowSpan={3}
        />
      );
    }

    if (position === 7) {
      // Middle tier group (7, 5, 3)
      return (
        <GroupingIndicator
          groupType="middle"
          percentage={groupedStats.middleTier.percentage}
          rowSpan={3}
        />
      );
    }

    if (position === 4) {
      // Low performers group (4, 2, 1)
      return (
        <GroupingIndicator
          groupType="low"
          percentage={groupedStats.lowPerformers.percentage}
          rowSpan={3}
        />
      );
    }

    return null;
  };

  return (
    <Box data-testid={testId || "distribution-table"}>
      <Typography
        variant="subtitle2"
        color="primary"
        gutterBottom
        data-testid={`${testId || "distribution-table"}-title`}
      >
        {t("panel.statisticsTab.distributionByPosition")}
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("panel.statisticsTab.position")}</TableCell>
              <TableCell align="right">
                {t("panel.statisticsTab.count")}
              </TableCell>
              <TableCell align="left" sx={{ minWidth: 200 }}>
                {t("panel.statisticsTab.percentage")}
              </TableCell>
              <TableCell align="center" sx={{ width: 120 }}>
                {t("panel.statisticsTab.groupPercentage")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDistribution.map((row) => (
              <DistributionRow
                key={row.grid_position}
                position={row.grid_position}
                positionLabel={
                  row.position_label || getPositionName(row.grid_position)
                }
                count={row.count}
                percentage={row.percentage}
                isEmpty={row.count === 0}
                groupIndicator={
                  isGroupStart(row.grid_position)
                    ? getGroupIndicator(row.grid_position)
                    : undefined
                }
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
