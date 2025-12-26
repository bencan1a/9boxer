/**
 * Demo component showing all intelligence visualizations with mock data
 * This file is for development/testing purposes only
 */

import React from "react";
import { Container, Typography, Paper, Divider } from "@mui/material";
import { DeviationChart } from "./DeviationChart";
import { DistributionHeatmap } from "./DistributionHeatmap";
import { LevelDistributionChart } from "./LevelDistributionChart";

// Mock data for DeviationChart
const mockLocationDeviations = [
  {
    category: "USA",
    observed_high_pct: 45,
    expected_high_pct: 25,
    z_score: 4.1,
    p_value: 0.0001,
    sample_size: 150,
    is_significant: true,
  },
  {
    category: "GBR",
    observed_high_pct: 28,
    expected_high_pct: 25,
    z_score: 0.8,
    p_value: 0.42,
    sample_size: 80,
    is_significant: false,
  },
  {
    category: "DEU",
    observed_high_pct: 18,
    expected_high_pct: 25,
    z_score: -2.1,
    p_value: 0.036,
    sample_size: 65,
    is_significant: true,
  },
  {
    category: "FRA",
    observed_high_pct: 50,
    expected_high_pct: 25,
    z_score: 4.8,
    p_value: 0.00001,
    sample_size: 120,
    is_significant: true,
  },
  {
    category: "JPN",
    observed_high_pct: 22,
    expected_high_pct: 25,
    z_score: -0.6,
    p_value: 0.55,
    sample_size: 55,
    is_significant: false,
  },
];

// Mock data for DistributionHeatmap
const mockFunctionDistributions = [
  {
    function: "Engineering",
    distribution: {
      "9": { percentage: 15.2, count: 12 },
      "8": { percentage: 8.9, count: 7 },
      "7": { percentage: 10.1, count: 8 },
      "6": { percentage: 12.7, count: 10 },
      "5": { percentage: 20.3, count: 16 },
      "4": { percentage: 8.9, count: 7 },
      "3": { percentage: 11.4, count: 9 },
      "2": { percentage: 7.6, count: 6 },
      "1": { percentage: 5.1, count: 4 },
    },
    total: 79,
  },
  {
    function: "Sales",
    distribution: {
      "9": { percentage: 22.5, count: 18 },
      "8": { percentage: 13.8, count: 11 },
      "7": { percentage: 7.5, count: 6 },
      "6": { percentage: 11.3, count: 9 },
      "5": { percentage: 17.5, count: 14 },
      "4": { percentage: 10.0, count: 8 },
      "3": { percentage: 8.8, count: 7 },
      "2": { percentage: 6.3, count: 5 },
      "1": { percentage: 2.5, count: 2 },
    },
    total: 80,
  },
  {
    function: "Marketing",
    distribution: {
      "9": { percentage: 10.0, count: 4 },
      "8": { percentage: 7.5, count: 3 },
      "7": { percentage: 15.0, count: 6 },
      "6": { percentage: 12.5, count: 5 },
      "5": { percentage: 22.5, count: 9 },
      "4": { percentage: 12.5, count: 5 },
      "3": { percentage: 10.0, count: 4 },
      "2": { percentage: 7.5, count: 3 },
      "1": { percentage: 2.5, count: 1 },
    },
    total: 40,
  },
  {
    function: "Operations",
    distribution: {
      "9": { percentage: 8.3, count: 5 },
      "8": { percentage: 6.7, count: 4 },
      "7": { percentage: 11.7, count: 7 },
      "6": { percentage: 15.0, count: 9 },
      "5": { percentage: 25.0, count: 15 },
      "4": { percentage: 13.3, count: 8 },
      "3": { percentage: 10.0, count: 6 },
      "2": { percentage: 6.7, count: 4 },
      "1": { percentage: 3.3, count: 2 },
    },
    total: 60,
  },
];

// Mock data for LevelDistributionChart
const mockLevelDistributions = [
  {
    level: "MT1",
    low_pct: 15.0,
    low_count: 6,
    medium_pct: 60.0,
    medium_count: 24,
    high_pct: 25.0,
    high_count: 10,
    total: 40,
  },
  {
    level: "MT2",
    low_pct: 12.5,
    low_count: 8,
    medium_pct: 62.5,
    medium_count: 40,
    high_pct: 25.0,
    high_count: 16,
    total: 64,
  },
  {
    level: "MT3",
    low_pct: 18.0,
    low_count: 9,
    medium_pct: 58.0,
    medium_count: 29,
    high_pct: 24.0,
    high_count: 12,
    total: 50,
  },
  {
    level: "MT4",
    low_pct: 10.0,
    low_count: 4,
    medium_pct: 55.0,
    medium_count: 22,
    high_pct: 35.0,
    high_count: 14,
    total: 40,
  },
  {
    level: "MT5",
    low_pct: 13.3,
    low_count: 4,
    medium_pct: 56.7,
    medium_count: 17,
    high_pct: 30.0,
    high_count: 9,
    total: 30,
  },
  {
    level: "MT6",
    low_pct: 5.0,
    low_count: 1,
    medium_pct: 35.0,
    medium_count: 7,
    high_pct: 60.0,
    high_count: 12,
    total: 20,
  },
];

export const MockDataDemo: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Intelligence Tab Visualizations - Mock Data Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This page demonstrates the three visualization components with mock
        data. These components will be integrated into the Intelligence Tab.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Deviation Chart Demo */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          1. Deviation Chart
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Shows expected vs actual percentages with significance indicators:
          Green (not significant), Yellow (p &lt; 0.05), Red (p &lt; 0.01)
        </Typography>
        <DeviationChart
          data={mockLocationDeviations}
          title="Location Analysis: High Performer Distribution"
        />
      </Paper>

      {/* Distribution Heatmap Demo */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          2. Distribution Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Heatmap showing percentage distribution across all 9-box positions by
          function. Color intensity represents concentration.
        </Typography>
        <DistributionHeatmap
          data={mockFunctionDistributions}
          title="Function Analysis: 9-Box Position Distribution"
        />
      </Paper>

      {/* Level Distribution Chart Demo */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          3. Level Distribution Chart
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Stacked bar chart showing performance distribution by job level. The
          baseline represents overall average high performance percentage. Note:
          MT6 shows 60% high performers which may indicate leniency bias.
        </Typography>
        <LevelDistributionChart
          data={mockLevelDistributions}
          title="Level Analysis: Performance Distribution by Level"
          baselineHighPct={27.0}
        />
      </Paper>
    </Container>
  );
};
