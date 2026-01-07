import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEmployees } from "../useEmployees";
import { useSession } from "../useSession";
import { useSessionStore } from "../../store/sessionStore";
import { useFilters } from "../useFilters";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";

// Mock dependencies
vi.mock("../useSession");
vi.mock("../../store/sessionStore", () => ({
  useSessionStore: vi.fn(),
  selectDonutModeActive: vi.fn((state) => state.donutModeActive),
}));
vi.mock("../useFilters");

// Helper to create test employee
const createEmployee = (overrides: Partial<Employee>): Employee => ({
  employee_id: 1,
  name: "Test Employee",
  business_title: "Test Title",
  job_title: "Test Job",
  job_profile: "Test Profile",
  job_level: "MT1",
  job_function: "Engineering",
  location: "USA",
  manager: "Test Manager",
  management_chain_01: null,
  management_chain_02: null,
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-01-01",
  tenure_category: "Mid",
  time_in_job_profile: "2 years",
  performance: PerformanceLevel.MEDIUM,
  potential: PotentialLevel.MEDIUM,
  grid_position: 5,
  talent_indicator: "Core",
  ratings_history: [],
  development_focus: null,
  development_action: null,
  notes: null,
  promotion_status: null,
  promotion_readiness: null,
  modified_in_session: false,
  last_modified: null,
  ...overrides,
});

describe("useEmployees", () => {
  const mockMoveEmployee = vi.fn();
  const mockSelectEmployee = vi.fn();
  const mockApplyFilters = vi.fn((employees) => employees);

  beforeEach(() => {
    vi.clearAllMocks();

    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      employees: [],
      moveEmployee: mockMoveEmployee,
      selectEmployee: mockSelectEmployee,
      selectedEmployeeId: null,
    });

    // Mock useSessionStore to work with selectors
    (useSessionStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => {
        const mockState = {
          donutModeActive: false,
        };
        return selector ? selector(mockState) : mockState;
      }
    );

    (useFilters as ReturnType<typeof vi.fn>).mockReturnValue({
      applyFilters: mockApplyFilters,
    });
  });

  describe("Normal mode (donutModeActive = false)", () => {
    it("returns all filtered employees", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, grid_position: 5 }),
        createEmployee({ employee_id: 2, grid_position: 9 }),
        createEmployee({ employee_id: 3, grid_position: 1 }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.employees).toHaveLength(3);
      expect(mockApplyFilters).toHaveBeenCalledWith(employees);
    });

    it("groups employees by grid_position", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, grid_position: 5 }),
        createEmployee({ employee_id: 2, grid_position: 5 }),
        createEmployee({ employee_id: 3, grid_position: 9 }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.employeesByPosition[5]).toHaveLength(2);
      expect(result.current.employeesByPosition[9]).toHaveLength(1);
      expect(result.current.employeesByPosition[1]).toHaveLength(0);
    });

    it("ignores donut_position in normal mode", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      // Should be in position 5 (grid_position), not position 9 (donut_position)
      expect(result.current.employeesByPosition[5]).toHaveLength(1);
      expect(result.current.employeesByPosition[9]).toHaveLength(0);
    });
  });

  describe("Donut mode (donutModeActive = true)", () => {
    beforeEach(() => {
      // Mock useSessionStore to work with selectors - donut mode active
      (
        useSessionStore as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation((selector) => {
        const mockState = {
          donutModeActive: true,
        };
        return selector ? selector(mockState) : mockState;
      });
    });

    it("filters to only show employees from position 5", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, grid_position: 5 }),
        createEmployee({ employee_id: 2, grid_position: 9 }),
        createEmployee({ employee_id: 3, grid_position: 5 }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.employees).toHaveLength(2);
      expect(result.current.employees.map((e) => e.employee_id)).toEqual([
        1, 3,
      ]);
    });

    it("uses donut_position when employee is donut_modified", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      // Should be in position 9 (donut_position) because donut_modified is true
      expect(result.current.employeesByPosition[9]).toHaveLength(1);
      expect(result.current.employeesByPosition[5]).toHaveLength(0);
    });

    it("uses grid_position when employee is not donut_modified", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: false,
        }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      // Should be in position 5 (grid_position) because donut_modified is false
      expect(result.current.employeesByPosition[5]).toHaveLength(1);
      expect(result.current.employeesByPosition[9]).toHaveLength(0);
    });

    it("uses grid_position when donut_position is undefined", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_modified: true,
          donut_position: undefined,
        }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      // Should fall back to grid_position when donut_position is undefined
      expect(result.current.employeesByPosition[5]).toHaveLength(1);
    });

    it("handles mixed donut-modified and non-modified employees", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 2,
          grid_position: 5,
          donut_position: 6,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 3,
          grid_position: 5,
          donut_modified: false,
        }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.employeesByPosition[9]).toHaveLength(1);
      expect(result.current.employeesByPosition[6]).toHaveLength(1);
      expect(result.current.employeesByPosition[5]).toHaveLength(1);
    });
  });

  describe("positionToLevels", () => {
    it("converts position 1 to Low/Low", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.positionToLevels(1)).toEqual({
        performance: "Low",
        potential: "Low",
      });
    });

    it("converts position 5 to Medium/Medium", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.positionToLevels(5)).toEqual({
        performance: "Medium",
        potential: "Medium",
      });
    });

    it("converts position 9 to High/High", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.positionToLevels(9)).toEqual({
        performance: "High",
        potential: "High",
      });
    });

    it("handles invalid position with default Medium/Medium", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.positionToLevels(0)).toEqual({
        performance: "Medium",
        potential: "Medium",
      });
      expect(result.current.positionToLevels(10)).toEqual({
        performance: "Medium",
        potential: "Medium",
      });
    });
  });

  describe("Delegation to useSession", () => {
    it("delegates moveEmployee to useSession", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.moveEmployee).toBe(mockMoveEmployee);
    });

    it("delegates selectEmployee to useSession", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.selectEmployee).toBe(mockSelectEmployee);
    });

    it("passes through selectedEmployeeId from useSession", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: 123,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.selectedEmployeeId).toBe(123);
    });
  });

  describe("Edge cases", () => {
    it("initializes all positions 1-9 in employeesByPosition", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      for (let i = 1; i <= 9; i++) {
        expect(result.current.employeesByPosition[i]).toBeDefined();
        expect(result.current.employeesByPosition[i]).toEqual([]);
      }
    });

    it("handles employees with out-of-range grid_position", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, grid_position: 0 }),
        createEmployee({ employee_id: 2, grid_position: 10 }),
        createEmployee({ employee_id: 3, grid_position: 5 }),
      ];

      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees,
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      // Out-of-range employees should not appear in any position
      expect(result.current.employeesByPosition[5]).toHaveLength(1);
      expect(result.current.employeesByPosition[0]).toBeUndefined();
      expect(result.current.employeesByPosition[10]).toBeUndefined();
    });

    it("handles empty employee list", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.employees).toHaveLength(0);
      for (let i = 1; i <= 9; i++) {
        expect(result.current.employeesByPosition[i]).toHaveLength(0);
      }
    });
  });

  describe("Position label functions", () => {
    it("exports position label helper functions", () => {
      (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
        employees: [],
        moveEmployee: mockMoveEmployee,
        selectEmployee: mockSelectEmployee,
        selectedEmployeeId: null,
      });

      const { result } = renderHook(() => useEmployees());

      expect(result.current.getPositionLabel).toBeDefined();
      expect(result.current.getShortPositionLabel).toBeDefined();
      expect(result.current.getPositionName).toBeDefined();
      expect(result.current.getPositionGuidance).toBeDefined();
      expect(result.current.getPositionInfo).toBeDefined();
    });
  });
});
