/**
 * StatisticsSummary - Summary cards container for key metrics
 *
 * Displays three StatisticCard components in a responsive grid layout showing:
 * - Total Employees
 * - Modified Employees (this session)
 * - High Performers
 *
 * @component
 * @example
 * ```tsx
 * <StatisticsSummary
 *   totalEmployees={125}
 *   modifiedEmployees={23}
 *   highPerformers={42}
 * />
 * ```
 */

import React from "react";
import { Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { StatisticCard } from "./StatisticCard";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export interface StatisticsSummaryProps {
  /** Total number of employees in current view */
  totalEmployees: number;
  /** Number of employees modified in current session */
  modifiedEmployees: number;
  /** Number of high performers (positions 6, 8, 9) */
  highPerformers: number;
  /** Test identifier for automated testing */
  "data-testid"?: string;
}

/**
 * StatisticsSummary Component
 *
 * Orchestrates three StatisticCard components in a responsive grid layout.
 *
 * **Design Tokens Used:**
 * - `theme.tokens.spacing.md` - Grid spacing
 *
 * **Responsive Behavior:**
 * - Desktop: 3 columns (equal width)
 * - Tablet: 3 columns (stacked if narrow)
 * - Mobile: 1 column (full width stacking)
 *
 * **Accessibility:**
 * - Each card has semantic color and icon
 * - i18n translated labels
 * - Number formatting for readability
 */
export const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({
  totalEmployees,
  modifiedEmployees,
  highPerformers,
  "data-testid": testId,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid
      container
      spacing={theme.tokens.spacing.md / 8} // Convert 16px to MUI units (2)
      data-testid={testId || "statistics-summary"}
    >
      <Grid item xs={12} sm={4}>
        <StatisticCard
          value={totalEmployees}
          label={t("panel.statisticsTab.totalEmployees")}
          color="primary"
          icon={<PeopleIcon sx={{ fontSize: 32 }} />}
          data-testid="total-employees-card"
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <StatisticCard
          value={modifiedEmployees}
          label={t("panel.statisticsTab.modified")}
          color="warning"
          icon={<EditIcon sx={{ fontSize: 32 }} />}
          data-testid="modified-employees-card"
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <StatisticCard
          value={highPerformers}
          label={t("panel.statisticsTab.highPerformers")}
          color="success"
          icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
          data-testid="high-performers-card"
        />
      </Grid>
    </Grid>
  );
};
