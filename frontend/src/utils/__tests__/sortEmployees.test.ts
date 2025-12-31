import { describe, it, expect } from "vitest";
import { sortEmployees } from "../sortEmployees";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";

/**
 * Helper to create a test employee with minimal required fields
 */
const createEmployee = (overrides: Partial<Employee>): Employee => ({
  employee_id: 1,
  name: "Test Employee",
  business_title: "Test Title",
  job_title: "Test Job",
  job_profile: "Test Profile",
  job_level: "MT1",
  job_function: "Test Function",
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
  flags: [],
  ...overrides,
});

describe("sortEmployees", () => {
  describe("Tier 1: Modified Employees", () => {
    it("places modified employees before flagged employees", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          name: "Alice",
          flags: ["promotion_ready"],
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob",
          modified_in_session: true,
        }),
        createEmployee({ employee_id: 3, name: "Carol" }),
      ];

      const sorted = sortEmployees(employees);

      expect(sorted[0].name).toBe("Bob"); // Modified (Tier 1)
      expect(sorted[1].name).toBe("Alice"); // Flagged (Tier 2)
      expect(sorted[2].name).toBe("Carol"); // Normal (Tier 3)
    });

    it("places modified employees before unflagged employees", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Alice" }),
        createEmployee({
          employee_id: 2,
          name: "Bob",
          modified_in_session: true,
        }),
        createEmployee({ employee_id: 3, name: "Carol" }),
      ];

      const sorted = sortEmployees(employees);

      expect(sorted[0].name).toBe("Bob"); // Modified (Tier 1)
      expect(sorted[1].name).toBe("Alice"); // Normal (Tier 3)
      expect(sorted[2].name).toBe("Carol"); // Normal (Tier 3)
    });

    it("sorts modified employees alphabetically within tier", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          name: "Zoe",
          modified_in_session: true,
        }),
        createEmployee({
          employee_id: 2,
          name: "Alice",
          modified_in_session: true,
        }),
        createEmployee({
          employee_id: 3,
          name: "Mike",
          modified_in_session: true,
        }),
      ];

      const sorted = sortEmployees(employees);

      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Mike");
      expect(sorted[2].name).toBe("Zoe");
    });

    it("modified + flagged employees go to Tier 1 (modified trumps flags)", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          name: "Alice",
          flags: ["flight_risk"],
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob",
          modified_in_session: true,
          flags: ["promotion_ready"],
        }),
        createEmployee({ employee_id: 3, name: "Carol" }),
      ];

      const sorted = sortEmployees(employees);

      // Bob is both modified AND flagged, but should be in Tier 1 (modified trumps flags)
      expect(sorted[0].name).toBe("Bob"); // Modified + Flagged (Tier 1)
      expect(sorted[1].name).toBe("Alice"); // Only Flagged (Tier 2)
      expect(sorted[2].name).toBe("Carol"); // Normal (Tier 3)
    });
  });

  describe("Tier 2: Flagged Employees", () => {
    it("places flagged employees before unflagged employees", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Alice" }),
        createEmployee({
          employee_id: 2,
          name: "Bob",
          flags: ["promotion_ready"],
        }),
        createEmployee({ employee_id: 3, name: "Carol" }),
      ];

      const sorted = sortEmployees(employees);

      expect(sorted[0].name).toBe("Bob"); // Flagged (Tier 2)
      expect(sorted[1].name).toBe("Alice"); // Normal (Tier 3)
      expect(sorted[2].name).toBe("Carol"); // Normal (Tier 3)
    });

    it("sorts flagged employees alphabetically within tier", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Zoe", flags: ["flight_risk"] }),
        createEmployee({
          employee_id: 2,
          name: "Alice",
          flags: ["promotion_ready"],
        }),
        createEmployee({ employee_id: 3, name: "Mike", flags: ["new_hire"] }),
      ];

      const sorted = sortEmployees(employees);

      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Mike");
      expect(sorted[2].name).toBe("Zoe");
    });

    it("treats any flag type equally (flight_risk, promotion_ready, etc.)", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          name: "Alice",
          flags: ["flight_risk"],
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob",
          flags: ["promotion_ready"],
        }),
        createEmployee({ employee_id: 3, name: "Carol", flags: ["new_hire"] }),
        createEmployee({ employee_id: 4, name: "Dan" }),
      ];

      const sorted = sortEmployees(employees);

      // All flagged employees (Tier 2) before unflagged (Tier 3)
      expect(sorted[0].name).toBe("Alice"); // Flagged, alphabetically first
      expect(sorted[1].name).toBe("Bob"); // Flagged, alphabetically second
      expect(sorted[2].name).toBe("Carol"); // Flagged, alphabetically third
      expect(sorted[3].name).toBe("Dan"); // Unflagged
    });

    it("treats multiple flags same as single flag", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          name: "Alice",
          flags: ["flight_risk", "promotion_ready"],
        }),
        createEmployee({ employee_id: 2, name: "Bob", flags: ["new_hire"] }),
        createEmployee({ employee_id: 3, name: "Carol" }),
      ];

      const sorted = sortEmployees(employees);

      // Both Alice and Bob are in Tier 2, sorted alphabetically
      expect(sorted[0].name).toBe("Alice"); // Multiple flags (Tier 2)
      expect(sorted[1].name).toBe("Bob"); // Single flag (Tier 2)
      expect(sorted[2].name).toBe("Carol"); // No flags (Tier 3)
    });
  });

  describe("Tier 3: Normal Employees", () => {
    it("sorts normal employees alphabetically", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Zoe" }),
        createEmployee({ employee_id: 2, name: "Alice" }),
        createEmployee({ employee_id: 3, name: "Mike" }),
      ];

      const sorted = sortEmployees(employees);

      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Mike");
      expect(sorted[2].name).toBe("Zoe");
    });

    it("handles employees with undefined flags as normal employees", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Alice", flags: undefined }),
        createEmployee({ employee_id: 2, name: "Bob" }),
      ];

      const sorted = sortEmployees(employees);

      // Both should be in Tier 3, sorted alphabetically
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Bob");
    });

    it("handles employees with empty flags array as normal employees", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Alice", flags: [] }),
        createEmployee({ employee_id: 2, name: "Bob", flags: [] }),
      ];

      const sorted = sortEmployees(employees);

      // Both should be in Tier 3, sorted alphabetically
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Bob");
    });
  });

  describe("Three-Tier Integration", () => {
    it("maintains correct tier order with mixed employees", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Zoe" }), // Tier 3
        createEmployee({
          employee_id: 2,
          name: "Bob",
          modified_in_session: true,
        }), // Tier 1
        createEmployee({
          employee_id: 3,
          name: "Alice",
          flags: ["promotion_ready"],
        }), // Tier 2
        createEmployee({ employee_id: 4, name: "Mike" }), // Tier 3
        createEmployee({
          employee_id: 5,
          name: "Dan",
          modified_in_session: true,
        }), // Tier 1
        createEmployee({ employee_id: 6, name: "Eve", flags: ["flight_risk"] }), // Tier 2
      ];

      const sorted = sortEmployees(employees);

      // Tier 1: Modified (alphabetical: Bob, Dan)
      expect(sorted[0].name).toBe("Bob");
      expect(sorted[1].name).toBe("Dan");
      // Tier 2: Flagged (alphabetical: Alice, Eve)
      expect(sorted[2].name).toBe("Alice");
      expect(sorted[3].name).toBe("Eve");
      // Tier 3: Normal (alphabetical: Mike, Zoe)
      expect(sorted[4].name).toBe("Mike");
      expect(sorted[5].name).toBe("Zoe");
    });

    it("handles all employees in same tier (all modified)", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          name: "Zoe",
          modified_in_session: true,
        }),
        createEmployee({
          employee_id: 2,
          name: "Alice",
          modified_in_session: true,
        }),
        createEmployee({
          employee_id: 3,
          name: "Mike",
          modified_in_session: true,
        }),
      ];

      const sorted = sortEmployees(employees);

      // All in Tier 1, sorted alphabetically
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Mike");
      expect(sorted[2].name).toBe("Zoe");
    });

    it("handles all employees in same tier (all flagged)", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Zoe", flags: ["flight_risk"] }),
        createEmployee({
          employee_id: 2,
          name: "Alice",
          flags: ["promotion_ready"],
        }),
        createEmployee({ employee_id: 3, name: "Mike", flags: ["new_hire"] }),
      ];

      const sorted = sortEmployees(employees);

      // All in Tier 2, sorted alphabetically
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Mike");
      expect(sorted[2].name).toBe("Zoe");
    });

    it("handles all employees in same tier (all normal)", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Zoe" }),
        createEmployee({ employee_id: 2, name: "Alice" }),
        createEmployee({ employee_id: 3, name: "Mike" }),
      ];

      const sorted = sortEmployees(employees);

      // All in Tier 3, sorted alphabetically
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Mike");
      expect(sorted[2].name).toBe("Zoe");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty array", () => {
      const sorted = sortEmployees([]);
      expect(sorted).toEqual([]);
    });

    it("handles single employee", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Alice" }),
      ];

      const sorted = sortEmployees(employees);

      expect(sorted).toHaveLength(1);
      expect(sorted[0].name).toBe("Alice");
    });

    it("handles null or undefined names without crashing", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: null as any }),
        createEmployee({ employee_id: 2, name: undefined as any }),
        createEmployee({ employee_id: 3, name: "Alice" }),
        createEmployee({ employee_id: 4, name: "" }),
      ];

      const sorted = sortEmployees(employees);

      // Should not throw
      expect(sorted).toHaveLength(4);
      expect(() => sortEmployees(employees)).not.toThrow();

      // Named employee should be present in results
      expect(sorted.some((emp) => emp.name === "Alice")).toBe(true);
    });

    it("does not mutate original array", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "Zoe" }),
        createEmployee({ employee_id: 2, name: "Alice" }),
      ];

      const original = [...employees];
      const sorted = sortEmployees(employees);

      // Original array should be unchanged
      expect(employees).toEqual(original);
      expect(employees[0].name).toBe("Zoe");
      expect(employees[1].name).toBe("Alice");

      // Sorted array should be different
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("Zoe");
    });

    it("handles special characters in names", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "O'Brien" }),
        createEmployee({ employee_id: 2, name: "MacDonald" }),
        createEmployee({ employee_id: 3, name: "Müller" }),
        createEmployee({ employee_id: 4, name: "Álvarez" }),
      ];

      const sorted = sortEmployees(employees);

      // localeCompare should handle special characters correctly
      expect(sorted[0].name).toBe("Álvarez");
      expect(sorted[1].name).toBe("MacDonald");
      expect(sorted[2].name).toBe("Müller");
      expect(sorted[3].name).toBe("O'Brien");
    });

    it("handles case-insensitive sorting", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "zoe" }),
        createEmployee({ employee_id: 2, name: "Alice" }),
        createEmployee({ employee_id: 3, name: "MIKE" }),
      ];

      const sorted = sortEmployees(employees);

      // localeCompare should handle case-insensitive sorting
      expect(sorted[0].name).toBe("Alice");
      expect(sorted[1].name).toBe("MIKE");
      expect(sorted[2].name).toBe("zoe");
    });

    it("handles names with leading/trailing spaces", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: " Zoe" }),
        createEmployee({ employee_id: 2, name: "Alice " }),
        createEmployee({ employee_id: 3, name: "Mike" }),
      ];

      const sorted = sortEmployees(employees);

      // localeCompare handles spaces in sorting
      expect(sorted[0].name).toBe(" Zoe");
      expect(sorted[1].name).toBe("Alice ");
      expect(sorted[2].name).toBe("Mike");
    });

    it("maintains stable sort for employees with identical names", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
        createEmployee({ employee_id: 2, name: "John Smith" }),
        createEmployee({ employee_id: 3, name: "John Smith" }),
      ];

      const sorted = sortEmployees(employees);

      // All should remain in original order when names are identical
      expect(sorted[0].employee_id).toBe(1);
      expect(sorted[1].employee_id).toBe(2);
      expect(sorted[2].employee_id).toBe(3);
    });
  });

  describe("Performance Characteristics", () => {
    it("handles large arrays efficiently", () => {
      const employees: Employee[] = [];
      for (let i = 0; i < 100; i++) {
        employees.push(
          createEmployee({
            employee_id: i,
            name: `Employee ${i}`,
            modified_in_session: i % 3 === 0,
            flags: i % 2 === 0 ? ["promotion_ready"] : [],
          })
        );
      }

      const startTime = performance.now();
      const sorted = sortEmployees(employees);
      const endTime = performance.now();

      // Should complete in reasonable time (< 200ms for CI/mobile compatibility)
      expect(endTime - startTime).toBeLessThan(200);
      expect(sorted).toHaveLength(100);
    });
  });
});
