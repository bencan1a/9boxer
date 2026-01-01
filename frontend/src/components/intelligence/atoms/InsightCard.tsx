/**
 * Insight card component - displays an AI-generated insight with confidence indicator
 */

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { InsightCardProps } from "../../../types/intelligence";

/** Confidence threshold for high-confidence insights (80%) */
const CONFIDENCE_THRESHOLD_HIGH = 0.8;

/** Confidence threshold for medium-confidence insights (50%) */
const CONFIDENCE_THRESHOLD_MEDIUM = 0.5;

/**
 * Displays an AI-generated insight with confidence indicator and optional action.
 *
 * Shows insight type (recommendation/observation/warning), confidence level with visual indicator,
 * and optional action button. The card uses color-coded styling to indicate insight type and
 * confidence level. Supports interactive features like clicking to trigger actions.
 *
 * @component
 * @example
 * ```tsx
 * <InsightCard
 *   insight={{
 *     id: 'insight-1',
 *     type: 'recommendation',
 *     text: 'Consider reviewing employees in position 1 for development opportunities',
 *     confidence: 0.85,
 *     actionLabel: 'View Employees',
 *     metadata: {
 *       employeeCount: 12,
 *       affectedBoxes: [1, 2, 4]
 *     }
 *   }}
 *   onAction={handleInsightAction}
 *   showConfidence={true}
 * />
 * ```
 *
 * @param {InsightCardProps} props - Component props
 * @param {Insight} props.insight - The insight data to display
 * @param {function} [props.onAction] - Optional callback when action button is clicked
 * @param {boolean} [props.showConfidence=true] - Whether to show confidence indicator
 *
 * @accessibility
 * - Keyboard navigation with Enter/Space keys when actionable
 * - ARIA label describes the insight action
 * - Role="button" applied when clickable
 * - Confidence displayed both visually (progress bar) and textually
 *
 * @i18n
 * - intelligence.insightType.recommendation - Recommendation type label
 * - intelligence.insightType.observation - Observation type label
 * - intelligence.insightType.warning - Warning type label
 * - intelligence.confidence.high - High confidence label
 * - intelligence.confidence.medium - Medium confidence label
 * - intelligence.confidence.low - Low confidence label
 * - intelligence.insight.confidence - Confidence label
 * - intelligence.insight.confidenceLabel - Confidence level label with value
 * - intelligence.insight.employeeCount - Employee count with pluralization
 * - intelligence.insight.boxCount - Box count with pluralization
 * - intelligence.insight.actionAria - ARIA label for actionable card
 * - intelligence.insight.actionButtonAria - ARIA label for action button
 *
 * @see InsightsSection
 * @see Insight type definition
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onAction,
  showConfidence = true,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  /**
   * Gets the appropriate icon for the current insight type.
   *
   * @returns {React.ReactElement} Icon component for the insight type
   */
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

  /**
   * Gets the theme color for the current insight type.
   *
   * @returns {string} Theme color for the insight type
   */
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

  /**
   * Gets the localized label for the current insight type.
   *
   * @returns {string} Translated insight type label
   */
  const getTypeLabel = () => {
    switch (insight.type) {
      case "recommendation":
        return t("intelligence.insightType.recommendation");
      case "observation":
        return t("intelligence.insightType.observation");
      case "warning":
        return t("intelligence.insightType.warning");
      default:
        return t("intelligence.insightType.observation");
    }
  };

  /**
   * Gets the theme color for the current confidence level.
   *
   * @returns {string} Theme color for the confidence level
   */
  const getConfidenceColor = () => {
    if (insight.confidence >= CONFIDENCE_THRESHOLD_HIGH)
      return theme.palette.success.main;
    if (insight.confidence >= CONFIDENCE_THRESHOLD_MEDIUM)
      return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  /**
   * Gets the localized label for the current confidence level.
   *
   * @returns {string} Translated confidence level label
   */
  const getConfidenceLabel = () => {
    if (insight.confidence >= CONFIDENCE_THRESHOLD_HIGH)
      return t("intelligence.confidence.high");
    if (insight.confidence >= CONFIDENCE_THRESHOLD_MEDIUM)
      return t("intelligence.confidence.medium");
    return t("intelligence.confidence.low");
  };

  /**
   * Handles action button click to trigger onAction callback.
   */
  const handleAction = () => {
    if (onAction) {
      onAction(insight.id);
    }
  };

  /**
   * Handles card click to trigger action if available.
   */
  const handleCardClick = () => {
    if (insight.actionLabel && onAction) {
      onAction(insight.id);
    }
  };

  /**
   * Handles keyboard navigation for card interaction.
   *
   * @param {React.KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (insight.actionLabel && onAction) {
        onAction(insight.id);
      }
    }
  };

  const isClickable = Boolean(insight.actionLabel && onAction);

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${getTypeColor()}`,
        cursor: isClickable ? "pointer" : "default",
        "&:hover": isClickable
          ? {
              backgroundColor: theme.palette.action.hover,
            }
          : {},
      }}
      onClick={isClickable ? handleCardClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      aria-label={
        isClickable
          ? t("intelligence.insight.actionAria", {
              action: insight.actionLabel,
              type: getTypeLabel(),
            })
          : undefined
      }
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
              label={t("intelligence.insight.confidenceLabel", {
                level: getConfidenceLabel(),
              })}
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
                {t("intelligence.insight.confidence")}
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
                {t("intelligence.insight.employeeCount", {
                  count: insight.metadata.employeeCount,
                })}
              </Typography>
            )}
            {insight.metadata?.affectedBoxes && (
              <Typography variant="caption" color="text.secondary">
                {t("intelligence.insight.boxCount", {
                  count: insight.metadata.affectedBoxes.length,
                })}
              </Typography>
            )}
          </Box>
          {insight.actionLabel && onAction && (
            <Button
              size="small"
              onClick={handleAction}
              aria-label={t("intelligence.insight.actionButtonAria", {
                action: insight.actionLabel,
              })}
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
