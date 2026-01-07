import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { EmployeeChangesSummary } from "../EmployeeChangesSummary";
import { getTranslatedText } from "../../../test/i18nTestUtils";
import { GridMoveEvent, DonutMoveEvent } from "../../../types/events";
import { PerformanceLevel, PotentialLevel } from "../../../types/employee";

// Mock the session store
const mockEvents: GridMoveEvent[] = [];
const mockDonutEvents: DonutMoveEvent[] = [];
const mockUpdateChangeNotes = vi.fn();
const mockUpdateDonutChangeNotes = vi.fn();

vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn((selector) => {
    const state = {
      events: mockEvents,
      donutEvents: mockDonutEvents,
      updateChangeNotes: mockUpdateChangeNotes,
      updateDonutChangeNotes: mockUpdateDonutChangeNotes,
    };
    return selector(state);
  }),
}));

describe("EmployeeChangesSummary", () => {
  beforeEach(() => {
    mockEvents.length = 0;
    mockDonutEvents.length = 0;
  });

  it("displays empty state when no changes exist for employee", () => {
    render(<EmployeeChangesSummary employeeId={123} />);

    expect(screen.getByTestId("employee-changes-empty")).toBeInTheDocument();
    expect(
      screen.getByText(getTranslatedText("panel.changesSummary.noChanges"))
    ).toBeInTheDocument();
  });

  it("displays regular change for employee", () => {
    const change: GridMoveEvent = {
      event_id: "event-1",
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: "Promoted based on Q4 performance",
    };

    mockEvents.push(change);

    render(<EmployeeChangesSummary employeeId={123} />);

    expect(screen.getByTestId("employee-changes-summary")).toBeInTheDocument();
    expect(screen.getByText("Grid Movement")).toBeInTheDocument();
    expect(
      screen.getByText("Promoted based on Q4 performance")
    ).toBeInTheDocument();
  });

  it("displays donut change for employee", () => {
    const donutChange: DonutMoveEvent = {
      event_id: "donut-event-1",
      event_type: "donut_move",
      employee_id: 456,
      employee_name: "Jane Smith",
      timestamp: "2025-12-24T09:15:00Z",
      old_performance: PerformanceLevel.HIGH,
      old_potential: PotentialLevel.HIGH,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.MEDIUM,
      old_position: 9,
      new_position: 6,
      notes: "High retention priority",
    };

    mockDonutEvents.push(donutChange);

    render(<EmployeeChangesSummary employeeId={456} />);

    expect(screen.getByTestId("employee-changes-summary")).toBeInTheDocument();
    expect(screen.getByText("Donut Movement")).toBeInTheDocument();
    expect(screen.getByText("High retention priority")).toBeInTheDocument();
  });

  it("filters changes to show only selected employee", () => {
    const change1: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: "Employee 123 change",
    };

    const change2: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 456,
      employee_name: "Jane Smith",
      timestamp: "2025-12-24T09:15:00Z",
      old_performance: PerformanceLevel.LOW,
      old_potential: PotentialLevel.LOW,
      new_performance: PerformanceLevel.MEDIUM,
      new_potential: PotentialLevel.MEDIUM,
      old_position: 1,
      new_position: 5,
      notes: "Employee 456 change",
    };

    mockEvents.push(change1, change2);

    render(<EmployeeChangesSummary employeeId={123} />);

    // Should show change for employee 123
    expect(screen.getByText("Employee 123 change")).toBeInTheDocument();

    // Should NOT show change for employee 456
    expect(screen.queryByText("Employee 456 change")).not.toBeInTheDocument();
  });

  it("displays both normal and donut changes for the same employee", () => {
    const normalChange: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: "Normal change",
    };

    const donutChange: DonutMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "donut_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T09:15:00Z",
      old_performance: PerformanceLevel.HIGH,
      old_potential: PotentialLevel.HIGH,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.MEDIUM,
      old_position: 9,
      new_position: 6,
      notes: "Donut change",
    };

    mockEvents.push(normalChange);
    mockDonutEvents.push(donutChange);

    render(<EmployeeChangesSummary employeeId={123} />);

    // Should show both changes
    expect(screen.getByText("Normal change")).toBeInTheDocument();
    expect(screen.getByText("Donut change")).toBeInTheDocument();

    // Should show count of 2
    expect(screen.getByText(/Recent Changes.*\(2\)/)).toBeInTheDocument();
  });

  it("sorts changes by timestamp with most recent first", () => {
    const olderChange: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-20T14:00:00Z",
      old_performance: PerformanceLevel.LOW,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.MEDIUM,
      new_potential: PotentialLevel.MEDIUM,
      old_position: 4,
      new_position: 5,
      notes: "Older change",
    };

    const newerChange: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: "Newer change",
    };

    mockEvents.push(olderChange, newerChange);

    render(<EmployeeChangesSummary employeeId={123} />);

    const changeRows = screen.getAllByTestId(/change-row-/);

    // First row should be the newer change
    expect(changeRows[0]).toHaveTextContent("Newer change");

    // Second row should be the older change
    expect(changeRows[1]).toHaveTextContent("Older change");
  });

  it("displays change without notes correctly with editable field", () => {
    const change: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: null,
    };

    mockEvents.push(change);

    render(<EmployeeChangesSummary employeeId={123} />);

    // Should show change with editable notes field (now always shown)
    expect(screen.getByTestId("employee-changes-summary")).toBeInTheDocument();
    // Notes field should be empty (placeholder visible)
    const notesField = screen.getByTestId("change-notes-0");
    expect(notesField).toHaveValue("");
  });

  it("displays position labels in movement chips", () => {
    const change: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5, // Core Talent [M,M]
      new_position: 9, // Star [H,H]
      notes: "Promoted",
    };

    mockEvents.push(change);

    render(<EmployeeChangesSummary employeeId={123} />);

    // Should show position names and coordinates
    expect(screen.getByText(/Core Talent/)).toBeInTheDocument();
    expect(screen.getByText(/Star/)).toBeInTheDocument();
    expect(screen.getByText(/\[M,M\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[H,H\]/)).toBeInTheDocument();
  });

  it("displays timestamp in localized format", async () => {
    const change: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: "Test change",
    };

    mockEvents.push(change);

    const { user } = render(<EmployeeChangesSummary employeeId={123} />);

    // Timestamp is displayed in a tooltip on hover over the time icon
    const changeRow = screen.getByTestId("change-row-0");
    expect(changeRow).toBeInTheDocument();

    // Find the timestamp icon button
    const timeIcon = changeRow.querySelector(
      '[data-testid="AccessTimeIcon"]'
    )?.parentElement;
    expect(timeIcon).toBeInTheDocument();

    // Hover to show tooltip with timestamp
    await user.hover(timeIcon!);

    // Tooltip should contain the date (format varies by locale, but should include 2025 and 12/24)
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toMatch(/2025/);
  });

  it("allows editing notes for regular changes", async () => {
    const change: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: "Original notes",
    };

    mockEvents.push(change);
    mockUpdateChangeNotes.mockResolvedValue(undefined);

    const { user } = render(<EmployeeChangesSummary employeeId={123} />);

    const notesField = screen.getByTestId("change-notes-0");
    expect(notesField).toHaveValue("Original notes");

    // Focus and edit notes
    await user.clear(notesField);
    await user.type(notesField, "Updated notes");

    // Blur should trigger save
    await user.tab();

    expect(mockUpdateChangeNotes).toHaveBeenCalledWith(123, "Updated notes");
  });

  it("allows editing notes for donut changes", async () => {
    const donutChange: DonutMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "donut_move",
      employee_id: 456,
      employee_name: "Jane Smith",
      timestamp: "2025-12-24T09:15:00Z",
      old_performance: PerformanceLevel.HIGH,
      old_potential: PotentialLevel.HIGH,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.MEDIUM,
      old_position: 9,
      new_position: 6,
      notes: "Donut notes",
    };

    mockDonutEvents.push(donutChange);
    mockUpdateDonutChangeNotes.mockResolvedValue(undefined);

    const { user } = render(<EmployeeChangesSummary employeeId={456} />);

    const notesField = screen.getByTestId("change-notes-0");
    expect(notesField).toHaveValue("Donut notes");

    // Focus and edit notes
    await user.clear(notesField);
    await user.type(notesField, "Updated donut notes");

    // Blur should trigger save
    await user.tab();

    expect(mockUpdateDonutChangeNotes).toHaveBeenCalledWith(
      456,
      "Updated donut notes"
    );
  });

  it("allows adding notes to change without existing notes", async () => {
    const change: GridMoveEvent = {
      event_id: `event-${Math.random()}`,
      event_type: "grid_move",
      employee_id: 123,
      employee_name: "John Doe",
      timestamp: "2025-12-24T10:30:00Z",
      old_performance: PerformanceLevel.MEDIUM,
      old_potential: PotentialLevel.MEDIUM,
      new_performance: PerformanceLevel.HIGH,
      new_potential: PotentialLevel.HIGH,
      old_position: 5,
      new_position: 9,
      notes: null,
    };

    mockEvents.push(change);
    mockUpdateChangeNotes.mockResolvedValue(undefined);

    const { user } = render(<EmployeeChangesSummary employeeId={123} />);

    const notesField = screen.getByTestId("change-notes-0");
    expect(notesField).toHaveValue("");

    // Type new notes
    await user.type(notesField, "New notes added");

    // Blur should trigger save
    await user.tab();

    expect(mockUpdateChangeNotes).toHaveBeenCalledWith(123, "New notes added");
  });
});
