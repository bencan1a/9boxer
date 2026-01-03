import type { Meta, StoryObj } from "@storybook/react";
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
import { InsightCard } from "./InsightCard";
import type {
  CalibrationSummaryData,
  LLMSummaryResult,
  Insight,
} from "../../types/api";

// Mock data for stories
const mockInsights: Insight[] = [
  {
    id: "anomaly-location-abc12345",
    type: "anomaly",
    category: "location",
    priority: "high",
    title: "New York office has 45% lower performers",
    description:
      "Statistical anomaly detected: New York location shows significantly higher concentration of lower performers.",
    affected_count: 23,
    source_data: {
      z_score: 3.2,
      p_value: 0.001,
      observed_pct: 45.0,
      expected_pct: 11.5,
    },
  },
  {
    id: "focus_area-function-def67890",
    type: "focus_area",
    category: "function",
    priority: "medium",
    title: "Engineering team distribution skewed",
    description:
      "Engineering function shows unusual clustering in center box positions.",
    affected_count: 45,
    source_data: {
      center_count: 45,
      center_pct: 55.0,
      recommended_max_pct: 30.0,
    },
  },
  {
    id: "recommendation-level-ghi11111",
    type: "recommendation",
    category: "level",
    priority: "low",
    title: "Senior levels well calibrated",
    description:
      "Director and VP levels show healthy distribution across all performance categories.",
    affected_count: 12,
    source_data: { p_value: 0.42 },
  },
  {
    id: "time_allocation-time-jkl22222",
    type: "time_allocation",
    category: "time",
    priority: "medium",
    title: "Allocate extra time for tenure discussion",
    description:
      "Employees with 5+ years tenure show mixed performance patterns.",
    affected_count: 34,
    source_data: {
      total_minutes: 25,
      by_level: { "5+ years": 15, "3-5 years": 10 },
    },
  },
  {
    id: "anomaly-distribution-mno33333",
    type: "anomaly",
    category: "distribution",
    priority: "high",
    title: "Center box overcrowded at 42%",
    description:
      "Core Talent position has 42% of employees, above the recommended 25-30% range.",
    affected_count: 84,
    source_data: {
      center_count: 84,
      center_pct: 42.0,
      recommended_max_pct: 30.0,
    },
  },
];

const mockCalibrationData: CalibrationSummaryData = {
  data_overview: {
    total_employees: 200,
    by_level: { IC: 120, Manager: 50, Director: 20, VP: 10 },
    by_function: { Engineering: 80, Sales: 60, Marketing: 40, HR: 20 },
    by_location: {
      "New York": 80,
      "San Francisco": 60,
      London: 40,
      Remote: 20,
    },
    stars_count: 18,
    stars_percentage: 9.0,
    center_box_count: 84,
    center_box_percentage: 42.0,
    lower_performers_count: 23,
    lower_performers_percentage: 11.5,
    high_performers_count: 36,
    high_performers_percentage: 18.0,
  },
  time_allocation: {
    estimated_duration_minutes: 90,
    breakdown_by_level: [
      { level: "Stars", employee_count: 18, minutes: 15, percentage: 16.7 },
      {
        level: "Lower Performers",
        employee_count: 23,
        minutes: 30,
        percentage: 33.3,
      },
      {
        level: "Center Box",
        employee_count: 84,
        minutes: 25,
        percentage: 27.8,
      },
      { level: "Others", employee_count: 75, minutes: 20, percentage: 22.2 },
    ],
    suggested_sequence: ["Lower Performers", "Stars", "Center Box"],
  },
  insights: mockInsights,
};

const mockLLMResponse: LLMSummaryResult = {
  summary:
    "This calibration session involves 200 employees with a notable concentration in the center box (42%). Key focus areas include the New York office's elevated lower performer rate and the Engineering team's distribution pattern. The session is estimated to take 90 minutes.",
  key_recommendations: [
    "Prioritize discussion of the 23 lower performers in New York - investigate potential systemic issues",
    "Review Engineering team's center box clustering - may indicate calibration bias or role misalignment",
    "Recognize and plan development paths for the 18 stars (9% of workforce)",
  ],
  discussion_points: [
    "Why is New York showing 45% lower performers vs company average of 11.5%?",
    "Is the center box overcrowding due to rating inflation or genuine performance?",
    "What support mechanisms exist for employees in lower performer positions?",
  ],
  model_used: "Claude 3.5 Sonnet",
};

/**
 * Presentational version of CalibrationSummarySection for Storybook
 */
interface MockCalibrationSummarySectionProps {
  data: CalibrationSummaryData | null;
  isLoading?: boolean;
  error?: Error | null;
  llmData?: LLMSummaryResult | null;
  llmLoading?: boolean;
  llmAvailable?: boolean;
  defaultExpanded?: boolean;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

const MockCalibrationSummarySection: React.FC<
  MockCalibrationSummarySectionProps
> = ({
  data,
  isLoading = false,
  error = null,
  llmData = null,
  llmLoading = false,
  llmAvailable = true,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [selectedInsights, setSelectedInsights] = useState<
    Record<string, boolean>
  >(() => {
    if (!data?.insights) return {};
    return Object.fromEntries(data.insights.map((i) => [i.id, true]));
  });

  const toggleInsight = (id: string) => {
    setSelectedInsights((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    if (!data?.insights) return;
    setSelectedInsights(
      Object.fromEntries(data.insights.map((i) => [i.id, true]))
    );
  };

  const deselectAll = () => {
    if (!data?.insights) return;
    setSelectedInsights(
      Object.fromEntries(data.insights.map((i) => [i.id, false]))
    );
  };

  const selectedCount = Object.values(selectedInsights).filter(Boolean).length;

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

  const { data_overview, time_allocation, insights } = data;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
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
            Calibration Summary
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
                Data Overview
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>{data_overview.total_employees}</strong> employees
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarIcon fontSize="small" sx={{ color: "warning.main" }} />
                  <Typography variant="body2">
                    <strong>{data_overview.stars_count}</strong> Stars (
                    {data_overview.stars_percentage.toFixed(0)}%)
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <RadioButtonCheckedIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>{data_overview.center_box_count}</strong> Center Box
                    ({data_overview.center_box_percentage.toFixed(0)}%)
                  </Typography>
                </Box>

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
                  Calibration Insights
                </Typography>
                <ButtonGroup size="small" variant="text">
                  <Button onClick={selectAll}>Select All</Button>
                  <Button onClick={deselectAll}>Deselect All</Button>
                </ButtonGroup>
              </Box>

              {/* Insight Cards */}
              <Box sx={{ maxHeight: 300, overflowY: "auto", pr: 1 }}>
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
                  disabled={!llmAvailable || llmLoading || selectedCount === 0}
                >
                  {llmLoading ? "Generating..." : "Generate AI Summary"}
                </Button>

                <Typography variant="caption" color="text.secondary">
                  {selectedCount} insight{selectedCount !== 1 ? "s" : ""}{" "}
                  selected
                </Typography>
              </Box>

              {/* LLM Not Available Warning */}
              {!llmAvailable && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  AI Summary requires ANTHROPIC_API_KEY to be configured
                </Alert>
              )}

              {/* LLM Summary Result */}
              {llmData && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">{llmData.summary}</Typography>
                  </Alert>

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

/**
 * CalibrationSummarySection - Calibration Meeting Preparation Tool
 *
 * Displays at the top of the Intelligence tab, providing calibration managers
 * with a comprehensive overview and actionable insights for meeting preparation.
 *
 * **Key Features:**
 * - Data Overview: Total employees, stars, center box, and lower performers
 * - Time Allocation: Estimated meeting duration with suggested discussion sequence
 * - Selectable Insights: Pick which insights to include in AI summary
 * - AI Summary Generation: Optional Claude-powered meeting preparation notes
 *
 * **Use Cases:**
 * - Pre-meeting preparation for calibration sessions
 * - Identifying focus areas and discussion topics
 * - Generating structured talking points with AI assistance
 */
const meta: Meta<typeof MockCalibrationSummarySection> = {
  title: "Intelligence/CalibrationSummary/CalibrationSummarySection",
  component: MockCalibrationSummarySection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The main container for calibration meeting preparation. Shows data overview, time allocation recommendations, selectable insights, and optional AI-generated summaries. This is a presentational version for Storybook - the actual component uses React Query hooks.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MockCalibrationSummarySection>;

/**
 * Default view with all features visible.
 * Shows the complete calibration summary with data overview,
 * insights, and AI summary button.
 */
export const Default: Story = {
  args: {
    data: mockCalibrationData,
    llmAvailable: true,
  },
};

/**
 * Collapsed state - header only visible.
 * Users can click to expand and see full details.
 */
export const Collapsed: Story = {
  args: {
    data: mockCalibrationData,
    defaultExpanded: false,
  },
};

/**
 * Loading state while fetching calibration data.
 */
export const Loading: Story = {
  args: {
    data: null,
    isLoading: true,
  },
};

/**
 * Error state when data fetch fails.
 */
export const ErrorState: Story = {
  args: {
    data: null,
    error: new Error("Failed to load calibration summary. Please try again."),
  },
};

/**
 * LLM not available - shows info message.
 * This happens when ANTHROPIC_API_KEY is not configured.
 */
export const LLMNotAvailable: Story = {
  args: {
    data: mockCalibrationData,
    llmAvailable: false,
  },
};

/**
 * With AI summary generated - shows full results.
 * Displays summary, key recommendations, and discussion points.
 */
export const WithLLMSummary: Story = {
  args: {
    data: mockCalibrationData,
    llmData: mockLLMResponse,
    llmAvailable: true,
  },
};

/**
 * LLM generating state - shows loading indicator on button.
 */
export const LLMGenerating: Story = {
  args: {
    data: mockCalibrationData,
    llmLoading: true,
    llmAvailable: true,
  },
};

/**
 * Small dataset with few employees and insights.
 */
export const SmallDataset: Story = {
  args: {
    data: {
      data_overview: {
        total_employees: 25,
        by_level: { IC: 20, Manager: 5 },
        by_function: { Engineering: 15, Sales: 10 },
        by_location: { Remote: 25 },
        stars_count: 3,
        stars_percentage: 12.0,
        center_box_count: 10,
        center_box_percentage: 40.0,
        lower_performers_count: 2,
        lower_performers_percentage: 8.0,
        high_performers_count: 5,
        high_performers_percentage: 20.0,
      },
      time_allocation: {
        estimated_duration_minutes: 30,
        breakdown_by_level: [
          { level: "Stars", employee_count: 3, minutes: 8, percentage: 26.7 },
          {
            level: "Lower Performers",
            employee_count: 2,
            minutes: 10,
            percentage: 33.3,
          },
          {
            level: "Others",
            employee_count: 20,
            minutes: 12,
            percentage: 40.0,
          },
        ],
        suggested_sequence: ["Lower Performers", "Stars"],
      },
      insights: [mockInsights[0], mockInsights[2]],
    },
    llmAvailable: true,
  },
};

/**
 * Large dataset with many employees (enterprise scale).
 */
export const LargeDataset: Story = {
  args: {
    data: {
      data_overview: {
        total_employees: 2500,
        by_level: { IC: 2000, Manager: 350, Director: 100, VP: 50 },
        by_function: { Engineering: 1000, Sales: 750, Marketing: 500, HR: 250 },
        by_location: {
          "New York": 800,
          "San Francisco": 700,
          London: 500,
          Remote: 500,
        },
        stars_count: 225,
        stars_percentage: 9.0,
        center_box_count: 875,
        center_box_percentage: 35.0,
        lower_performers_count: 175,
        lower_performers_percentage: 7.0,
        high_performers_count: 450,
        high_performers_percentage: 18.0,
      },
      time_allocation: {
        estimated_duration_minutes: 480,
        breakdown_by_level: [
          {
            level: "Stars",
            employee_count: 225,
            minutes: 90,
            percentage: 18.75,
          },
          {
            level: "Lower Performers",
            employee_count: 175,
            minutes: 120,
            percentage: 25.0,
          },
          {
            level: "Center Box",
            employee_count: 875,
            minutes: 150,
            percentage: 31.25,
          },
          {
            level: "Others",
            employee_count: 1225,
            minutes: 120,
            percentage: 25.0,
          },
        ],
        suggested_sequence: [
          "Lower Performers",
          "Stars",
          "Center Box",
          "Others",
        ],
      },
      insights: mockInsights,
    },
    llmAvailable: true,
  },
};
