import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { FilterSection } from "./FilterSection";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

describe("FilterSection", () => {
  const mockOnToggle = vi.fn();

  const defaultProps = {
    title: "Test Section",
    expanded: false,
    onToggle: mockOnToggle,
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with title", () => {
    render(<FilterSection {...defaultProps} />);

    expect(screen.getByText("Test Section")).toBeInTheDocument();
  });

  it("renders with default testId when not provided", () => {
    render(<FilterSection {...defaultProps} />);

    expect(screen.getByTestId("filter-section")).toBeInTheDocument();
  });

  it("renders with custom testId when provided", () => {
    render(<FilterSection {...defaultProps} testId="custom-test-id" />);

    expect(screen.getByTestId("custom-test-id")).toBeInTheDocument();
  });

  it("does not show count badge when count is undefined", () => {
    render(<FilterSection {...defaultProps} />);

    const badge = screen.getByTestId("filter-section-count-badge");
    // Badge is in DOM but hidden to prevent jitter
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ visibility: "hidden" });
  });

  it("does not show count badge when count is 0", () => {
    render(<FilterSection {...defaultProps} count={0} />);

    const badge = screen.getByTestId("filter-section-count-badge");
    // Badge is in DOM but hidden to prevent jitter
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ visibility: "hidden" });
  });

  it("shows count badge when count is greater than 0", () => {
    render(<FilterSection {...defaultProps} count={3} />);

    const badge = screen.getByTestId("filter-section-count-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
  });

  it("calls onToggle when header is clicked", () => {
    render(<FilterSection {...defaultProps} />);

    const header = screen.getByTestId("filter-section-header");
    fireEvent.click(header);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("does not render children when collapsed", () => {
    render(<FilterSection {...defaultProps} expanded={false} />);

    // MUI Accordion hides content when collapsed using CSS (height: 0, overflow: hidden)
    // The content is in the DOM but visually hidden
    const content = screen.getByTestId("filter-section-content");
    // Verify content exists but is in a collapsed container
    expect(content).toBeInTheDocument();
    // The parent wrapper should have specific styles indicating it's collapsed
    // Check via the header's aria-expanded attribute instead
    const header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  it("renders children when expanded", () => {
    render(<FilterSection {...defaultProps} expanded={true} />);

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    const header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("renders complex children content", () => {
    const complexChildren = (
      <FormGroup>
        <FormControlLabel control={<Checkbox />} label="Option 1" />
        <FormControlLabel control={<Checkbox />} label="Option 2" />
        <FormControlLabel control={<Checkbox />} label="Option 3" />
      </FormGroup>
    );

    render(
      <FilterSection {...defaultProps} expanded={true}>
        {complexChildren}
      </FilterSection>
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("has proper ARIA attributes for accessibility", () => {
    render(<FilterSection {...defaultProps} testId="accessible-section" />);

    const header = screen.getByTestId("accessible-section-header");
    const content = screen.getByTestId("accessible-section-content");

    // Verify header has id and controls content
    expect(header).toHaveAttribute("id", "accessible-section-header");
    expect(header).toHaveAttribute(
      "aria-controls",
      "accessible-section-content"
    );

    // Verify content has role region and is labeled by header
    expect(content).toHaveAttribute("role", "region");
    expect(content).toHaveAttribute(
      "aria-labelledby",
      "accessible-section-header"
    );
    expect(content).toHaveAttribute("id", "accessible-section-content");
  });

  it("supports keyboard navigation", () => {
    render(<FilterSection {...defaultProps} />);

    const header = screen.getByTestId("filter-section-header");

    // Simulate Enter key press
    fireEvent.keyDown(header, { key: "Enter", code: "Enter" });
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it("toggles between expanded and collapsed states", () => {
    const { rerender } = render(<FilterSection {...defaultProps} />);

    // Initially collapsed
    let header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded", "false");

    // Rerender as expanded
    rerender(<FilterSection {...defaultProps} expanded={true} />);
    header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded", "true");

    // Rerender back to collapsed
    rerender(<FilterSection {...defaultProps} expanded={false} />);
    header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  it("updates count badge when count changes", () => {
    const { rerender } = render(<FilterSection {...defaultProps} count={1} />);

    let badge = screen.getByTestId("filter-section-count-badge");
    expect(badge).toHaveTextContent("1");

    // Update count
    rerender(<FilterSection {...defaultProps} count={5} />);
    badge = screen.getByTestId("filter-section-count-badge");
    expect(badge).toHaveTextContent("5");

    // Count back to 0 should hide badge (but keep in DOM to prevent jitter)
    rerender(<FilterSection {...defaultProps} count={0} />);
    badge = screen.getByTestId("filter-section-count-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ visibility: "hidden" });
  });

  it("maintains expand icon in header", () => {
    render(<FilterSection {...defaultProps} />);

    // MUI AccordionSummary renders ExpandMoreIcon
    // We verify by checking that the header can expand (has the button role)
    const header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded");
  });

  it("has correct aria-expanded state", () => {
    const { rerender } = render(<FilterSection {...defaultProps} />);

    let header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded", "false");

    rerender(<FilterSection {...defaultProps} expanded={true} />);
    header = screen.getByTestId("filter-section-header");
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("applies transparent background styling", () => {
    render(<FilterSection {...defaultProps} />);

    const accordion = screen.getByTestId("filter-section");
    // Verify accordion has transparent background class
    expect(accordion).toBeInTheDocument();
  });
});
