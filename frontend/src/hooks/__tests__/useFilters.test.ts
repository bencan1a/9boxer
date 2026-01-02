import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFilters } from "../useFilters";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";
import { useFilterStore } from "../../store/filterStore";

// Helper to create a test employee
const createEmployee = (overrides: Partial<Employee>): Employee => ({
  employee_id: 1,
  name: "Test Employee",
  business_title: "Test Title",
  job_title: "Test Job",
  job_profile: "Test Profile",
  job_level: "MT1 - Individual Contributor",
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
  position_label: "Core Talent [M,M]",
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

describe("useFilters", () => {
  beforeEach(() => {
    // Reset filter store before each test
    const { clearAllFilters } = useFilterStore.getState();
    clearAllFilters();
  });

  describe("applyFilters", () => {
    describe("Level filtering", () => {
      it("filters employees by selected job levels", () => {
        const employees: Employee[] = [
          createEmployee({
            employee_id: 1,
            job_level: "MT1 - Individual Contributor",
          }),
          createEmployee({ employee_id: 2, job_level: "MT2 - Team Lead" }),
          createEmployee({ employee_id: 3, job_level: "MT3 - Manager" }),
        ];

        const { result } = renderHook(() => useFilters());

        // Toggle MT1 level
        act(() => {
          result.current.toggleLevel("MT1");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(1);
      });

      it("filters employees with multiple selected levels", () => {
        const employees: Employee[] = [
          createEmployee({
            employee_id: 1,
            job_level: "MT1 - Individual Contributor",
          }),
          createEmployee({ employee_id: 2, job_level: "MT2 - Team Lead" }),
          createEmployee({ employee_id: 3, job_level: "MT3 - Manager" }),
        ];

        const { result } = renderHook(() => useFilters());

        // Toggle MT1 and MT2 levels
        act(() => {
          result.current.toggleLevel("MT1");
          result.current.toggleLevel("MT2");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(2);
        expect(filtered.map((e) => e.employee_id).sort()).toEqual([1, 2]);
      });

      it("returns all employees when no levels are selected", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, job_level: "MT1" }),
          createEmployee({ employee_id: 2, job_level: "MT2" }),
        ];

        const { result } = renderHook(() => useFilters());

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(2);
      });
    });

    describe("Job function filtering", () => {
      it("filters employees by selected job functions", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, job_function: "Engineering" }),
          createEmployee({ employee_id: 2, job_function: "Sales" }),
          createEmployee({ employee_id: 3, job_function: "Engineering" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleJobFunction("Engineering");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(2);
        expect(filtered.map((e) => e.employee_id).sort()).toEqual([1, 3]);
      });

      it("filters employees with multiple selected job functions", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, job_function: "Engineering" }),
          createEmployee({ employee_id: 2, job_function: "Sales" }),
          createEmployee({ employee_id: 3, job_function: "Marketing" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleJobFunction("Engineering");
          result.current.toggleJobFunction("Sales");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(2);
        expect(filtered.map((e) => e.employee_id).sort()).toEqual([1, 2]);
      });
    });

    describe("Location filtering", () => {
      it("filters employees by location display names", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, location: "USA" }),
          createEmployee({ employee_id: 2, location: "IND" }),
          createEmployee({ employee_id: 3, location: "USA" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleLocation("USA");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(2);
        expect(filtered.map((e) => e.employee_id).sort()).toEqual([1, 3]);
      });

      it("maps European country codes to 'Europe' display name", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, location: "GBR" }),
          createEmployee({ employee_id: 2, location: "FRA" }),
          createEmployee({ employee_id: 3, location: "DEU" }),
          createEmployee({ employee_id: 4, location: "USA" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleLocation("Europe");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(3);
        expect(filtered.map((e) => e.employee_id).sort()).toEqual([1, 2, 3]);
      });

      it("handles unmapped location codes as-is", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, location: "XYZ" }),
          createEmployee({ employee_id: 2, location: "USA" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleLocation("XYZ");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(1);
      });
    });

    describe("Manager filtering", () => {
      it("filters employees by selected managers", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, manager: "Alice Smith" }),
          createEmployee({ employee_id: 2, manager: "Bob Jones" }),
          createEmployee({ employee_id: 3, manager: "Alice Smith" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          // Pass employee IDs for Alice Smith's reports
          result.current.toggleManager("Alice Smith", [1, 3]);
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(2);
        expect(filtered.map((e) => e.employee_id).sort()).toEqual([1, 3]);
      });
    });

    describe("Reporting chain filtering", () => {
      it("filters by direct manager (case-insensitive)", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, manager: "Alice Smith" }),
          createEmployee({ employee_id: 2, manager: "Bob Jones" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          // Pass employee IDs for employees reporting to alice smith
          result.current.setReportingChainFilter("alice smith", [1]);
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(1);
      });

      it("filters by management chain levels (case-insensitive)", () => {
        const employees: Employee[] = [
          createEmployee({
            employee_id: 1,
            manager: "Direct Manager",
            management_chain_01: "Level 1 Manager",
            management_chain_02: "Level 2 Manager",
          }),
          createEmployee({
            employee_id: 2,
            manager: "Another Manager",
            management_chain_01: "Different Manager",
          }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          // Pass employee IDs for employees under level 2 manager
          result.current.setReportingChainFilter("level 2 manager", [1]);
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(1);
      });

      it("searches through all management chain levels", () => {
        const employees: Employee[] = [
          createEmployee({
            employee_id: 1,
            management_chain_03: "Target Manager",
          }),
          createEmployee({
            employee_id: 2,
            management_chain_04: "Target Manager",
          }),
          createEmployee({
            employee_id: 3,
            management_chain_05: "Target Manager",
          }),
          createEmployee({
            employee_id: 4,
            management_chain_06: "Target Manager",
          }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          // Pass employee IDs for all employees under Target Manager
          result.current.setReportingChainFilter(
            "Target Manager",
            [1, 2, 3, 4]
          );
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(4);
      });

      it("clears reporting chain filter", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, manager: "Alice Smith" }),
          createEmployee({ employee_id: 2, manager: "Bob Jones" }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          // Pass employee IDs for Alice Smith's reports
          result.current.setReportingChainFilter("Alice Smith", [1]);
        });

        let filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);

        act(() => {
          result.current.clearReportingChainFilter();
        });

        filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(2);
      });
    });

    describe("Flag filtering", () => {
      it("filters employees by selected flags (AND logic)", () => {
        const employees: Employee[] = [
          createEmployee({
            employee_id: 1,
            flags: ["promotion_ready", "flight_risk"],
          }),
          createEmployee({ employee_id: 2, flags: ["promotion_ready"] }),
          createEmployee({ employee_id: 3, flags: ["flight_risk"] }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleFlag("promotion_ready");
          result.current.toggleFlag("flight_risk");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(1);
      });

      it("handles employees with no flags", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1, flags: undefined }),
          createEmployee({ employee_id: 2, flags: [] }),
          createEmployee({ employee_id: 3, flags: ["promotion_ready"] }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleFlag("promotion_ready");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(3);
      });
    });

    describe("Excluded employees filtering", () => {
      it("excludes employees by ID", () => {
        const employees: Employee[] = [
          createEmployee({ employee_id: 1 }),
          createEmployee({ employee_id: 2 }),
          createEmployee({ employee_id: 3 }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.setExcludedIds([2, 3]);
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(1);
      });
    });

    describe("Combined filtering", () => {
      it("applies multiple filters together", () => {
        const employees: Employee[] = [
          createEmployee({
            employee_id: 1,
            job_level: "MT1",
            job_function: "Engineering",
            location: "USA",
            manager: "Alice Smith",
          }),
          createEmployee({
            employee_id: 2,
            job_level: "MT2",
            job_function: "Engineering",
            location: "USA",
            manager: "Alice Smith",
          }),
          createEmployee({
            employee_id: 3,
            job_level: "MT1",
            job_function: "Sales",
            location: "USA",
            manager: "Alice Smith",
          }),
        ];

        const { result } = renderHook(() => useFilters());

        act(() => {
          result.current.toggleLevel("MT1");
          result.current.toggleJobFunction("Engineering");
        });

        const filtered = result.current.applyFilters(employees);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].employee_id).toBe(1);
      });
    });
  });

  describe("getAvailableOptions", () => {
    it("extracts unique job levels", () => {
      const employees: Employee[] = [
        createEmployee({ job_level: "MT1 - Individual Contributor" }),
        createEmployee({ job_level: "MT2 - Team Lead" }),
        createEmployee({ job_level: "MT1 - Individual Contributor" }),
      ];

      const { result } = renderHook(() => useFilters());

      const options = result.current.getAvailableOptions(employees);
      expect(options.levels).toEqual(["MT1", "MT2"]);
    });

    it("extracts unique job functions", () => {
      const employees: Employee[] = [
        createEmployee({ job_function: "Engineering" }),
        createEmployee({ job_function: "Sales" }),
        createEmployee({ job_function: "Engineering" }),
      ];

      const { result } = renderHook(() => useFilters());

      const options = result.current.getAvailableOptions(employees);
      expect(options.jobFunctions).toEqual(["Engineering", "Sales"]);
    });

    it("extracts unique locations with display name mapping", () => {
      const employees: Employee[] = [
        createEmployee({ location: "USA" }),
        createEmployee({ location: "IND" }),
        createEmployee({ location: "GBR" }),
        createEmployee({ location: "FRA" }),
      ];

      const { result } = renderHook(() => useFilters());

      const options = result.current.getAvailableOptions(employees);
      expect(options.locations.sort()).toEqual(["Europe", "India", "USA"]);
    });

    it("extracts unique managers", () => {
      const employees: Employee[] = [
        createEmployee({ manager: "Alice Smith" }),
        createEmployee({ manager: "Bob Jones" }),
        createEmployee({ manager: "Alice Smith" }),
      ];

      const { result } = renderHook(() => useFilters());

      const options = result.current.getAvailableOptions(employees);
      expect(options.managers).toEqual(["Alice Smith", "Bob Jones"]);
    });

    it("extracts flags with counts", () => {
      const employees: Employee[] = [
        createEmployee({ flags: ["promotion_ready", "flight_risk"] }),
        createEmployee({ flags: ["promotion_ready"] }),
        createEmployee({ flags: ["new_hire"] }),
      ];

      const { result } = renderHook(() => useFilters());

      const options = result.current.getAvailableOptions(employees);
      expect(options.flags.length).toBeGreaterThan(0);

      const promotionReadyFlag = options.flags.find(
        (f) => f.key === "promotion_ready"
      );
      expect(promotionReadyFlag?.count).toBe(2);
    });

    it("handles empty employee array", () => {
      const { result } = renderHook(() => useFilters());

      const options = result.current.getAvailableOptions([]);
      expect(options).toEqual({
        levels: [],
        jobFunctions: [],
        locations: [],
        managers: [],
        flags: [],
      });
    });

    it("filters out falsy job functions and locations", () => {
      const employees: Employee[] = [
        createEmployee({ job_function: "Engineering", location: "USA" }),
        createEmployee({ job_function: "", location: "" }),
      ];

      const { result } = renderHook(() => useFilters());

      const options = result.current.getAvailableOptions(employees);
      expect(options.jobFunctions).toEqual(["Engineering"]);
      expect(options.locations).toEqual(["USA"]);
    });
  });

  describe("hasActiveFilters", () => {
    it("returns false when no filters are active", () => {
      const { result } = renderHook(() => useFilters());

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("returns true when any filter is active", () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.toggleLevel("MT1");
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("clearAllFilters", () => {
    it("clears all active filters", () => {
      const { result } = renderHook(() => useFilters());

      act(() => {
        result.current.toggleLevel("MT1");
        result.current.toggleJobFunction("Engineering");
        result.current.setReportingChainFilter("Alice Smith");
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.selectedLevels).toEqual([]);
      expect(result.current.selectedJobFunctions).toEqual([]);
      expect(result.current.reportingChainFilter).toBeNull();
    });
  });

  describe("toggleDrawer", () => {
    it("toggles drawer open/close state", () => {
      const { result } = renderHook(() => useFilters());

      expect(result.current.isDrawerOpen).toBe(false);

      act(() => {
        result.current.toggleDrawer();
      });

      expect(result.current.isDrawerOpen).toBe(true);

      act(() => {
        result.current.toggleDrawer();
      });

      expect(result.current.isDrawerOpen).toBe(false);
    });
  });
});
