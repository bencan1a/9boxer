/**
 * Unit tests for InsightCard component (Calibration Summary)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/utils";
import { InsightCard } from "../InsightCard";
import type { Insight } from "../../../types/api";

/**
 * Create a mock insight for testing
 */
const createMockInsight = (overrides: Partial<Insight> = {}): Insight => ({
  id: "focus-test-insight-12345678",
  type: "focus_area",
  category: "distribution",
  priority: "high",
  title: "Test Insight Title",
  description: "This is a test insight description for testing purposes.",
  affected_count: 25,
  source_data: {},
  ...overrides,
});

describe("InsightCard", () => {
  describe("Rendering", () => {
    it("renders the insight title", () => {
      const insight = createMockInsight({ title: "Crowded Center Box" });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(screen.getByText("Crowded Center Box")).toBeInTheDocument();
    });

    it("renders the insight description", () => {
      const insight = createMockInsight({
        description: "More than 50% of employees are in the center box.",
      });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(
        screen.getByText("More than 50% of employees are in the center box.")
      ).toBeInTheDocument();
    });

    it("displays affected count", () => {
      const insight = createMockInsight({ affected_count: 42 });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(
        screen.getByTestId(`insight-affected-${insight.id}`)
      ).toHaveTextContent("42");
    });
  });

  describe("Priority Badge", () => {
    it("shows HIGH for high priority", () => {
      const insight = createMockInsight({ priority: "high" });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(
        screen.getByTestId(`insight-priority-${insight.id}`)
      ).toHaveTextContent("HIGH");
    });

    it("shows MED for medium priority", () => {
      const insight = createMockInsight({ priority: "medium" });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(
        screen.getByTestId(`insight-priority-${insight.id}`)
      ).toHaveTextContent("MED");
    });

    it("shows LOW for low priority", () => {
      const insight = createMockInsight({ priority: "low" });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(
        screen.getByTestId(`insight-priority-${insight.id}`)
      ).toHaveTextContent("LOW");
    });
  });

  describe("Selection State", () => {
    it("renders checkbox as checked when selected", () => {
      const insight = createMockInsight();

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      // Get the actual checkbox input element
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("renders checkbox as unchecked when not selected", () => {
      const insight = createMockInsight();

      render(
        <InsightCard insight={insight} selected={false} onToggle={() => {}} />
      );

      // Get the actual checkbox input element
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("applies reduced opacity when not selected", () => {
      const insight = createMockInsight();

      render(
        <InsightCard insight={insight} selected={false} onToggle={() => {}} />
      );

      const card = screen.getByTestId(`insight-card-${insight.id}`);
      expect(card).toHaveStyle({ opacity: "0.6" });
    });

    it("applies full opacity when selected", () => {
      const insight = createMockInsight();

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      const card = screen.getByTestId(`insight-card-${insight.id}`);
      expect(card).toHaveStyle({ opacity: "1" });
    });
  });

  describe("Interactions", () => {
    it("calls onToggle when card is clicked", async () => {
      const onToggle = vi.fn();
      const insight = createMockInsight();

      const { user } = render(
        <InsightCard insight={insight} selected={true} onToggle={onToggle} />
      );

      // Click the card action area
      await user.click(screen.getByRole("button"));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onToggle when checkbox is clicked", async () => {
      const onToggle = vi.fn();
      const insight = createMockInsight();

      const { user } = render(
        <InsightCard insight={insight} selected={false} onToggle={onToggle} />
      );

      // Click the actual checkbox input element
      await user.click(screen.getByRole("checkbox"));

      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has accessible aria-label on action area when selected", () => {
      const insight = createMockInsight({ title: "Focus on Stars" });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Deselect insight: Focus on Stars"
      );
    });

    it("has accessible aria-label on action area when not selected", () => {
      const insight = createMockInsight({ title: "Focus on Stars" });

      render(
        <InsightCard insight={insight} selected={false} onToggle={() => {}} />
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Select insight: Focus on Stars"
      );
    });

    it("checkbox has accessible aria-label", () => {
      const insight = createMockInsight({ title: "Review Lower Performers" });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-label",
        "Select Review Lower Performers"
      );
    });
  });

  describe("Test IDs", () => {
    it("renders all required test IDs", () => {
      const insight = createMockInsight({ id: "anomaly-test-abc12345" });

      render(
        <InsightCard insight={insight} selected={true} onToggle={() => {}} />
      );

      expect(
        screen.getByTestId("insight-card-anomaly-test-abc12345")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("insight-checkbox-anomaly-test-abc12345")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("insight-priority-anomaly-test-abc12345")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("insight-title-anomaly-test-abc12345")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("insight-description-anomaly-test-abc12345")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("insight-affected-anomaly-test-abc12345")
      ).toBeInTheDocument();
    });
  });

  describe("Clustering", () => {
    it("supports insights with cluster_id and cluster_title fields", () => {
      const clusteredInsight = createMockInsight({
        cluster_id: "cluster-1",
        cluster_title: "MT3 Focus",
      });

      render(
        <InsightCard
          insight={clusteredInsight}
          selected={false}
          onToggle={vi.fn()}
        />
      );

      // Verify the component accepts and stores cluster fields
      // The actual display of cluster badges may be implemented in future iterations
      expect(
        screen.getByTestId(`insight-card-${clusteredInsight.id}`)
      ).toBeInTheDocument();
    });

    it("works correctly without cluster fields", () => {
      const nonClusteredInsight = createMockInsight({
        cluster_id: undefined,
        cluster_title: undefined,
      });

      render(
        <InsightCard
          insight={nonClusteredInsight}
          selected={false}
          onToggle={vi.fn()}
        />
      );

      expect(
        screen.getByTestId(`insight-card-${nonClusteredInsight.id}`)
      ).toBeInTheDocument();
    });

    it("handles partial cluster information gracefully", () => {
      // Test case where cluster_id exists but cluster_title doesn't
      const partialClusterInsight = createMockInsight({
        cluster_id: "cluster-1",
        cluster_title: undefined,
      });

      render(
        <InsightCard
          insight={partialClusterInsight}
          selected={false}
          onToggle={vi.fn()}
        />
      );

      expect(
        screen.getByTestId(`insight-card-${partialClusterInsight.id}`)
      ).toBeInTheDocument();
    });
  });
});
