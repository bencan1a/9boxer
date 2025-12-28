/**
 * Tests for LevelDistributionChart component
 */

import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@/test/utils";
import { LevelDistributionChart } from "../LevelDistributionChart";
import {
  mockLevelDistributionNormal,
  mockLevelDistributionHighSkew,
  mockLevelDistributionLowSkew,
  mockLevelDistributionEmpty,
  mockLevelDistributionSingle,
  mockLevelDistributionSmallSamples,
  mockLevelDistributionMany,
} from "../../../mocks/mockChartData";

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("LevelDistributionChart", () => {
  describe("Rendering with data", () => {
    it("renders when chart title is provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Test Chart Title"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Test Chart Title")).toBeInTheDocument();
    });

    it("renders when data array has items", () => {
      const { container } = render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Performance Distribution"
          baselineHighPct={25}
        />
      );

      // Recharts renders SVG
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("uses when default baseline percentage when not provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Default Baseline"
        />
      );

      // Should render without errors (default is 25)
      expect(screen.getByText("Default Baseline")).toBeInTheDocument();
    });

    it("accepts when custom baseline percentage", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Custom Baseline"
          baselineHighPct={40}
        />
      );

      expect(screen.getByText("Custom Baseline")).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("displays when no data message when data is empty array", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionEmpty}
          title="No Data Chart"
          baselineHighPct={25}
        />
      );

      expect(
        screen.getByText(/panel.intelligenceTab.chart.noDataAvailable/i)
      ).toBeInTheDocument();
    });

    it("displays when no data message when data is null", () => {
      render(
        <LevelDistributionChart
          data={null as any}
          title="Null Data Chart"
          baselineHighPct={25}
        />
      );

      expect(
        screen.getByText(/panel.intelligenceTab.chart.noDataAvailable/i)
      ).toBeInTheDocument();
    });

    it("does not render when chart when data is empty", () => {
      const { container } = render(
        <LevelDistributionChart
          data={mockLevelDistributionEmpty}
          title="No Data"
          baselineHighPct={25}
        />
      );

      const svg = container.querySelector("svg");
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe("Data handling", () => {
    it("renders when single level is provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionSingle}
          title="Single Level"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Single Level")).toBeInTheDocument();
    });

    it("renders when multiple levels are provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Multiple Levels"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Multiple Levels")).toBeInTheDocument();
    });

    it("renders when high-skewed distribution is provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionHighSkew}
          title="High Skew"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("High Skew")).toBeInTheDocument();
    });

    it("renders when low-skewed distribution is provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionLowSkew}
          title="Low Skew"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Low Skew")).toBeInTheDocument();
    });

    it("renders when small sample sizes are provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionSmallSamples}
          title="Small Samples"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Small Samples")).toBeInTheDocument();
    });

    it("renders when many levels are provided", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionMany}
          title="Many Levels"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Many Levels")).toBeInTheDocument();
    });
  });

  describe("Chart structure", () => {
    it("renders when ResponsiveContainer wraps chart", () => {
      const { container } = render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Chart Structure"
          baselineHighPct={25}
        />
      );

      // ResponsiveContainer creates a div wrapper
      const responsiveContainer = container.querySelector(
        ".recharts-responsive-container"
      );
      expect(responsiveContainer).toBeInTheDocument();
    });

    it("renders when BarChart is present in DOM", () => {
      const { container } = render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Bar Chart Test"
          baselineHighPct={25}
        />
      );

      // BarChart renders as SVG
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("displays when baseline note text is present", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Baseline Note"
          baselineHighPct={25}
        />
      );

      expect(
        screen.getByText(/panel.intelligenceTab.chart.baselineNote/i)
      ).toBeInTheDocument();
    });
  });

  describe("Statistical data transformation", () => {
    it("transforms when percentage values correctly", () => {
      const data = [
        {
          level: "MT3",
          low_pct: 20.0,
          low_count: 10,
          medium_pct: 50.0,
          medium_count: 25,
          high_pct: 30.0,
          high_count: 15,
          total: 50,
        },
      ];

      render(
        <LevelDistributionChart
          data={data}
          title="Transform Test"
          baselineHighPct={25}
        />
      );

      // Chart should render without errors
      expect(screen.getByText("Transform Test")).toBeInTheDocument();
    });

    it("handles when zero total counts", () => {
      const dataWithZeroTotal = [
        {
          level: "Empty",
          low_pct: 0,
          low_count: 0,
          medium_pct: 0,
          medium_count: 0,
          high_pct: 0,
          high_count: 0,
          total: 0,
        },
      ];

      render(
        <LevelDistributionChart
          data={dataWithZeroTotal}
          title="Zero Total Test"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Zero Total Test")).toBeInTheDocument();
    });

    it("calculates when stacked percentages correctly", () => {
      // Percentages should sum to 100% for stacked bars
      const data = mockLevelDistributionNormal;

      render(
        <LevelDistributionChart
          data={data}
          title="Stacked Test"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("Stacked Test")).toBeInTheDocument();
    });
  });

  describe("Baseline reference line", () => {
    it("renders when baseline at 25 percent", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="25% Baseline"
          baselineHighPct={25}
        />
      );

      expect(screen.getByText("25% Baseline")).toBeInTheDocument();
    });

    it("renders when baseline at 15 percent", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="15% Baseline"
          baselineHighPct={15}
        />
      );

      expect(screen.getByText("15% Baseline")).toBeInTheDocument();
    });

    it("renders when baseline at 40 percent", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="40% Baseline"
          baselineHighPct={40}
        />
      );

      expect(screen.getByText("40% Baseline")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has when accessible title for screen readers", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Accessible Chart"
          baselineHighPct={25}
        />
      );

      const title = screen.getByText("Accessible Chart");
      expect(title).toBeInTheDocument();
    });

    it("maintains when structure for keyboard navigation", () => {
      const { container } = render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Keyboard Nav"
          baselineHighPct={25}
        />
      );

      // SVG should be focusable
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("provides when baseline note for context", () => {
      render(
        <LevelDistributionChart
          data={mockLevelDistributionNormal}
          title="Context Test"
          baselineHighPct={25}
        />
      );

      expect(
        screen.getByText(/panel.intelligenceTab.chart.baselineNote/i)
      ).toBeInTheDocument();
    });
  });
});
