import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { ReportingChainFilter } from "./ReportingChainFilter";

describe("ReportingChainFilter", () => {
  describe("Rendering", () => {
    it("renders with manager name when provided", () => {
      render(
        <ReportingChainFilter managerName="John Smith" onClear={vi.fn()} />
      );

      expect(
        screen.getByTestId("reporting-chain-filter-chip")
      ).toBeInTheDocument();
      expect(screen.getByText(/Reporting to: John Smith/)).toBeInTheDocument();
    });

    it("renders without employee count badge when not provided", () => {
      render(<ReportingChainFilter managerName="Jane Doe" onClear={vi.fn()} />);

      // Badge should not be present
      expect(
        screen.queryByTestId("reporting-chain-filter-badge")
      ).not.toBeInTheDocument();
    });

    it("renders with employee count badge when provided", () => {
      render(
        <ReportingChainFilter
          managerName="Jane Doe"
          employeeCount={12}
          onClear={vi.fn()}
        />
      );

      // Badge should be present
      expect(
        screen.getByTestId("reporting-chain-filter-badge")
      ).toBeInTheDocument();
      // Badge content (number 12) should be visible
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    it("renders with zero employee count", () => {
      render(
        <ReportingChainFilter
          managerName="Empty Manager"
          employeeCount={0}
          onClear={vi.fn()}
        />
      );

      // Badge should be present even with count of 0
      expect(
        screen.getByTestId("reporting-chain-filter-badge")
      ).toBeInTheDocument();
      // Note: MUI Badge hides the badge content when it's 0 by default
      // The badge element exists but is invisible (has .MuiBadge-invisible class)
    });

    it("renders AccountTreeIcon", () => {
      const { container } = render(
        <ReportingChainFilter managerName="John Smith" onClear={vi.fn()} />
      );

      // Check for the icon (MUI renders it as an svg)
      const icon = container.querySelector(
        'svg[data-testid="AccountTreeIcon"]'
      );
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onClear when delete button is clicked", () => {
      const handleClear = vi.fn();
      const { container } = render(
        <ReportingChainFilter managerName="John Smith" onClear={handleClear} />
      );

      // Find and click the delete icon (MUI Chip renders it as an SVG inside the chip)
      const deleteIcon = container.querySelector('[data-testid="CancelIcon"]');
      expect(deleteIcon).toBeInTheDocument();

      // Click the delete icon SVG
      const deleteButton = deleteIcon?.closest("svg");
      fireEvent.click(deleteButton!);

      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it("calls onClear when delete button is clicked with employee count", () => {
      const handleClear = vi.fn();
      const { container } = render(
        <ReportingChainFilter
          managerName="Jane Doe"
          employeeCount={25}
          onClear={handleClear}
        />
      );

      const deleteIcon = container.querySelector('[data-testid="CancelIcon"]');
      fireEvent.click(deleteIcon!);

      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it("does not call onClear when clicking the chip body", () => {
      const handleClear = vi.fn();
      render(
        <ReportingChainFilter managerName="John Smith" onClear={handleClear} />
      );

      // Click the chip itself, not the delete button
      const chip = screen.getByTestId("reporting-chain-filter-chip");
      fireEvent.click(chip);

      expect(handleClear).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has accessible label for the chip", () => {
      render(
        <ReportingChainFilter managerName="John Smith" onClear={vi.fn()} />
      );

      const chip = screen.getByTestId("reporting-chain-filter-chip");
      expect(chip).toHaveAttribute(
        "aria-label",
        "Reporting chain filter for John Smith. Click delete to remove filter."
      );
    });

    it("has delete icon present for clearing filter", () => {
      const { container } = render(
        <ReportingChainFilter managerName="John Smith" onClear={vi.fn()} />
      );

      const deleteIcon = container.querySelector('[data-testid="CancelIcon"]');
      expect(deleteIcon).toBeInTheDocument();
      // The delete icon is visually present and clickable
      // The parent chip has the main aria-label for accessibility
    });

    it("chip is keyboard accessible", () => {
      const handleClear = vi.fn();
      render(
        <ReportingChainFilter managerName="John Smith" onClear={handleClear} />
      );

      const chip = screen.getByTestId("reporting-chain-filter-chip");
      chip.focus();
      expect(chip).toHaveFocus();

      // The chip itself is the button and handles keyboard events
      // Note: In actual MUI implementation, the chip button responds to keyboard
      // but the onDelete is triggered by clicking the delete icon specifically
    });
  });

  describe("Visual States", () => {
    it("renders with success color", () => {
      render(
        <ReportingChainFilter managerName="John Smith" onClear={vi.fn()} />
      );

      const chip = screen.getByTestId("reporting-chain-filter-chip");
      // MUI Chip applies color via className
      expect(chip.className).toContain("MuiChip-colorSuccess");
    });

    it("renders with full width", () => {
      render(
        <ReportingChainFilter managerName="John Smith" onClear={vi.fn()} />
      );

      const chip = screen.getByTestId("reporting-chain-filter-chip");
      // Check that sx prop includes width: 100%
      const styles = window.getComputedStyle(chip);
      expect(styles.width).toBe("100%");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long manager names", () => {
      const longName = "Dr. Alexander Montgomery-Richardson III";
      render(<ReportingChainFilter managerName={longName} onClear={vi.fn()} />);

      expect(screen.getByText(`Reporting to: ${longName}`)).toBeInTheDocument();
    });

    it("handles large employee counts", () => {
      render(
        <ReportingChainFilter
          managerName="Manager"
          employeeCount={999}
          onClear={vi.fn()}
        />
      );

      // MUI Badge shows "99+" for counts >= 100 by default
      expect(screen.getByText("99+")).toBeInTheDocument();
    });

    it("handles special characters in manager name", () => {
      render(
        <ReportingChainFilter
          managerName="O'Brien-Smith & Associates"
          onClear={vi.fn()}
        />
      );

      expect(
        screen.getByText("Reporting to: O'Brien-Smith & Associates")
      ).toBeInTheDocument();
    });
  });
});
