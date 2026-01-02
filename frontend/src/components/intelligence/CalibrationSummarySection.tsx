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
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { useCalibrationSummary } from "../../hooks/useCalibrationSummary";
import { useLLMSummary } from "../../hooks/useLLMSummary";
import { InsightCard } from "./InsightCard";

/**
 * Format duration in minutes to human-readable string.
 * Moved outside component to avoid recreation on each render.
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

interface CalibrationSummarySectionProps {
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
}

export const CalibrationSummarySection: React.FC<
  CalibrationSummarySectionProps
> = ({ defaultExpanded = true }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const {
    data,
    isLoading,
    error,
    selectedInsights,
    toggleInsight,
    selectAll,
    deselectAll,
    getSelectedIds,
    selectedCount,
  } = useCalibrationSummary();

  const {
    data: llmData,
    isLoading: llmLoading,
    error: llmError,
    isAvailable: llmAvailable,
    generate: generateLLMSummary,
  } = useLLMSummary();

  const handleGenerateSummary = () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length > 0) {
      generateLLMSummary(selectedIds);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="error">{error.message}</Alert>
        </CardContent>
      </Card>
    );
  }

  // No data
  if (!data) {
    return null;
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

  const { data_overview, time_allocation, insights } = data;

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
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LightbulbIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="medium">
            {t("intelligence.calibrationSummary.title", {
              defaultValue: "Calibration Summary",
            })}
          </Typography>
          <Chip
            label={`${data_overview.total_employees} employees`}
            size="small"
            variant="outlined"
          />
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Data Overview Section */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("intelligence.calibrationSummary.dataOverview", {
                  defaultValue: "Data Overview",
                })}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Total Employees */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>{data_overview.total_employees}</strong> employees
                  </Typography>
                </Box>

                {/* Stars */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarIcon fontSize="small" sx={{ color: "warning.main" }} />
                  <Typography variant="body2">
                    <strong>{data_overview.stars_count}</strong> Stars (
                    {data_overview.stars_percentage.toFixed(0)}%)
                  </Typography>
                </Box>

                {/* Center Box */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RadioButtonCheckedIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>{data_overview.center_box_count}</strong> Center Box
                    ({data_overview.center_box_percentage.toFixed(0)}%)
                  </Typography>
                </Box>

                {/* Lower Performers */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrendingDownIcon fontSize="small" color="error" />
                  <Typography variant="body2">
                    <strong>{data_overview.lower_performers_count}</strong>{" "}
                    Lower Performers (
                    {data_overview.lower_performers_percentage.toFixed(0)}%)
                  </Typography>
                </Box>
              </Box>

              {/* Time Allocation */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    Est.{" "}
                    {formatDuration(time_allocation.estimated_duration_minutes)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Suggested: {time_allocation.suggested_sequence.join(" → ")}
                </Typography>
              </Box>
            </Grid>

            {/* Insights Section */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {t("intelligence.calibrationSummary.insights", {
                    defaultValue: "Meeting Insights",
                  })}
                </Typography>
                <ButtonGroup size="small" variant="text">
                  <Button onClick={selectAll}>Select All</Button>
                  <Button onClick={deselectAll}>Deselect All</Button>
                </ButtonGroup>
              </Box>

              {/* Insight Cards */}
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                {insights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    selected={selectedInsights[insight.id] ?? true}
                    onToggle={() => toggleInsight(insight.id)}
                  />
                ))}
              </Box>

              {/* LLM Summary Section */}
              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    llmLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <AutoAwesomeIcon />
                    )
                  }
                  onClick={handleGenerateSummary}
                  disabled={!llmAvailable || llmLoading || selectedCount === 0}
                  data-testid="generate-summary-button"
                >
                  {llmLoading
                    ? t("intelligence.calibrationSummary.generating", {
                        defaultValue: "Generating...",
                      })
                    : t("intelligence.calibrationSummary.generateSummary", {
                        defaultValue: "Generate AI Summary",
                      })}
                </Button>

                <Typography variant="caption" color="text.secondary">
                  {selectedCount} insight{selectedCount !== 1 ? "s" : ""}{" "}
                  selected
                </Typography>
              </Box>

              {/* LLM Not Available Warning */}
              {!llmAvailable && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  {t("intelligence.calibrationSummary.llmNotAvailable", {
                    defaultValue:
                      "AI Summary requires ANTHROPIC_API_KEY to be configured",
                  })}
                </Alert>
              )}

              {/* LLM Error */}
              {llmError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {llmError.message}
                </Alert>
              )}

              {/* LLM Summary Result */}
              {llmData && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">{llmData.summary}</Typography>
                  </Alert>

                  {/* Key Recommendations */}
                  {llmData.key_recommendations.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Key Recommendations
                      </Typography>
                      <List dense disablePadding>
                        {llmData.key_recommendations.map((rec, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <CheckCircleIcon
                                fontSize="small"
                                color="success"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={rec}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Discussion Points */}
                  {llmData.discussion_points.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Predicted Discussion Points
                      </Typography>
                      <List dense disablePadding>
                        {llmData.discussion_points.map((point, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <LightbulbIcon fontSize="small" color="warning" />
                            </ListItemIcon>
                            <ListItemText
                              primary={point}
                              primaryTypographyProps={{ variant: "body2" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Powered by {llmData.model_used}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
};
