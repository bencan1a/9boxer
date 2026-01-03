/**
 * Intelligence summary component - displays overview cards at top of Intelligence tab
 */

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import type { IntelligenceData } from "../../types/api";
import { useCalibrationSummary } from "../../hooks/useCalibrationSummary";

interface IntelligenceSummaryProps {
  data: IntelligenceData;
}

export const IntelligenceSummary: React.FC<IntelligenceSummaryProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const { data: calibrationData } = useCalibrationSummary();

  // Determine quality score color and status
  const getQualityColor = (score: number): string => {
    if (score >= 80) return "success.main";
    if (score >= 50) return "warning.main";
    return "error.main";
  };

  const getQualityIcon = (score: number): React.ReactNode => {
    if (score >= 80)
      return <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />;
    if (score >= 50)
      return <WarningIcon sx={{ fontSize: 48, color: "warning.main" }} />;
    return <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />;
  };

  const totalAnomalies =
    data.anomaly_count.green +
    data.anomaly_count.yellow +
    data.anomaly_count.red;

  return (
    <Grid container spacing={2} data-testid="intelligence-summary">
      {/* Quality Score Card */}
      <Grid item xs={12} md={4}>
        <Card
          variant="outlined"
          sx={{ height: "100%" }}
          data-testid="quality-score-card"
        >
          <CardContent sx={{ pb: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              {getQualityIcon(data.quality_score)}
              <Box>
                <Typography
                  variant="h3"
                  color={getQualityColor(data.quality_score)}
                  data-testid="quality-score-value"
                >
                  {data.quality_score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("panel.intelligenceTab.summary.qualityScore")}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              {t("panel.intelligenceTab.summary.qualityScoreDescription")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Anomaly Count Card */}
      <Grid item xs={12} md={4}>
        <Card
          variant="outlined"
          sx={{ height: "100%" }}
          data-testid="anomaly-count-card"
        >
          <CardContent sx={{ pb: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="h3" data-testid="total-anomaly-count">
              {totalAnomalies}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("panel.intelligenceTab.summary.totalAnomalies")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${data.anomaly_count.green} ${t("panel.intelligenceTab.summary.green")}`}
                color="success"
                size="small"
                variant="outlined"
                data-testid="anomaly-chip-green"
              />
              <Chip
                icon={<WarningIcon />}
                label={`${data.anomaly_count.yellow} ${t("panel.intelligenceTab.summary.yellow")}`}
                color="warning"
                size="small"
                variant="outlined"
                data-testid="anomaly-chip-yellow"
              />
              <Chip
                icon={<ErrorIcon />}
                label={`${data.anomaly_count.red} ${t("panel.intelligenceTab.summary.red")}`}
                color="error"
                size="small"
                variant="outlined"
                data-testid="anomaly-chip-red"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Org Overview Card */}
      {calibrationData?.data_overview && (
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{ height: "100%" }}
            data-testid="org-overview-card"
          >
            <CardContent sx={{ pb: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h3" data-testid="org-overview-heading">
                {calibrationData.data_overview.total_employees}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t("panel.intelligenceTab.summary.employees")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`${calibrationData.data_overview.high_performers_count} High`}
                  color="success"
                  size="small"
                  variant="outlined"
                  data-testid="org-chip-high"
                />
                <Chip
                  label={`${calibrationData.data_overview.center_box_count} Medium`}
                  color="default"
                  size="small"
                  variant="outlined"
                  data-testid="org-chip-medium"
                />
                <Chip
                  label={`${calibrationData.data_overview.lower_performers_count} Low`}
                  color="default"
                  size="small"
                  variant="outlined"
                  data-testid="org-chip-low"
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                {calibrationData.data_overview.stars_count} flagged •{" "}
                {Object.keys(calibrationData.data_overview.by_location).length}{" "}
                locations •{" "}
                {Object.keys(calibrationData.data_overview.by_level).length}{" "}
                levels
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};
