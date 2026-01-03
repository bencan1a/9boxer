/**
 * InsightCard component - displays a single selectable insight
 *
 * Used in the Calibration Summary section to show individual insights
 * that can be selected/deselected for LLM summary generation.
 */

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import GroupsIcon from "@mui/icons-material/Groups";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import type {
  Insight,
  InsightCategory,
  InsightPriority,
} from "../../types/api";
import { ClusterBadge } from "./ClusterBadge";

interface InsightCardProps {
  /** The insight to display */
  insight: Insight;
  /** Whether the insight is selected */
  selected: boolean;
  /** Callback when selection is toggled */
  onToggle: () => void;
  /** Whether to show cluster badge if available */
  showClusterBadge?: boolean;
  /** Compact mode shows only title, click to expand for details */
  compact?: boolean;
}

/**
 * Get icon for insight category
 */
const getCategoryIcon = (category: InsightCategory): React.ReactNode => {
  switch (category) {
    case "location":
      return <LocationOnIcon fontSize="small" />;
    case "function":
      return <WorkIcon fontSize="small" />;
    case "level":
    case "tenure":
      return <GroupsIcon fontSize="small" />;
    case "distribution":
      return <TrendingUpIcon fontSize="small" />;
    case "time":
      return <ScheduleIcon fontSize="small" />;
    default:
      return <LightbulbIcon fontSize="small" />;
  }
};

/**
 * Get color for priority badge
 */
const getPriorityColor = (
  priority: InsightPriority
): "error" | "warning" | "success" => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "success";
  }
};

/**
 * Get label for priority
 */
const getPriorityLabel = (priority: InsightPriority): string => {
  switch (priority) {
    case "high":
      return "HIGH";
    case "medium":
      return "MED";
    case "low":
      return "LOW";
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  selected,
  onToggle,
  showClusterBadge = true,
  compact = false,
}) => {
  const { t } = useTranslation();
  const [isDetailExpanded, setIsDetailExpanded] = React.useState(!compact);
  const hasCluster = insight.cluster_id && insight.cluster_title;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        opacity: selected ? 1 : 0.6,
        borderColor: selected ? "primary.main" : "divider",
        borderWidth: 2,
        backgroundColor: selected ? "action.hover" : "background.default",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          opacity: 1,
          backgroundColor: "action.hover",
        },
      }}
      data-testid={`insight-card-${insight.id}`}
    >
      <CardActionArea
        onClick={onToggle}
        aria-label={`${selected ? "Deselect" : "Select"} insight: ${insight.title}`}
        role="button"
      >
        <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            {/* Checkbox */}
            <Checkbox
              checked={selected}
              onChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ p: 0, mt: 0.25 }}
              data-testid={`insight-checkbox-${insight.id}`}
              inputProps={{
                "aria-label": `Select ${insight.title}`,
              }}
            />

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Header row: Priority badge only */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mb: 0.75,
                }}
              >
                <Chip
                  label={getPriorityLabel(insight.priority)}
                  color={getPriorityColor(insight.priority)}
                  variant="outlined"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    borderWidth: 1.5,
                    "& .MuiChip-label": { px: 0.75, py: 0 },
                  }}
                  data-testid={`insight-priority-${insight.id}`}
                />
                {hasCluster && showClusterBadge && (
                  <ClusterBadge
                    clusterId={insight.cluster_id!}
                    clusterTitle={insight.cluster_title!}
                  />
                )}
              </Box>

              {/* Title row with icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 0.75,
                  mb: 0.75,
                }}
              >
                <Box
                  sx={{
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    mt: 0.25,
                  }}
                >
                  {getCategoryIcon(insight.category)}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                  data-testid={`insight-title-${insight.id}`}
                >
                  {insight.title}
                </Typography>
              </Box>

              {/* Compact mode: Show expand toggle */}
              {compact && !isDetailExpanded && (
                <Typography
                  component="span"
                  variant="caption"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailExpanded(true);
                  }}
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                    display: "inline-block",
                  }}
                  data-testid={`insight-expand-toggle-${insight.id}`}
                >
                  Show details
                </Typography>
              )}

              {/* Full details - shown in non-compact mode or when expanded */}
              {isDetailExpanded && (
                <>
                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.5,
                      mb: 0.75,
                      fontSize: "0.85rem",
                    }}
                    data-testid={`insight-description-${insight.id}`}
                  >
                    {insight.description}
                  </Typography>

                  {/* Hide details link for compact mode */}
                  {compact && (
                    <Typography
                      component="span"
                      variant="caption"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDetailExpanded(false);
                      }}
                      sx={{
                        color: "text.secondary",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                        mb: 0.75,
                        display: "inline-block",
                      }}
                    >
                      Hide details
                    </Typography>
                  )}

                  {/* Affected count - integrated with border-top */}
                  <Box
                    sx={{
                      pt: 0.75,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem" }}
                      data-testid={`insight-affected-${insight.id}`}
                    >
                      {t("intelligence.calibrationSummary.affectedEmployees", {
                        count: insight.affected_count,
                        defaultValue: `${insight.affected_count} employees affected`,
                      })}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
