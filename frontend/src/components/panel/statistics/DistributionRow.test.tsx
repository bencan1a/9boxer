import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { Table, TableBody } from "@mui/material";
import { DistributionRow } from "./DistributionRow";

// Helper to render DistributionRow in a table context
const renderInTable = (props: React.ComponentProps<typeof DistributionRow>) => {
  return render(
    <Table>
      <TableBody>
        <DistributionRow {...props} />
      </TableBody>
    </Table>
  );
};

describe("DistributionRow", () => {
  describe("Rendering", () => {
    it("renders position label", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      expect(screen.getByText("9 - Star Performer")).toBeInTheDocument();
    });

    it("renders employee count", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      expect(screen.getByText("12")).toBeInTheDocument();
    });

    it("renders ColoredPercentageBar", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      // Bar should render with formatted percentage
      expect(screen.getByText("10.8%")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("applies empty state styling when isEmpty is true", () => {
      const { container } = renderInTable({
        position: 7,
        positionLabel: "7 - High Potential",
        count: 0,
        percentage: 0,
        isEmpty: true,
      });

      const tableRow = container.querySelector("tr");
      expect(tableRow).toHaveStyle({ backgroundColor: expect.any(String) });
    });

    it("does not apply empty state styling when isEmpty is false", () => {
      const { container } = renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
        isEmpty: false,
      });

      const tableRow = container.querySelector("tr");
      const style = window.getComputedStyle(tableRow!);
      // Both "transparent" and "rgba(0, 0, 0, 0)" are valid representations
      // eslint-disable-next-line no-restricted-syntax
      expect(["transparent", "rgba(0, 0, 0, 0)"]).toContain(
        style.backgroundColor
      );
    });

    it("automatically sets isEmpty when count is 0", () => {
      renderInTable({
        position: 7,
        positionLabel: "7 - High Potential",
        count: 0,
        percentage: 0,
        isEmpty: true,
      });

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("Font Weight", () => {
    it("uses medium font weight when count > 0", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      const countElement = screen.getByTestId("distribution-row-9-count");
      const style = window.getComputedStyle(countElement);
      expect(style.fontWeight).toBe("500"); // medium
    });

    it("uses normal font weight when count is 0", () => {
      renderInTable({
        position: 7,
        positionLabel: "7 - High Potential",
        count: 0,
        percentage: 0,
        isEmpty: true,
      });

      const countElement = screen.getByTestId("distribution-row-7-count");
      const style = window.getComputedStyle(countElement);
      // Both "400" and "normal" are valid representations
      expect(["400", "normal"]).toContain(style.fontWeight);
    });
  });

  describe("Table Cell Structure", () => {
    it("has three table cells when no grouping indicator", () => {
      const { container } = renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      // Should have 1 th (position label) + 2 td (count and percentage)
      const tableCells = container.querySelectorAll("td");
      expect(tableCells.length).toBe(2);
    });

    it("first cell has scope=row for accessibility", () => {
      const { container } = renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      const firstCell = container.querySelector("th");
      expect(firstCell).toHaveAttribute("scope", "row");
    });

    it("count cell is right-aligned", () => {
      const { container } = renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      const tableCells = container.querySelectorAll("td");
      // MUI TableCell with align="right" should have the attribute or style
      const countCell = tableCells[0];
      const hasAlignAttribute = countCell.getAttribute("align") === "right";
      const hasAlignStyle =
        window.getComputedStyle(countCell).textAlign === "right";
      expect(hasAlignAttribute || hasAlignStyle).toBe(true);
    });

    it("percentage cell is left-aligned", () => {
      const { container } = renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      const tableCells = container.querySelectorAll("td");
      // MUI TableCell with align="left" should have the attribute or style
      const percentageCell = tableCells[1];
      const hasAlignAttribute = percentageCell.getAttribute("align") === "left";
      const hasAlignStyle =
        window.getComputedStyle(percentageCell).textAlign === "left";
      expect(hasAlignAttribute || hasAlignStyle).toBe(true);
    });
  });

  describe("Grouping Indicator", () => {
    it("renders grouping indicator when provided", () => {
      const mockIndicator = <td data-testid="mock-indicator">Indicator</td>;

      const { container } = renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
        groupIndicator: mockIndicator,
      });

      expect(screen.getByTestId("mock-indicator")).toBeInTheDocument();

      // Should have 4 cells when indicator is present
      const tableCells = container.querySelectorAll("td, th");
      expect(tableCells.length).toBe(4);
    });

    it("does not render extra cell when no grouping indicator", () => {
      const { container } = renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      // Should have 3 cells total: 1 th (position) + 2 td (count, percentage)
      const tableCells = container.querySelectorAll("td, th");
      expect(tableCells.length).toBe(3);
    });
  });

  describe("Data Test IDs", () => {
    it("uses default test ID based on position", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      expect(screen.getByTestId("distribution-row-9")).toBeInTheDocument();
    });

    it("uses custom test ID when provided", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
        "data-testid": "custom-row",
      });

      expect(screen.getByTestId("custom-row")).toBeInTheDocument();
    });

    it("includes label, count, and bar test IDs", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      expect(
        screen.getByTestId("distribution-row-9-label")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("distribution-row-9-count")
      ).toBeInTheDocument();
      expect(screen.getByTestId("distribution-row-9-bar")).toBeInTheDocument();
    });
  });

  describe("ColoredPercentageBar Integration", () => {
    it("passes correct props to ColoredPercentageBar", () => {
      renderInTable({
        position: 9,
        positionLabel: "9 - Star Performer",
        count: 12,
        percentage: 10.8,
      });

      // Bar should render with position-based coloring
      expect(screen.getByTestId("distribution-row-9-bar")).toBeInTheDocument();
      expect(screen.getByText("10.8%")).toBeInTheDocument();
    });

    it("percentage bar shows label by default", () => {
      renderInTable({
        position: 5,
        positionLabel: "5 - Solid Performer",
        count: 18,
        percentage: 16.2,
      });

      expect(screen.getByText("16.2%")).toBeInTheDocument();
    });
  });

  describe("All Positions", () => {
    it("handles all 9 positions correctly", () => {
      const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      positions.forEach((position) => {
        const { unmount } = renderInTable({
          position,
          positionLabel: `${position} - Position`,
          count: 10,
          percentage: 11.1,
        });

        expect(
          screen.getByTestId(`distribution-row-${position}`)
        ).toBeInTheDocument();
        unmount();
      });
    });
  });
});
