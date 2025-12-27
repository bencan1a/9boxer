/**
 * Insight card component - displays an AI-generated insight with confidence indicator
 */

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { InsightCardProps } from "../../../types/intelligence";

// Confidence thresholds for categorizing insight reliability
const CONFIDENCE_THRESHOLD_HIGH = 0.8;
const CONFIDENCE_THRESHOLD_MEDIUM = 0.5;

/**
 * Insight card component
 *
 * Displays an AI-generated insight with confidence indicator and optional action button.
 *
 * @example
 * ```tsx
 * <InsightCard
 *   insight={insight}
 *   onAction={(id) => console.log('Action:', id)}
 *   showConfidence
 * />
 * ```
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onAction,
  showConfidence = true,
}) => {
  const theme = useTheme();

  const getTypeIcon = () => {
    switch (insight.type) {
      case "recommendation":
        return <LightbulbIcon sx={{ fontSize: 20 }} />;
      case "observation":
        return <VisibilityIcon sx={{ fontSize: 20 }} />;
      case "warning":
        return <ReportProblemIcon sx={{ fontSize: 20 }} />;
      default:
        return <LightbulbIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getTypeColor = () => {
    switch (insight.type) {
      case "recommendation":
        return theme.palette.primary.main;
      case "observation":
        return theme.palette.info.main;
      case "warning":
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getTypeLabel = () => {
    switch (insight.type) {
      case "recommendation":
        return "Recommendation";
      case "observation":
        return "Observation";
      case "warning":
        return "Warning";
      default:
        return "Insight";
    }
  };

  const getConfidenceColor = () => {
    if (insight.confidence >= CONFIDENCE_THRESHOLD_HIGH) return theme.palette.success.main;
    if (insight.confidence >= CONFIDENCE_THRESHOLD_MEDIUM) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getConfidenceLabel = () => {
    if (insight.confidence >= CONFIDENCE_THRESHOLD_HIGH) return "High";
    if (insight.confidence >= CONFIDENCE_THRESHOLD_MEDIUM) return "Medium";
    return "Low";
  };

  const handleAction = () => {
    if (onAction) {
      onAction(insight.id);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${getTypeColor()}`,
      }}
      data-testid={`insight-card-${insight.id}`}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ color: getTypeColor(), display: "flex" }}>
              {getTypeIcon()}
            </Box>
            <Chip
              label={getTypeLabel()}
              size="small"
              variant="outlined"
              sx={{ borderColor: getTypeColor(), color: getTypeColor() }}
            />
          </Box>
          {showConfidence && (
            <Chip
              label={`${getConfidenceLabel()} Confidence`}
              size="small"
              sx={{
                backgroundColor: getConfidenceColor(),
                color: "white",
                fontWeight: "bold",
              }}
            />
          )}
        </Box>

        {/* Insight text */}
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {insight.text}
        </Typography>

        {/* Confidence bar */}
        {showConfidence && (
          <Box sx={{ mb: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Confidence
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(insight.confidence * 100).toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={insight.confidence * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.action.hover,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: getConfidenceColor(),
                },
              }}
            />
          </Box>
        )}

        {/* Metadata and action */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {insight.metadata?.employeeCount !== undefined && (
              <Typography variant="caption" color="text.secondary">
                {insight.metadata.employeeCount} employee
                {insight.metadata.employeeCount !== 1 ? "s" : ""}
              </Typography>
            )}
            {insight.metadata?.affectedBoxes && (
              <Typography variant="caption" color="text.secondary">
                {insight.metadata.affectedBoxes.length} box
                {insight.metadata.affectedBoxes.length !== 1 ? "es" : ""}
              </Typography>
            )}
          </Box>
          {insight.actionLabel && onAction && (
            <Button
              size="small"
              onClick={handleAction}
              data-testid={`insight-action-${insight.id}`}
            >
              {insight.actionLabel}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
