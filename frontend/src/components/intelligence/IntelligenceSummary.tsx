/**
 * Intelligence summary component - displays overview cards at top of Intelligence tab
 */

import React from "react";
import { Box, Card, CardContent, Typography, Grid, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import type { IntelligenceData } from "../../types/api";

interface IntelligenceSummaryProps {
  data: IntelligenceData;
}

export const IntelligenceSummary: React.FC<IntelligenceSummaryProps> = ({ data }) => {
  const { t } = useTranslation();

  // Determine quality score color and status
  const getQualityColor = (score: number): string => {
    if (score >= 80) return "success.main";
    if (score >= 50) return "warning.main";
    return "error.main";
  };

  const getQualityIcon = (score: number): React.ReactNode => {
    if (score >= 80) return <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />;
    if (score >= 50) return <WarningIcon sx={{ fontSize: 48, color: "warning.main" }} />;
    return <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />;
  };

  const getQualityStatus = (score: number): string => {
    if (score >= 80) return t('panel.intelligenceTab.summary.excellent');
    if (score >= 50) return t('panel.intelligenceTab.summary.good');
    return t('panel.intelligenceTab.summary.needsAttention');
  };

  const totalAnomalies = data.anomaly_count.green + data.anomaly_count.yellow + data.anomaly_count.red;

  return (
    <Grid container spacing={2}>
      {/* Quality Score Card */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              {getQualityIcon(data.quality_score)}
              <Box>
                <Typography variant="h3" color={getQualityColor(data.quality_score)}>
                  {data.quality_score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('panel.intelligenceTab.summary.qualityScore')}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              {t('panel.intelligenceTab.summary.qualityScoreDescription')}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Anomaly Count Card */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {totalAnomalies}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('panel.intelligenceTab.summary.totalAnomalies')}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${data.anomaly_count.green} ${t('panel.intelligenceTab.summary.green')}`}
                color="success"
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<WarningIcon />}
                label={`${data.anomaly_count.yellow} ${t('panel.intelligenceTab.summary.yellow')}`}
                color="warning"
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<ErrorIcon />}
                label={`${data.anomaly_count.red} ${t('panel.intelligenceTab.summary.red')}`}
                color="error"
                size="small"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Status Card */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {getQualityStatus(data.quality_score)}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('panel.intelligenceTab.summary.overallHealth')}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {data.quality_score >= 80 ? (
                <Typography variant="body2" color="success.main">
                  {t('panel.intelligenceTab.summary.wellCalibrated')}
                </Typography>
              ) : data.quality_score >= 50 ? (
                <Typography variant="body2" color="warning.main">
                  {t('panel.intelligenceTab.summary.someAnomalies')}
                </Typography>
              ) : (
                <Typography variant="body2" color="error.main">
                  {t('panel.intelligenceTab.summary.significantAnomalies')}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
