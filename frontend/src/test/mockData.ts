import { Employee, PerformanceLevel, PotentialLevel } from "../types/employee";
import { GridMoveEvent } from "../types/events";

/**
 * Create a mock employee for testing
 */
export const createMockEmployee = (overrides?: Partial<Employee>): Employee => {
  const defaults: Employee = {
    employee_id: 1,
    name: "John Doe",
    business_title: "Software Engineer",
    job_title: "Senior Engineer",
    job_profile: "Engineering-Tech-USA",
    job_level: "MT4",
    job_function: "Engineering",
    location: "USA",
    manager: "Jane Smith",
    management_chain_01: "Jane Smith",
    management_chain_02: "Bob Johnson",
    management_chain_03: null,
    management_chain_04: null,
    management_chain_05: null,
    management_chain_06: null,
    hire_date: "2020-01-15",
    tenure_category: "3-5 years",
    time_in_job_profile: "2 years",
    performance: PerformanceLevel.HIGH,
    potential: PotentialLevel.HIGH,
    grid_position: 9,
    talent_indicator: "High Performer",
    ratings_history: [
      { year: 2023, rating: "Leading" },
      { year: 2022, rating: "Strong" },
    ],
    development_focus: "Leadership skills",
    development_action: "Attend leadership training",
    notes: "Ready for promotion",
    promotion_status: "Ready",
    promotion_readiness: true,
    modified_in_session: false,
    last_modified: null,
  };

  return { ...defaults, ...overrides };
};

/**
 * Mock employees in different grid positions
 */
export const mockEmployees: Employee[] = [
  createMockEmployee({
    employee_id: 1,
    name: "Alice Johnson",
    performance: PerformanceLevel.HIGH,
    potential: PotentialLevel.HIGH,
    grid_position: 9,
  }),
  createMockEmployee({
    employee_id: 2,
    name: "Bob Smith",
    business_title: "Product Manager",
    performance: PerformanceLevel.MEDIUM,
    potential: PotentialLevel.HIGH,
    grid_position: 8,
  }),
  createMockEmployee({
    employee_id: 3,
    name: "Carol White",
    business_title: "Data Analyst",
    performance: PerformanceLevel.LOW,
    potential: PotentialLevel.HIGH,
    grid_position: 7,
  }),
  createMockEmployee({
    employee_id: 4,
    name: "David Brown",
    business_title: "Engineering Manager",
    performance: PerformanceLevel.HIGH,
    potential: PotentialLevel.MEDIUM,
    grid_position: 6,
    modified_in_session: true,
  }),
  createMockEmployee({
    employee_id: 5,
    name: "Eve Davis",
    business_title: "UX Designer",
    performance: PerformanceLevel.MEDIUM,
    potential: PotentialLevel.MEDIUM,
    grid_position: 5,
  }),
];

/**
 * Mock employees grouped by position for NineBoxGrid testing
 */
export const mockEmployeesByPosition: Record<number, Employee[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [mockEmployees[4]], // Eve Davis
  6: [mockEmployees[3]], // David Brown
  7: [mockEmployees[2]], // Carol White
  8: [mockEmployees[1]], // Bob Smith
  9: [mockEmployees[0]], // Alice Johnson
};

/**
 * Mock statistics data matching useStatistics labels
 */
export const mockStatistics = {
  total_employees: 5,
  modified_employees: 1,
  high_performers: 2,
  distribution: [
    {
      grid_position: 1,
      position_label: "Underperformer [L,L]",
      count: 0,
      percentage: 0,
    },
    {
      grid_position: 2,
      position_label: "Effective Pro [M,L]",
      count: 0,
      percentage: 0,
    },
    {
      grid_position: 3,
      position_label: "Workhorse [H,L]",
      count: 0,
      percentage: 0,
    },
    {
      grid_position: 4,
      position_label: "Inconsistent [L,M]",
      count: 0,
      percentage: 0,
    },
    {
      grid_position: 5,
      position_label: "Core Talent [M,M]",
      count: 1,
      percentage: 20,
    },
    {
      grid_position: 6,
      position_label: "High Impact [H,M]",
      count: 1,
      percentage: 20,
    },
    {
      grid_position: 7,
      position_label: "Enigma [L,H]",
      count: 1,
      percentage: 20,
    },
    {
      grid_position: 8,
      position_label: "Growth [M,H]",
      count: 1,
      percentage: 20,
    },
    {
      grid_position: 9,
      position_label: "Star [H,H]",
      count: 1,
      percentage: 20,
    },
  ],
  groupedStats: {
    highPerformers: { positions: [6, 8, 9], count: 3, percentage: 60 },
    middleTier: { positions: [3, 5, 7], count: 2, percentage: 40 },
    lowPerformers: { positions: [1, 2, 4], count: 0, percentage: 0 },
  },
};

/**
 * Mock employee changes for ChangeTrackerTab testing
 */
export const mockChanges: GridMoveEvent[] = [
  {
    event_id: "change-1",
    event_type: "grid_move",
    employee_id: 1,
    employee_name: "Alice Johnson",
    timestamp: new Date("2024-01-15T10:30:00Z").toISOString(),
    old_performance: "Medium",
    old_potential: "High",
    new_performance: "High",
    new_potential: "High",
    old_position: 8,
    new_position: 9,
    notes: "Promoted after successful project delivery",
  },
  {
    event_id: "change-2",
    event_type: "grid_move",
    employee_id: 2,
    employee_name: "Bob Smith",
    timestamp: new Date("2024-01-15T11:45:00Z").toISOString(),
    old_performance: "Low",
    old_potential: "Medium",
    new_performance: "Medium",
    new_potential: "Medium",
    old_position: 4,
    new_position: 5,
    notes: "Improvement after coaching",
  },
  {
    event_id: "change-3",
    event_type: "grid_move",
    employee_id: 3,
    employee_name: "Carol White",
    timestamp: new Date("2024-01-15T14:20:00Z").toISOString(),
    old_performance: "High",
    old_potential: "Medium",
    new_performance: "High",
    new_potential: "High",
    old_position: 6,
    new_position: 9,
    notes: null,
  },
];
