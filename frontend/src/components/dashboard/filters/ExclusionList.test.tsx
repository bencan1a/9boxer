import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { ExclusionList } from "./ExclusionList";

describe("ExclusionList", () => {
  const mockOnRemoveExclusion = vi.fn();
  const mockOnClearAll = vi.fn();

  const defaultProps = {
    onRemoveExclusion: mockOnRemoveExclusion,
    onClearAll: mockOnClearAll,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Empty state", () => {
    it("shows empty state when no exclusions", () => {
      render(<ExclusionList {...defaultProps} excludedEmployees={[]} />);

      expect(screen.getByTestId("exclusion-list-empty")).toBeInTheDocument();
      expect(screen.getByText(/no employees excluded/i)).toBeInTheDocument();
    });

    it("displays info icon in empty state", () => {
      render(<ExclusionList {...defaultProps} excludedEmployees={[]} />);

      const emptyState = screen.getByTestId("exclusion-list-empty");
      expect(
        emptyState.querySelector('svg[data-testid="InfoOutlinedIcon"]')
      ).toBeInTheDocument();
    });

    it("does not show clear all button in empty state", () => {
      render(<ExclusionList {...defaultProps} excludedEmployees={[]} />);

      expect(
        screen.queryByTestId("clear-all-exclusions")
      ).not.toBeInTheDocument();
    });
  });

  describe("With exclusions", () => {
    const mockEmployees = [
      { id: 101, name: "Alice Johnson" },
      { id: 202, name: "Bob Smith" },
      { id: 303, name: "Carol Williams" },
    ];

    it("renders all excluded employees", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      expect(screen.getByTestId("exclusion-list")).toBeInTheDocument();
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
      expect(screen.getByText("Bob Smith")).toBeInTheDocument();
      expect(screen.getByText("Carol Williams")).toBeInTheDocument();
    });

    it("displays employee IDs", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      expect(screen.getByText("ID: 101")).toBeInTheDocument();
      expect(screen.getByText("ID: 202")).toBeInTheDocument();
      expect(screen.getByText("ID: 303")).toBeInTheDocument();
    });

    it("renders remove button for each employee", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      expect(screen.getByTestId("remove-exclusion-101")).toBeInTheDocument();
      expect(screen.getByTestId("remove-exclusion-202")).toBeInTheDocument();
      expect(screen.getByTestId("remove-exclusion-303")).toBeInTheDocument();
    });

    it("shows exclusion items with correct test IDs", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      expect(screen.getByTestId("exclusion-item-101")).toBeInTheDocument();
      expect(screen.getByTestId("exclusion-item-202")).toBeInTheDocument();
      expect(screen.getByTestId("exclusion-item-303")).toBeInTheDocument();
    });

    it("shows clear all button", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      expect(screen.getByTestId("clear-all-exclusions")).toBeInTheDocument();
    });
  });

  describe("User interactions", () => {
    const mockEmployees = [
      { id: 101, name: "Alice Johnson" },
      { id: 202, name: "Bob Smith" },
    ];

    it("calls onRemoveExclusion with correct ID when remove button clicked", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      const removeButton = screen.getByTestId("remove-exclusion-101");
      fireEvent.click(removeButton);

      expect(mockOnRemoveExclusion).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveExclusion).toHaveBeenCalledWith(101);
    });

    it("calls onRemoveExclusion for different employees", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      const removeButton1 = screen.getByTestId("remove-exclusion-101");
      const removeButton2 = screen.getByTestId("remove-exclusion-202");

      fireEvent.click(removeButton1);
      expect(mockOnRemoveExclusion).toHaveBeenCalledWith(101);

      fireEvent.click(removeButton2);
      expect(mockOnRemoveExclusion).toHaveBeenCalledWith(202);

      expect(mockOnRemoveExclusion).toHaveBeenCalledTimes(2);
    });

    it("calls onClearAll when clear all button clicked", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      const clearAllButton = screen.getByTestId("clear-all-exclusions");
      fireEvent.click(clearAllButton);

      expect(mockOnClearAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    const mockEmployees = [{ id: 101, name: "Alice Johnson" }];

    it("has aria-label on remove button", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      const removeButton = screen.getByTestId("remove-exclusion-101");
      expect(removeButton).toHaveAttribute("aria-label");
    });

    it("has aria-label on clear all button", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={mockEmployees} />
      );

      const clearAllButton = screen.getByTestId("clear-all-exclusions");
      expect(clearAllButton).toHaveAttribute("aria-label");
    });
  });

  describe("Single exclusion", () => {
    const singleEmployee = [{ id: 101, name: "Alice Johnson" }];

    it("renders correctly with single employee", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={singleEmployee} />
      );

      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
      expect(screen.getByTestId("clear-all-exclusions")).toBeInTheDocument();
    });

    it("calls onRemoveExclusion for single employee", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={singleEmployee} />
      );

      const removeButton = screen.getByTestId("remove-exclusion-101");
      fireEvent.click(removeButton);

      expect(mockOnRemoveExclusion).toHaveBeenCalledWith(101);
    });
  });

  describe("Many exclusions", () => {
    const manyEmployees = Array.from({ length: 15 }, (_, i) => ({
      id: 100 + i,
      name: `Employee ${i + 1}`,
    }));

    it("renders all employees even when many", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={manyEmployees} />
      );

      // Check first and last employees are rendered
      expect(screen.getByText("Employee 1")).toBeInTheDocument();
      expect(screen.getByText("Employee 15")).toBeInTheDocument();
    });

    it("shows clear all button with many exclusions", () => {
      render(
        <ExclusionList {...defaultProps} excludedEmployees={manyEmployees} />
      );

      expect(screen.getByTestId("clear-all-exclusions")).toBeInTheDocument();
    });
  });
});
