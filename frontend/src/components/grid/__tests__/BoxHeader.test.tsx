import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { BoxHeader } from "../BoxHeader";

describe("BoxHeader", () => {
  const defaultProps = {
    position: 9,
    positionName: "Star",
    shortLabel: "H,H",
    employeeCount: 5,
    isExpanded: false,
    isCollapsed: false,
    onExpand: vi.fn(),
    onCollapse: vi.fn(),
    positionGuidance: "High performers with high potential",
  };

  it("renders employee count badge", () => {
    render(<BoxHeader {...defaultProps} />);

    const badge = screen.getByTestId("grid-box-9-count");
    expect(badge).toBeInTheDocument();
  });

  it("shows expand button in normal state", () => {
    render(<BoxHeader {...defaultProps} />);

    const expandButton = screen.getByLabelText(/expand/i);
    expect(expandButton).toBeInTheDocument();
  });

  it("shows collapse button in expanded state", () => {
    render(<BoxHeader {...defaultProps} isExpanded={true} />);

    const collapseButton = screen.getByLabelText(/collapse/i);
    expect(collapseButton).toBeInTheDocument();
  });

  it("calls onExpand when expand button clicked", () => {
    const onExpand = vi.fn();
    render(<BoxHeader {...defaultProps} onExpand={onExpand} />);

    const expandButton = screen.getByLabelText(/expand/i);
    fireEvent.click(expandButton);

    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("calls onCollapse when collapse button clicked", () => {
    const onCollapse = vi.fn();
    render(
      <BoxHeader {...defaultProps} isExpanded={true} onCollapse={onCollapse} />
    );

    const collapseButton = screen.getByLabelText(/collapse/i);
    fireEvent.click(collapseButton);

    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it("renders centered layout when collapsed", () => {
    render(<BoxHeader {...defaultProps} isCollapsed={true} />);

    // In collapsed state, expand button should still be visible
    const expandButton = screen.getByLabelText(/expand/i);
    expect(expandButton).toBeInTheDocument();
  });

  it("renders with zero employee count", () => {
    render(<BoxHeader {...defaultProps} employeeCount={0} />);

    const badge = screen.getByTestId("grid-box-9-count");
    expect(badge).toBeInTheDocument();
  });

  it("renders with high employee count", () => {
    render(<BoxHeader {...defaultProps} employeeCount={42} />);

    const badge = screen.getByTestId("grid-box-9-count");
    expect(badge).toBeInTheDocument();
  });

  it("displays position guidance attribute", () => {
    render(<BoxHeader {...defaultProps} />);

    // Check that aria-label is set (for accessibility/tooltip)
    const element = screen.getByLabelText("High performers with high potential");
    expect(element).toBeInTheDocument();
  });
});
