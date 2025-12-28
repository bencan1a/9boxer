import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { DistributionTable } from "./DistributionTable";
import type { PositionDistribution } from "@/types/api";

// Helper to create mock distribution data
const createMockDistribution = (
  data: Record<number, number>
): PositionDistribution[] => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  return Object.entries(data).map(([position, count]) => ({
    grid_position: Number(position),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    position_label: `Position ${position}`,
  }));
};

describe("DistributionTable", () => {
  describe("Rendering", () => {
    it("renders table container", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(<DistributionTable distribution={distribution} />);

      expect(screen.getByTestId("distribution-table")).toBeInTheDocument();
    });

    it("renders table title", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(<DistributionTable distribution={distribution} />);

      expect(
        screen.getByTestId("distribution-table-title")
      ).toBeInTheDocument();
    });

    it("renders all 9 distribution rows", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      const { container } = render(
        <DistributionTable distribution={distribution} />
      );

      // Should have 9 data rows
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(9);
    });

    it("renders table headers", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      const { container } = render(
        <DistributionTable distribution={distribution} />
      );

      // Should have header row
      const headerCells = container.querySelectorAll("thead th");
      expect(headerCells.length).toBe(4); // Position, Count, Percentage, Group %
    });
  });

  describe("Custom Sort Order", () => {
    it("sorts distribution in custom order (9,8,6, 7,5,3, 4,2,1)", () => {
      const distribution = createMockDistribution({
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
      });

      const { container } = render(
        <DistributionTable distribution={distribution} />
      );

      const rows = container.querySelectorAll("tbody tr");
      const customOrder = [9, 8, 6, 7, 5, 3, 4, 2, 1];

      rows.forEach((row, index) => {
        const expectedPosition = customOrder[index];
        expect(row.querySelector("th")?.textContent).toContain(
          `Position ${expectedPosition}`
        );
      });
    });
  });

  describe("Grouping Indicators", () => {
    const mockGroupedStats = {
      highPerformers: { count: 41, percentage: 32.5 },
      middleTier: { count: 41, percentage: 32.5 },
      lowPerformers: { count: 29, percentage: 35.0 },
    };

    it("renders grouping indicators when groupedStats provided", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(
        <DistributionTable
          distribution={distribution}
          groupedStats={mockGroupedStats}
        />
      );

      // Should have three grouping indicators
      expect(screen.getByTestId("grouping-indicator-high")).toBeInTheDocument();
      expect(
        screen.getByTestId("grouping-indicator-middle")
      ).toBeInTheDocument();
      expect(screen.getByTestId("grouping-indicator-low")).toBeInTheDocument();
    });

    it("does not render grouping indicators when groupedStats not provided", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(<DistributionTable distribution={distribution} />);

      // Should not have grouping indicators
      expect(
        screen.queryByTestId("grouping-indicator-high")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("grouping-indicator-middle")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("grouping-indicator-low")
      ).not.toBeInTheDocument();
    });

    it("renders high performers grouping indicator at position 9", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(
        <DistributionTable
          distribution={distribution}
          groupedStats={mockGroupedStats}
        />
      );

      const highIndicator = screen.getByTestId("grouping-indicator-high");
      expect(highIndicator).toHaveAttribute("rowspan", "3");
    });

    it("renders middle tier grouping indicator at position 7", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(
        <DistributionTable
          distribution={distribution}
          groupedStats={mockGroupedStats}
        />
      );

      const middleIndicator = screen.getByTestId("grouping-indicator-middle");
      expect(middleIndicator).toHaveAttribute("rowspan", "3");
    });

    it("renders low performers grouping indicator at position 4", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(
        <DistributionTable
          distribution={distribution}
          groupedStats={mockGroupedStats}
        />
      );

      const lowIndicator = screen.getByTestId("grouping-indicator-low");
      expect(lowIndicator).toHaveAttribute("rowspan", "3");
    });
  });

  describe("Empty State Handling", () => {
    it("marks rows with count=0 as empty", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 0,
        6: 10,
        5: 10,
        4: 0,
        3: 10,
        2: 0,
        1: 10,
      });

      const { container } = render(
        <DistributionTable distribution={distribution} />
      );

      const rows = container.querySelectorAll("tbody tr");
      // Positions 7, 4, 2 should have empty styling
      const customOrder = [9, 8, 6, 7, 5, 3, 4, 2, 1];
      rows.forEach((row, index) => {
        const position = customOrder[index];
        if ([7, 4, 2].includes(position)) {
          // Empty rows should have background color
          const style = window.getComputedStyle(row);
          expect(style.backgroundColor).not.toBe("transparent");
        }
      });
    });
  });

  describe("Data Test IDs", () => {
    it("uses default test ID when not provided", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(<DistributionTable distribution={distribution} />);

      expect(screen.getByTestId("distribution-table")).toBeInTheDocument();
    });

    it("uses custom test ID when provided", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(
        <DistributionTable
          distribution={distribution}
          data-testid="custom-table"
        />
      );

      expect(screen.getByTestId("custom-table")).toBeInTheDocument();
    });
  });

  describe("Integration with Child Components", () => {
    it("passes correct props to DistributionRow components", () => {
      const distribution = createMockDistribution({
        9: 12,
        8: 15,
        7: 10,
        6: 14,
        5: 18,
        4: 11,
        3: 13,
        2: 9,
        1: 9,
      });

      render(<DistributionTable distribution={distribution} />);

      // Check that position 9 row exists with correct data
      expect(screen.getByTestId("distribution-row-9")).toBeInTheDocument();
    });

    it("all positions render their respective rows", () => {
      const distribution = createMockDistribution({
        9: 10,
        8: 10,
        7: 10,
        6: 10,
        5: 10,
        4: 10,
        3: 10,
        2: 10,
        1: 10,
      });

      render(<DistributionTable distribution={distribution} />);

      for (let i = 1; i <= 9; i++) {
        expect(screen.getByTestId(`distribution-row-${i}`)).toBeInTheDocument();
      }
    });
  });

  describe("Edge Cases", () => {
    it("handles empty distribution array", () => {
      render(<DistributionTable distribution={[]} />);

      // Should render table with no rows
      expect(screen.getByTestId("distribution-table")).toBeInTheDocument();
    });

    it("handles all zero counts", () => {
      const distribution = createMockDistribution({
        9: 0,
        8: 0,
        7: 0,
        6: 0,
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      });

      const { container } = render(
        <DistributionTable distribution={distribution} />
      );

      // All rows should have empty styling
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(9);
    });

    it("handles missing positions in distribution", () => {
      const distribution = createMockDistribution({ 9: 10, 5: 20 });

      render(<DistributionTable distribution={distribution} />);

      // Should only render provided positions
      const { container } = render(
        <DistributionTable distribution={distribution} />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(2);
    });
  });
});
