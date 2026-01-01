/**
 * Insights section component - displays AI-generated insights
 */

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "../atoms/SectionHeader";
import { InsightCard } from "../atoms/InsightCard";
import { EmptyState } from "../../common/EmptyState";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import type { Insight } from "../../../types/intelligence";

export interface InsightsSectionProps {
  /**
   * List of insights to display
   */
  insights: Insight[];

  /**
   * Callback when an insight action button is clicked
   */
  onInsightAction?: (insightId: string) => void;

  /**
   * Whether to show confidence indicators on insight cards
   */
  showConfidence?: boolean;
}

/**
 * Container section for displaying AI-generated insights.
 *
 * Shows a summary of insights by type (recommendation/observation/warning) with color-coded
 * badges, followed by individual insight cards. Displays an empty state when no insights
 * are available. Each insight can have an optional action button.
 *
 * @component
 * @example
 * ```tsx
 * <InsightsSection
 *   insights={[
 *     {
 *       id: 'insight-1',
 *       type: 'recommendation',
 *       text: 'Consider reviewing employees in position 1 for development opportunities',
 *       confidence: 0.85,
 *       actionLabel: 'View Employees',
 *       metadata: {
 *         employeeCount: 12,
 *         affectedBoxes: [1, 2, 4]
 *       }
 *     },
 *     // ... more insights
 *   ]}
 *   onInsightAction={handleInsightAction}
 *   showConfidence={true}
 * />
 * ```
 *
 * @param {InsightsSectionProps} props - Component props
 * @param {Insight[]} props.insights - List of insights to display
 * @param {function} [props.onInsightAction] - Callback when insight action button is clicked
 * @param {boolean} [props.showConfidence=true] - Whether to show confidence indicators
 *
 * @accessibility
 * - Type badges use color and text labels
 * - Empty state provides meaningful feedback
 * - All interactive elements keyboard accessible
 * - ARIA labels provided by child components
 *
 * @i18n
 * - intelligence.insights.title - Section title
 * - intelligence.insights.tooltip - Section explanatory tooltip
 * - intelligence.insights.empty - Empty state title
 * - intelligence.insights.emptyDescription - Empty state description
 * - intelligence.insights.recommendationCount - Recommendation type count with pluralization
 * - intelligence.insights.observationCount - Observation type count with pluralization
 * - intelligence.insights.warningCount - Warning type count with pluralization
 *
 * @see InsightCard
 * @see SectionHeader
 * @see EmptyState
 */
export const InsightsSection: React.FC<InsightsSectionProps> = ({
  insights,
  onInsightAction,
  showConfidence = true,
}) => {
  const { t } = useTranslation();

  // Count by type - memoized to avoid recalculation on every render
  const { recommendationCount, observationCount, warningCount } = React.useMemo(
    () => ({
      recommendationCount: insights.filter((i) => i.type === "recommendation")
        .length,
      observationCount: insights.filter((i) => i.type === "observation").length,
      warningCount: insights.filter((i) => i.type === "warning").length,
    }),
    [insights]
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          title={t("intelligence.insights.title")}
          tooltip={t("intelligence.insights.tooltip")}
          icon={<LightbulbIcon />}
        />

        {insights.length === 0 ? (
          <EmptyState
            title={t("intelligence.insights.empty")}
            description={t("intelligence.insights.emptyDescription")}
            iconSize="small"
          />
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              {recommendationCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {t("intelligence.insights.recommendationCount", {
                      count: recommendationCount,
                    })}
                  </Box>
                </Box>
              )}
              {observationCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "info.main",
                    }}
                  />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {t("intelligence.insights.observationCount", {
                      count: observationCount,
                    })}
                  </Box>
                </Box>
              )}
              {warningCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                    }}
                  />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {t("intelligence.insights.warningCount", {
                      count: warningCount,
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAction={onInsightAction}
                  showConfidence={showConfidence}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
