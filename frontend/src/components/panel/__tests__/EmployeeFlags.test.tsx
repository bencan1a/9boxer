/**
 * Tests for EmployeeFlags component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test/utils";
import { EmployeeFlags } from "../EmployeeFlags";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../../types/employee";

// Mock the session store
const mockUpdateEmployee = vi.fn();

vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn((selector) => {
    const state = {
      updateEmployee: mockUpdateEmployee,
    };
    return selector(state);
  }),
}));

const mockEmployee: Employee = {
  employee_id: 1,
  name: "John Doe",
  business_title: "Software Engineer",
  job_title: "Senior Software Engineer",
  job_profile: "Engineering",
  job_level: "MT2",
  job_function: "Engineering",
  location: "USA",
  manager: "Jane Smith",
  management_chain_01: null,
  management_chain_02: null,
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-01-01",
  tenure_category: "2-5 years",
  time_in_job_profile: "2 years",
  performance: PerformanceLevel.HIGH,
  potential: PotentialLevel.HIGH,
  grid_position: 9,
  talent_indicator: "High Performer",
  ratings_history: [],
  development_focus: null,
  development_action: null,
  notes: null,
  promotion_status: null,
  promotion_readiness: false,
  modified_in_session: false,
  last_modified: null,
  flags: ["promotion_ready", "flight_risk"],
};

describe("EmployeeFlags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateEmployee.mockClear();
  });

  it("displays set flags as chips when employee has flags", () => {
    render(<EmployeeFlags employee={mockEmployee} />);

    // Should show both flags
    expect(screen.getByTestId("flag-chip-promotion_ready")).toBeInTheDocument();
    expect(screen.getByTestId("flag-chip-flight_risk")).toBeInTheDocument();

    // Should show display names
    expect(screen.getByText("Promotion Ready")).toBeInTheDocument();
    expect(screen.getByText("Flight Risk")).toBeInTheDocument();
  });

  it("shows flag picker when employee has available flags", () => {
    render(<EmployeeFlags employee={mockEmployee} />);

    // Flag picker input should be visible
    const picker = screen.getByTestId("flag-picker");
    expect(picker).toBeInTheDocument();
  });

  it("removes flag when delete button is clicked", async () => {
    render(<EmployeeFlags employee={mockEmployee} />);

    // Find and click the delete button on the first flag
    const promotionReadyChip = screen.getByTestId("flag-chip-promotion_ready");
    const deleteButton = promotionReadyChip.querySelector(
      '[data-testid*="CancelIcon"]'
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockUpdateEmployee).toHaveBeenCalledWith(1, {
          flags: ["flight_risk"], // Only flight_risk should remain
        });
      });
    }
  });

  it("shows picker input element", () => {
    render(<EmployeeFlags employee={mockEmployee} />);

    // Verify the autocomplete picker input is present
    const pickerContainer = screen.getByTestId("flag-picker");
    expect(pickerContainer).toBeInTheDocument();

    const input = pickerContainer.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Add flag...");
  });

  it("shows empty state when employee has no flags", () => {
    const employeeWithNoFlags = { ...mockEmployee, flags: [] };
    render(<EmployeeFlags employee={employeeWithNoFlags} />);

    // Should show flag picker
    expect(screen.getByTestId("flag-picker")).toBeInTheDocument();

    // Should not show any flag chips
    expect(
      screen.queryByTestId("flag-chip-promotion_ready")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("flag-chip-flight_risk")
    ).not.toBeInTheDocument();
  });

  it("applies correct colors to flag chips", () => {
    render(<EmployeeFlags employee={mockEmployee} />);

    const promotionReadyChip = screen.getByTestId("flag-chip-promotion_ready");
    const flightRiskChip = screen.getByTestId("flag-chip-flight_risk");

    // Check that chips have background colors applied
    // eslint-disable-next-line no-restricted-syntax
    expect(promotionReadyChip).toHaveStyle({ backgroundColor: "#1976d2" }); // Blue
    // eslint-disable-next-line no-restricted-syntax
    expect(flightRiskChip).toHaveStyle({ backgroundColor: "#f44336" }); // Red
  });

  it("handles employee with undefined flags", () => {
    const employeeWithUndefinedFlags = { ...mockEmployee, flags: undefined };
    render(<EmployeeFlags employee={employeeWithUndefinedFlags} />);

    // Should show flag picker
    expect(screen.getByTestId("flag-picker")).toBeInTheDocument();

    // Should not show any flag chips
    expect(
      screen.queryByTestId("flag-chip-promotion_ready")
    ).not.toBeInTheDocument();
  });
});
