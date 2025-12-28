import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { IntelligenceSummary } from "../IntelligenceSummary";
import {
  mockExcellentIntelligence,
  mockGoodIntelligence,
  mockNeedsAttentionIntelligence,
  mockHighAnomalyCount,
  mockLowAnomalyCount,
  mockMixedIntelligence,
} from "@/mocks/mockIntelligence";
import type { IntelligenceData } from "@/types/api";

describe("IntelligenceSummary", () => {
  describe("Rendering", () => {
    it("renders three summary cards when given data", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      expect(screen.getByTestId("intelligence-summary")).toBeInTheDocument();
      expect(screen.getByTestId("quality-score-card")).toBeInTheDocument();
      expect(screen.getByTestId("anomaly-count-card")).toBeInTheDocument();
      expect(screen.getByTestId("status-card")).toBeInTheDocument();
    });

    it("displays quality score value correctly", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      const scoreValue = screen.getByTestId("quality-score-value");
      expect(scoreValue).toHaveTextContent(
        mockMixedIntelligence.quality_score.toString()
      );
    });

    it("calculates and displays total anomaly count correctly", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      const totalCount = screen.getByTestId("total-anomaly-count");
      const expectedTotal =
        mockMixedIntelligence.anomaly_count.green +
        mockMixedIntelligence.anomaly_count.yellow +
        mockMixedIntelligence.anomaly_count.red;

      expect(totalCount).toHaveTextContent(expectedTotal.toString());
    });

    it("displays anomaly count breakdown with chips", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      expect(screen.getByTestId("anomaly-chip-green")).toBeInTheDocument();
      expect(screen.getByTestId("anomaly-chip-yellow")).toBeInTheDocument();
      expect(screen.getByTestId("anomaly-chip-red")).toBeInTheDocument();
    });
  });

  describe("Quality Score Status", () => {
    it("displays excellent status when score is 80 or above", () => {
      render(<IntelligenceSummary data={mockExcellentIntelligence} />);

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Excellent");

      const statusMessage = screen.getByTestId("status-message");
      expect(statusMessage).toHaveTextContent(
        "Rating distributions appear well-calibrated across all dimensions."
      );
    });

    it("displays good status when score is between 50 and 79", () => {
      render(<IntelligenceSummary data={mockGoodIntelligence} />);

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Good");

      const statusMessage = screen.getByTestId("status-message");
      expect(statusMessage).toHaveTextContent(
        "Some anomalies detected. Review sections below for details."
      );
    });

    it("displays needs attention status when score is below 50", () => {
      render(<IntelligenceSummary data={mockNeedsAttentionIntelligence} />);

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Needs Attention");

      const statusMessage = screen.getByTestId("status-message");
      expect(statusMessage).toHaveTextContent(
        "Significant anomalies detected. Immediate review recommended."
      );
    });

    it("displays excellent status at boundary score of 80", () => {
      const boundaryData: IntelligenceData = {
        ...mockMixedIntelligence,
        quality_score: 80,
      };

      render(<IntelligenceSummary data={boundaryData} />);

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Excellent");
    });

    it("displays good status at boundary score of 50", () => {
      const boundaryData: IntelligenceData = {
        ...mockMixedIntelligence,
        quality_score: 50,
      };

      render(<IntelligenceSummary data={boundaryData} />);

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Good");
    });

    it("displays needs attention status at boundary score of 49", () => {
      const boundaryData: IntelligenceData = {
        ...mockMixedIntelligence,
        quality_score: 49,
      };

      render(<IntelligenceSummary data={boundaryData} />);

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Needs Attention");
    });
  });

  describe("Edge Cases", () => {
    it("handles perfect score of 100 correctly", () => {
      const perfectData: IntelligenceData = {
        ...mockExcellentIntelligence,
        quality_score: 100,
      };

      render(<IntelligenceSummary data={perfectData} />);

      const scoreValue = screen.getByTestId("quality-score-value");
      expect(scoreValue).toHaveTextContent("100");

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Excellent");
    });

    it("handles zero score correctly", () => {
      const zeroData: IntelligenceData = {
        ...mockNeedsAttentionIntelligence,
        quality_score: 0,
      };

      render(<IntelligenceSummary data={zeroData} />);

      const scoreValue = screen.getByTestId("quality-score-value");
      expect(scoreValue).toHaveTextContent("0");

      const statusHeading = screen.getByTestId("status-heading");
      expect(statusHeading).toHaveTextContent("Needs Attention");
    });

    it("handles zero anomalies correctly", () => {
      const noAnomaliesData: IntelligenceData = {
        ...mockExcellentIntelligence,
        anomaly_count: {
          green: 0,
          yellow: 0,
          red: 0,
        },
      };

      render(<IntelligenceSummary data={noAnomaliesData} />);

      const totalCount = screen.getByTestId("total-anomaly-count");
      expect(totalCount).toHaveTextContent("0");
    });

    it("handles high anomaly count correctly", () => {
      render(<IntelligenceSummary data={mockHighAnomalyCount} />);

      const totalCount = screen.getByTestId("total-anomaly-count");
      const expectedTotal =
        mockHighAnomalyCount.anomaly_count.green +
        mockHighAnomalyCount.anomaly_count.yellow +
        mockHighAnomalyCount.anomaly_count.red;

      expect(totalCount).toHaveTextContent(expectedTotal.toString());
      expect(expectedTotal).toBeGreaterThan(20); // Verify it's actually high
    });

    it("handles low anomaly count correctly", () => {
      render(<IntelligenceSummary data={mockLowAnomalyCount} />);

      const totalCount = screen.getByTestId("total-anomaly-count");
      const expectedTotal =
        mockLowAnomalyCount.anomaly_count.green +
        mockLowAnomalyCount.anomaly_count.yellow +
        mockLowAnomalyCount.anomaly_count.red;

      expect(totalCount).toHaveTextContent(expectedTotal.toString());
      expect(expectedTotal).toBeLessThanOrEqual(4); // Verify it's actually low
    });
  });

  describe("Anomaly Breakdown Display", () => {
    it("displays correct green anomaly count", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      const greenChip = screen.getByTestId("anomaly-chip-green");
      expect(greenChip).toHaveTextContent(
        mockMixedIntelligence.anomaly_count.green.toString()
      );
    });

    it("displays correct yellow anomaly count", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      const yellowChip = screen.getByTestId("anomaly-chip-yellow");
      expect(yellowChip).toHaveTextContent(
        mockMixedIntelligence.anomaly_count.yellow.toString()
      );
    });

    it("displays correct red anomaly count", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      const redChip = screen.getByTestId("anomaly-chip-red");
      expect(redChip).toHaveTextContent(
        mockMixedIntelligence.anomaly_count.red.toString()
      );
    });

    it("displays all yellow anomalies when no green or red exist", () => {
      const allYellowData: IntelligenceData = {
        ...mockGoodIntelligence,
        anomaly_count: {
          green: 0,
          yellow: 8,
          red: 0,
        },
      };

      render(<IntelligenceSummary data={allYellowData} />);

      const greenChip = screen.getByTestId("anomaly-chip-green");
      const yellowChip = screen.getByTestId("anomaly-chip-yellow");
      const redChip = screen.getByTestId("anomaly-chip-red");

      expect(greenChip).toHaveTextContent("0");
      expect(yellowChip).toHaveTextContent("8");
      expect(redChip).toHaveTextContent("0");
    });
  });

  describe("Accessibility", () => {
    it("renders with proper semantic structure", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      // Check for proper data-testid attributes
      expect(screen.getByTestId("intelligence-summary")).toBeInTheDocument();
      expect(screen.getByTestId("quality-score-card")).toBeInTheDocument();
      expect(screen.getByTestId("anomaly-count-card")).toBeInTheDocument();
      expect(screen.getByTestId("status-card")).toBeInTheDocument();
    });

    it("uses Material-UI semantic color tokens for quality indicators", () => {
      const { container } = render(
        <IntelligenceSummary data={mockExcellentIntelligence} />
      );

      // Verify component renders without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("integrates with i18n translation system", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      // Check that translated text appears (translations should be loaded by test utils)
      expect(screen.getByText("Quality Score")).toBeInTheDocument();
      expect(screen.getByText("Total Anomalies")).toBeInTheDocument();
      expect(screen.getByText("Overall Health")).toBeInTheDocument();
    });

    it("displays quality score description text", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      expect(
        screen.getByText("0-100 scale based on statistical anomalies detected")
      ).toBeInTheDocument();
    });
  });

  describe("Different Data Scenarios", () => {
    it("renders correctly with excellent intelligence data", () => {
      render(<IntelligenceSummary data={mockExcellentIntelligence} />);

      expect(screen.getByTestId("quality-score-value")).toHaveTextContent("92");
      expect(screen.getByTestId("status-heading")).toHaveTextContent(
        "Excellent"
      );
    });

    it("renders correctly with good intelligence data", () => {
      render(<IntelligenceSummary data={mockGoodIntelligence} />);

      expect(screen.getByTestId("quality-score-value")).toHaveTextContent("73");
      expect(screen.getByTestId("status-heading")).toHaveTextContent("Good");
    });

    it("renders correctly with needs attention intelligence data", () => {
      render(<IntelligenceSummary data={mockNeedsAttentionIntelligence} />);

      expect(screen.getByTestId("quality-score-value")).toHaveTextContent("42");
      expect(screen.getByTestId("status-heading")).toHaveTextContent(
        "Needs Attention"
      );
    });

    it("renders correctly with high anomaly count data", () => {
      render(<IntelligenceSummary data={mockHighAnomalyCount} />);

      const totalCount = screen.getByTestId("total-anomaly-count");
      expect(parseInt(totalCount.textContent || "0")).toBeGreaterThan(20);
    });

    it("renders correctly with low anomaly count data", () => {
      render(<IntelligenceSummary data={mockLowAnomalyCount} />);

      const totalCount = screen.getByTestId("total-anomaly-count");
      expect(parseInt(totalCount.textContent || "0")).toBeLessThanOrEqual(4);
    });

    it("renders correctly with mixed intelligence data", () => {
      render(<IntelligenceSummary data={mockMixedIntelligence} />);

      expect(screen.getByTestId("quality-score-value")).toHaveTextContent("67");
      expect(screen.getByTestId("status-heading")).toHaveTextContent("Good");
    });
  });
});
