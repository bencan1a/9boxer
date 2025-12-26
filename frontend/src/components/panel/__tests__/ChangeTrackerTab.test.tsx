import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test/utils";
import { ChangeTrackerTab } from "../ChangeTrackerTab";
import { mockChanges } from "../../../test/mockData";
import { useSessionStore } from "../../../store/sessionStore";
import { getTranslatedText } from "../../../test/i18nTestUtils";

// Mock date-fns to have consistent timestamps
vi.mock("date-fns", () => ({
  formatDistanceToNow: vi.fn((date: Date) => {
    const now = new Date("2024-01-15T15:00:00Z");
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours ago`;
  }),
}));

// Mock the session store module
const mockUpdateChangeNotes = vi.fn();
const mockUpdateDonutChangeNotes = vi.fn();
let mockEventsData: any[] = [];
let mockDonutEventsData: any[] = [];
let mockDonutModeActive: boolean = false;

vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn((selector) => {
    const state = {
      events: mockEventsData,
      donutEvents: mockDonutEventsData,
      donutModeActive: mockDonutModeActive,
      updateChangeNotes: mockUpdateChangeNotes,
      updateDonutChangeNotes: mockUpdateDonutChangeNotes,
    };
    return selector(state);
  }),
}));

describe("ChangeTrackerTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateChangeNotes.mockResolvedValue(undefined);
    mockUpdateDonutChangeNotes.mockResolvedValue(undefined);
    mockEventsData = [];
    mockDonutEventsData = [];
    mockDonutModeActive = false;
  });

  it("displays empty state when no changes exist", () => {
    mockEventsData = [];

    render(<ChangeTrackerTab />);

    expect(
      screen.getByText(getTranslatedText("panel.changeTrackerTab.noChanges"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        getTranslatedText("panel.changeTrackerTab.moveEmployeesHint")
      )
    ).toBeInTheDocument();
  });

  it("displays change tracker heading when changes exist", () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    expect(screen.getByText("Change Tracker")).toBeInTheDocument();
  });

  it("displays change list when changes exist", () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    // Now uses a list structure instead of table
    expect(screen.getByTestId("change-list")).toBeInTheDocument();
  });

  it("displays employee name correctly", () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });

  it("displays movement with position labels correctly", () => {
    mockEventsData = [mockChanges[0]]; // Growth [M,H] -> Star [H,H]

    render(<ChangeTrackerTab />);

    // Old position: Growth [M,H]
    expect(screen.getByText(/Growth.*\[M,H\]/)).toBeInTheDocument();
    // New position: Star [H,H]
    expect(screen.getByText(/Star.*\[H,H\]/)).toBeInTheDocument();
  });

  it("displays timestamp icons for changes", () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    // EventDisplay component shows timestamp icons
    const list = screen.getByTestId("change-list");
    expect(list).toBeInTheDocument();
    // Check that timestamp icon button is present (timestamp is in tooltip)
    const timeIcons = screen.getAllByRole("button");
    expect(timeIcons.length).toBeGreaterThan(0);
  });

  it("displays existing notes in TextField", () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    const notesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );
    expect(notesField).toBeInTheDocument();
  });

  it("displays empty TextField when notes are null", () => {
    mockEventsData = [mockChanges[2]]; // This one has notes: null

    render(<ChangeTrackerTab />);

    const notesField = screen.getByPlaceholderText(
      getTranslatedText("panel.changeTrackerTab.addNotesPlaceholder")
    );
    expect(notesField).toBeInTheDocument();
    expect(notesField).toHaveValue("");
  });

  it("displays placeholder text in notes field", () => {
    mockEventsData = [mockChanges[2]]; // notes: null

    render(<ChangeTrackerTab />);

    expect(
      screen.getByPlaceholderText(
        getTranslatedText("panel.changeTrackerTab.addNotesPlaceholder")
      )
    ).toBeInTheDocument();
  });

  it("calls updateChangeNotes when notes field is blurred after editing", async () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    const notesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );

    // Focus the field (to enter editing mode)
    fireEvent.focus(notesField);

    // Change the value
    fireEvent.change(notesField, {
      target: { value: "Updated notes for promotion" },
    });

    // Blur the field (to trigger save)
    fireEvent.blur(notesField);

    await waitFor(() => {
      expect(mockUpdateChangeNotes).toHaveBeenCalledWith(
        1,
        "Updated notes for promotion"
      );
    });
  });

  it("calls updateChangeNotes with empty string when notes are cleared", async () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    const notesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );

    fireEvent.focus(notesField);
    fireEvent.change(notesField, { target: { value: "" } });
    fireEvent.blur(notesField);

    await waitFor(() => {
      expect(mockUpdateChangeNotes).toHaveBeenCalledWith(1, "");
    });
  });

  it("sorts changes by most recent first", () => {
    mockEventsData = mockChanges; // Carol (14:20) should be first, then Bob (11:45), then Alice (10:30)

    render(<ChangeTrackerTab />);

    // Now using Paper cards instead of table rows
    const changeCards = screen.getAllByTestId(/^change-row-/);

    // Most recent: Carol White (14:20)
    expect(changeCards[0]).toHaveTextContent("Carol White");
    // Second: Bob Smith (11:45)
    expect(changeCards[1]).toHaveTextContent("Bob Smith");
    // Third: Alice Johnson (10:30)
    expect(changeCards[2]).toHaveTextContent("Alice Johnson");
  });

  it("displays multiple changes correctly", () => {
    mockEventsData = mockChanges;

    render(<ChangeTrackerTab />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("Carol White")).toBeInTheDocument();
  });

  it("handles focus and blur for different employees separately", async () => {
    mockEventsData = [mockChanges[0], mockChanges[1]];

    render(<ChangeTrackerTab />);

    // Get both notes fields
    const aliceNotesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );
    const bobNotesField = screen.getByDisplayValue(
      "Improvement after coaching"
    );

    // Edit Alice's notes
    fireEvent.focus(aliceNotesField);
    fireEvent.change(aliceNotesField, {
      target: { value: "Alice updated notes" },
    });
    fireEvent.blur(aliceNotesField);

    await waitFor(() => {
      expect(mockUpdateChangeNotes).toHaveBeenCalledWith(
        1,
        "Alice updated notes"
      );
    });

    // Edit Bob's notes
    fireEvent.focus(bobNotesField);
    fireEvent.change(bobNotesField, { target: { value: "Bob updated notes" } });
    fireEvent.blur(bobNotesField);

    await waitFor(() => {
      expect(mockUpdateChangeNotes).toHaveBeenCalledWith(
        2,
        "Bob updated notes"
      );
    });

    expect(mockUpdateChangeNotes).toHaveBeenCalledTimes(2);
  });

  it("displays correct position labels for all changes", () => {
    mockEventsData = mockChanges;

    render(<ChangeTrackerTab />);

    // Change 1: Growth [M,H] -> Star [H,H]
    expect(screen.getByText(/Growth.*\[M,H\]/)).toBeInTheDocument();
    // "Star [H,H]" appears twice (changes 1 and 3 both move to position 9)
    const starLabels = screen.getAllByText(/Star.*\[H,H\]/);
    expect(starLabels.length).toBeGreaterThanOrEqual(1);

    // Change 2: Inconsistent [L,M] -> Core Talent [M,M]
    expect(screen.getByText(/Inconsistent.*\[L,M\]/)).toBeInTheDocument();
    expect(screen.getByText(/Core Talent.*\[M,M\]/)).toBeInTheDocument();

    // Change 3: High Impact [H,M] -> Star [H,H]
    expect(screen.getByText(/High Impact.*\[H,M\]/)).toBeInTheDocument();
  });

  it("logs error to console when updateChangeNotes fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockError = new Error("Network error");
    mockUpdateChangeNotes.mockRejectedValue(mockError);

    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    const notesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );

    fireEvent.focus(notesField);
    fireEvent.change(notesField, { target: { value: "New notes" } });
    fireEvent.blur(notesField);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[ERROR] Failed to save notes",
        mockError
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("allows multiline notes in TextField", () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    const notesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );

    // Check that the field is multiline (has multiline prop)
    expect(notesField.tagName).toBe("TEXTAREA");
  });

  it("updates internal state when editing notes", () => {
    mockEventsData = [mockChanges[0]];

    render(<ChangeTrackerTab />);

    const notesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );

    fireEvent.focus(notesField);
    fireEvent.change(notesField, {
      target: { value: "New value while editing" },
    });

    // While focused, the field should show the new value
    expect(notesField).toHaveValue("New value while editing");
  });

  it("renders change with unique key based on employee_id and timestamp", () => {
    // This tests that the key is properly formed to avoid React warnings
    mockEventsData = mockChanges;

    // Should not throw any console warnings about duplicate keys
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    render(<ChangeTrackerTab />);

    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  // ==================== Donut Mode Tests ====================

  it("displays tabs when donut mode is active", () => {
    mockEventsData = [mockChanges[0]];
    mockDonutModeActive = true;

    render(<ChangeTrackerTab />);

    expect(screen.getByTestId("regular-changes-tab")).toBeInTheDocument();
    expect(screen.getByTestId("donut-changes-tab")).toBeInTheDocument();
  });

  it("displays tabs when donut changes exist even if donut mode is inactive", () => {
    mockEventsData = [mockChanges[0]];
    mockDonutEventsData = [mockChanges[1]];
    mockDonutModeActive = false;

    render(<ChangeTrackerTab />);

    expect(screen.getByTestId("regular-changes-tab")).toBeInTheDocument();
    expect(screen.getByTestId("donut-changes-tab")).toBeInTheDocument();
  });

  it("does not display tabs when donut mode is inactive and no donut changes exist", () => {
    mockEventsData = [mockChanges[0]];
    mockDonutModeActive = false;

    render(<ChangeTrackerTab />);

    expect(screen.queryByTestId("regular-changes-tab")).not.toBeInTheDocument();
    expect(screen.queryByTestId("donut-changes-tab")).not.toBeInTheDocument();
  });

  it("displays donut changes in donut changes tab", () => {
    mockEventsData = [];
    mockDonutEventsData = [mockChanges[0]];
    mockDonutModeActive = true;

    render(<ChangeTrackerTab />);

    // Switch to donut changes tab
    fireEvent.click(screen.getByTestId("donut-changes-tab"));

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });

  it("displays empty state for donut changes when no donut changes exist", () => {
    mockEventsData = [mockChanges[0]];
    mockDonutEventsData = [];
    mockDonutModeActive = true;

    render(<ChangeTrackerTab />);

    // Switch to donut changes tab
    fireEvent.click(screen.getByTestId("donut-changes-tab"));

    expect(
      screen.getByText(
        getTranslatedText("panel.changeTrackerTab.noDonutChanges")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        getTranslatedText("panel.changeTrackerTab.moveEmployeesDonutHint")
      )
    ).toBeInTheDocument();
  });

  it("calls updateDonutChangeNotes when donut change notes are edited", async () => {
    mockEventsData = [];
    mockDonutEventsData = [mockChanges[0]];
    mockDonutModeActive = true;

    render(<ChangeTrackerTab />);

    // Switch to donut changes tab
    fireEvent.click(screen.getByTestId("donut-changes-tab"));

    const notesField = screen.getByDisplayValue(
      "Promoted after successful project delivery"
    );

    fireEvent.focus(notesField);
    fireEvent.change(notesField, { target: { value: "Donut notes updated" } });
    fireEvent.blur(notesField);

    await waitFor(() => {
      expect(mockUpdateDonutChangeNotes).toHaveBeenCalledWith(
        1,
        "Donut notes updated"
      );
    });

    expect(mockUpdateChangeNotes).not.toHaveBeenCalled();
  });

  it("displays donut changes with secondary color chip", () => {
    mockEventsData = [];
    mockDonutEventsData = [mockChanges[0]];
    mockDonutModeActive = true;

    render(<ChangeTrackerTab />);

    // Switch to donut changes tab
    fireEvent.click(screen.getByTestId("donut-changes-tab"));

    // Check that the new position chip exists (we can't directly check color in JSDOM)
    expect(screen.getByText(/Star.*\[H,H\]/)).toBeInTheDocument();
  });

  it("displays correct change counts in tab labels", () => {
    mockEventsData = [mockChanges[0], mockChanges[1]];
    mockDonutEventsData = [mockChanges[2]];
    mockDonutModeActive = true;

    render(<ChangeTrackerTab />);

    const gridChangesLabel = `${getTranslatedText("panel.changeTrackerTab.gridChanges")} (2)`;
    const donutChangesLabel = `${getTranslatedText("panel.changeTrackerTab.donutChanges")} (1)`;
    expect(screen.getByText(gridChangesLabel)).toBeInTheDocument();
    expect(screen.getByText(donutChangesLabel)).toBeInTheDocument();
  });

  it("switches between regular and donut changes tabs correctly", () => {
    mockEventsData = [mockChanges[0]];
    mockDonutEventsData = [mockChanges[1]];
    mockDonutModeActive = true;

    render(<ChangeTrackerTab />);

    // Initially on regular changes tab
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();

    // Switch to donut changes tab
    fireEvent.click(screen.getByTestId("donut-changes-tab"));

    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();

    // Switch back to regular changes tab
    fireEvent.click(screen.getByTestId("regular-changes-tab"));

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
  });
});
