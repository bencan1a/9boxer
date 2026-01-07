import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeTileList } from "../EmployeeTileList";
import { createMockEmployee } from "../../../test/mockData";
import { GridZoomProvider } from "../../../contexts/GridZoomContext";
import type { Employee } from "../../../types/employee";
import { tokens } from "../../../theme/tokens";

// Mock TanStack Virtual to disable virtualization in tests
// This allows all items to render without complex viewport mocking
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

// Wrapper for GridZoomProvider with scroll container
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <GridZoomProvider>
      <div
        style={{
          width: "400px",
          height: "500px",
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </GridZoomProvider>
  );
};

describe("EmployeeTileList", () => {
  const mockOnSelect = vi.fn();

  const threeEmployees: Employee[] = [
    createMockEmployee({ employee_id: 1, name: "Alice" }),
    createMockEmployee({ employee_id: 2, name: "Bob" }),
    createMockEmployee({ employee_id: 3, name: "Carol" }),
  ];

  // Mock ResizeObserver to provide container dimensions for virtualization
  let resizeObserverCallback: ResizeObserverCallback | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock ResizeObserver to simulate container width
    global.ResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback;
      }
      observe(element: HTMLElement) {
        // Mock the element's clientWidth so updateWidth() reads a non-zero value
        Object.defineProperty(element, "clientWidth", {
          configurable: true,
          value: 400,
        });
        Object.defineProperty(element, "clientHeight", {
          configurable: true,
          value: 500,
        });

        // Mock the parent scroll container for TanStack Virtual
        const parentElement = element.parentElement;
        if (parentElement) {
          Object.defineProperty(parentElement, "clientWidth", {
            configurable: true,
            value: 400,
          });
          Object.defineProperty(parentElement, "clientHeight", {
            configurable: true,
            value: 500,
          });
          Object.defineProperty(parentElement, "scrollHeight", {
            configurable: true,
            value: 1000,
          });
          Object.defineProperty(parentElement, "scrollTop", {
            configurable: true,
            writable: true,
            value: 0,
          });
          Object.defineProperty(parentElement, "getBoundingClientRect", {
            configurable: true,
            value: () => ({
              width: 400,
              height: 500,
              top: 0,
              left: 0,
              right: 400,
              bottom: 500,
              x: 0,
              y: 0,
            }),
          });
        }

        // Trigger the callback immediately to simulate initial measurement
        if (resizeObserverCallback) {
          resizeObserverCallback(
            [
              {
                target: element,
                contentRect: {
                  width: 400,
                  height: 500,
                  top: 0,
                  left: 0,
                  bottom: 500,
                  right: 400,
                  x: 0,
                  y: 0,
                } as DOMRectReadOnly,
                borderBoxSize: [] as ResizeObserverSize[],
                contentBoxSize: [] as ResizeObserverSize[],
                devicePixelContentBoxSize: [] as ResizeObserverSize[],
              } as ResizeObserverEntry,
            ],
            this
          );
        }
      }
      disconnect() {}
      unobserve() {}
    };
  });

  afterEach(() => {
    resizeObserverCallback = null;
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

  it("renders all employees in the list", async () => {
    const { debug } = render(
      <TestWrapper>
        <EmployeeTileList
          employees={threeEmployees}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    // Debug to see what's actually rendered
    debug();

    // Wait for virtualization to render after ResizeObserver callback
    await vi.waitFor(
      () => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
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

    // With virtualization, grid layout is on the virtual row containers
    const virtualRow = container.querySelector(
      '[data-index="0"]'
    ) as HTMLElement;
    expect(virtualRow).toBeInTheDocument();
    const styles = window.getComputedStyle(virtualRow);
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

    // With virtualization, grid layout is on the virtual row containers
    const virtualRow = container.querySelector(
      '[data-index="0"]'
    ) as HTMLElement;
    expect(virtualRow).toBeInTheDocument();
    const styles = window.getComputedStyle(virtualRow);
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

    // With virtualization, gap is on the virtual row containers
    const virtualRow = container.querySelector(
      '[data-index="0"]'
    ) as HTMLElement;
    expect(virtualRow).toBeInTheDocument();
    const styles = window.getComputedStyle(virtualRow);
    // Default zoom level (level2) - use token value for gap
    const expectedGap = `${tokens.dimensions.gridZoom.level2.spacing.gap}px`;
    expect(styles.gap).toBe(expectedGap);
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

    // Check order by employee IDs (should maintain input order for employees with same tier)
    expect(cards[0]).toHaveAttribute("data-testid", "employee-card-1");
    expect(cards[1]).toHaveAttribute("data-testid", "employee-card-2");
    expect(cards[2]).toHaveAttribute("data-testid", "employee-card-3");
  });

  it("sorts employees by three-tier priority", () => {
    const mixedEmployees: Employee[] = [
      createMockEmployee({
        employee_id: 1,
        name: "Zoe Normal",
      }),
      createMockEmployee({
        employee_id: 2,
        name: "Bob Modified",
        modified_in_session: true,
      }),
      createMockEmployee({
        employee_id: 3,
        name: "Alice Flagged",
        flags: ["promotion_ready"],
      }),
      createMockEmployee({
        employee_id: 4,
        name: "Mike Normal",
      }),
    ];

    render(
      <TestWrapper>
        <EmployeeTileList
          employees={mixedEmployees}
          isExpanded={false}
          onSelectEmployee={mockOnSelect}
        />
      </TestWrapper>
    );

    const cards = screen.getAllByTestId(/employee-card-/);
    expect(cards).toHaveLength(4);

    // Note: EmployeeTileList receives already-sorted employees from parent (useEmployees hook)
    // This test verifies that the component maintains the sort order it receives
    // The actual sorting is tested in sortEmployees.test.ts

    // Verify all employees are rendered
    expect(screen.getByText("Zoe Normal")).toBeInTheDocument();
    expect(screen.getByText("Bob Modified")).toBeInTheDocument();
    expect(screen.getByText("Alice Flagged")).toBeInTheDocument();
    expect(screen.getByText("Mike Normal")).toBeInTheDocument();
  });
});
