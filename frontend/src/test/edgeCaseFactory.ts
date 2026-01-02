/**
 * Edge Case Factory for Realistic Test Data
 *
 * Purpose: Generate employees with realistic edge cases that mirror
 * actual sample data generation, including undefined/null values,
 * empty strings, and other anomalies that can occur in production.
 *
 * Use this factory when testing components/hooks that process employee data
 * to ensure they handle real-world edge cases gracefully.
 */

import { Employee, PerformanceLevel, PotentialLevel } from "../types/employee";

/**
 * Edge case scenarios that can occur in real data
 */
export enum EdgeCaseScenario {
  CEO_NO_MANAGER = "ceo_no_manager",
  ORPHANED_EMPLOYEE = "orphaned_employee",
  EMPTY_STRINGS = "empty_strings",
  NULL_VALUES = "null_values",
  MISSING_OPTIONAL = "missing_optional",
  SPECIAL_CHARACTERS = "special_characters",
  MINIMAL_DATA = "minimal_data",
  UNICODE_NAMES = "unicode_names",
}

/**
 * Create an employee with specific edge case characteristics
 */
export const createEdgeCaseEmployee = (
  scenario: EdgeCaseScenario,
  baseId: number = 1
): Employee => {
  const baseEmployee: Employee = {
    employee_id: baseId,
    name: `Employee ${baseId}`,
    business_title: "Test Title",
    job_title: "Test Job",
    job_profile: "Test Profile",
    job_level: "MT3",
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
  };

  switch (scenario) {
    case EdgeCaseScenario.CEO_NO_MANAGER:
      return {
        ...baseEmployee,
        name: "John Smith (CEO)",
        job_level: "MT6",
        manager: undefined, // CEO has no manager
        business_title: "Chief Executive Officer",
      };

    case EdgeCaseScenario.ORPHANED_EMPLOYEE:
      return {
        ...baseEmployee,
        manager: undefined, // Employee with missing manager reference
        management_chain_01: undefined,
      };

    case EdgeCaseScenario.EMPTY_STRINGS:
      return {
        ...baseEmployee,
        manager: "", // Empty string manager
        job_function: "",
        location: "",
        notes: "",
      };

    case EdgeCaseScenario.NULL_VALUES:
      return {
        ...baseEmployee,
        manager: null as any,
        job_function: null as any,
        location: null as any,
        flags: null as any,
      };

    case EdgeCaseScenario.MISSING_OPTIONAL:
      return {
        ...baseEmployee,
        flags: undefined,
        ratings_history: undefined as any,
        development_focus: undefined,
        development_action: undefined,
      };

    case EdgeCaseScenario.SPECIAL_CHARACTERS:
      return {
        ...baseEmployee,
        name: "O'Brien, John Jr.",
        manager: "María García-López",
        business_title: "VP, Sales & Marketing",
        notes: 'Employee said: "Ready for promotion"',
      };

    case EdgeCaseScenario.MINIMAL_DATA:
      // Only truly required fields (but job_level is expected by useFilters)
      return {
        employee_id: baseId,
        name: `Minimal Employee ${baseId}`,
        performance: PerformanceLevel.LOW,
        potential: PotentialLevel.LOW,
        grid_position: 1,
        job_level: undefined, // This will expose bugs in code that doesn't check
      } as any as Employee;

    case EdgeCaseScenario.UNICODE_NAMES:
      return {
        ...baseEmployee,
        name: "李明 (Li Ming)",
        manager: "José António da Silva",
        business_title: "Développeur Senior",
      };

    default:
      return baseEmployee;
  }
};

/**
 * Generate a realistic dataset with various edge cases
 * Simulates what the sample data generator might produce
 */
export const generateRealisticDataset = (size: number = 50): Employee[] => {
  const employees: Employee[] = [];
  let idCounter = 1;

  // CEO (no manager)
  employees.push(
    createEdgeCaseEmployee(EdgeCaseScenario.CEO_NO_MANAGER, idCounter++)
  );

  // Some regular employees
  for (let i = 0; i < Math.floor(size * 0.7); i++) {
    employees.push({
      employee_id: idCounter++,
      name: `Employee ${idCounter}`,
      business_title: ["Engineer", "Manager", "Analyst", "Designer"][i % 4],
      job_title: ["Senior", "Junior", "Lead", "Principal"][i % 4] + " Role",
      job_profile: "Standard Profile",
      job_level: ["MT1", "MT2", "MT3", "MT4"][i % 4],
      job_function: ["Engineering", "Sales", "Marketing", "Operations"][i % 4],
      location: ["USA", "IND", "GBR", "FRA"][i % 4],
      manager: i < 5 ? "John Smith (CEO)" : `Manager ${Math.floor(i / 5)}`,
      management_chain_01:
        i < 5 ? "John Smith (CEO)" : `Manager ${Math.floor(i / 10)}`,
      management_chain_02: i < 10 ? null : "John Smith (CEO)",
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
      hire_date: `202${i % 5}-0${(i % 12) + 1}-15`,
      tenure_category: ["New", "Mid", "Senior", "Veteran"][i % 4],
      time_in_job_profile: `${(i % 5) + 1} years`,
      performance: [
        PerformanceLevel.LOW,
        PerformanceLevel.MEDIUM,
        PerformanceLevel.HIGH,
      ][i % 3],
      potential: [
        PotentialLevel.LOW,
        PotentialLevel.MEDIUM,
        PotentialLevel.HIGH,
      ][i % 3],
      grid_position: (i % 3) * 3 + ((i % 3) + 1),
      position_label: "Standard Label",
      talent_indicator: "Core",
      ratings_history: i % 3 === 0 ? undefined : [],
      development_focus: i % 4 === 0 ? null : "Standard focus",
      development_action: null,
      notes: null,
      promotion_status: null,
      promotion_readiness: null,
      modified_in_session: false,
      last_modified: null,
      flags: i % 5 === 0 ? ["promotion_ready"] : undefined,
    });
  }

  // Add edge cases (30% of dataset)
  const edgeCaseScenarios = [
    EdgeCaseScenario.ORPHANED_EMPLOYEE,
    EdgeCaseScenario.EMPTY_STRINGS,
    EdgeCaseScenario.NULL_VALUES,
    EdgeCaseScenario.MISSING_OPTIONAL,
    EdgeCaseScenario.SPECIAL_CHARACTERS,
    EdgeCaseScenario.UNICODE_NAMES,
  ];

  for (let i = 0; i < Math.floor(size * 0.3); i++) {
    const scenario = edgeCaseScenarios[i % edgeCaseScenarios.length];
    employees.push(createEdgeCaseEmployee(scenario, idCounter++));
  }

  return employees;
};

/**
 * Test data presets for common testing scenarios
 */
export const edgeCasePresets = {
  /**
   * Dataset with undefined managers (CEO scenario)
   */
  withUndefinedManagers: (): Employee[] => [
    createEdgeCaseEmployee(EdgeCaseScenario.CEO_NO_MANAGER, 1),
    ...Array.from({ length: 5 }, (_, i) => ({
      ...createEdgeCaseEmployee(EdgeCaseScenario.MINIMAL_DATA, i + 2),
      manager: "John Smith (CEO)",
    })),
  ],

  /**
   * Dataset with various null/empty values
   */
  withNullAndEmpty: (): Employee[] => [
    createEdgeCaseEmployee(EdgeCaseScenario.NULL_VALUES, 1),
    createEdgeCaseEmployee(EdgeCaseScenario.EMPTY_STRINGS, 2),
    createEdgeCaseEmployee(EdgeCaseScenario.MISSING_OPTIONAL, 3),
  ],

  /**
   * Dataset with special characters and Unicode
   */
  withSpecialCharacters: (): Employee[] => [
    createEdgeCaseEmployee(EdgeCaseScenario.SPECIAL_CHARACTERS, 1),
    createEdgeCaseEmployee(EdgeCaseScenario.UNICODE_NAMES, 2),
  ],

  /**
   * Minimal dataset for smoke testing
   */
  minimal: (): Employee[] => [
    createEdgeCaseEmployee(EdgeCaseScenario.MINIMAL_DATA, 1),
    createEdgeCaseEmployee(EdgeCaseScenario.MINIMAL_DATA, 2),
  ],

  /**
   * Comprehensive edge case dataset
   */
  comprehensive: (): Employee[] => generateRealisticDataset(20),
};
