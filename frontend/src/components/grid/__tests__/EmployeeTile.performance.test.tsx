/**
 * EmployeeTile Performance Tests
 *
 * Tests to ensure individual employee tiles render efficiently.
 * These tests verify that React.memo optimizations are working
 * and that tiles don't re-render unnecessarily.
 *
 * Performance Targets (CI-friendly):
 * - Single tile render: <20ms
 * - Batch render (100 tiles): <1000ms (CI can be slower)
 * - Re-render only changed tiles (not all tiles)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "../../../test/utils";
import { EmployeeTile } from "../EmployeeTile";
import { generateLargeEmployeeDataset } from "../../../test-utils/performance-generators";

// Mock the useEmployees hook
vi.mock("../../../hooks/useEmployees", () => ({
  useEmployees: () => ({
    selectEmployee: vi.fn(),
  }),
}));

describe("EmployeeTile Performance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a single tile in <20ms", () => {
    // Generate single employee
    const [employee] = generateLargeEmployeeDataset(1);

    // Measure render time
    const startTime = performance.now();
    const { container } = render(
      <EmployeeTile employee={employee} isSelected={false} />
    );
    const renderTime = performance.now() - startTime;

    // Verify render happened
    expect(
      container.querySelector('[data-testid^="employee-card-"]')
    ).toBeInTheDocument();

    // Performance assertion
    expect(renderTime).toBeLessThan(20);

    console.log(
      `✓ EmployeeTile rendered in ${renderTime.toFixed(2)}ms (target: <20ms)`
    );
  });

  it("should render 100 tiles efficiently in batch", () => {
    // Generate employees
    const employees = generateLargeEmployeeDataset(100);

    // Measure batch render time
    const startTime = performance.now();

    const { container } = render(
      <div>
        {employees.map((employee) => (
          <EmployeeTile
            key={employee.employee_id}
            employee={employee}
            isSelected={false}
          />
        ))}
      </div>
    );

    const renderTime = performance.now() - startTime;

    // Verify all tiles rendered
    const tiles = container.querySelectorAll('[data-testid^="employee-card-"]');
    expect(tiles).toHaveLength(100);

    // Performance assertion - 100 tiles should render in <1000ms (CI-friendly)
    expect(renderTime).toBeLessThan(1000);

    console.log(
      `✓ Rendered 100 EmployeeTiles in ${renderTime.toFixed(2)}ms (target: <1000ms)`
    );
    console.log(`  Average: ${(renderTime / 100).toFixed(2)}ms per tile`);
  });

  it("should not re-render unmodified tiles when one tile changes", () => {
    // Generate employees
    const employees = generateLargeEmployeeDataset(10);

    // Track render counts
    let renderCount = 0;
    const RenderCountWrapper = ({ employee, isSelected }: any) => {
      renderCount++;
      return <EmployeeTile employee={employee} isSelected={isSelected} />;
    };

    // Initial render
    const { rerender } = render(
      <div>
        {employees.map((employee) => (
          <RenderCountWrapper
            key={employee.employee_id}
            employee={employee}
            isSelected={false}
          />
        ))}
      </div>
    );

    // Reset count after initial render
    renderCount = 0;

    // Update only the first employee
    const updatedEmployees = [...employees];
    updatedEmployees[0] = {
      ...updatedEmployees[0],
      modified_in_session: true,
    };

    // Re-render with updated data
    const startTime = performance.now();
    rerender(
      <div>
        {updatedEmployees.map((employee) => (
          <RenderCountWrapper
            key={employee.employee_id}
            employee={employee}
            isSelected={false}
          />
        ))}
      </div>
    );
    const rerenderTime = performance.now() - startTime;

    // With proper React.memo, only the changed tile should re-render
    // In practice, React may re-render a few more, so we allow some tolerance
    expect(renderCount).toBeLessThanOrEqual(3); // Allow some framework overhead

    // Re-render should be fast
    expect(rerenderTime).toBeLessThan(50);

    console.log(
      `✓ Re-render after single change took ${rerenderTime.toFixed(2)}ms`
    );
    console.log(`  Re-rendered ${renderCount} of 10 tiles (target: ≤3)`);
  });

  it("should handle tiles with flags without performance penalty", () => {
    // Generate employees with flags
    const employees = generateLargeEmployeeDataset(100, { withFlags: true });

    // Measure render time
    const startTime = performance.now();

    const { container } = render(
      <div>
        {employees.map((employee) => (
          <EmployeeTile
            key={employee.employee_id}
            employee={employee}
            isSelected={false}
          />
        ))}
      </div>
    );

    const renderTime = performance.now() - startTime;

    // Verify all tiles rendered
    const tiles = container.querySelectorAll('[data-testid^="employee-card-"]');
    expect(tiles).toHaveLength(100);

    // Tiles with flags should not significantly impact performance
    expect(renderTime).toBeLessThan(1000);

    console.log(
      `✓ Rendered 100 tiles (with flags) in ${renderTime.toFixed(2)}ms (target: <1000ms)`
    );
  });

  it("should handle selected state changes efficiently", () => {
    // Generate single employee
    const [employee] = generateLargeEmployeeDataset(1);

    // Initial render (not selected)
    const { rerender } = render(
      <EmployeeTile employee={employee} isSelected={false} />
    );

    // Measure time to toggle selection
    const startTime = performance.now();
    rerender(<EmployeeTile employee={employee} isSelected={true} />);
    const toggleTime = performance.now() - startTime;

    // Selection toggle should be very fast
    expect(toggleTime).toBeLessThan(20);

    console.log(
      `✓ Selection toggle took ${toggleTime.toFixed(2)}ms (target: <20ms)`
    );
  });

  it("should efficiently render tiles with long names and complex data", () => {
    // Create employee with complex data
    const [employee] = generateLargeEmployeeDataset(1);
    const complexEmployee = {
      ...employee,
      name: "Dr. Bartholomew Maximilian Fitzgerald-Wellington III",
      business_title:
        "Senior Vice President of Global Strategic Initiatives and Business Development",
      ratings_history: Array.from({ length: 10 }, (_, i) => ({
        year: 2024 - i,
        rating: "Leading",
      })),
    };

    // Measure render time
    const startTime = performance.now();
    const { container } = render(
      <EmployeeTile employee={complexEmployee} isSelected={false} />
    );
    const renderTime = performance.now() - startTime;

    // Verify render happened
    expect(
      container.querySelector('[data-testid^="employee-card-"]')
    ).toBeInTheDocument();

    // Complex data should not significantly impact performance
    expect(renderTime).toBeLessThan(25);

    console.log(
      `✓ Complex EmployeeTile rendered in ${renderTime.toFixed(2)}ms (target: <25ms)`
    );
  });
});
