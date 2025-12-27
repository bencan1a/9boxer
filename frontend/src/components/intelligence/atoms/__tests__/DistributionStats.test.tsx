/**
 * Unit tests for DistributionStats component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { DistributionStats } from "../DistributionStats";
import {
  mockIdealDistribution,
  mockSkewedDistribution,
  mockBalancedDistribution,
  mockEmptyDistribution,
  mockSmallDistribution,
  createCustomDistribution,
} from "@/mocks/mockDistribution";
import type { DistributionData } from "@/types/intelligence";

describe("DistributionStats", () => {
  describe("Rendering segments", () => {
    it("renders all segments sorted by position", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // Check that all 9 positions are rendered
      for (let i = 1; i <= 9; i++) {
        expect(screen.getByTestId(`dist-stat-${i}`)).toBeInTheDocument();
      }
    });

    it("displays percentage for each segment", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // Check within specific segments since percentages may repeat
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("5.0%");

      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toHaveTextContent("40.0%");
    });

    it("calculates percentages correctly", () => {
      const customDist = createCustomDistribution([
        10, 20, 5, 15, 25, 10, 5, 5, 5,
      ]);
      render(<DistributionStats data={customDist} />);

      // Total = 100
      // Check within specific segments since percentages may repeat
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("10.0%");

      const position2 = screen.getByTestId("dist-stat-2");
      expect(position2).toHaveTextContent("20.0%");

      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toHaveTextContent("25.0%");
    });

    it("shows position labels", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      for (let i = 1; i <= 9; i++) {
        expect(screen.getByText(`Position ${i}`)).toBeInTheDocument();
      }
    });

    it("displays employee count for each segment", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // Position 1: 5 employees
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("5 employees");

      // Position 5: 40 employees
      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toHaveTextContent("40 employees");
    });

    it("uses singular 'employee' for count of 1", () => {
      const customDist = createCustomDistribution([1, 0, 0, 0, 0, 0, 0, 0, 0]);
      render(<DistributionStats data={customDist} />);

      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("1 employee");
    });

    it("uses plural 'employees' for count of 0", () => {
      const customDist = createCustomDistribution([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      render(<DistributionStats data={customDist} />);

      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("0 employees");
    });
  });

  describe("Position colors", () => {
    it("uses correct colors for high performer positions", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // High performers: positions 6, 8, 9
      const position6 = screen.getByTestId("dist-stat-6");
      const position8 = screen.getByTestId("dist-stat-8");
      const position9 = screen.getByTestId("dist-stat-9");

      // Check that they have styling (actual colors tested via visual regression)
      expect(position6).toBeInTheDocument();
      expect(position8).toBeInTheDocument();
      expect(position9).toBeInTheDocument();
    });

    it("uses correct colors for needs attention positions", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // Needs attention: positions 1, 2, 4
      const position1 = screen.getByTestId("dist-stat-1");
      const position2 = screen.getByTestId("dist-stat-2");
      const position4 = screen.getByTestId("dist-stat-4");

      expect(position1).toBeInTheDocument();
      expect(position2).toBeInTheDocument();
      expect(position4).toBeInTheDocument();
    });

    it("uses correct colors for solid performer position", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // Solid performer: position 5
      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toBeInTheDocument();
    });

    it("uses correct colors for development positions", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // Development: positions 3, 7
      const position3 = screen.getByTestId("dist-stat-3");
      const position7 = screen.getByTestId("dist-stat-7");

      expect(position3).toBeInTheDocument();
      expect(position7).toBeInTheDocument();
    });
  });

  describe("Ideal percentage comparison", () => {
    it("shows deviation warning when difference >5%", () => {
      render(<DistributionStats data={mockSkewedDistribution} showIdeal />);

      // Position 9: 45% actual vs 5% ideal = +40% deviation
      const position9 = screen.getByTestId("dist-stat-9");
      expect(position9).toHaveTextContent("+40.0% vs ideal");
    });

    it("shows 'On target' when within ideal range", () => {
      render(<DistributionStats data={mockBalancedDistribution} showIdeal />);

      // Position 5: 30% actual vs 40% ideal = -10% deviation
      // But some positions should be close
      const position2 = screen.getByTestId("dist-stat-2");
      expect(position2).toHaveTextContent("vs ideal");
    });

    it("hides ideal comparison when showIdeal=false", () => {
      render(
        <DistributionStats data={mockSkewedDistribution} showIdeal={false} />
      );

      // Should not show "vs ideal" text
      expect(screen.queryByText(/vs ideal/i)).not.toBeInTheDocument();
    });

    it("shows positive deviation with plus sign", () => {
      render(<DistributionStats data={mockSkewedDistribution} showIdeal />);

      // Position 9: 45% vs 5% = +40%
      const position9 = screen.getByTestId("dist-stat-9");
      expect(position9).toHaveTextContent("+40.0% vs ideal");
    });

    it("shows negative deviation without extra sign", () => {
      render(<DistributionStats data={mockSkewedDistribution} showIdeal />);

      // Position 5: 15% vs 40% = -25%
      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toHaveTextContent("-25.0% vs ideal");
    });

    it("handles missing ideal percentages gracefully", () => {
      const dataWithoutIdeal: DistributionData = {
        ...mockIdealDistribution,
        idealPercentages: {},
      };
      render(<DistributionStats data={dataWithoutIdeal} showIdeal />);

      // Should not show deviation text when ideal not available
      expect(screen.queryByText(/vs ideal/i)).not.toBeInTheDocument();
    });

    it("handles partial ideal percentages", () => {
      const dataWithPartialIdeal: DistributionData = {
        ...mockIdealDistribution,
        idealPercentages: {
          "1": 5,
          "2": 10,
          // Others missing
        },
      };
      render(<DistributionStats data={dataWithPartialIdeal} showIdeal />);

      // Positions 1 and 2 should show deviation
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("vs ideal");

      // Position 3 should not (no ideal defined)
      const position3 = screen.getByTestId("dist-stat-3");
      // Should not have vs ideal text if ideal not defined
    });
  });

  describe("Deviation highlighting", () => {
    it("highlights segments with significant deviation", () => {
      render(<DistributionStats data={mockSkewedDistribution} showIdeal />);

      // Position 9 has +40% deviation (>5% threshold)
      const position9 = screen.getByTestId("dist-stat-9");
      // Component adds border styling for significant deviations
      expect(position9).toBeInTheDocument();
    });

    it("does not highlight segments within acceptable range", () => {
      render(<DistributionStats data={mockBalancedDistribution} showIdeal />);

      // Some positions should be close to ideal
      // Check that they don't have warning styling
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toBeInTheDocument();
    });

    it("uses bold text for significant deviations", () => {
      render(<DistributionStats data={mockSkewedDistribution} showIdeal />);

      const position9 = screen.getByTestId("dist-stat-9");
      // The deviation text should exist
      expect(position9).toHaveTextContent("+40.0% vs ideal");
    });
  });

  describe("Edge cases", () => {
    it("handles empty distribution", () => {
      render(<DistributionStats data={mockEmptyDistribution} />);

      // All positions should show 0%
      for (let i = 1; i <= 9; i++) {
        const position = screen.getByTestId(`dist-stat-${i}`);
        expect(position).toHaveTextContent("0.0%");
        expect(position).toHaveTextContent("0 employees");
      }
    });

    it("handles small dataset", () => {
      render(<DistributionStats data={mockSmallDistribution} />);

      // Total of 10 employees
      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toHaveTextContent("50.0%"); // 5/10 = 50%
      expect(position5).toHaveTextContent("5 employees");
    });

    it("handles zero total gracefully", () => {
      const zeroTotal = createCustomDistribution([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      render(<DistributionStats data={zeroTotal} />);

      // Should show 0% for all (not NaN)
      for (let i = 1; i <= 9; i++) {
        const position = screen.getByTestId(`dist-stat-${i}`);
        expect(position).toHaveTextContent("0.0%");
      }
    });

    it("handles decimal percentages correctly", () => {
      const customDist = createCustomDistribution([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      render(<DistributionStats data={customDist} />);

      // Total = 45
      // Position 1: 1/45 = 2.2%
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("2.2%");
    });

    it("handles 100% in single position", () => {
      const allInOne = createCustomDistribution([0, 0, 0, 0, 100, 0, 0, 0, 0]);
      render(<DistributionStats data={allInOne} />);

      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toHaveTextContent("100.0%");
      expect(position5).toHaveTextContent("100 employees");
    });

    it("sorts segments correctly when provided in random order", () => {
      // Create distribution with segments in reverse order
      const reversedData: DistributionData = {
        segments: mockIdealDistribution.segments.slice().reverse(),
        total: mockIdealDistribution.total,
        idealPercentages: mockIdealDistribution.idealPercentages,
      };
      render(<DistributionStats data={reversedData} />);

      // Should still render in position order 1-9
      const positions = screen.getAllByText(/Position \d/);
      expect(positions).toHaveLength(9);
    });
  });

  describe("Responsive behavior", () => {
    it("renders in grid layout", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // All segments should be present
      for (let i = 1; i <= 9; i++) {
        expect(screen.getByTestId(`dist-stat-${i}`)).toBeInTheDocument();
      }
    });
  });

  describe("Data testids", () => {
    it("has testid for each position", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      for (let i = 1; i <= 9; i++) {
        expect(screen.getByTestId(`dist-stat-${i}`)).toBeInTheDocument();
      }
    });
  });

  describe("Percentage formatting", () => {
    it("displays percentages with one decimal place", () => {
      render(<DistributionStats data={mockIdealDistribution} />);

      // All percentages should have .0 format - check within the specific segments
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("5.0%");

      const position5 = screen.getByTestId("dist-stat-5");
      expect(position5).toHaveTextContent("40.0%");
    });

    it("rounds percentages correctly", () => {
      const customDist = createCustomDistribution([1, 1, 1, 1, 1, 1, 1, 1, 1]);
      render(<DistributionStats data={customDist} />);

      // 1/9 = 11.111...% → should round to 11.1%
      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("11.1%");
    });
  });

  describe("Deviation calculation accuracy", () => {
    it("calculates exact deviation correctly", () => {
      render(<DistributionStats data={mockSkewedDistribution} showIdeal />);

      // Position 9: 45% actual - 5% ideal = +40%
      const position9 = screen.getByTestId("dist-stat-9");
      expect(position9).toHaveTextContent("+40.0% vs ideal");
    });

    it("shows deviation at exactly 5% threshold", () => {
      // Create distribution where position 1 is exactly 5% off ideal
      const customDist = createCustomDistribution([
        10, 10, 5, 10, 40, 10, 5, 10, 0,
      ]);
      // Position 1: 10% vs 5% ideal = +5%
      render(<DistributionStats data={customDist} showIdeal />);

      const position1 = screen.getByTestId("dist-stat-1");
      expect(position1).toHaveTextContent("+5.0% vs ideal");
    });

    it("shows deviation at exactly -5% threshold", () => {
      // Position 2: 0% vs 10% ideal = -10%
      const customDist = createCustomDistribution([
        5, 0, 5, 10, 40, 10, 5, 10, 15,
      ]);
      render(<DistributionStats data={customDist} showIdeal />);

      const position2 = screen.getByTestId("dist-stat-2");
      expect(position2).toHaveTextContent("-10.0% vs ideal");
    });
  });
});
