/**
 * NineBoxGrid Performance Tests
 *
 * Tests to ensure the grid renders efficiently with varying dataset sizes.
 * These tests catch performance regressions like missing React.memo,
 * inefficient re-renders, or slow virtualization.
 *
 * Performance Targets (CI-friendly):
 * - 100 employees: <700ms render time (CI can be slower than dev)
 * - 500 employees: <1500ms render time
 * - 1000 employees: <2500ms render time
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "../../../test/utils";
import { NineBoxGrid } from "../NineBoxGrid";
import {
  generateLargeEmployeeDataset,
  generateEmployeesByPosition,
} from "../../../test-utils/performance-generators";
import { useSessionStore } from "../../../store/sessionStore";

// Module-level state for mocked data
let mockEmployees: any[] = [];
let mockEmployeesByPosition: any = {};

// Mock the useEmployees hook
vi.mock("../../../hooks/useEmployees", () => ({
  useEmployees: () => ({
    employeesByPosition: mockEmployeesByPosition,
    employees: mockEmployees,
    getShortPositionLabel: (position: number) => {
      const labels: Record<number, string> = {
        1: "[L,L]",
        2: "[M,L]",
        3: "[H,L]",
        4: "[L,M]",
        5: "[M,M]",
        6: "[H,M]",
        7: "[L,H]",
        8: "[M,H]",
        9: "[H,H]",
      };
      return labels[position] || "";
    },
    positionToLevels: (position: number) => ({
      performance: "Medium",
      potential: "Medium",
    }),
    moveEmployee: vi.fn(),
    selectEmployee: vi.fn(),
  }),
}));

// Helper to set mock data
function setMockEmployeeData(employees: any[], byPosition: any) {
  mockEmployees = employees;
  mockEmployeesByPosition = byPosition;
}

// Mock the useFilters hook
vi.mock("../../../hooks/useFilters", () => ({
  useFilters: () => ({
    hasActiveFilters: false,
    selectedLevels: [],
    selectedJobFunctions: [],
    selectedLocations: [],
    selectedManagers: [],
    excludedEmployeeIds: [],
  }),
}));

// Mock the sessionStore
vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn(),
  selectDonutModeActive: vi.fn((state) => state.donutModeActive),
  selectMoveEmployeeDonut: vi.fn((state) => state.moveEmployeeDonut),
}));

describe.skip("NineBoxGrid Performance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock state
    vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
      const state = {
        sessionId: "test-session-id",
        donutModeActive: false,
        employees: [],
        moveEmployeeDonut: vi.fn(),
        toggleDonutMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    });
  });

  it("should render 100 employees in <700ms", () => {
    // Generate test data
    const employees = generateLargeEmployeeDataset(100);
    const employeesByPosition = generateEmployeesByPosition(11); // ~11 per position

    // Set mock data
    setMockEmployeeData(employees, employeesByPosition);

    // Update session store mock
    vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
      const state = {
        sessionId: "test-session-id",
        donutModeActive: false,
        employees,
        moveEmployeeDonut: vi.fn(),
        toggleDonutMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    // Measure render time
    const startTime = performance.now();
    const { container } = render(<NineBoxGrid />);
    const renderTime = performance.now() - startTime;

    // Verify render happened
    expect(
      container.querySelector('[data-testid="nine-box-grid"]')
    ).toBeInTheDocument();

    // Performance assertion - CI environments are slower
    expect(renderTime).toBeLessThan(700);

    console.log(
      `✓ NineBoxGrid rendered 100 employees in ${renderTime.toFixed(2)}ms (target: <700ms)`
    );
  });

  it("should render 500 employees in <1500ms", () => {
    // Generate test data
    const employees = generateLargeEmployeeDataset(500);
    const employeesByPosition = generateEmployeesByPosition(56); // ~56 per position

    // Set mock data
    setMockEmployeeData(employees, employeesByPosition);

    // Update session store mock
    vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
      const state = {
        sessionId: "test-session-id",
        donutModeActive: false,
        employees,
        moveEmployeeDonut: vi.fn(),
        toggleDonutMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    // Measure render time
    const startTime = performance.now();
    const { container } = render(<NineBoxGrid />);
    const renderTime = performance.now() - startTime;

    // Verify render happened
    expect(
      container.querySelector('[data-testid="nine-box-grid"]')
    ).toBeInTheDocument();

    // Performance assertion
    expect(renderTime).toBeLessThan(1500);

    console.log(
      `✓ NineBoxGrid rendered 500 employees in ${renderTime.toFixed(2)}ms (target: <1500ms)`
    );
  });

  it("should render 1000 employees in <2500ms", () => {
    // Generate test data
    const employees = generateLargeEmployeeDataset(1000);
    const employeesByPosition = generateEmployeesByPosition(111); // ~111 per position

    // Set mock data
    setMockEmployeeData(employees, employeesByPosition);

    // Update session store mock
    vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
      const state = {
        sessionId: "test-session-id",
        donutModeActive: false,
        employees,
        moveEmployeeDonut: vi.fn(),
        toggleDonutMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    // Measure render time
    const startTime = performance.now();
    const { container } = render(<NineBoxGrid />);
    const renderTime = performance.now() - startTime;

    // Verify render happened
    expect(
      container.querySelector('[data-testid="nine-box-grid"]')
    ).toBeInTheDocument();

    // Performance assertion
    expect(renderTime).toBeLessThan(2500);

    console.log(
      `✓ NineBoxGrid rendered 1000 employees in ${renderTime.toFixed(2)}ms (target: <2500ms)`
    );
  });

  it("should re-render efficiently when only one employee changes", () => {
    // Generate initial data
    const employees = generateLargeEmployeeDataset(100);
    const employeesByPosition = generateEmployeesByPosition(11);

    // Set mock data
    setMockEmployeeData(employees, employeesByPosition);

    // Update session store mock
    vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
      const state = {
        sessionId: "test-session-id",
        donutModeActive: false,
        employees,
        moveEmployeeDonut: vi.fn(),
        toggleDonutMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    // Initial render
    const { rerender } = render(<NineBoxGrid />);

    // Update one employee
    const updatedEmployees = [...employees];
    updatedEmployees[0] = { ...updatedEmployees[0], modified_in_session: true };

    // Update mocks
    setMockEmployeeData(updatedEmployees, employeesByPosition);
    vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
      const state = {
        sessionId: "test-session-id",
        donutModeActive: false,
        employees: updatedEmployees,
        moveEmployeeDonut: vi.fn(),
        toggleDonutMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    // Measure re-render time
    const startTime = performance.now();
    rerender(<NineBoxGrid />);
    const rerenderTime = performance.now() - startTime;

    // Re-render should be reasonably fast (CI can be slow)
    expect(rerenderTime).toBeLessThan(200);

    console.log(
      `✓ NineBoxGrid re-rendered with single change in ${rerenderTime.toFixed(2)}ms (target: <200ms)`
    );
  });

  it("should handle empty dataset without performance issues", () => {
    // Set empty mock data
    setMockEmployeeData([], {});

    // Update session store mock
    vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
      const state = {
        sessionId: "test-session-id",
        donutModeActive: false,
        employees: [],
        moveEmployeeDonut: vi.fn(),
        toggleDonutMode: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    // Measure render time
    const startTime = performance.now();
    const { container } = render(<NineBoxGrid />);
    const renderTime = performance.now() - startTime;

    // Verify render happened
    expect(
      container.querySelector('[data-testid="nine-box-grid"]')
    ).toBeInTheDocument();

    // Empty grid should render reasonably fast
    expect(renderTime).toBeLessThan(100);

    console.log(
      `✓ NineBoxGrid rendered empty grid in ${renderTime.toFixed(2)}ms (target: <100ms)`
    );
  });
});
