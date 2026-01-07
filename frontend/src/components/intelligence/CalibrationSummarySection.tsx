/**
 * CalibrationSummarySection component - main container for calibration meeting prep
 *
 * Displays at the top of the Intelligence tab, providing:
 * - Data overview (employee counts, key metrics)
 * - Selectable insights for meeting planning
 * - Time allocation recommendations
 * - Optional LLM-generated summary
 */

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCalibrationSummary } from "../../hooks/useCalibrationSummary";
import { EmptyState } from "../common/EmptyState";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface CalibrationSummarySectionProps {
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
}

export const CalibrationSummarySection: React.FC<
  CalibrationSummarySectionProps
> = ({ defaultExpanded = true }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const { data, isLoading, isGeneratingAI, error, generateAISummary, summary } =
    useCalibrationSummary();

  // Auto-expand section when error occurs to ensure error is visible
  React.useEffect(() => {
    if (error) {
      setExpanded(true);
    }
  }, [error]);

  // Loading state (initial data load)
  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  // Error state - only show if we don't have data (initial load failed)
  // If we have data but error occurred during AI generation, show error inline below
  if (error && !data) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="error">{error.message}</Alert>
        </CardContent>
      </Card>
    );
  }

  // No data state (shouldn't happen with auto-load, but keep as fallback)
  if (!data) {
    return (
      <EmptyState
        title={t("intelligence.calibrationSummary.noData", {
          defaultValue: "No calibration summary data available",
        })}
        iconSize="medium"
      />
    );
  }

  // Defensive data validation - ensure all required fields exist
  if (!data.data_overview || !data.time_allocation || !data.insights) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="error">
            {t("intelligence.calibrationSummary.invalidData", {
              defaultValue:
                "Invalid data structure received. Please refresh and try again.",
            })}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{ mb: 2 }}
      data-testid="calibration-summary-section"
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
          role="button"
          aria-expanded={expanded}
          aria-label={t("intelligence.calibrationSummary.toggleSection", {
            defaultValue: "Toggle calibration summary section",
          })}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpanded(!expanded);
            }
          }}
        >
          <LightbulbIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="medium">
            {t("intelligence.calibrationSummary.title", {
              defaultValue: "Calibration Summary",
            })}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {!summary && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={
                isGeneratingAI ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                generateAISummary();
              }}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI
                ? t("intelligence.calibrationSummary.generating", {
                    defaultValue: "Generating...",
                  })
                : t("intelligence.calibrationSummary.generateAI", {
                    defaultValue: "Generate AI Summary",
                  })}
            </Button>
          )}
          {summary && (
            <Button
              size="small"
              variant="text"
              startIcon={
                isGeneratingAI ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                generateAISummary();
              }}
              disabled={isGeneratingAI}
            >
              {t("intelligence.calibrationSummary.refresh", {
                defaultValue: "Refresh",
              })}
            </Button>
          )}
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            aria-hidden="true"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <CardContent>
          {/* Show error if AI generation failed */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {t("intelligence.calibrationSummary.errorFriendly", {
                  defaultValue:
                    "Sorry, we're unable to generate the AI summary right now.",
                })}
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                sx={{ textTransform: "none", p: 0, minWidth: 0 }}
              >
                {showErrorDetails
                  ? t("intelligence.calibrationSummary.hideDetails", {
                      defaultValue: "Hide details",
                    })
                  : t("intelligence.calibrationSummary.showDetails", {
                      defaultValue: "Show details",
                    })}
              </Button>
              <Collapse in={showErrorDetails}>
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" component="pre" sx={{ m: 0 }}>
                    {error.message}
                  </Typography>
                </Box>
              </Collapse>
            </Alert>
          )}

          {/* Show generating indicator if AI summary is being generated */}
          {isGeneratingAI && !summary && (
            <Alert
              severity="info"
              icon={<CircularProgress size={20} />}
              sx={{ mb: 2 }}
            >
              {t("intelligence.calibrationSummary.generatingMessage", {
                defaultValue:
                  "Generating AI-powered summary... This will take 30-40 seconds. You can keep working while it is put together.",
              })}
            </Alert>
          )}

          {/* AI Summary Text - directly in section with 3-line preview */}
          {summary && (
            <Box>
              <Typography
                variant="body1"
                color="text.primary"
                sx={{
                  display: summaryExpanded ? "block" : "-webkit-box",
                  WebkitLineClamp: summaryExpanded ? "unset" : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.6,
                  mb: 1,
                  whiteSpace: "pre-line",
                }}
              >
                {summary}
              </Typography>
              <Typography
                component="span"
                variant="caption"
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                  display: "inline-block",
                }}
              >
                {summaryExpanded
                  ? t("intelligence.calibrationSummary.showLess", {
                      defaultValue: "Show less",
                    })
                  : t("intelligence.calibrationSummary.showFullSummary", {
                      defaultValue: "Show full summary",
                    })}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, fontStyle: "italic" }}
              >
                {t("intelligence.calibrationSummary.poweredByClaude", {
                  defaultValue: "Powered by Claude",
                })}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};
