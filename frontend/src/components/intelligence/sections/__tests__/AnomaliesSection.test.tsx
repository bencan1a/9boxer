/**
 * Tests for AnomaliesSection component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { AnomaliesSection } from "../AnomaliesSection";
import {
  mockFunctionAnomaly,
  mockLocationAnomaly,
  mockDistributionAnomaly,
  mockManyAnomalies,
  createMockAnomaly,
} from "@/mocks/mockAnomalies";
import type { Anomaly } from "@/types/intelligence";

describe("AnomaliesSection", () => {
  describe("Empty State", () => {
    it("shows empty state when anomalies array is empty", () => {
      render(<AnomaliesSection anomalies={[]} />);

      expect(screen.getByText("No anomalies detected")).toBeInTheDocument();
    });

    it("shows empty state with correct i18n text", () => {
      render(<AnomaliesSection anomalies={[]} />);

      expect(screen.getByText("No anomalies detected")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Your talent distribution appears well-calibrated with no significant anomalies"
        )
      ).toBeInTheDocument();
    });

    it("does not render anomaly cards when empty", () => {
      render(<AnomaliesSection anomalies={[]} />);

      expect(screen.queryByTestId(/^anomaly-card-/)).not.toBeInTheDocument();
    });
  });

  describe("Section Header", () => {
    it("renders section header with correct title", () => {
      render(<AnomaliesSection anomalies={[mockFunctionAnomaly]} />);

      expect(screen.getByText("Anomalies Detected")).toBeInTheDocument();
    });

    it("uses correct i18n keys for section title", () => {
      render(<AnomaliesSection anomalies={[mockFunctionAnomaly]} />);

      // Verify the translated text appears (intelligence.anomalies.title)
      expect(screen.getByText("Anomalies Detected")).toBeInTheDocument();
    });
  });

  describe("Anomaly Cards", () => {
    it("renders anomaly cards for each anomaly", () => {
      const anomalies = [
        mockFunctionAnomaly,
        mockLocationAnomaly,
        mockDistributionAnomaly,
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(
        screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`anomaly-card-${mockLocationAnomaly.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`anomaly-card-${mockDistributionAnomaly.id}`)
      ).toBeInTheDocument();
    });

    it("passes onClick prop to anomaly cards", () => {
      const handleClick = vi.fn();
      render(
        <AnomaliesSection
          anomalies={[mockFunctionAnomaly]}
          onAnomalyClick={handleClick}
        />
      );

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      card.click();

      expect(handleClick).toHaveBeenCalledWith(mockFunctionAnomaly);
    });

    it("passes onDismiss prop to anomaly cards", () => {
      const handleDismiss = vi.fn();
      render(
        <AnomaliesSection
          anomalies={[mockFunctionAnomaly]}
          onAnomalyDismiss={handleDismiss}
        />
      );

      const dismissButton = screen.getByTestId(
        `anomaly-dismiss-${mockFunctionAnomaly.id}`
      );
      dismissButton.click();

      expect(handleDismiss).toHaveBeenCalledWith(mockFunctionAnomaly.id);
    });

    it("renders multiple anomalies correctly (stress test)", () => {
      render(<AnomaliesSection anomalies={mockManyAnomalies} />);

      mockManyAnomalies.forEach((anomaly) => {
        expect(
          screen.getByTestId(`anomaly-card-${anomaly.id}`)
        ).toBeInTheDocument();
      });

      // Verify we have at least 7 anomaly cards
      const cards = screen.getAllByTestId(/^anomaly-card-/);
      expect(cards.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe("Severity Count Badges", () => {
    const createMixedSeverityAnomalies = (): Anomaly[] => [
      createMockAnomaly(
        "crit-1",
        "location",
        "critical",
        "Critical 1",
        "Description 1"
      ),
      createMockAnomaly(
        "crit-2",
        "function",
        "critical",
        "Critical 2",
        "Description 2"
      ),
      createMockAnomaly(
        "warn-1",
        "distribution",
        "warning",
        "Warning 1",
        "Description 3"
      ),
      createMockAnomaly(
        "warn-2",
        "outlier",
        "warning",
        "Warning 2",
        "Description 4"
      ),
      createMockAnomaly(
        "warn-3",
        "location",
        "warning",
        "Warning 3",
        "Description 5"
      ),
      createMockAnomaly(
        "info-1",
        "function",
        "info",
        "Info 1",
        "Description 6"
      ),
    ];

    it("counts critical anomalies correctly", () => {
      const anomalies = createMixedSeverityAnomalies();
      render(<AnomaliesSection anomalies={anomalies} />);

      const criticalCount = anomalies.filter(
        (a) => a.severity === "critical"
      ).length;
      expect(screen.getByText(`${criticalCount} Critical`)).toBeInTheDocument();
    });

    it("counts warning anomalies correctly", () => {
      const anomalies = createMixedSeverityAnomalies();
      render(<AnomaliesSection anomalies={anomalies} />);

      const warningCount = anomalies.filter(
        (a) => a.severity === "warning"
      ).length;
      expect(screen.getByText(`${warningCount} Warning`)).toBeInTheDocument();
    });

    it("counts info anomalies correctly", () => {
      const anomalies = createMixedSeverityAnomalies();
      render(<AnomaliesSection anomalies={anomalies} />);

      const infoCount = anomalies.filter((a) => a.severity === "info").length;
      expect(screen.getByText(`${infoCount} Info`)).toBeInTheDocument();
    });

    it("shows critical count badge when critical anomalies exist", () => {
      const anomalies = [
        createMockAnomaly(
          "crit-1",
          "location",
          "critical",
          "Critical",
          "Description"
        ),
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.getByText("1 Critical")).toBeInTheDocument();
    });

    it("shows warning count badge when warning anomalies exist", () => {
      const anomalies = [
        createMockAnomaly(
          "warn-1",
          "location",
          "warning",
          "Warning",
          "Description"
        ),
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.getByText("1 Warning")).toBeInTheDocument();
    });

    it("shows info count badge when info anomalies exist", () => {
      const anomalies = [
        createMockAnomaly("info-1", "location", "info", "Info", "Description"),
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.getByText("1 Info")).toBeInTheDocument();
    });

    it("does not show critical badge when no critical anomalies", () => {
      const anomalies = [
        createMockAnomaly(
          "warn-1",
          "location",
          "warning",
          "Warning",
          "Description"
        ),
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.queryByText(/Critical/)).not.toBeInTheDocument();
    });

    it("does not show warning badge when no warning anomalies", () => {
      const anomalies = [
        createMockAnomaly(
          "crit-1",
          "location",
          "critical",
          "Critical",
          "Description"
        ),
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.queryByText(/Warning/)).not.toBeInTheDocument();
    });

    it("does not show info badge when no info anomalies", () => {
      const anomalies = [
        createMockAnomaly(
          "crit-1",
          "location",
          "critical",
          "Critical",
          "Description"
        ),
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.queryByText(/Info/)).not.toBeInTheDocument();
    });

    it("displays multiple severity badges simultaneously", () => {
      const anomalies = createMixedSeverityAnomalies();
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.getByText("2 Critical")).toBeInTheDocument();
      expect(screen.getByText("3 Warning")).toBeInTheDocument();
      expect(screen.getByText("1 Info")).toBeInTheDocument();
    });

    it("uses correct i18n keys for severity counts", () => {
      const anomalies = createMixedSeverityAnomalies();
      render(<AnomaliesSection anomalies={anomalies} />);

      // Verify translated text appears (intelligence.anomalies.criticalCount, etc.)
      expect(screen.getByText("2 Critical")).toBeInTheDocument();
      expect(screen.getByText("3 Warning")).toBeInTheDocument();
      expect(screen.getByText("1 Info")).toBeInTheDocument();
    });
  });

  describe("Props and Actions", () => {
    it("passes showActions prop to anomaly cards", () => {
      render(
        <AnomaliesSection
          anomalies={[mockFunctionAnomaly]}
          showActions={false}
          onAnomalyDismiss={vi.fn()}
        />
      );

      // Dismiss button should not be rendered when showActions is false
      expect(
        screen.queryByTestId(`anomaly-dismiss-${mockFunctionAnomaly.id}`)
      ).not.toBeInTheDocument();
    });

    it("renders dismiss button when showActions is true", () => {
      render(
        <AnomaliesSection
          anomalies={[mockFunctionAnomaly]}
          showActions={true}
          onAnomalyDismiss={vi.fn()}
        />
      );

      expect(
        screen.getByTestId(`anomaly-dismiss-${mockFunctionAnomaly.id}`)
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles single anomaly", () => {
      render(<AnomaliesSection anomalies={[mockFunctionAnomaly]} />);

      expect(
        screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`)
      ).toBeInTheDocument();
      expect(screen.getAllByTestId(/^anomaly-card-/).length).toBe(1);
    });

    it("handles all anomalies with same severity", () => {
      const anomalies = [
        createMockAnomaly(
          "crit-1",
          "location",
          "critical",
          "Critical 1",
          "Description 1"
        ),
        createMockAnomaly(
          "crit-2",
          "function",
          "critical",
          "Critical 2",
          "Description 2"
        ),
        createMockAnomaly(
          "crit-3",
          "distribution",
          "critical",
          "Critical 3",
          "Description 3"
        ),
      ];
      render(<AnomaliesSection anomalies={anomalies} />);

      expect(screen.getByText("3 Critical")).toBeInTheDocument();
      expect(screen.queryByText(/Warning/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Info/)).not.toBeInTheDocument();
    });

    it("handles anomalies without onClick handler", () => {
      render(<AnomaliesSection anomalies={[mockFunctionAnomaly]} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);

      // Should not throw when clicked without handler
      expect(() => card.click()).not.toThrow();
    });

    it("handles anomalies without onDismiss handler", () => {
      render(
        <AnomaliesSection
          anomalies={[mockFunctionAnomaly]}
          showActions={true}
        />
      );

      // Dismiss button should not be rendered without onDismiss handler
      expect(
        screen.queryByTestId(`anomaly-dismiss-${mockFunctionAnomaly.id}`)
      ).not.toBeInTheDocument();
    });
  });
});
