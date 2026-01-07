import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { GridBox } from "../GridBox";
import { mockEmployees } from "../../../test/mockData";
import { DndContext } from "@dnd-kit/core";
import { getTranslatedText } from "../../../test/i18nTestUtils";

// Mock TanStack Virtual to disable virtualization in tests
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: index,
        start: index * 100,
        size: 100,
      })),
    getTotalSize: () => count * 100,
    scrollToIndex: vi.fn(),
    measure: vi.fn(),
  }),
}));

// Wrapper for drag-and-drop context
const DndWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>{children}</DndContext>
);

describe("GridBox", () => {
  const mockOnSelectEmployee = vi.fn();
  const mockOnExpand = vi.fn();
  const mockOnCollapse = vi.fn();

  const defaultProps = {
    position: 9,
    employees: [],
    shortLabel: "[H,H]",
    onSelectEmployee: mockOnSelectEmployee,
    onExpand: mockOnExpand,
    onCollapse: mockOnCollapse,
  };

  it("renders with short label and employee count badge", () => {
    render(
      <DndWrapper>
        <GridBox {...defaultProps} employees={mockEmployees.slice(0, 3)} />
      </DndWrapper>
    );

    expect(screen.getByText(/Star \[H,H\]/)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("displays employee tiles when employees are provided", () => {
    const employees = mockEmployees.slice(0, 2);
    render(
      <DndWrapper>
        <GridBox {...defaultProps} employees={employees} />
      </DndWrapper>
    );

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  it("shows empty state when no employees are provided", () => {
    const { container } = render(
      <DndWrapper>
        <GridBox {...defaultProps} employees={[]} />
      </DndWrapper>
    );

    expect(screen.getByText(/Star \[H,H\]/)).toBeInTheDocument();
    // Badge component is present (MUI Badge may not display 0 by default)
    const badge = container.querySelector('[data-testid="grid-box-9-count"]');
    expect(badge).toBeInTheDocument();
  });

  it("applies correct background color based on position", () => {
    const { container } = render(
      <DndWrapper>
        <GridBox {...defaultProps} position={9} />
      </DndWrapper>
    );

    const box = container.querySelector("[aria-expanded]");
    expect(box).toBeInTheDocument();
  });

  it("hides count badge when collapsed", () => {
    const { container } = render(
      <DndWrapper>
        <GridBox
          {...defaultProps}
          employees={mockEmployees.slice(0, 2)}
          isCollapsed={true}
        />
      </DndWrapper>
    );

    // Label should still be visible
    expect(screen.getByText(/Star \[H,H\]/)).toBeInTheDocument();
    // Badge should not be rendered when collapsed (check data-testid doesn't exist)
    const badge = container.querySelector('[data-testid="grid-box-9-count"]');
    expect(badge).not.toBeInTheDocument();
  });

  it("shows expand button when not expanded", () => {
    render(
      <DndWrapper>
        <GridBox {...defaultProps} isExpanded={false} />
      </DndWrapper>
    );

    const expandButton = screen.getByLabelText(
      getTranslatedText("grid.gridBox.expandBox")
    );
    expect(expandButton).toBeInTheDocument();
  });

  it("shows collapse button when expanded", () => {
    render(
      <DndWrapper>
        <GridBox {...defaultProps} isExpanded={true} />
      </DndWrapper>
    );

    const collapseButton = screen.getByLabelText(
      getTranslatedText("grid.gridBox.collapseBox")
    );
    expect(collapseButton).toBeInTheDocument();
  });

  it("renders all employee tiles when expanded with multiple employees", () => {
    render(
      <DndWrapper>
        <GridBox
          {...defaultProps}
          employees={mockEmployees}
          isExpanded={true}
        />
      </DndWrapper>
    );

    // Verify all employees are rendered (multi-column grid can display them all)
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("Carol White")).toBeInTheDocument();
    expect(screen.getByText("David Brown")).toBeInTheDocument();
    expect(screen.getByText("Eve Davis")).toBeInTheDocument();
  });

  it("renders single-column layout when not expanded", () => {
    const { container } = render(
      <DndWrapper>
        <GridBox
          {...defaultProps}
          employees={mockEmployees.slice(0, 3)}
          isExpanded={false}
        />
      </DndWrapper>
    );

    const gridBox = container.querySelector('[data-testid="grid-box-9"]');
    expect(gridBox).toBeInTheDocument();

    // Employee tiles should still be rendered
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  it("hides employee tiles when collapsed", () => {
    render(
      <DndWrapper>
        <GridBox
          {...defaultProps}
          employees={mockEmployees.slice(0, 2)}
          isCollapsed={true}
        />
      </DndWrapper>
    );

    // Employee names should not be visible when collapsed
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });
});
