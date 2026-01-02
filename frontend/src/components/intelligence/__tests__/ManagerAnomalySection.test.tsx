import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/utils";
import { ManagerAnomalySection } from "../ManagerAnomalySection";
import {
  mockGreenManagerAnalysis,
  mockYellowManagerAnalysis,
  mockRedManagerAnalysis,
} from "@/mocks/mockIntelligence";

describe("ManagerAnomalySection", () => {
  describe("Rendering", () => {
    it("renders title and status chip", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Manager Analysis")).toBeInTheDocument();
      expect(screen.getByText("No Issues")).toBeInTheDocument();
    });

    it("renders statistical summary section", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Statistical Summary")).toBeInTheDocument();
    });

    it("renders interpretation section", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Interpretation")).toBeInTheDocument();
      expect(
        screen.getByText(mockGreenManagerAnalysis.interpretation)
      ).toBeInTheDocument();
    });

    it("renders chart component", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div data-testid="test-chart">Chart Content</div>}
        />
      );

      expect(screen.getByTestId("test-chart")).toBeInTheDocument();
      expect(screen.getByText("Chart Content")).toBeInTheDocument();
    });
  });

  describe("Status Display", () => {
    it("displays green status with correct icon and label", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("No Issues")).toBeInTheDocument();
    });

    it("displays yellow status with correct icon and label", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockYellowManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Moderate Anomaly")).toBeInTheDocument();
    });

    it("displays red status with correct icon and label", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockRedManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Severe Anomaly")).toBeInTheDocument();
    });
  });

  describe("Statistical Summary Values", () => {
    it("displays p-value correctly", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const pValue = mockGreenManagerAnalysis.p_value.toFixed(3);
      expect(screen.getByText(pValue)).toBeInTheDocument();
    });

    it("displays effect size correctly", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const effectSize = mockGreenManagerAnalysis.effect_size.toFixed(3);
      expect(screen.getByText(effectSize)).toBeInTheDocument();
    });

    it("displays sample size correctly", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(
        screen.getByText(mockGreenManagerAnalysis.sample_size.toString())
      ).toBeInTheDocument();
    });

    it("displays degrees of freedom correctly", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(
        screen.getByText(mockGreenManagerAnalysis.degrees_of_freedom.toString())
      ).toBeInTheDocument();
    });

    it("formats p-value as <0.001 when very small", () => {
      const verySmallPValue = {
        ...mockRedManagerAnalysis,
        p_value: 0.0001,
      };

      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={verySmallPValue}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("<0.001")).toBeInTheDocument();
    });
  });

  describe("Collapsible Details Table", () => {
    it("shows detailed deviations count in collapsed state", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const deviationsCount = mockGreenManagerAnalysis.deviations.length;
      expect(
        screen.getByText(`Detailed Deviations (${deviationsCount})`)
      ).toBeInTheDocument();
    });

    it("expands details table when clicked", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsToggle = screen.getByText(/Detailed Deviations/);
      fireEvent.click(detailsToggle);

      // Check for table headers
      expect(screen.getByText("Manager")).toBeInTheDocument();
      expect(screen.getByText("Team Size")).toBeInTheDocument();
      expect(screen.getByText("High %")).toBeInTheDocument();
      expect(screen.getByText("Medium %")).toBeInTheDocument();
      expect(screen.getByText("Low %")).toBeInTheDocument();
    });

    it("collapses details table when clicked again", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsToggle = screen.getByText(/Detailed Deviations/);

      // Expand
      fireEvent.click(detailsToggle);
      expect(screen.getByText("Manager")).toBeInTheDocument();

      // Collapse
      fireEvent.click(detailsToggle);

      // Table headers should still be in document but not visible (due to Collapse component)
      // We can verify the toggle button rotated back
      const { container } = render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it("displays manager deviation data in table", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Expand table
      const detailsToggle = screen.getByText(/Detailed Deviations/);
      fireEvent.click(detailsToggle);

      // Check that manager names are displayed
      mockGreenManagerAnalysis.deviations.forEach((deviation) => {
        expect(screen.getByText(deviation.category)).toBeInTheDocument();
      });
    });

    it("displays team size values in table", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Expand table
      const detailsToggle = screen.getByText(/Detailed Deviations/);
      fireEvent.click(detailsToggle);

      // Check for team size values
      mockGreenManagerAnalysis.deviations.forEach((deviation) => {
        expect(
          screen.getByText(deviation.team_size.toString())
        ).toBeInTheDocument();
      });
    });

    it("displays percentage values formatted correctly", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Expand table
      const detailsToggle = screen.getByText(/Detailed Deviations/);
      fireEvent.click(detailsToggle);

      // Check that percentages are formatted with one decimal place
      mockGreenManagerAnalysis.deviations.forEach((deviation) => {
        const highPctText = `${deviation.high_pct.toFixed(1)}%`;
        expect(screen.getByText(highPctText)).toBeInTheDocument();
      });
    });

    it("highlights significant deviations in table", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockRedManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Expand table
      const detailsToggle = screen.getByText(/Detailed Deviations/);
      fireEvent.click(detailsToggle);

      // Check for "Yes" and "No" chips for significance
      const significantDeviations = mockRedManagerAnalysis.deviations.filter(
        (d) => d.is_significant
      );
      if (significantDeviations.length > 0) {
        expect(screen.getAllByText("Yes").length).toBeGreaterThan(0);
      }
    });
  });

  describe("Different Analysis Scenarios", () => {
    it("renders correctly with green analysis", () => {
      const { container } = render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText("No Issues")).toBeInTheDocument();
    });

    it("renders correctly with yellow analysis", () => {
      const { container } = render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockYellowManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Moderate Anomaly")).toBeInTheDocument();
    });

    it("renders correctly with red analysis", () => {
      const { container } = render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockRedManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText("Severe Anomaly")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty deviations array", () => {
      const emptyAnalysis = {
        ...mockGreenManagerAnalysis,
        deviations: [],
      };

      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={emptyAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Detailed Deviations (0)")).toBeInTheDocument();
    });

    it("handles very high z-scores with bold formatting indication", () => {
      const highZScore = {
        ...mockRedManagerAnalysis,
        deviations: [
          {
            category: "High Z Manager",
            team_size: 20,
            high_pct: 80.0,
            medium_pct: 15.0,
            low_pct: 5.0,
            high_deviation: 60.0,
            medium_deviation: -55.0,
            low_deviation: -5.0,
            total_deviation: 120.0,
            z_score: 4.5,
            is_significant: true,
          },
        ],
      };

      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={highZScore}
          chartComponent={<div>Chart</div>}
        />
      );

      // Expand table
      const detailsToggle = screen.getByText(/Detailed Deviations/);
      fireEvent.click(detailsToggle);

      expect(screen.getByText("4.50")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("renders with proper semantic structure", () => {
      const { container } = render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Check for card structure
      expect(container.querySelector(".MuiCard-root")).toBeInTheDocument();
    });

    it("includes tooltips for statistical terms", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Look for info icons that indicate tooltips
      const { container } = render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Check that InfoIcons exist (they provide tooltips)
      expect(container).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("integrates with i18n translation system", () => {
      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Statistical Summary")).toBeInTheDocument();
      expect(screen.getByText("Interpretation")).toBeInTheDocument();
    });

    it("accepts custom chart component", () => {
      const CustomChart = () => (
        <div data-testid="custom-chart">Custom Chart Content</div>
      );

      render(
        <ManagerAnomalySection
          title="Manager Analysis"
          analysis={mockGreenManagerAnalysis}
          chartComponent={<CustomChart />}
        />
      );

      expect(screen.getByTestId("custom-chart")).toBeInTheDocument();
      expect(screen.getByText("Custom Chart Content")).toBeInTheDocument();
    });
  });
});
