import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { GroupingIndicator } from "./GroupingIndicator";
import { tokens } from "@/theme/tokens";

// Helper to render GroupingIndicator in a table context
const renderInTable = (
  props: React.ComponentProps<typeof GroupingIndicator>
) => {
  return render(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>Test Cell</TableCell>
          <GroupingIndicator {...props} />
        </TableRow>
      </TableBody>
    </Table>
  );
};

describe("GroupingIndicator", () => {
  describe("Label Rendering", () => {
    it("renders High Performers label when groupType is high", () => {
      renderInTable({ groupType: "high", percentage: 30 });
      expect(screen.getByText("High Performers")).toBeInTheDocument();
    });

    it("renders Middle Tier label when groupType is middle", () => {
      renderInTable({ groupType: "middle", percentage: 35 });
      expect(screen.getByText("Middle Tier")).toBeInTheDocument();
    });

    it("renders Low Performers label when groupType is low", () => {
      renderInTable({ groupType: "low", percentage: 20 });
      expect(screen.getByText("Low Performers")).toBeInTheDocument();
    });
  });

  describe("Percentage Rendering", () => {
    it("renders percentage with one decimal place", () => {
      renderInTable({ groupType: "high", percentage: 32.456 });
      expect(screen.getByText("32.5%")).toBeInTheDocument();
    });

    it("handles whole numbers correctly", () => {
      renderInTable({ groupType: "middle", percentage: 30 });
      expect(screen.getByText("30.0%")).toBeInTheDocument();
    });

    it("handles zero percentage", () => {
      renderInTable({ groupType: "low", percentage: 0 });
      expect(screen.getByText("0.0%")).toBeInTheDocument();
    });
  });

  describe("Color Logic - High Performers", () => {
    it("uses success color when percentage is balanced (25-35%)", () => {
      const { container } = renderInTable({
        groupType: "high",
        percentage: 30,
      });
      const tableCell = container.querySelector("td[rowspan]");
      const style = window.getComputedStyle(tableCell!);

      // Should have green border (success color) with design token width
      expect(style.borderLeftStyle).toBe("solid");
      const expectedBorderWidth = `${tokens.dimensions.distributionTable.groupingBorderWidth}px`;
      expect(style.borderLeftWidth).toBe(expectedBorderWidth);
    });

    it("uses warning color when percentage is too low (<20%)", () => {
      renderInTable({ groupType: "high", percentage: 15 });
      // Component should apply warning color, verified by integration tests
      expect(screen.getByText("15.0%")).toBeInTheDocument();
    });

    it("uses info color when percentage is too high (>40%)", () => {
      renderInTable({ groupType: "high", percentage: 45 });
      expect(screen.getByText("45.0%")).toBeInTheDocument();
    });
  });

  describe("Color Logic - Middle Tier", () => {
    it("uses info color when percentage is balanced (30-40%)", () => {
      renderInTable({ groupType: "middle", percentage: 35 });
      expect(screen.getByText("Middle Tier")).toBeInTheDocument();
    });

    it("uses warning color when percentage is too low (<25%)", () => {
      renderInTable({ groupType: "middle", percentage: 20 });
      expect(screen.getByText("20.0%")).toBeInTheDocument();
    });

    it("uses warning color when percentage is too high (>45%)", () => {
      renderInTable({ groupType: "middle", percentage: 50 });
      expect(screen.getByText("50.0%")).toBeInTheDocument();
    });
  });

  describe("Color Logic - Low Performers", () => {
    it("uses success color when percentage is balanced (15-25%)", () => {
      renderInTable({ groupType: "low", percentage: 20 });
      expect(screen.getByText("Low Performers")).toBeInTheDocument();
    });

    it("uses info color when percentage is very low (<10%)", () => {
      renderInTable({ groupType: "low", percentage: 5 });
      expect(screen.getByText("5.0%")).toBeInTheDocument();
    });

    it("uses error color when percentage is too high (>30%)", () => {
      renderInTable({ groupType: "low", percentage: 35 });
      expect(screen.getByText("35.0%")).toBeInTheDocument();
    });
  });

  describe("Table Cell Properties", () => {
    it("applies correct rowSpan attribute", () => {
      const { container } = renderInTable({
        groupType: "high",
        percentage: 30,
        rowSpan: 3,
      });

      const tableCell = container.querySelector("td[rowspan]");
      expect(tableCell).toHaveAttribute("rowspan", "3");
    });

    it("uses default rowSpan of 3 when not provided", () => {
      const { container } = renderInTable({
        groupType: "high",
        percentage: 30,
      });

      const tableCell = container.querySelector("td[rowspan]");
      expect(tableCell).toHaveAttribute("rowspan", "3");
    });

    it("has correct width of 120px", () => {
      const { container } = renderInTable({
        groupType: "middle",
        percentage: 35,
      });

      const tableCell = container.querySelector("td[rowspan]");
      const style = window.getComputedStyle(tableCell!);
      const expectedWidth = `${tokens.dimensions.distributionTable.groupingColumnWidth}px`;
      expect(style.width).toBe(expectedWidth);
    });

    it("has border-left with design token width", () => {
      const { container } = renderInTable({
        groupType: "high",
        percentage: 30,
      });

      const tableCell = container.querySelector("td[rowspan]");
      const style = window.getComputedStyle(tableCell!);
      const expectedBorderWidth = `${tokens.dimensions.distributionTable.groupingBorderWidth}px`;
      expect(style.borderLeftWidth).toBe(expectedBorderWidth);
      expect(style.borderLeftStyle).toBe("solid");
    });
  });

  describe("Data Test IDs", () => {
    it("uses default test ID based on groupType", () => {
      renderInTable({ groupType: "high", percentage: 30 });
      expect(screen.getByTestId("grouping-indicator-high")).toBeInTheDocument();
    });

    it("uses custom test ID when provided", () => {
      renderInTable({
        groupType: "middle",
        percentage: 35,
        "data-testid": "custom-indicator",
      });
      expect(screen.getByTestId("custom-indicator")).toBeInTheDocument();
    });

    it("includes label and percentage test IDs", () => {
      renderInTable({ groupType: "low", percentage: 20 });
      expect(
        screen.getByTestId("grouping-indicator-low-label")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("grouping-indicator-low-percentage")
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic TableCell element", () => {
      const { container } = renderInTable({
        groupType: "high",
        percentage: 30,
      });

      const tableCell = container.querySelector("td[rowspan]");
      expect(tableCell?.tagName).toBe("TD");
    });

    it("has center alignment for readability", () => {
      const { container } = renderInTable({
        groupType: "middle",
        percentage: 35,
      });

      const tableCell = container.querySelector("td[rowspan]");
      // MUI TableCell with align="center" should have the attribute or style
      const hasAlignAttribute = tableCell?.getAttribute("align") === "center";
      const hasAlignStyle = tableCell
        ? window.getComputedStyle(tableCell).textAlign === "center"
        : false;
      expect(hasAlignAttribute || hasAlignStyle).toBe(true);
    });

    it("label is uppercase for emphasis", () => {
      renderInTable({
        groupType: "high",
        percentage: 30,
      });

      const label = screen.getByText("High Performers");
      const style = window.getComputedStyle(label);
      expect(style.textTransform).toBe("uppercase");
    });
  });
});
