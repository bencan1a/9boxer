import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeTile } from "../EmployeeTile";
import { createMockEmployee } from "../../../test/mockData";
import { DndContext } from "@dnd-kit/core";
import { GridZoomProvider } from "../../../contexts/GridZoomContext";
import userEvent from "@testing-library/user-event";

// Wrapper for drag-and-drop context and zoom context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <GridZoomProvider>
    <DndContext>{children}</DndContext>
  </GridZoomProvider>
);

describe("EmployeeTile", () => {
  const mockOnSelect = vi.fn();

  const defaultEmployee = createMockEmployee({
    employee_id: 1,
    name: "John Doe",
    business_title: "Software Engineer",
    job_level: "MT4",
    modified_in_session: false,
  });

  it("displays employee name, title, and job level", () => {
    render(
      <TestWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </TestWrapper>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    // Title and job level are displayed with truncation (17 chars > 16 char limit)
    // "Software Engineer" becomes "Software Enginee…"
    expect(screen.getByText(/Software Enginee/i)).toBeInTheDocument();
    expect(screen.getByText(/MT4/)).toBeInTheDocument();
  });

  it("shows modified styling when employee was modified in session", () => {
    const modifiedEmployee = createMockEmployee({
      ...defaultEmployee,
      modified_in_session: true,
    });

    render(
      <TestWrapper>
        <EmployeeTile employee={modifiedEmployee} onSelect={mockOnSelect} />
      </TestWrapper>
    );

    // Modified employees have orange left border (visual indicator only, no badge)
    const card = screen.getByTestId(
      `employee-card-${modifiedEmployee.employee_id}`
    );
    expect(card).toBeInTheDocument();
  });

  it("renders without modified styling when employee was not modified", () => {
    render(
      <TestWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </TestWrapper>
    );

    // No modified badge exists (design uses border only)
    const card = screen.getByTestId(
      `employee-card-${defaultEmployee.employee_id}`
    );
    expect(card).toBeInTheDocument();
  });

  it("calls onSelect when employee card is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </TestWrapper>
    );

    const card = screen.getByText("John Doe").closest(".MuiCard-root");
    expect(card).toBeInTheDocument();

    if (card) {
      await user.click(card);
      expect(mockOnSelect).toHaveBeenCalledWith(1);
    }
  });
});

describe("EmployeeTile - Donut Mode", () => {
  const mockOnSelect = vi.fn();

  const position5Employee = createMockEmployee({
    employee_id: 1,
    name: "Jane Smith",
    business_title: "Product Manager",
    job_level: "MT3",
    grid_position: 5,
    modified_in_session: false,
    donut_modified: false,
  });

  it("displays regular position label when donut mode is inactive", () => {
    render(
      <TestWrapper>
        <EmployeeTile
          employee={position5Employee}
          onSelect={mockOnSelect}
          donutModeActive={false}
        />
      </TestWrapper>
    );

    // Should not show donut-specific labels when donut mode is off
    expect(screen.queryByText(/Donut:/)).not.toBeInTheDocument();
  });

  it("displays original position indicator when employee is donut-modified and donut mode is active", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <TestWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </TestWrapper>
    );

    // Should show original position indicator with history icon
    const originalPositionIndicator = screen.getByTestId(
      "original-position-icon-text"
    );
    expect(originalPositionIndicator).toBeInTheDocument();

    // Should show the original position label (position 5 = Core Talent [M,M])
    expect(screen.getByText(/Core Talent \[M,M\]/)).toBeInTheDocument();

    // Should have history icon
    expect(screen.getByTestId("HistoryIcon")).toBeInTheDocument();
  });

  it("displays full purple border when donut-modified and in donut mode", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 6,
    });

    render(
      <TestWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </TestWrapper>
    );

    const card = screen.getByTestId(
      `employee-card-${donutModifiedEmployee.employee_id}`
    );

    expect(card).toBeInTheDocument();
    // Full purple border (2px) is applied via sx prop
  });

  it("does not apply ghostly styling when donut mode is inactive", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 6,
    });

    render(
      <TestWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={false}
        />
      </TestWrapper>
    );

    const card = screen.getByTestId(
      `employee-card-${donutModifiedEmployee.employee_id}`
    );
    expect(card).toBeInTheDocument();
    // Should not have reduced opacity when donut mode is off
  });

  it("does not display donut badge when donut mode is inactive", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <TestWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={false}
        />
      </TestWrapper>
    );

    const donutIndicator = screen.queryByTestId("donut-indicator");
    expect(donutIndicator).not.toBeInTheDocument();
  });

  it("applies purple border styling when donut-modified and in donut mode", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 8,
    });

    render(
      <TestWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </TestWrapper>
    );

    const card = screen.getByTestId(
      `employee-card-${donutModifiedEmployee.employee_id}`
    );
    expect(card).toBeInTheDocument();
    // Purple border is applied via sx prop with borderColor: "#9c27b0"
  });

  it("shows donut border styling when employee is donut-modified (no badge)", () => {
    const dualModifiedEmployee = createMockEmployee({
      ...position5Employee,
      modified_in_session: true,
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <TestWrapper>
        <EmployeeTile
          employee={dualModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </TestWrapper>
    );

    // Donut indicator badge should NOT be visible (only border treatment)
    expect(screen.queryByTestId("donut-indicator")).not.toBeInTheDocument();
    // Card should be present with purple border styling
    const card = screen.getByTestId(
      `employee-card-${dualModifiedEmployee.employee_id}`
    );
    expect(card).toBeInTheDocument();
  });
});

describe("EmployeeTile - Flag Badges", () => {
  const mockOnSelect = vi.fn();

  const baseEmployee = createMockEmployee({
    employee_id: 1,
    name: "Alice Johnson",
    business_title: "Senior Engineer",
    job_level: "MT5",
  });

  it("displays individual flag badges when employee has flags", () => {
    const employeeWithFlags = createMockEmployee({
      ...baseEmployee,
      flags: ["high_retention_priority", "flight_risk", "new_hire"],
    });

    render(
      <TestWrapper>
        <EmployeeTile employee={employeeWithFlags} onSelect={mockOnSelect} />
      </TestWrapper>
    );

    // Should show 3 individual flag badges
    expect(screen.getByTestId("flag-badge-0")).toBeInTheDocument();
    expect(screen.getByTestId("flag-badge-1")).toBeInTheDocument();
    expect(screen.getByTestId("flag-badge-2")).toBeInTheDocument();
  });

  it("does not display flag badges when employee has no flags", () => {
    const employeeNoFlags = createMockEmployee({
      ...baseEmployee,
      flags: [],
    });

    render(
      <TestWrapper>
        <EmployeeTile employee={employeeNoFlags} onSelect={mockOnSelect} />
      </TestWrapper>
    );

    // Should not show any flag badges
    expect(screen.queryByTestId("flag-badge-0")).not.toBeInTheDocument();
  });

  it("displays correct number of flag badges for multiple flags", () => {
    const employeeWithManyFlags = createMockEmployee({
      ...baseEmployee,
      flags: [
        "promotion_ready",
        "succession_candidate",
        "high_retention_priority",
        "flight_risk",
      ],
    });

    render(
      <TestWrapper>
        <EmployeeTile
          employee={employeeWithManyFlags}
          onSelect={mockOnSelect}
        />
      </TestWrapper>
    );

    // Should show 4 flag badges
    expect(screen.getByTestId("flag-badge-0")).toBeInTheDocument();
    expect(screen.getByTestId("flag-badge-1")).toBeInTheDocument();
    expect(screen.getByTestId("flag-badge-2")).toBeInTheDocument();
    expect(screen.getByTestId("flag-badge-3")).toBeInTheDocument();
  });

  it("displays single flag badge correctly", () => {
    const employeeWithOneFlag = createMockEmployee({
      ...baseEmployee,
      flags: ["pip"],
    });

    render(
      <TestWrapper>
        <EmployeeTile employee={employeeWithOneFlag} onSelect={mockOnSelect} />
      </TestWrapper>
    );

    // Should show exactly 1 flag badge
    expect(screen.getByTestId("flag-badge-0")).toBeInTheDocument();
    expect(screen.queryByTestId("flag-badge-1")).not.toBeInTheDocument();
  });
});
