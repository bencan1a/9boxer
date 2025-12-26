import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeTileList } from "../EmployeeTileList";
import { createMockEmployee } from "../../../test/mockData";
import type { Employee } from "../../../types/employee";

describe("EmployeeTileList", () => {
  const mockOnSelect = vi.fn();

  const threeEmployees: Employee[] = [
    createMockEmployee({ employee_id: 1, name: "Alice" }),
    createMockEmployee({ employee_id: 2, name: "Bob" }),
    createMockEmployee({ employee_id: 3, name: "Carol" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty list without errors", () => {
    const { container } = render(
      <EmployeeTileList
        employees={[]}
        isExpanded={false}
        onSelectEmployee={mockOnSelect}
      />
    );

    // Should render container but no employee cards
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByTestId(/employee-card-/)).not.toBeInTheDocument();
  });

  it("renders all employees in the list", () => {
    render(
      <EmployeeTileList
        employees={threeEmployees}
        isExpanded={false}
        onSelectEmployee={mockOnSelect}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("uses block layout when not expanded", () => {
    const { container } = render(
      <EmployeeTileList
        employees={threeEmployees}
        isExpanded={false}
        onSelectEmployee={mockOnSelect}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(listContainer);
    expect(styles.display).toBe("block");
  });

  it("uses grid layout when expanded", () => {
    const { container } = render(
      <EmployeeTileList
        employees={threeEmployees}
        isExpanded={true}
        onSelectEmployee={mockOnSelect}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(listContainer);
    expect(styles.display).toBe("grid");
  });

  it("applies correct gap in expanded mode", () => {
    const { container } = render(
      <EmployeeTileList
        employees={threeEmployees}
        isExpanded={true}
        onSelectEmployee={mockOnSelect}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(listContainer);
    // 1.5 theme spacing = 12px
    expect(styles.gap).toBe("12px");
  });

  it("passes onSelectEmployee callback to tiles", () => {
    render(
      <EmployeeTileList
        employees={threeEmployees}
        isExpanded={false}
        onSelectEmployee={mockOnSelect}
      />
    );

    const aliceCard = screen.getByTestId("employee-card-1");
    aliceCard.click();

    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it("passes donutModeActive to tiles", () => {
    const donutEmployee = createMockEmployee({
      employee_id: 1,
      name: "Alice",
      donut_modified: true,
      donut_position: 9,
    });

    render(
      <EmployeeTileList
        employees={[donutEmployee]}
        isExpanded={false}
        onSelectEmployee={mockOnSelect}
        donutModeActive={true}
      />
    );

    // Check for donut indicator
    expect(screen.getByTestId("donut-indicator")).toBeInTheDocument();
  });

  it("handles single employee correctly", () => {
    render(
      <EmployeeTileList
        employees={[threeEmployees[0]]}
        isExpanded={false}
        onSelectEmployee={mockOnSelect}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("handles many employees efficiently", () => {
    const manyEmployees = Array.from({ length: 20 }, (_, i) =>
      createMockEmployee({ employee_id: i + 1, name: `Employee ${i + 1}` })
    );

    render(
      <EmployeeTileList
        employees={manyEmployees}
        isExpanded={true}
        onSelectEmployee={mockOnSelect}
      />
    );

    // All employees should render
    expect(screen.getByText("Employee 1")).toBeInTheDocument();
    expect(screen.getByText("Employee 20")).toBeInTheDocument();
  });

  it("maintains tile order from employees array", () => {
    render(
      <EmployeeTileList
        employees={threeEmployees}
        isExpanded={false}
        onSelectEmployee={mockOnSelect}
      />
    );

    const cards = screen.getAllByTestId(/employee-card-/);
    expect(cards).toHaveLength(3);
    
    // Check order by employee IDs
    expect(cards[0]).toHaveAttribute("data-testid", "employee-card-1");
    expect(cards[1]).toHaveAttribute("data-testid", "employee-card-2");
    expect(cards[2]).toHaveAttribute("data-testid", "employee-card-3");
  });
});
