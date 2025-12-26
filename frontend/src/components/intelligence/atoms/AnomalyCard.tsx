/**
 * Anomaly card component - displays a single anomaly with severity styling
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Collapse,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { AnomalyCardProps } from "../../../types/intelligence";

/**
 * Anomaly card component
 *
 * Displays an anomaly with appropriate severity styling and optional actions.
 * Can be expanded to show suggestions and additional details.
 *
 * @example
 * ```tsx
 * <AnomalyCard
 *   anomaly={anomaly}
 *   onDismiss={(id) => console.log('Dismissed:', id)}
 *   onClick={(anomaly) => console.log('Clicked:', anomaly)}
 *   showActions
 * />
 * ```
 */
export const AnomalyCard: React.FC<AnomalyCardProps> = ({
  anomaly,
  onDismiss,
  onClick,
  showActions = true,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

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

  const getSeverityLabel = () => {
    switch (anomaly.severity) {
      case "critical":
        return "Critical";
      case "warning":
        return "Warning";
      case "info":
        return "Info";
      default:
        return "Info";
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss(anomaly.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(anomaly);
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
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
                aria-label="Dismiss anomaly"
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
          sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
        >
          <Typography variant="caption" color="text.secondary">
            Affected: {anomaly.affectedEmployees.length} employee
            {anomaly.affectedEmployees.length !== 1 ? "s" : ""}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Confidence: {(anomaly.confidence * 100).toFixed(0)}%
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
                {expanded ? "Hide" : "Show"} Suggestion
              </Button>
            </Box>
            <Collapse in={expanded}>
              <Box
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
