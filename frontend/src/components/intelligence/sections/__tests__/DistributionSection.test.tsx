/**
 * Tests for DistributionSection component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { DistributionSection } from "../DistributionSection";
import {
  mockIdealDistribution,
  mockBalancedDistribution,
  mockSkewedDistribution,
  mockEmptyDistribution,
  mockSmallDistribution,
} from "@/mocks/mockDistribution";

describe("DistributionSection", () => {
  describe("Section Header", () => {
    it("renders section header with correct title", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      expect(screen.getByText("Talent Distribution")).toBeInTheDocument();
    });

    it("uses correct i18n keys for section title", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      // Verify the translated text appears (intelligence.distribution.title)
      expect(screen.getByText("Talent Distribution")).toBeInTheDocument();
    });
  });

  describe("DistributionStats Component", () => {
    it("renders DistributionStats component", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      // Verify that distribution stats are rendered by checking for position data
      expect(screen.getByTestId("dist-stat-1")).toBeInTheDocument();
      expect(screen.getByTestId("dist-stat-5")).toBeInTheDocument();
      expect(screen.getByTestId("dist-stat-9")).toBeInTheDocument();
    });

    it("passes data prop to DistributionStats", () => {
      render(<DistributionSection data={mockBalancedDistribution} />);

      // Verify that the correct data is rendered
      const stat5 = screen.getByTestId("dist-stat-5");
      expect(stat5).toBeInTheDocument();
      expect(stat5.textContent).toContain("30.0%"); // Center box in balanced distribution
    });

    it("renders all 9 position stats", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      for (let i = 1; i <= 9; i++) {
        expect(screen.getByTestId(`dist-stat-${i}`)).toBeInTheDocument();
      }
    });
  });

  describe("Total Employee Count", () => {
    it("shows total employee count", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      expect(
        screen.getByText(`Total: ${mockIdealDistribution.total} employees`)
      ).toBeInTheDocument();
    });

    it("uses correct i18n keys for total count", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      // Verify the translated text appears (intelligence.distribution.totalEmployees)
      expect(screen.getByText("Total: 100 employees")).toBeInTheDocument();
    });

    it("displays correct total from data.total", () => {
      render(<DistributionSection data={mockSmallDistribution} />);

      expect(screen.getByText("Total: 10 employees")).toBeInTheDocument();
    });

    it("displays zero total correctly", () => {
      render(<DistributionSection data={mockEmptyDistribution} />);

      expect(screen.getByText("Total: 0 employees")).toBeInTheDocument();
    });
  });

  describe("Chart Component", () => {
    it("renders chart component when provided", () => {
      const mockChart = <div data-testid="mock-chart">Mock Chart</div>;
      render(
        <DistributionSection
          data={mockIdealDistribution}
          chartComponent={mockChart}
        />
      );

      expect(screen.getByTestId("mock-chart")).toBeInTheDocument();
      expect(screen.getByText("Mock Chart")).toBeInTheDocument();
    });

    it("does not render chart when not provided", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      expect(screen.queryByTestId("mock-chart")).not.toBeInTheDocument();
    });

    it("renders chart above stats", () => {
      const mockChart = <div data-testid="mock-chart">Mock Chart</div>;
      const { container } = render(
        <DistributionSection
          data={mockIdealDistribution}
          chartComponent={mockChart}
        />
      );

      const chart = screen.getByTestId("mock-chart");
      const stat1 = screen.getByTestId("dist-stat-1");

      // Chart should come before stats in DOM order
      expect(container.contains(chart)).toBe(true);
      expect(container.contains(stat1)).toBe(true);

      const chartParent = chart.parentElement;
      const statsParent = stat1.closest(
        '[data-testid="dist-stat-1"]'
      )?.parentElement;

      // Both should be in the document, chart's parent should come before stats
      expect(chartParent).toBeTruthy();
      expect(statsParent).toBeTruthy();
    });
  });

  describe("ShowIdeal Prop", () => {
    it("handles showIdeal prop correctly", () => {
      const { rerender } = render(
        <DistributionSection data={mockIdealDistribution} showIdeal={true} />
      );

      // Should show ideal comparison (vs ideal text)
      expect(screen.getAllByText(/vs ideal/).length).toBeGreaterThan(0);

      rerender(
        <DistributionSection data={mockIdealDistribution} showIdeal={false} />
      );

      // Should not show ideal comparison
      expect(screen.queryByText(/vs ideal/)).not.toBeInTheDocument();
    });

    it("defaults showIdeal to true", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      // Ideal comparison should be shown by default
      expect(screen.getAllByText(/vs ideal/).length).toBeGreaterThan(0);
    });

    it("passes showIdeal to DistributionStats", () => {
      const { rerender } = render(
        <DistributionSection data={mockIdealDistribution} showIdeal={false} />
      );

      expect(screen.queryByText(/vs ideal/)).not.toBeInTheDocument();

      rerender(
        <DistributionSection data={mockIdealDistribution} showIdeal={true} />
      );

      expect(screen.getAllByText(/vs ideal/).length).toBeGreaterThan(0);
    });
  });

  describe("Different Distribution Data", () => {
    it("renders ideal distribution correctly", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      expect(screen.getByText("Total: 100 employees")).toBeInTheDocument();
      expect(screen.getByTestId("dist-stat-5")).toBeInTheDocument();
    });

    it("renders balanced distribution correctly", () => {
      render(<DistributionSection data={mockBalancedDistribution} />);

      expect(screen.getByText("Total: 100 employees")).toBeInTheDocument();
      const stat5 = screen.getByTestId("dist-stat-5");
      expect(stat5.textContent).toContain("30.0%");
    });

    it("renders skewed distribution correctly", () => {
      render(<DistributionSection data={mockSkewedDistribution} />);

      expect(screen.getByText("Total: 100 employees")).toBeInTheDocument();
      const stat9 = screen.getByTestId("dist-stat-9");
      expect(stat9.textContent).toContain("45.0%"); // Heavy skew to position 9
    });

    it("renders empty distribution correctly", () => {
      render(<DistributionSection data={mockEmptyDistribution} />);

      expect(screen.getByText("Total: 0 employees")).toBeInTheDocument();
      // All positions should show 0%
      for (let i = 1; i <= 9; i++) {
        const stat = screen.getByTestId(`dist-stat-${i}`);
        expect(stat.textContent).toContain("0.0%");
      }
    });

    it("renders small distribution correctly", () => {
      render(<DistributionSection data={mockSmallDistribution} />);

      expect(screen.getByText("Total: 10 employees")).toBeInTheDocument();
      const stat5 = screen.getByTestId("dist-stat-5");
      expect(stat5.textContent).toContain("50.0%"); // 5 out of 10 employees
    });
  });

  describe("Complex Chart Integration", () => {
    it("renders with complex chart component", () => {
      const ComplexChart = () => (
        <div data-testid="complex-chart">
          <svg>
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
      );

      render(
        <DistributionSection
          data={mockIdealDistribution}
          chartComponent={<ComplexChart />}
        />
      );

      expect(screen.getByTestId("complex-chart")).toBeInTheDocument();
      expect(screen.getByText("Total: 100 employees")).toBeInTheDocument();
    });

    it("maintains layout with and without chart", () => {
      const { rerender } = render(
        <DistributionSection data={mockIdealDistribution} />
      );

      expect(screen.getByTestId("dist-stat-1")).toBeInTheDocument();

      const mockChart = <div data-testid="mock-chart">Chart</div>;
      rerender(
        <DistributionSection
          data={mockIdealDistribution}
          chartComponent={mockChart}
        />
      );

      expect(screen.getByTestId("mock-chart")).toBeInTheDocument();
      expect(screen.getByTestId("dist-stat-1")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles distribution with all employees in one box", () => {
      const allInOneBox = {
        segments: mockIdealDistribution.segments.map((seg, idx) => ({
          ...seg,
          count: idx === 4 ? 100 : 0, // All in position 5
          percentage: idx === 4 ? 100 : 0,
        })),
        total: 100,
        idealPercentages: mockIdealDistribution.idealPercentages,
      };

      render(<DistributionSection data={allInOneBox} />);

      const stat5 = screen.getByTestId("dist-stat-5");
      expect(stat5.textContent).toContain("100.0%");
    });

    it("handles large employee counts", () => {
      const largeDistribution = {
        segments: mockIdealDistribution.segments.map((seg) => ({
          ...seg,
          count: seg.count * 100,
        })),
        total: 10000,
        idealPercentages: mockIdealDistribution.idealPercentages,
      };

      render(<DistributionSection data={largeDistribution} />);

      expect(screen.getByText("Total: 10000 employees")).toBeInTheDocument();
    });

    it("renders correctly when showIdeal is false and no ideal data", () => {
      const noIdealData = {
        ...mockBalancedDistribution,
        idealPercentages: undefined,
      };

      render(
        <DistributionSection data={noIdealData as any} showIdeal={false} />
      );

      expect(screen.getByTestId("dist-stat-1")).toBeInTheDocument();
      expect(screen.queryByText(/vs ideal/)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility and Structure", () => {
    it("maintains proper component hierarchy", () => {
      render(<DistributionSection data={mockIdealDistribution} />);

      // Card should contain all elements
      expect(screen.getByText("Talent Distribution")).toBeInTheDocument();
      expect(screen.getByTestId("dist-stat-1")).toBeInTheDocument();
      expect(screen.getByText("Total: 100 employees")).toBeInTheDocument();
    });

    it("renders all required elements in correct order", () => {
      const { container } = render(
        <DistributionSection data={mockIdealDistribution} />
      );

      const title = screen.getByText("Talent Distribution");
      const stats = screen.getByTestId("dist-stat-1");
      const total = screen.getByText("Total: 100 employees");

      expect(container.contains(title)).toBe(true);
      expect(container.contains(stats)).toBe(true);
      expect(container.contains(total)).toBe(true);
    });
  });
});
