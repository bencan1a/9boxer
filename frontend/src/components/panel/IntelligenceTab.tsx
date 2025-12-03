/**
 * Intelligence tab - displays statistical anomaly analysis for the full dataset
 */

import React from "react";
import { Box, CircularProgress, Alert, Button } from "@mui/material";
import { useIntelligence } from "../../hooks/useIntelligence";
import { IntelligenceSummary } from "../intelligence/IntelligenceSummary";
import { AnomalySection } from "../intelligence/AnomalySection";
import { DeviationChart } from "../intelligence/DeviationChart";
import { LevelDistributionChart } from "../intelligence/LevelDistributionChart";

export const IntelligenceTab: React.FC = () => {
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
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          {error.message || "Failed to load intelligence data"}
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
        <Alert severity="info">No intelligence data available</Alert>
      </Box>
    );
  }

  // Calculate overall baseline high performer percentage for level chart
  const calculateBaselineHighPct = (): number => {
    const levelDeviations = data.level_analysis.deviations;
    if (levelDeviations.length === 0) return 25; // Default

    // Average of all observed high percentages
    const avgHigh = levelDeviations.reduce(
      (sum, dev) => sum + dev.observed_high_pct,
      0
    ) / levelDeviations.length;

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
        title="Location Analysis"
        analysis={data.location_analysis}
        chartComponent={
          <DeviationChart
            data={data.location_analysis.deviations}
            title="High Performer % by Location"
          />
        }
      />

      {/* Function Analysis */}
      <AnomalySection
        title="Function Analysis"
        analysis={data.function_analysis}
        chartComponent={
          <DeviationChart
            data={data.function_analysis.deviations}
            title="High Performer % by Function"
          />
        }
      />

      {/* Level Analysis */}
      <AnomalySection
        title="Level Analysis"
        analysis={data.level_analysis}
        chartComponent={
          <LevelDistributionChart
            data={levelDistributionData}
            title="Performance Distribution by Level"
            baselineHighPct={baselineHighPct}
          />
        }
      />

      {/* Tenure Analysis */}
      <AnomalySection
        title="Tenure Analysis"
        analysis={data.tenure_analysis}
        chartComponent={
          <DeviationChart
            data={data.tenure_analysis.deviations}
            title="High Performer % by Tenure"
          />
        }
      />
    </Box>
  );
};
