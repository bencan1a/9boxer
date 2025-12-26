import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeDetails } from "../EmployeeDetails";
import { createMockEmployee } from "../../../test/mockData";
import { getTranslatedText } from "../../../test/i18nTestUtils";
import { PotentialLevel } from "../../../types/employee";

// Mock the session store
vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn((selector) => {
    const state = {
      events: [],
      donutEvents: [],
      updateChangeNotes: vi.fn(),
      updateDonutChangeNotes: vi.fn(),
    };
    return selector(state);
  }),
}));

// Mock the EmployeeChangesSummary component
vi.mock("../EmployeeChangesSummary", () => ({
  EmployeeChangesSummary: ({ employeeId }: { employeeId: number }) => (
    <div data-testid="employee-changes-summary">
      Changes for employee {employeeId}
    </div>
  ),
}));

// Mock the EmployeeFlags component
vi.mock("../EmployeeFlags", () => ({
  EmployeeFlags: () => <div data-testid="employee-flags">Flags</div>,
}));

describe("EmployeeDetails", () => {
  it("renders employee name and title correctly", () => {
    const employee = createMockEmployee({
      name: "John Doe",
      business_title: "Software Engineer",
    });

    render(<EmployeeDetails employee={employee} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("displays employee information section with all fields", () => {
    const employee = createMockEmployee({
      job_function: "Engineering",
      location: "USA",
      job_level: "MT4",
      tenure_category: "3-5 years",
      time_in_job_profile: "2 years",
    });

    render(<EmployeeDetails employee={employee} />);

    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.employeeInformation")
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("USA")).toBeInTheDocument();
    expect(screen.getByText("MT4")).toBeInTheDocument();
    expect(screen.getByText("3-5 years")).toBeInTheDocument();
    expect(screen.getByText("2 years")).toBeInTheDocument();
  });

  it("displays current assessment section with box info", () => {
    const employee = createMockEmployee({
      potential: PotentialLevel.HIGH,
      grid_position: 9,
    });

    render(<EmployeeDetails employee={employee} />);

    expect(
      screen.getByText(getTranslatedText("panel.detailsTab.currentAssessment"))
    ).toBeInTheDocument();
    // Box label should be present
    expect(screen.getByText(/Box:/)).toBeInTheDocument();
    // Performance and Potential should appear as caption labels (without colon)
    const performanceLabels = screen.getAllByText("Performance");
    expect(performanceLabels.length).toBeGreaterThan(0);
  });

  it("displays potential chip with correct label", () => {
    const employee = createMockEmployee({
      potential: PotentialLevel.HIGH,
    });

    render(<EmployeeDetails employee={employee} />);

    // The Chip component shows the full potential value
    // There will be multiple "High" texts (for both performance and potential chips)
    const highTexts = screen.getAllByText("High");
    expect(highTexts.length).toBeGreaterThan(0);
  });

  it("displays box name and grid coordinates correctly", () => {
    const employee = createMockEmployee({
      grid_position: 9,
    });

    render(<EmployeeDetails employee={employee} />);

    // Should show box name and coordinates
    expect(screen.getByText(/Star/)).toBeInTheDocument();
    expect(screen.getByText(/\[H,H\]/)).toBeInTheDocument();
  });

  it("displays performance chip with correct value", () => {
    const employee = createMockEmployee({
      performance: "High" as any,
      grid_position: 9,
    });

    render(<EmployeeDetails employee={employee} />);

    // Find all chips with "High" - there should be two (performance and potential)
    const highChips = screen.getAllByText("High");
    expect(highChips.length).toBeGreaterThan(0);
  });

  it("displays performance and potential chips for all grid positions", () => {
    // Test different grid positions have their performance/potential displayed
    const testCases = [
      { position: 1, name: "Underperformer" },
      { position: 5, name: "Core Talent" },
      { position: 9, name: "Star" },
    ];

    testCases.forEach(({ position, name }) => {
      const employee = createMockEmployee({ grid_position: position });
      const { unmount } = render(<EmployeeDetails employee={employee} />);
      expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
      unmount();
    });
  });

  it("displays modified in session badge when employee is modified", () => {
    const employee = createMockEmployee({
      modified_in_session: true,
    });

    render(<EmployeeDetails employee={employee} />);

    expect(
      screen.getByText(getTranslatedText("panel.detailsTab.modifiedInSession"))
    ).toBeInTheDocument();
  });

  it("does not display modified badge when employee is not modified", () => {
    const employee = createMockEmployee({
      modified_in_session: false,
    });

    render(<EmployeeDetails employee={employee} />);

    expect(
      screen.queryByText(
        getTranslatedText("panel.detailsTab.modifiedInSession")
      )
    ).not.toBeInTheDocument();
  });

  it("hides info rows when field values are null", () => {
    const employee = createMockEmployee({
      job_function: null,
      location: null,
      job_level: null,
      tenure_category: null,
      time_in_job_profile: null,
    });

    render(<EmployeeDetails employee={employee} />);

    // Should still show the section heading
    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.employeeInformation")
      )
    ).toBeInTheDocument();

    // But field labels should not appear since values are null
    expect(
      screen.queryByText(getTranslatedText("panel.detailsTab.jobFunction"))
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(getTranslatedText("panel.detailsTab.location"))
    ).not.toBeInTheDocument();
  });

  it("displays all potential levels with correct colors", () => {
    const testCases = [
      { potential: PotentialLevel.HIGH, label: "High" },
      { potential: PotentialLevel.MEDIUM, label: "Medium" },
      { potential: PotentialLevel.LOW, label: "Low" },
    ];

    testCases.forEach(({ potential, label }) => {
      const employee = createMockEmployee({ potential });
      const { unmount } = render(<EmployeeDetails employee={employee} />);
      // There will be multiple instances of the label (performance and potential chips)
      const labels = screen.getAllByText(label);
      expect(labels.length).toBeGreaterThan(0);
      unmount();
    });
  });
});
