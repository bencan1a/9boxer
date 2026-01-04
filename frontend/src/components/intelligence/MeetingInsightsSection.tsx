/**
 * Calibration Insights Section - Displays selectable calibration insights
 *
 * Separated from CalibrationSummarySection to avoid double-nesting
 * and provide clear visual hierarchy below AI summary.
 */

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { InsightCard } from "./InsightCard";
import type { Insight } from "../../types/api";

interface MeetingInsightsSectionProps {
  insights: Insight[];
  selectedInsights: Record<string, boolean>;
  onToggleInsight: (insightId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  defaultExpanded?: boolean;
}

export const MeetingInsightsSection: React.FC<MeetingInsightsSectionProps> = ({
  insights,
  selectedInsights,
  onToggleInsight,
  onSelectAll,
  onDeselectAll,
  defaultExpanded = true,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("high");

  // Filter insights by priority
  const filteredInsights =
    priorityFilter === "all"
      ? insights
      : insights.filter((insight) => insight.priority === priorityFilter);

  // Calculate priority counts for filter buttons
  const priorityCounts = {
    all: insights.length,
    high: insights.filter((i) => i.priority === "high").length,
    medium: insights.filter((i) => i.priority === "medium").length,
    low: insights.filter((i) => i.priority === "low").length,
  };

  return (
    <Card
      variant="outlined"
      sx={{ mb: 2 }}
      data-testid="meeting-insights-section"
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          bgcolor: "background.default",
          borderBottom: expanded ? 1 : 0,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <ChecklistIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="medium">
            {t("intelligence.calibrationSummary.insights", {
              defaultValue: "Calibration Insights",
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({filteredInsights.length} of {insights.length})
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ButtonGroup size="small" variant="text">
            <Button onClick={onSelectAll}>Select All</Button>
            <Button onClick={onDeselectAll}>Deselect All</Button>
          </ButtonGroup>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <CardContent>
          {/* Priority Filter */}
          <Box sx={{ mb: 1.5 }}>
            <ButtonGroup size="small" variant="outlined">
              <Button
                variant={priorityFilter === "all" ? "contained" : "outlined"}
                onClick={() => setPriorityFilter("all")}
              >
                All ({priorityCounts.all})
              </Button>
              <Button
                variant={priorityFilter === "high" ? "contained" : "outlined"}
                onClick={() => setPriorityFilter("high")}
                color="error"
              >
                High ({priorityCounts.high})
              </Button>
              <Button
                variant={priorityFilter === "medium" ? "contained" : "outlined"}
                onClick={() => setPriorityFilter("medium")}
                color="warning"
              >
                Medium ({priorityCounts.medium})
              </Button>
              <Button
                variant={priorityFilter === "low" ? "contained" : "outlined"}
                onClick={() => setPriorityFilter("low")}
                color="success"
              >
                Low ({priorityCounts.low})
              </Button>
            </ButtonGroup>
          </Box>

          {/* Insight Cards */}
          <Box
            sx={{
              maxHeight: 400,
              overflowY: "auto",
              pr: 1,
            }}
          >
            {filteredInsights.length > 0 ? (
              filteredInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  selected={selectedInsights[insight.id] ?? true}
                  onToggle={() => onToggleInsight(insight.id)}
                  compact={true}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, textAlign: "center" }}
              >
                No {priorityFilter} priority insights found
              </Typography>
            )}
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};
