/**
 * Tests for InsightsSection component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { InsightsSection } from "../InsightsSection";
import {
  mockRecommendationHigh,
  mockRecommendationMedium,
  mockObservation,
  mockWarning,
  mockManyInsights,
  createMockInsight,
} from "@/mocks/mockInsights";
import type { Insight } from "@/types/intelligence";

describe("InsightsSection", () => {
  describe("Empty State", () => {
    it("shows empty state when insights array is empty", () => {
      render(<InsightsSection insights={[]} />);

      expect(screen.getByText("No insights available")).toBeInTheDocument();
    });

    it("shows empty state with correct i18n text", () => {
      render(<InsightsSection insights={[]} />);

      expect(screen.getByText("No insights available")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Insights will appear here as the system analyzes your talent data"
        )
      ).toBeInTheDocument();
    });

    it("does not render insight cards when empty", () => {
      render(<InsightsSection insights={[]} />);

      expect(screen.queryByTestId(/^insight-card-/)).not.toBeInTheDocument();
    });
  });

  describe("Section Header", () => {
    it("renders section header with correct title", () => {
      render(<InsightsSection insights={[mockRecommendationHigh]} />);

      expect(screen.getByText("AI Insights")).toBeInTheDocument();
    });

    it("uses correct i18n keys for section title", () => {
      render(<InsightsSection insights={[mockRecommendationHigh]} />);

      // Verify the translated text appears (intelligence.insights.title)
      expect(screen.getByText("AI Insights")).toBeInTheDocument();
    });
  });

  describe("Insight Cards", () => {
    it("renders insight cards for each insight", () => {
      const insights = [mockRecommendationHigh, mockObservation, mockWarning];
      render(<InsightsSection insights={insights} />);

      expect(
        screen.getByTestId(`insight-card-${mockRecommendationHigh.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`insight-card-${mockObservation.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`insight-card-${mockWarning.id}`)
      ).toBeInTheDocument();
    });

    it("passes onAction prop to insight cards", () => {
      const handleAction = vi.fn();
      render(
        <InsightsSection
          insights={[mockRecommendationHigh]}
          onInsightAction={handleAction}
        />
      );

      const actionButton = screen.getByTestId(
        `insight-action-${mockRecommendationHigh.id}`
      );
      actionButton.click();

      expect(handleAction).toHaveBeenCalledWith(mockRecommendationHigh.id);
    });

    it("passes showConfidence prop to insight cards", () => {
      render(
        <InsightsSection
          insights={[mockRecommendationHigh]}
          showConfidence={false}
        />
      );

      // Confidence label should not be rendered when showConfidence is false
      expect(screen.queryByText(/Confidence/)).not.toBeInTheDocument();
    });

    it("renders multiple insights correctly (stress test)", () => {
      render(<InsightsSection insights={mockManyInsights} />);

      mockManyInsights.forEach((insight) => {
        expect(
          screen.getByTestId(`insight-card-${insight.id}`)
        ).toBeInTheDocument();
      });

      // Verify we have at least 7 insight cards
      const cards = screen.getAllByTestId(/^insight-card-/);
      expect(cards.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe("Type Count Badges", () => {
    const createMixedTypeInsights = (): Insight[] => [
      createMockInsight("rec-1", "recommendation", "Recommendation 1"),
      createMockInsight("rec-2", "recommendation", "Recommendation 2"),
      createMockInsight("rec-3", "recommendation", "Recommendation 3"),
      createMockInsight("obs-1", "observation", "Observation 1"),
      createMockInsight("obs-2", "observation", "Observation 2"),
      createMockInsight("warn-1", "warning", "Warning 1"),
    ];

    it("counts recommendations correctly", () => {
      const insights = createMixedTypeInsights();
      render(<InsightsSection insights={insights} />);

      const recommendationCount = insights.filter(
        (i) => i.type === "recommendation"
      ).length;
      expect(
        screen.getByText(`${recommendationCount} Recommendations`)
      ).toBeInTheDocument();
    });

    it("counts observations correctly", () => {
      const insights = createMixedTypeInsights();
      render(<InsightsSection insights={insights} />);

      const observationCount = insights.filter(
        (i) => i.type === "observation"
      ).length;
      expect(
        screen.getByText(`${observationCount} Observations`)
      ).toBeInTheDocument();
    });

    it("counts warnings correctly", () => {
      const insights = createMixedTypeInsights();
      render(<InsightsSection insights={insights} />);

      const warningCount = insights.filter((i) => i.type === "warning").length;
      expect(screen.getByText(`${warningCount} Warning`)).toBeInTheDocument();
    });

    it("shows recommendation count badge when recommendations exist", () => {
      const insights = [
        createMockInsight("rec-1", "recommendation", "Recommendation"),
      ];
      render(<InsightsSection insights={insights} />);

      expect(screen.getByText("1 Recommendation")).toBeInTheDocument();
    });

    it("shows observation count badge when observations exist", () => {
      const insights = [
        createMockInsight("obs-1", "observation", "Observation"),
      ];
      render(<InsightsSection insights={insights} />);

      expect(screen.getByText("1 Observation")).toBeInTheDocument();
    });

    it("shows warning count badge when warnings exist", () => {
      const insights = [createMockInsight("warn-1", "warning", "Warning")];
      render(<InsightsSection insights={insights} />);

      expect(screen.getByText("1 Warning")).toBeInTheDocument();
    });

    it("does not show recommendation badge when no recommendations", () => {
      const insights = [
        createMockInsight("obs-1", "observation", "Observation"),
      ];
      render(<InsightsSection insights={insights} />);

      expect(screen.queryByText(/Recommendation/)).not.toBeInTheDocument();
    });

    it("does not show observation badge when no observations", () => {
      const insights = [
        createMockInsight("rec-1", "recommendation", "Recommendation"),
      ];
      render(<InsightsSection insights={insights} />);

      expect(screen.queryByText(/Observation/)).not.toBeInTheDocument();
    });

    it("does not show warning badge when no warnings", () => {
      const insights = [
        createMockInsight("rec-1", "recommendation", "Recommendation"),
      ];
      render(<InsightsSection insights={insights} />);

      expect(screen.queryByText(/Warning/)).not.toBeInTheDocument();
    });

    it("displays multiple type badges simultaneously", () => {
      const insights = createMixedTypeInsights();
      render(<InsightsSection insights={insights} />);

      expect(screen.getByText("3 Recommendations")).toBeInTheDocument();
      expect(screen.getByText("2 Observations")).toBeInTheDocument();
      expect(screen.getByText("1 Warning")).toBeInTheDocument();
    });

    it("uses correct i18n keys for type counts", () => {
      const insights = createMixedTypeInsights();
      render(<InsightsSection insights={insights} />);

      // Verify translated text appears (intelligence.insights.recommendationCount, etc.)
      expect(screen.getByText("3 Recommendations")).toBeInTheDocument();
      expect(screen.getByText("2 Observations")).toBeInTheDocument();
      expect(screen.getByText("1 Warning")).toBeInTheDocument();
    });

    it("handles singular vs plural for recommendations", () => {
      const singleRec = [
        createMockInsight("rec-1", "recommendation", "Recommendation"),
      ];
      const multiRec = [
        createMockInsight("rec-1", "recommendation", "Recommendation 1"),
        createMockInsight("rec-2", "recommendation", "Recommendation 2"),
      ];

      const { unmount } = render(<InsightsSection insights={singleRec} />);
      expect(screen.getByText("1 Recommendation")).toBeInTheDocument();

      unmount();

      render(<InsightsSection insights={multiRec} />);
      expect(screen.getByText("2 Recommendations")).toBeInTheDocument();
    });

    it("handles singular vs plural for observations", () => {
      const singleObs = [
        createMockInsight("obs-1", "observation", "Observation"),
      ];
      const multiObs = [
        createMockInsight("obs-1", "observation", "Observation 1"),
        createMockInsight("obs-2", "observation", "Observation 2"),
      ];

      const { unmount } = render(<InsightsSection insights={singleObs} />);
      expect(screen.getByText("1 Observation")).toBeInTheDocument();

      unmount();

      render(<InsightsSection insights={multiObs} />);
      expect(screen.getByText("2 Observations")).toBeInTheDocument();
    });

    it("handles singular vs plural for warnings", () => {
      const singleWarn = [createMockInsight("warn-1", "warning", "Warning")];
      const multiWarn = [
        createMockInsight("warn-1", "warning", "Warning 1"),
        createMockInsight("warn-2", "warning", "Warning 2"),
      ];

      const { unmount } = render(<InsightsSection insights={singleWarn} />);
      expect(screen.getByText("1 Warning")).toBeInTheDocument();

      unmount();

      render(<InsightsSection insights={multiWarn} />);
      expect(screen.getByText("2 Warnings")).toBeInTheDocument();
    });
  });

  describe("Props and Actions", () => {
    it("defaults showConfidence to true", () => {
      render(<InsightsSection insights={[mockRecommendationHigh]} />);

      // Confidence indicator should be visible by default
      expect(screen.getByText("High Confidence")).toBeInTheDocument();
    });

    it("hides confidence when showConfidence is false", () => {
      render(
        <InsightsSection
          insights={[mockRecommendationHigh]}
          showConfidence={false}
        />
      );

      // Confidence indicator should not be visible
      expect(screen.queryByText(/Confidence/)).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles single insight", () => {
      render(<InsightsSection insights={[mockRecommendationHigh]} />);

      expect(
        screen.getByTestId(`insight-card-${mockRecommendationHigh.id}`)
      ).toBeInTheDocument();
      expect(screen.getAllByTestId(/^insight-card-/).length).toBe(1);
    });

    it("handles all insights with same type", () => {
      const insights = [
        createMockInsight("rec-1", "recommendation", "Recommendation 1"),
        createMockInsight("rec-2", "recommendation", "Recommendation 2"),
        createMockInsight("rec-3", "recommendation", "Recommendation 3"),
      ];
      render(<InsightsSection insights={insights} />);

      expect(screen.getByText("3 Recommendations")).toBeInTheDocument();
      expect(screen.queryByText(/Observation/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Warning/)).not.toBeInTheDocument();
    });

    it("handles insights without action labels", () => {
      const insightWithoutAction = createMockInsight(
        "obs-1",
        "observation",
        "Observation without action"
      );
      render(<InsightsSection insights={[insightWithoutAction]} />);

      expect(
        screen.getByTestId(`insight-card-${insightWithoutAction.id}`)
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(`insight-action-${insightWithoutAction.id}`)
      ).not.toBeInTheDocument();
    });

    it("handles insights without onInsightAction handler", () => {
      render(<InsightsSection insights={[mockRecommendationHigh]} />);

      const actionButton = screen.queryByTestId(
        `insight-action-${mockRecommendationHigh.id}`
      );

      // Action button should not be rendered without handler
      expect(actionButton).not.toBeInTheDocument();
    });

    it("renders action button when both actionLabel and handler exist", () => {
      render(
        <InsightsSection
          insights={[mockRecommendationHigh]}
          onInsightAction={vi.fn()}
        />
      );

      expect(
        screen.getByTestId(`insight-action-${mockRecommendationHigh.id}`)
      ).toBeInTheDocument();
    });
  });
});
