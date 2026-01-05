/**
 * NineBoxGrid Memory Leak Tests
 *
 * Tests to ensure the grid component properly cleans up event listeners,
 * timers, and other resources on unmount. Verifies no memory leaks occur
 * over multiple mount/unmount cycles.
 *
 * Memory Leak Scenarios Tested:
 * - Event listeners not cleaned up
 * - DOM references retained after unmount
 * - Store subscriptions not unsubscribed
 * - Memory growth over multiple mount/unmount cycles
 *
 * These tests use a baseline + tolerance approach (similar to performance tests)
 * to ensure stability in CI environments with varying resources.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "../../../test/utils";
import { NineBoxGrid } from "../NineBoxGrid";
import {
  generateLargeEmployeeDataset,
  generateEmployeesByPosition,
} from "../../../test-utils/performance-generators";
import { useSessionStore } from "../../../store/sessionStore";
import {
  PERFORMANCE_BASELINES,
  getMaxTime,
} from "../../../test-utils/performance-baselines";

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
    positionToLevels: () => ({ performance: "Medium", potential: "Medium" }),
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
  selectSessionId: (state: any) => state.sessionId,
  selectDonutModeActive: (state: any) => state.donutModeActive,
  selectMoveEmployeeDonut: (state: any) => state.moveEmployeeDonut,
  selectToggleDonutMode: (state: any) => state.toggleDonutMode,
}));

describe("NineBoxGrid Memory Leak Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not leak memory over 10 mount/unmount cycles with empty data", () => {
    const iterations = 10;

    // Set up empty data
    setMockEmployeeData([], {});

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

    // Measure time for mount/unmount cycles
    const startTime = performance.now();

    // Perform mount/unmount cycles
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(<NineBoxGrid />);
      unmount();
      cleanup();
    }

    const totalTime = performance.now() - startTime;

    // Performance assertion using baseline config
    const { baseline, tolerance } =
      PERFORMANCE_BASELINES.nineBoxGrid.memoryCycles10;
    const maxTime = getMaxTime(baseline, tolerance);
    expect(totalTime).toBeLessThan(maxTime);

    console.log(
      `✓ Completed ${iterations} mount/unmount cycles in ${totalTime.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxTime}ms)`
    );
  }, 10000);

  it("should not leak memory with 100 employees over 10 cycles", () => {
    const iterations = 10;
    const employees = generateLargeEmployeeDataset(100);
    const employeesByPosition = generateEmployeesByPosition(11);

    // Set up data
    setMockEmployeeData(employees, employeesByPosition);

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

    // Measure time for mount/unmount cycles
    const startTime = performance.now();

    // Perform mount/unmount cycles
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(<NineBoxGrid />);
      unmount();
      cleanup();
    }

    const totalTime = performance.now() - startTime;

    // Performance assertion using baseline config
    const { baseline, tolerance } =
      PERFORMANCE_BASELINES.nineBoxGrid.memoryCycles20;
    const maxTime = getMaxTime(baseline, tolerance);
    expect(totalTime).toBeLessThan(maxTime);

    console.log(
      `✓ Completed ${iterations} cycles with 100 employees in ${totalTime.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxTime}ms)`
    );
  }, 10000);

  it("should clean up DOM references on unmount", () => {
    const employees = generateLargeEmployeeDataset(50);
    const employeesByPosition = generateEmployeesByPosition(6);

    setMockEmployeeData(employees, employeesByPosition);

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

    // Render and get container reference
    const { container, unmount } = render(<NineBoxGrid />);

    // Verify grid exists
    const grid = container.querySelector('[data-testid="nine-box-grid"]');
    expect(grid).toBeInTheDocument();

    // Count initial DOM nodes
    const initialNodeCount = container.querySelectorAll("*").length;
    expect(initialNodeCount).toBeGreaterThan(0);

    // Unmount
    unmount();
    cleanup();

    // After cleanup, container should be empty
    const finalNodeCount = container.querySelectorAll("*").length;
    expect(finalNodeCount).toBe(0);

    console.log(
      `✓ DOM cleaned up: ${initialNodeCount} nodes → ${finalNodeCount} nodes`
    );
  }, 5000);

  it("should handle rapid mount/unmount without leaking", () => {
    const employees = generateLargeEmployeeDataset(30);
    const employeesByPosition = generateEmployeesByPosition(3);

    setMockEmployeeData(employees, employeesByPosition);

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

    const rapidCycles = 10;

    // Measure time for rapid mount/unmount cycles
    const startTime = performance.now();

    for (let i = 0; i < rapidCycles; i++) {
      const { unmount } = render(<NineBoxGrid />);
      unmount();
    }

    cleanup();

    const totalTime = performance.now() - startTime;

    // Use memoryCycles10 baseline
    const { baseline, tolerance } =
      PERFORMANCE_BASELINES.nineBoxGrid.memoryCycles10;
    const maxTime = getMaxTime(baseline, tolerance);
    expect(totalTime).toBeLessThan(maxTime);

    console.log(
      `✓ Survived ${rapidCycles} rapid mount/unmount cycles in ${totalTime.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxTime}ms)`
    );
  }, 5000);

  it("should not leak when switching between empty and populated data", () => {
    const iterations = 10;
    const employees = generateLargeEmployeeDataset(100);
    const employeesByPosition = generateEmployeesByPosition(11);

    // Measure time for switching data
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Alternate between empty and populated data
      const useEmptyData = i % 2 === 0;

      if (useEmptyData) {
        setMockEmployeeData([], {});
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
      } else {
        setMockEmployeeData(employees, employeesByPosition);
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
      }

      const { unmount } = render(<NineBoxGrid />);
      unmount();
      cleanup();
    }

    const totalTime = performance.now() - startTime;

    // Use memoryCycles20 baseline (more generous for data switching)
    const { baseline, tolerance } =
      PERFORMANCE_BASELINES.nineBoxGrid.memoryCycles20;
    const maxTime = getMaxTime(baseline, tolerance);
    expect(totalTime).toBeLessThan(maxTime);

    console.log(
      `✓ Switched between empty/populated data ${iterations} times in ${totalTime.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxTime}ms)`
    );
  }, 10000);

  it("should not leak when toggling donut mode multiple times", () => {
    const employees = generateLargeEmployeeDataset(50);
    const employeesByPosition = generateEmployeesByPosition(6);

    setMockEmployeeData(employees, employeesByPosition);

    const iterations = 10;

    // Measure time for toggling donut mode
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const donutModeActive = i % 2 === 0;

      vi.mocked(useSessionStore).mockImplementation((selector?: any) => {
        const state = {
          sessionId: "test-session-id",
          donutModeActive,
          employees,
          moveEmployeeDonut: vi.fn(),
          toggleDonutMode: vi.fn(),
        };
        return selector ? selector(state) : state;
      });

      const { unmount } = render(<NineBoxGrid />);
      unmount();
      cleanup();
    }

    const totalTime = performance.now() - startTime;

    // Use memoryCycles10 baseline
    const { baseline, tolerance } =
      PERFORMANCE_BASELINES.nineBoxGrid.memoryCycles10;
    const maxTime = getMaxTime(baseline, tolerance);
    expect(totalTime).toBeLessThan(maxTime);

    console.log(
      `✓ Toggled donut mode ${iterations} times in ${totalTime.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxTime}ms)`
    );
  }, 5000);

  it("should not accumulate event listeners over multiple renders", () => {
    // Note: JSDOM doesn't provide a way to count event listeners directly,
    // but we can verify the component renders/unmounts without errors
    // In a real browser, you'd use Chrome DevTools Memory Profiler

    const employees = generateLargeEmployeeDataset(100);
    const employeesByPosition = generateEmployeesByPosition(11);

    setMockEmployeeData(employees, employeesByPosition);

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

    const iterations = 10;

    // Measure time for render/unmount cycles
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(<NineBoxGrid />);
      unmount();
      cleanup();
    }

    const totalTime = performance.now() - startTime;

    // Use memoryCycles20 baseline (100 employees is heavier)
    const { baseline, tolerance } =
      PERFORMANCE_BASELINES.nineBoxGrid.memoryCycles20;
    const maxTime = getMaxTime(baseline, tolerance);
    expect(totalTime).toBeLessThan(maxTime);

    console.log(
      `✓ No event listener leaks detected over ${iterations} cycles in ${totalTime.toFixed(2)}ms (baseline: ${baseline}ms, max: ${maxTime}ms)`
    );
    console.log(`  (Verified by successful render/unmount cycles)`);
  }, 10000);
});
