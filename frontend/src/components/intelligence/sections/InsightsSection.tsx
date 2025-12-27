/**
 * Insights section component - displays AI-generated insights
 */

import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import { SectionHeader } from "../atoms/SectionHeader";
import { InsightCard } from "../atoms/InsightCard";
import { EmptyState } from "../../common/EmptyState";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import type { Insight } from "../../../types/intelligence";

export interface InsightsSectionProps {
  insights: Insight[];
  onInsightAction?: (insightId: string) => void;
  showConfidence?: boolean;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({
  insights,
  onInsightAction,
  showConfidence = true,
}) => {
  // Count by type - memoized to avoid recalculation on every render
  const { recommendationCount, observationCount, warningCount } = React.useMemo(
    () => ({
      recommendationCount: insights.filter((i) => i.type === "recommendation").length,
      observationCount: insights.filter((i) => i.type === "observation").length,
      warningCount: insights.filter((i) => i.type === "warning").length,
    }),
    [insights]
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          title="AI Insights"
          tooltip="Automated insights and recommendations based on your talent data"
          icon={<LightbulbIcon />}
        />

        {insights.length === 0 ? (
          <EmptyState
            title="No Insights Available"
            description="AI analysis will generate insights once sufficient data is available."
            iconSize="small"
          />
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              {recommendationCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "primary.main" }} />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {recommendationCount} Recommendation{recommendationCount !== 1 ? "s" : ""}
                  </Box>
                </Box>
              )}
              {observationCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "info.main" }} />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {observationCount} Observation{observationCount !== 1 ? "s" : ""}
                  </Box>
                </Box>
              )}
              {warningCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "warning.main" }} />
                  <Box component="span" sx={{ fontSize: "0.875rem" }}>
                    {warningCount} Warning{warningCount !== 1 ? "s" : ""}
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
