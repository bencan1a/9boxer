import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeTileList } from "../EmployeeTileList";
import { createMockEmployee } from "../../../test/mockData";
import { GridZoomProvider } from "../../../contexts/GridZoomContext";
import type { Employee } from "../../../types/employee";

// Wrapper for GridZoomProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <GridZoomProvider>{children}</GridZoomProvider>
);

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
      <TestWrapper>
        <EmployeeTileList
          employees={[]}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    // Should render container but no employee cards
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByTestId(/employee-card-/)).not.toBeInTheDocument();
  });

  it("renders all employees in the list", () => {
    render(
      <TestWrapper>
        <EmployeeTileList
          employees={threeEmployees}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("always uses grid layout for multi-column support", () => {
    const { container } = render(
      <TestWrapper>
        <EmployeeTileList
          employees={threeEmployees}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    const listContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(listContainer);
    expect(styles.display).toBe("grid");
  });

  it("uses grid layout when expanded", () => {
    const { container } = render(
      <TestWrapper>
        <EmployeeTileList
          employees={threeEmployees}
          isExpanded={true}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    const listContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(listContainer);
    expect(styles.display).toBe("grid");
  });

  it("applies correct gap based on zoom level", () => {
    const { container } = render(
      <TestWrapper>
        <EmployeeTileList
          employees={threeEmployees}
          isExpanded={true}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    const listContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(listContainer);
    // Default zoom level (level2) has gap of 12px = 1.5rem (12/8)
    expect(styles.gap).toBe("1.5rem");
  });

  it("passes onSelectEmployee callback to tiles", () => {
    render(
      <TestWrapper>
        <EmployeeTileList
          employees={threeEmployees}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
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
      <TestWrapper>
        <EmployeeTileList
          employees={[donutEmployee]}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
          donutModeActive={true}
        />
      </TestWrapper>
    );

    // Donut mode uses purple border styling (no indicator badge)
    const card = screen.getByTestId("employee-card-1");
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("data-donut-position", "9");
  });

  it("handles single employee correctly", () => {
    render(
      <TestWrapper>
        <EmployeeTileList
          employees={[threeEmployees[0]]}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("handles many employees efficiently", () => {
    const manyEmployees = Array.from({ length: 20 }, (_, i) =>
      createMockEmployee({ employee_id: i + 1, name: `Employee ${i + 1}` })
    );

    render(
      <TestWrapper>
        <EmployeeTileList
          employees={manyEmployees}
          isExpanded={true}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    // All employees should render
    expect(screen.getByText("Employee 1")).toBeInTheDocument();
    expect(screen.getByText("Employee 20")).toBeInTheDocument();
  });

  it("maintains tile order from employees array", () => {
    render(
      <TestWrapper>
        <EmployeeTileList
          employees={threeEmployees}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    const cards = screen.getAllByTestId(/employee-card-/);
    expect(cards).toHaveLength(3);

    // Check order by employee IDs
    expect(cards[0]).toHaveAttribute("data-testid", "employee-card-1");
    expect(cards[1]).toHaveAttribute("data-testid", "employee-card-2");
    expect(cards[2]).toHaveAttribute("data-testid", "employee-card-3");
  });
});
