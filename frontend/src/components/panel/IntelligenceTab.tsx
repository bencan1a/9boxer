/**
 * Intelligence tab - displays statistical anomaly analysis for the full dataset
 */

import React from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  AlertTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useIntelligence } from "../../hooks/useIntelligence";
import { IntelligenceSummary } from "../intelligence/IntelligenceSummary";
import { AnomalySection } from "../intelligence/AnomalySection";
import { DeviationChart } from "../intelligence/DeviationChart";
import { LevelDistributionChart } from "../intelligence/LevelDistributionChart";
import { ApiError } from "../../services/api";

export const IntelligenceTab: React.FC = () => {
  const { t } = useTranslation();
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
      <Box sx={{ p: 2 }}>
        <Alert
          severity={isSessionNotFound ? "warning" : "error"}
          action={
            <Button color="inherit" size="small" onClick={refetch}>
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
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Alert severity="info">
          {t("panel.intelligenceTab.noIntelligenceData")}
        </Alert>
      </Box>
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 2 }}>
      {/* Summary Section */}
      <IntelligenceSummary data={data} />

      {/* Location Analysis */}
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

      {/* Function Analysis */}
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

      {/* Level Analysis */}
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

      {/* Tenure Analysis */}
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
  );
};
