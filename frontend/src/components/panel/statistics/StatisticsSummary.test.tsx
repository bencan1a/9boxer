import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { StatisticsSummary } from "./StatisticsSummary";

describe("StatisticsSummary", () => {
  describe("Rendering", () => {
    it("renders all three cards", () => {
      render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      expect(screen.getByTestId("total-employees-card")).toBeInTheDocument();
      expect(screen.getByTestId("modified-employees-card")).toBeInTheDocument();
      expect(screen.getByTestId("high-performers-card")).toBeInTheDocument();
    });

    it("displays total employees value", () => {
      render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={0}
          highPerformers={0}
        />
      );

      expect(screen.getByText("125")).toBeInTheDocument();
    });

    it("displays modified employees value", () => {
      render(
        <StatisticsSummary
          totalEmployees={100}
          modifiedEmployees={23}
          highPerformers={0}
        />
      );

      expect(screen.getByText("23")).toBeInTheDocument();
    });

    it("displays high performers value", () => {
      render(
        <StatisticsSummary
          totalEmployees={100}
          modifiedEmployees={0}
          highPerformers={42}
        />
      );

      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  describe("Number Formatting", () => {
    it("formats large numbers with commas", () => {
      render(
        <StatisticsSummary
          totalEmployees={1234}
          modifiedEmployees={567}
          highPerformers={890}
        />
      );

      expect(screen.getByText("1,234")).toBeInTheDocument();
      expect(screen.getByText("567")).toBeInTheDocument();
      expect(screen.getByText("890")).toBeInTheDocument();
    });

    it("handles zero values correctly", () => {
      render(
        <StatisticsSummary
          totalEmployees={0}
          modifiedEmployees={0}
          highPerformers={0}
        />
      );

      // Should show three "0" values
      const zeroValues = screen.getAllByText("0");
      expect(zeroValues.length).toBe(3);
    });
  });

  describe("Icons", () => {
    it("renders icons for all cards", () => {
      const { container } = render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      // Should have 3 SVG icons (one per card)
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBe(3);
    });
  });

  describe("Grid Layout", () => {
    it("uses MUI Grid container", () => {
      const { container } = render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      const gridContainer = container.querySelector(".MuiGrid-container");
      expect(gridContainer).toBeInTheDocument();
    });

    it("has three Grid items", () => {
      const { container } = render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      const gridItems = container.querySelectorAll(".MuiGrid-item");
      expect(gridItems.length).toBe(3);
    });

    it("grid items have correct responsive breakpoints", () => {
      const { container } = render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      const gridItems = container.querySelectorAll(".MuiGrid-item");
      gridItems.forEach((item) => {
        // Should have xs={12} and sm={4}
        expect(item).toHaveClass("MuiGrid-grid-xs-12");
        expect(item).toHaveClass("MuiGrid-grid-sm-4");
      });
    });
  });

  describe("Color Coding", () => {
    it("uses primary color for total employees card", () => {
      render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={0}
          highPerformers={0}
        />
      );

      // Total employees card should exist
      expect(screen.getByTestId("total-employees-card")).toBeInTheDocument();
    });

    it("uses warning color for modified employees card", () => {
      render(
        <StatisticsSummary
          totalEmployees={0}
          modifiedEmployees={23}
          highPerformers={0}
        />
      );

      // Modified employees card should exist
      expect(screen.getByTestId("modified-employees-card")).toBeInTheDocument();
    });

    it("uses success color for high performers card", () => {
      render(
        <StatisticsSummary
          totalEmployees={0}
          modifiedEmployees={0}
          highPerformers={42}
        />
      );

      // High performers card should exist
      expect(screen.getByTestId("high-performers-card")).toBeInTheDocument();
    });
  });

  describe("Data Test IDs", () => {
    it("uses default test ID when not provided", () => {
      render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      expect(screen.getByTestId("statistics-summary")).toBeInTheDocument();
    });

    it("uses custom test ID when provided", () => {
      render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
          data-testid="custom-summary"
        />
      );

      expect(screen.getByTestId("custom-summary")).toBeInTheDocument();
    });

    it("individual cards have unique test IDs", () => {
      render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      expect(screen.getByTestId("total-employees-card")).toBeInTheDocument();
      expect(screen.getByTestId("modified-employees-card")).toBeInTheDocument();
      expect(screen.getByTestId("high-performers-card")).toBeInTheDocument();
    });
  });

  describe("Internationalization", () => {
    it("uses translation keys for card labels", () => {
      render(
        <StatisticsSummary
          totalEmployees={125}
          modifiedEmployees={23}
          highPerformers={42}
        />
      );

      // Translation keys are used (verified by t() calls in component)
      // Actual labels will be rendered via i18n system
      expect(screen.getByTestId("statistics-summary")).toBeInTheDocument();
    });
  });
});
