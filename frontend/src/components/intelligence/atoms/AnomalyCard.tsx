/**
 * Anomaly card component - displays a single anomaly with severity styling
 */

import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { AnomalyCardProps } from "../../../types/intelligence";

/**
 * Displays a single statistical anomaly detected in talent distribution data.
 *
 * Shows anomaly severity, affected employees, and optional suggestions for remediation.
 * Supports interactive features like clicking for details and dismissing anomalies.
 * The card uses color-coded borders and icons to indicate severity level (critical/warning/info).
 *
 * @component
 * @example
 * ```tsx
 * <AnomalyCard
 *   anomaly={{
 *     id: 'anomaly-1',
 *     type: 'distribution',
 *     severity: 'warning',
 *     title: 'Uneven distribution detected',
 *     description: 'Position 1 has 15% more employees than ideal',
 *     affectedEmployees: ['emp-1', 'emp-2'],
 *     suggestion: 'Consider reviewing calibration for this position',
 *     confidence: 0.85
 *   }}
 *   onClick={handleViewDetails}
 *   onDismiss={handleDismiss}
 *   showActions={true}
 * />
 * ```
 *
 * @param {AnomalyCardProps} props - Component props
 * @param {Anomaly} props.anomaly - The anomaly data to display
 * @param {function} [props.onClick] - Optional callback when card is clicked
 * @param {function} [props.onDismiss] - Optional callback when anomaly is dismissed
 * @param {boolean} [props.showActions=true] - Whether to show action buttons
 *
 * @accessibility
 * - Keyboard navigation with Enter/Space keys when clickable
 * - ARIA label describes the anomaly and action
 * - aria-expanded communicates suggestion toggle state
 * - Dismiss button has descriptive aria-label
 * - Role="button" applied when clickable
 *
 * @i18n
 * - intelligence.severity.critical - Critical severity label
 * - intelligence.severity.warning - Warning severity label
 * - intelligence.severity.info - Info severity label
 * - intelligence.anomaly.affectedEmployees - Affected employees label
 * - intelligence.anomaly.employeeCount - Employee count with pluralization
 * - intelligence.insight.confidence - Confidence percentage label
 * - intelligence.anomaly.suggestion - Suggestion label
 * - intelligence.anomaly.viewDetailsAria - ARIA label for clickable card
 * - common.show - Show button label
 * - common.hide - Hide button label
 * - common.dismiss - Dismiss button label
 *
 * @see AnomaliesSection
 * @see Anomaly type definition
 */
export const AnomalyCard: React.FC<AnomalyCardProps> = ({
  anomaly,
  onDismiss,
  onClick,
  showActions = true,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  /**
   * Gets the theme color for the current severity level.
   *
   * @returns {string} Theme color for the severity
   */
  const getSeverityColor = () => {
    switch (anomaly.severity) {
      case "critical":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "info":
        return theme.palette.info.main;
      default:
        return theme.palette.info.main;
    }
  };

  /**
   * Gets the appropriate icon for the current severity level.
   *
   * @returns {React.ReactElement} Icon component for the severity
   */
  const getSeverityIcon = () => {
    switch (anomaly.severity) {
      case "critical":
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: 20 }} />;
      case "info":
        return <InfoIcon sx={{ fontSize: 20 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 20 }} />;
    }
  };

  /**
   * Gets the localized label for the current severity level.
   *
   * @returns {string} Translated severity label
   */
  const getSeverityLabel = () => {
    switch (anomaly.severity) {
      case "critical":
        return t("intelligence.severity.critical");
      case "warning":
        return t("intelligence.severity.warning");
      case "info":
        return t("intelligence.severity.info");
      default:
        return t("intelligence.severity.info");
    }
  };

  /**
   * Handles dismiss button click, preventing event propagation.
   *
   * @param {React.MouseEvent} e - Mouse event
   */
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(anomaly.id);
    }
  };

  /**
   * Handles card click to trigger onClick callback.
   */
  const handleCardClick = () => {
    if (onClick) {
      onClick(anomaly);
    }
  };

  /**
   * Handles expand/collapse button click for suggestion section.
   *
   * @param {React.MouseEvent} e - Mouse event
   */
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  /**
   * Handles keyboard navigation for card interaction.
   *
   * @param {React.KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(anomaly);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${getSeverityColor()}`,
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              backgroundColor: theme.palette.action.hover,
            }
          : {},
      }}
      onClick={handleCardClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      aria-label={
        onClick
          ? t("intelligence.anomaly.viewDetailsAria", { title: anomaly.title })
          : undefined
      }
      data-testid={`anomaly-card-${anomaly.id}`}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <Box sx={{ color: getSeverityColor(), display: "flex" }}>
              {getSeverityIcon()}
            </Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {anomaly.title}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Chip
              label={getSeverityLabel()}
              size="small"
              sx={{
                backgroundColor: getSeverityColor(),
                color: "white",
                fontWeight: "bold",
              }}
            />
            {showActions && onDismiss && (
              <IconButton
                size="small"
                onClick={handleDismiss}
                aria-label={t("common.dismiss")}
                data-testid={`anomaly-dismiss-${anomaly.id}`}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {anomaly.description}
        </Typography>

        {/* Metadata */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("intelligence.anomaly.affectedEmployees")}:{" "}
            {t("intelligence.anomaly.employeeCount", {
              count: anomaly.affectedEmployees.length,
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("intelligence.insight.confidence")}:{" "}
            {(anomaly.confidence * 100).toFixed(0)}%
          </Typography>
          <Chip
            label={anomaly.type.charAt(0).toUpperCase() + anomaly.type.slice(1)}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Suggestion (expandable) */}
        {anomaly.suggestion && (
          <>
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-controls={`anomaly-suggestion-${anomaly.id}`}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: theme.transitions.create("transform", {
                        duration: theme.transitions.duration.short,
                      }),
                    }}
                  />
                }
              >
                {expanded ? t("common.hide") : t("common.show")}{" "}
                {t("intelligence.anomaly.suggestion")}
              </Button>
            </Box>
            <Collapse in={expanded}>
              <Box
                id={`anomaly-suggestion-${anomaly.id}`}
                role="region"
                sx={{
                  mt: 1,
                  p: 1.5,
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">{anomaly.suggestion}</Typography>
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};
