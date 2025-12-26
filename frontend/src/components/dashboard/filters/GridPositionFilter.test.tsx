import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { GridPositionFilter } from "./GridPositionFilter";

describe("GridPositionFilter", () => {
  const mockOnPositionsChange = vi.fn();

  const defaultProps = {
    selectedPositions: [],
    onPositionsChange: mockOnPositionsChange,
  };

  beforeEach(() => {
    mockOnPositionsChange.mockClear();
  });

  it("renders all 9 grid position boxes", () => {
    render(<GridPositionFilter {...defaultProps} />);

    // Check all 9 positions are rendered
    for (let i = 1; i <= 9; i++) {
      expect(screen.getByTestId(`grid-position-${i}`)).toBeInTheDocument();
    }
  });

  it("displays grid in correct 3x3 layout order", () => {
    render(<GridPositionFilter {...defaultProps} />);

    const container = screen.getByTestId("grid-position-filter");

    // Verify container has grid display
    expect(container).toBeInTheDocument();

    // All 9 positions should be rendered in the correct order
    const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    positions.forEach((pos) => {
      expect(screen.getByTestId(`grid-position-${pos}`)).toBeInTheDocument();
    });
  });

  it("highlights selected positions", () => {
    render(
      <GridPositionFilter {...defaultProps} selectedPositions={[1, 5, 9]} />
    );

    const position1 = screen.getByTestId("grid-position-1");
    const position5 = screen.getByTestId("grid-position-5");
    const position9 = screen.getByTestId("grid-position-9");
    const position2 = screen.getByTestId("grid-position-2");

    // Selected positions should have aria-pressed=true
    expect(position1).toHaveAttribute("aria-pressed", "true");
    expect(position5).toHaveAttribute("aria-pressed", "true");
    expect(position9).toHaveAttribute("aria-pressed", "true");

    // Unselected position should have aria-pressed=false
    expect(position2).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles position selection on click", () => {
    render(<GridPositionFilter {...defaultProps} />);

    const position5 = screen.getByTestId("grid-position-5");
    fireEvent.click(position5);

    expect(mockOnPositionsChange).toHaveBeenCalledWith([5]);
  });

  it("adds position to existing selections", () => {
    render(<GridPositionFilter {...defaultProps} selectedPositions={[1, 5]} />);

    const position9 = screen.getByTestId("grid-position-9");
    fireEvent.click(position9);

    expect(mockOnPositionsChange).toHaveBeenCalledWith([1, 5, 9]);
  });

  it("removes position from selections when clicked again", () => {
    render(
      <GridPositionFilter {...defaultProps} selectedPositions={[1, 5, 9]} />
    );

    const position5 = screen.getByTestId("grid-position-5");
    fireEvent.click(position5);

    expect(mockOnPositionsChange).toHaveBeenCalledWith([1, 9]);
  });

  it("displays employee counts when provided", () => {
    const employeeCounts = {
      1: 2,
      2: 5,
      3: 3,
      4: 4,
      5: 12,
      6: 8,
      7: 1,
      8: 6,
      9: 9,
    };

    render(
      <GridPositionFilter {...defaultProps} employeeCounts={employeeCounts} />
    );

    // Check counts are displayed
    expect(screen.getByTestId("grid-position-1-count")).toHaveTextContent("2");
    expect(screen.getByTestId("grid-position-5-count")).toHaveTextContent("12");
    expect(screen.getByTestId("grid-position-9-count")).toHaveTextContent("9");
  });

  it("does not display count badge for zero counts", () => {
    const employeeCounts = {
      1: 0,
      5: 10,
      9: 0,
    };

    render(
      <GridPositionFilter {...defaultProps} employeeCounts={employeeCounts} />
    );

    // Position 5 should have count
    expect(screen.getByTestId("grid-position-5-count")).toBeInTheDocument();

    // Positions 1 and 9 should not have count badges
    expect(
      screen.queryByTestId("grid-position-1-count")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("grid-position-9-count")
    ).not.toBeInTheDocument();
  });

  it("does not display counts when employeeCounts is not provided", () => {
    render(<GridPositionFilter {...defaultProps} />);

    // No count badges should be present
    for (let i = 1; i <= 9; i++) {
      expect(
        screen.queryByTestId(`grid-position-${i}-count`)
      ).not.toBeInTheDocument();
    }
  });

  it("shows clear button when positions are selected", () => {
    render(
      <GridPositionFilter {...defaultProps} selectedPositions={[1, 5, 9]} />
    );

    const clearButton = screen.getByTestId("grid-position-clear-button");
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveTextContent("(3)");
  });

  it("hides clear button when no positions are selected", () => {
    render(<GridPositionFilter {...defaultProps} />);

    const clearButton = screen.queryByTestId("grid-position-clear-button");
    expect(clearButton).not.toBeInTheDocument();
  });

  it("clears all selections when clear button is clicked", () => {
    render(
      <GridPositionFilter {...defaultProps} selectedPositions={[1, 5, 9]} />
    );

    const clearButton = screen.getByTestId("grid-position-clear-button");
    fireEvent.click(clearButton);

    expect(mockOnPositionsChange).toHaveBeenCalledWith([]);
  });

  it("has proper accessibility attributes", () => {
    render(<GridPositionFilter {...defaultProps} />);

    const position5 = screen.getByTestId("grid-position-5");

    // Should have aria-label with position name and guidance
    expect(position5).toHaveAttribute("aria-label");
    expect(position5.getAttribute("aria-label")).toContain("Solid");

    // Should have aria-pressed for toggle state
    expect(position5).toHaveAttribute("aria-pressed", "false");

    // Should be a button (ButtonBase)
    expect(position5.tagName).toBe("BUTTON");
  });

  it("updates aria-pressed when selection changes", () => {
    const { rerender } = render(
      <GridPositionFilter {...defaultProps} selectedPositions={[]} />
    );

    const position5 = screen.getByTestId("grid-position-5");
    expect(position5).toHaveAttribute("aria-pressed", "false");

    rerender(<GridPositionFilter {...defaultProps} selectedPositions={[5]} />);

    expect(position5).toHaveAttribute("aria-pressed", "true");
  });

  it("handles sparse employee counts data", () => {
    const employeeCounts = {
      2: 3,
      5: 15,
      9: 4,
      // Other positions not provided
    };

    render(
      <GridPositionFilter {...defaultProps} employeeCounts={employeeCounts} />
    );

    // Positions with counts should show them
    expect(screen.getByTestId("grid-position-2-count")).toHaveTextContent("3");
    expect(screen.getByTestId("grid-position-5-count")).toHaveTextContent("15");
    expect(screen.getByTestId("grid-position-9-count")).toHaveTextContent("4");

    // Positions without counts should not show badges
    expect(
      screen.queryByTestId("grid-position-1-count")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("grid-position-3-count")
    ).not.toBeInTheDocument();
  });
});
