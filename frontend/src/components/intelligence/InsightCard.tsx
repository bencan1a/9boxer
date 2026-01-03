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
}) => {
  const { t } = useTranslation();
  const hasCluster = insight.cluster_id && insight.cluster_title;

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        opacity: selected ? 1 : 0.6,
        borderColor: selected ? "primary.main" : "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          opacity: 1,
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
              sx={{ p: 0, mt: 0.5 }}
              data-testid={`insight-checkbox-${insight.id}`}
              inputProps={{
                "aria-label": `Select ${insight.title}`,
              }}
            />

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Header row: Priority badge + Type icon + Title */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Chip
                  label={getPriorityLabel(insight.priority)}
                  color={getPriorityColor(insight.priority)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                  data-testid={`insight-priority-${insight.id}`}
                />
                {hasCluster && showClusterBadge && (
                  <ClusterBadge
                    clusterId={insight.cluster_id!}
                    clusterTitle={insight.cluster_title!}
                  />
                )}
                <Box
                  sx={{
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getCategoryIcon(insight.category)}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  data-testid={`insight-title-${insight.id}`}
                >
                  {insight.title}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                data-testid={`insight-description-${insight.id}`}
              >
                {insight.description}
              </Typography>

              {/* Affected count */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
                data-testid={`insight-affected-${insight.id}`}
              >
                {t("intelligence.calibrationSummary.affectedEmployees", {
                  count: insight.affected_count,
                  defaultValue: `${insight.affected_count} employees affected`,
                })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
