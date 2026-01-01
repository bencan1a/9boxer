/**
 * Intelligence tab - displays statistical anomaly analysis for the full dataset
 *
 * Shows AI-generated insights, distribution analysis, and anomaly detection
 * for talent calibration and performance management.
 *
 * @component
 * @screenshots
 *   - calibration-intelligence-anomalies: Intelligence tab showing anomaly detection cards
 *   - distribution-chart-ideal: Distribution chart showing ideal vs actual employee distribution
 */

import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import AlertTitle from "@mui/material/AlertTitle";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useIntelligence } from "../../hooks/useIntelligence";
import { EmptyState } from "../common/EmptyState";
import { IntelligenceSummary } from "../intelligence/IntelligenceSummary";
import { AnomalySection } from "../intelligence/AnomalySection";
import { DeviationChart } from "../intelligence/DeviationChart";
import { LevelDistributionChart } from "../intelligence/LevelDistributionChart";
import { ApiError } from "../../services/api";

export const IntelligenceTab: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data, isLoading, error, refetch } = useIntelligence();

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        data-testid="intelligence-tab-loading"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    // Check if this is a session-not-found error (404)
    const isSessionNotFound =
      error instanceof ApiError && error.statusCode === 404;

    return (
      <Box
        sx={{ p: theme.tokens.spacing.md / 8 }}
        data-testid="intelligence-tab-error"
      >
        {" "}
        {/* Convert 16px to 2 */}
        <Alert
          severity={isSessionNotFound ? "warning" : "error"}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={refetch}
              data-testid="intelligence-retry-button"
            >
              {t("panel.intelligenceTab.retry")}
            </Button>
          }
        >
          {isSessionNotFound ? (
            <>
              <AlertTitle>
                {t("panel.intelligenceTab.sessionNotFound")}
              </AlertTitle>
              {t("panel.intelligenceTab.sessionLostMessage")}
            </>
          ) : (
            error.message || t("panel.intelligenceTab.failedToLoad")
          )}
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!data) {
    return (
      <EmptyState
        title={t("panel.intelligenceTab.noIntelligenceData")}
        iconSize="medium"
      />
    );
  }

  // Calculate overall baseline high performer percentage for level chart
  const calculateBaselineHighPct = (): number => {
    const levelDeviations = data.level_analysis.deviations;
    if (levelDeviations.length === 0) return 25; // Default

    // Average of all observed high percentages
    const avgHigh =
      levelDeviations.reduce((sum, dev) => sum + dev.observed_high_pct, 0) /
      levelDeviations.length;

    return avgHigh;
  };

  // Transform level analysis deviations into distribution format for LevelDistributionChart
  const transformLevelData = () => {
    const deviations = data.level_analysis.deviations;

    // We need to calculate low/medium/high percentages from the deviations
    // The deviations only give us high performer percentage, so we'll approximate
    // low and medium based on standard distributions
    return deviations.map((dev) => {
      const highPct = dev.observed_high_pct;
      // Approximate: if we have high %, distribute remaining between low/medium
      // Assume roughly equal split for low/medium from remaining
      const remainingPct = 100 - highPct;
      const lowPct = remainingPct * 0.4; // Approximate 40% of remaining
      const mediumPct = remainingPct * 0.6; // Approximate 60% of remaining

      // Calculate counts based on percentages and sample size
      const total = dev.sample_size;
      const highCount = Math.round((highPct / 100) * total);
      const lowCount = Math.round((lowPct / 100) * total);
      const mediumCount = total - highCount - lowCount; // Remainder

      return {
        level: dev.category,
        low_pct: lowPct,
        low_count: lowCount,
        medium_pct: mediumPct,
        medium_count: mediumCount,
        high_pct: highPct,
        high_count: highCount,
        total: total,
      };
    });
  };

  const baselineHighPct = calculateBaselineHighPct();
  const levelDistributionData = transformLevelData();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.tokens.spacing.lg / 8, // Convert 24px to 3
        p: theme.tokens.spacing.md / 8, // Convert 16px to 2
      }}
      data-testid="intelligence-tab-content"
    >
      {/* Summary Section */}
      <IntelligenceSummary data={data} />

      {/* Location Analysis */}
      <Box data-testid="location-analysis-section">
        <AnomalySection
          title={t("panel.intelligenceTab.locationAnalysis")}
          analysis={data.location_analysis}
          chartComponent={
            <DeviationChart
              data={data.location_analysis.deviations}
              title={t("panel.intelligenceTab.highPerformerByLocation")}
            />
          }
        />
      </Box>

      {/* Function Analysis */}
      <Box data-testid="function-analysis-section">
        <AnomalySection
          title={t("panel.intelligenceTab.functionAnalysis")}
          analysis={data.function_analysis}
          chartComponent={
            <DeviationChart
              data={data.function_analysis.deviations}
              title={t("panel.intelligenceTab.highPerformerByFunction")}
            />
          }
        />
      </Box>

      {/* Level Analysis */}
      <Box data-testid="level-analysis-section">
        <AnomalySection
          title={t("panel.intelligenceTab.levelAnalysis")}
          analysis={data.level_analysis}
          chartComponent={
            <LevelDistributionChart
              data={levelDistributionData}
              title={t("panel.intelligenceTab.performanceDistributionByLevel")}
              baselineHighPct={baselineHighPct}
            />
          }
        />
      </Box>

      {/* Tenure Analysis */}
      <Box data-testid="tenure-analysis-section">
        <AnomalySection
          title={t("panel.intelligenceTab.tenureAnalysis")}
          analysis={data.tenure_analysis}
          chartComponent={
            <DeviationChart
              data={data.tenure_analysis.deviations}
              title={t("panel.intelligenceTab.highPerformerByTenure")}
            />
          }
        />
      </Box>
    </Box>
  );
};
