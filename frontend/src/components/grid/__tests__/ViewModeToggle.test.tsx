import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "../../../test/utils";
import userEvent from "@testing-library/user-event";
import { ViewModeToggle } from "../ViewModeToggle";
import { useSessionStore } from "../../../store/sessionStore";
import { getTranslatedText } from "../../../test/i18nTestUtils";

// Mock dependencies
vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn(),
  selectSessionId: vi.fn((state) => state.sessionId),
  selectDonutModeActive: vi.fn((state) => state.donutModeActive),
  selectToggleDonutMode: vi.fn((state) => state.toggleDonutMode),
}));

describe("ViewModeToggle", () => {
  const mockToggleDonutMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Grid and Donut view buttons", () => {
    // Mock selector-based store access
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    // Check for toggle button group
    const toggleGroup = screen.getByTestId("view-mode-toggle");
    expect(toggleGroup).toBeInTheDocument();

    // Check for grid and donut buttons
    const gridButton = screen.getByTestId("grid-view-button");
    const donutButton = screen.getByTestId("donut-view-button");
    expect(gridButton).toBeInTheDocument();
    expect(donutButton).toBeInTheDocument();
  });

  it("shows Grid mode as selected when donutModeActive is false", () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByTestId("grid-view-button");
    const donutButton = screen.getByTestId("donut-view-button");

    // Grid button should be selected (aria-pressed="true")
    expect(gridButton).toHaveAttribute("aria-pressed", "true");
    expect(donutButton).toHaveAttribute("aria-pressed", "false");
  });

  it("shows Donut mode as selected when donutModeActive is true", () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: true,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByTestId("grid-view-button");
    const donutButton = screen.getByTestId("donut-view-button");

    // Donut button should be selected (aria-pressed="true")
    expect(gridButton).toHaveAttribute("aria-pressed", "false");
    expect(donutButton).toHaveAttribute("aria-pressed", "true");
  });

  it("calls toggleDonutMode with true when Donut button is clicked from Grid mode", async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const donutButton = screen.getByTestId("donut-view-button");
    await user.click(donutButton);

    await waitFor(() => {
      expect(mockToggleDonutMode).toHaveBeenCalledWith(true);
    });
  });

  it("calls toggleDonutMode with false when Grid button is clicked from Donut mode", async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: true,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByTestId("grid-view-button");
    await user.click(gridButton);

    await waitFor(() => {
      expect(mockToggleDonutMode).toHaveBeenCalledWith(false);
    });
  });

  it("is disabled when no sessionId exists", () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: null,
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByTestId("grid-view-button");
    const donutButton = screen.getByTestId("donut-view-button");

    // When disabled, both buttons should be disabled
    expect(gridButton).toBeDisabled();
    expect(donutButton).toBeDisabled();
  });

  it("is enabled when sessionId exists", () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByTestId("grid-view-button");
    const donutButton = screen.getByTestId("donut-view-button");

    // When enabled, buttons should not be disabled
    expect(gridButton).not.toBeDisabled();
    expect(donutButton).not.toBeDisabled();
  });

  it("shows Grid mode active tooltip when in Grid mode", async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const toggleGroup = screen.getByTestId("view-mode-toggle");

    // Hover to trigger tooltip
    await user.hover(toggleGroup);

    // Check for dynamic tooltip text showing Grid mode is active
    await waitFor(() => {
      const tooltip = screen.queryByText(
        getTranslatedText("grid.viewModeToggle.gridViewActive")
      );
      expect(tooltip).toBeInTheDocument();
    });
  });

  it("shows Donut mode active tooltip when in Donut mode", async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: true,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const toggleGroup = screen.getByTestId("view-mode-toggle");

    // Hover to trigger tooltip
    await user.hover(toggleGroup);

    // Check for dynamic tooltip text showing Donut mode is active
    await waitFor(() => {
      const tooltip = screen.queryByText(
        getTranslatedText("grid.viewModeToggle.donutViewActive")
      );
      expect(tooltip).toBeInTheDocument();
    });
  });

  it("does not change mode when clicking the already selected button", async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const gridButton = screen.getByTestId("grid-view-button");
    await user.click(gridButton);

    // Should not call toggleDonutMode because grid is already selected
    expect(mockToggleDonutMode).not.toHaveBeenCalled();
  });

  it("responds to keyboard shortcut (D key) to toggle mode", async () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    // Simulate pressing 'D' key
    fireEvent.keyDown(window, { key: "d", code: "KeyD" });

    await waitFor(() => {
      expect(mockToggleDonutMode).toHaveBeenCalledWith(true);
    });
  });

  it("does not respond to keyboard shortcut when no session exists", async () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: null,
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    // Simulate pressing 'D' key
    fireEvent.keyDown(window, { key: "d", code: "KeyD" });

    // Should not toggle because no session exists
    expect(mockToggleDonutMode).not.toHaveBeenCalled();
  });

  it("does not respond to keyboard shortcut with modifier keys", async () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    // Simulate pressing 'Ctrl+D'
    fireEvent.keyDown(window, { key: "d", code: "KeyD", ctrlKey: true });

    // Should not toggle because modifier key is pressed
    expect(mockToggleDonutMode).not.toHaveBeenCalled();
  });

  it("has correct ARIA labels for accessibility", () => {
    vi.mocked(useSessionStore).mockImplementation((selector: any) => {
      const state = {
        sessionId: "test-session",
        donutModeActive: false,
        toggleDonutMode: mockToggleDonutMode,
      };
      return selector(state);
    });

    render(<ViewModeToggle />);

    const toggleGroup = screen.getByTestId("view-mode-toggle");
    expect(toggleGroup).toHaveAttribute(
      "aria-label",
      getTranslatedText("grid.viewModeToggle.ariaLabelToggle")
    );

    const gridButton = screen.getByTestId("grid-view-button");
    expect(gridButton).toHaveAttribute(
      "aria-label",
      getTranslatedText("grid.viewModeToggle.ariaLabelGrid")
    );

    const donutButton = screen.getByTestId("donut-view-button");
    expect(donutButton).toHaveAttribute(
      "aria-label",
      getTranslatedText("grid.viewModeToggle.ariaLabelDonut")
    );
  });
});
