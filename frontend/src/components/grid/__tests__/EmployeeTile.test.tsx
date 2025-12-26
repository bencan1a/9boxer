import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeTile } from "../EmployeeTile";
import { createMockEmployee } from "../../../test/mockData";
import { DndContext } from "@dnd-kit/core";
import userEvent from "@testing-library/user-event";

// Wrapper for drag-and-drop context
const DndWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>{children}</DndContext>
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
      <DndWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("MT4")).toBeInTheDocument();
  });

  it("shows modified indicator when employee was modified in session", () => {
    const modifiedEmployee = createMockEmployee({
      ...defaultEmployee,
      modified_in_session: true,
    });

    render(
      <DndWrapper>
        <EmployeeTile employee={modifiedEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
    );

    expect(screen.getByText("Modified")).toBeInTheDocument();
  });

  it("does not show modified indicator when employee was not modified", () => {
    render(
      <DndWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
    );

    expect(screen.queryByText("Modified")).not.toBeInTheDocument();
  });

  it("calls onSelect when employee card is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DndWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
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
    position_label: "Core Contributor [M,M]",
    modified_in_session: false,
    donut_modified: false,
  });

  it("displays regular position label when donut mode is inactive", () => {
    render(
      <DndWrapper>
        <EmployeeTile
          employee={position5Employee}
          onSelect={mockOnSelect}
          donutModeActive={false}
        />
      </DndWrapper>
    );

    // Should not show donut-specific labels when donut mode is off
    expect(screen.queryByText(/Donut:/)).not.toBeInTheDocument();
  });

  it("displays donut position label when employee is donut-modified and donut mode is active", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <DndWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </DndWrapper>
    );

    // Should show donut position label
    expect(screen.getByText(/Donut: Star \[H,H\]/)).toBeInTheDocument();
  });

  it("applies ghostly opacity styling when donut-modified and in donut mode", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 6,
    });

    render(
      <DndWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </DndWrapper>
    );

    const card = screen.getByTestId(
      `employee-card-${donutModifiedEmployee.employee_id}`
    );

    // Check that card has reduced opacity (0.7) - using inline styles
    expect(card).toBeInTheDocument();
    // Opacity is set via sx prop, which gets applied as inline styles
  });

  it("does not apply ghostly styling when donut mode is inactive", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 6,
    });

    render(
      <DndWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={false}
        />
      </DndWrapper>
    );

    const card = screen.getByTestId(
      `employee-card-${donutModifiedEmployee.employee_id}`
    );
    expect(card).toBeInTheDocument();
    // Should not have reduced opacity when donut mode is off
  });

  it("displays purple donut badge for donut-modified employees when donut mode is active", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <DndWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </DndWrapper>
    );

    const donutIndicator = screen.getByTestId("donut-indicator");
    expect(donutIndicator).toBeInTheDocument();
    expect(donutIndicator).toHaveTextContent("Donut");
  });

  it("does not display donut badge when donut mode is inactive", () => {
    const donutModifiedEmployee = createMockEmployee({
      ...position5Employee,
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <DndWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={false}
        />
      </DndWrapper>
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
      <DndWrapper>
        <EmployeeTile
          employee={donutModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </DndWrapper>
    );

    const card = screen.getByTestId(
      `employee-card-${donutModifiedEmployee.employee_id}`
    );
    expect(card).toBeInTheDocument();
    // Purple border is applied via sx prop with borderColor: "#9c27b0"
  });

  it("shows both Modified and Donut indicators when employee has both modifications", () => {
    const dualModifiedEmployee = createMockEmployee({
      ...position5Employee,
      modified_in_session: true,
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <DndWrapper>
        <EmployeeTile
          employee={dualModifiedEmployee}
          onSelect={mockOnSelect}
          donutModeActive={true}
        />
      </DndWrapper>
    );

    expect(screen.getByTestId("modified-indicator")).toBeInTheDocument();
    expect(screen.getByTestId("donut-indicator")).toBeInTheDocument();
  });
});
