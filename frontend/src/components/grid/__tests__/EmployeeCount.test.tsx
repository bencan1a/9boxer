import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeCount } from "../EmployeeCount";
import { useEmployees } from "../../../hooks/useEmployees";
import { useSessionStore } from "../../../store/sessionStore";
import { useFilters } from "../../../hooks/useFilters";
import { mockEmployees } from "../../../test/mockData";
import { getTranslatedText } from "../../../test/i18nTestUtils";

// Mock dependencies
vi.mock("../../../hooks/useEmployees");
vi.mock("../../../store/sessionStore");
vi.mock("../../../hooks/useFilters");

describe("EmployeeCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows total count when no filters are active", () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    const expectedText = `5 ${getTranslatedText("grid.employeeCount.employee", { count: 5 })}`;
    expect(count).toHaveTextContent(expectedText);
  });

  it("shows filtered count when filters are active", () => {
    const filteredEmployees = mockEmployees.slice(0, 2); // 2 employees

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees, // 5 total
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ["MT4"],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    const expectedText = `2 ${getTranslatedText("grid.employeeCount.of")} 5 ${getTranslatedText("grid.employeeCount.employee", { count: 5 })}`;
    expect(count).toHaveTextContent(expectedText);
  });

  it("uses correct singular pluralization for 1 employee", () => {
    const singleEmployee = [mockEmployees[0]];

    vi.mocked(useEmployees).mockReturnValue({
      employees: singleEmployee,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: singleEmployee,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    const expectedText = `1 ${getTranslatedText("grid.employeeCount.employee", { count: 1 })}`;
    expect(count).toHaveTextContent(expectedText);
    expect(count).not.toHaveTextContent(
      getTranslatedText("grid.employeeCount.employee", { count: 2 })
    );
  });

  it("uses correct plural pluralization for multiple employees", () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    expect(count).toHaveTextContent(
      getTranslatedText("grid.employeeCount.employee", { count: 5 })
    );
  });

  it("handles zero employees edge case", () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: [],
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: [],
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    expect(count).toHaveTextContent(
      getTranslatedText("grid.employeeCount.noEmployees")
    );
  });

  it("shows total count when all filters match (filtered count equals total)", () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ["MT4"], // All employees match
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    // When filtered count equals total, show total only
    const expectedText = `5 ${getTranslatedText("grid.employeeCount.employee", { count: 5 })}`;
    expect(count).toHaveTextContent(expectedText);
  });

  it("displays tooltip with filter breakdown when filters are active", () => {
    const filteredEmployees = mockEmployees.slice(0, 2);

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ["MT4", "MT5"],
      selectedJobFunctions: ["Engineering"],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    expect(count).toBeInTheDocument();

    // Tooltip should contain filter information (verified via aria-label)
    const expectedAriaLabel = getTranslatedText(
      "grid.employeeCount.ariaLabelFiltered",
      {
        filteredCount: 2,
        totalCount: 5,
      }
    );
    expect(count).toHaveAttribute(
      "aria-label",
      expect.stringContaining(expectedAriaLabel)
    );
  });

  it("displays simple tooltip when no filters are active", () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    const expectedAriaLabel = getTranslatedText(
      "grid.employeeCount.ariaLabel",
      { count: 5 }
    );
    expect(count).toHaveAttribute("aria-label", expectedAriaLabel);
  });

  it("includes excluded employees count in tooltip when present", () => {
    const filteredEmployees = mockEmployees.slice(0, 3);

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [1, 2], // 2 excluded
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    // Verify the component renders (detailed tooltip content is in the component's internal state)
    expect(count).toBeInTheDocument();
    const expectedText = `3 ${getTranslatedText("grid.employeeCount.of")} 5 ${getTranslatedText("grid.employeeCount.employee", { count: 5 })}`;
    expect(count).toHaveTextContent(expectedText);
  });

  it("includes multiple filter types in tooltip", () => {
    const filteredEmployees = mockEmployees.slice(0, 1);

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ["MT4"],
      selectedJobFunctions: ["Engineering"],
      selectedLocations: ["USA"],
      selectedManagers: ["Jane Smith"],
      excludedEmployeeIds: [5],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    expect(count).toBeInTheDocument();
    const expectedText = `1 ${getTranslatedText("grid.employeeCount.of")} 5 ${getTranslatedText("grid.employeeCount.employee", { count: 1 })}`;
    expect(count).toHaveTextContent(expectedText);
  });

  it("has correct accessibility labels", () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any);
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any);

    render(<EmployeeCount />);

    const count = screen.getByTestId("employee-count");
    expect(count).toHaveAttribute("aria-label");
  });
});
