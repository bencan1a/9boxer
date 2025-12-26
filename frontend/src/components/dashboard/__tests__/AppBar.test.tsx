import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppBar } from "../AppBar";
import { useSessionStore } from "../../../store/sessionStore";
import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "../../../theme/theme";
import { I18nTestWrapper } from "../../../test/i18nTestUtils";

// Mock dependencies
vi.mock("../../../store/sessionStore");
vi.mock("../../../hooks/useFilters", () => ({
  useFilters: () => ({
    toggleDrawer: vi.fn(),
    hasActiveFilters: false,
    applyFilters: (employees: any[]) => employees,
    selectedLevels: [],
    selectedJobFunctions: [],
    selectedLocations: [],
    selectedManagers: [],
    excludedEmployeeIds: [],
  }),
}));
vi.mock("../../../contexts/SnackbarContext", () => ({
  useSnackbar: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Wrapper with theme and i18n providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = getTheme("light");
  return (
    <I18nTestWrapper>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </I18nTestWrapper>
  );
};

describe("AppBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 9Boxer title", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: null,
      employees: [],
      changes: [],
      filename: null,
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    expect(screen.getByText("9Boxer")).toBeInTheDocument();
  });

  it("renders FileMenu component", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: "test-session",
      employees: [],
      changes: [],
      filename: "test.xlsx",
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    // FileMenu should be present (look for its button)
    expect(screen.getByTestId("file-menu-button")).toBeInTheDocument();
  });

  it("renders Filter button", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: "test-session",
      employees: [],
      changes: [],
      filename: "test.xlsx",
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    const filterButton = screen.getByTestId("filter-button");
    expect(filterButton).toBeInTheDocument();
  });

  it("renders Settings button", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: null,
      employees: [],
      changes: [],
      filename: null,
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    const settingsButton = screen.getByTestId("settings-button");
    expect(settingsButton).toBeInTheDocument();
  });

  it("renders Help button", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: null,
      employees: [],
      changes: [],
      filename: null,
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    const helpButton = screen.getByTestId("help-button");
    expect(helpButton).toBeInTheDocument();
  });

  it("disables Filter button when no session is active", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: null,
      employees: [],
      changes: [],
      filename: null,
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    const filterButton = screen.getByTestId("filter-button");
    expect(filterButton).toBeDisabled();
  });

  it("enables Filter button when session is active", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: "test-session",
      employees: [],
      changes: [],
      filename: "test.xlsx",
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    const filterButton = screen.getByTestId("filter-button");
    expect(filterButton).not.toBeDisabled();
  });

  it("does not render Import button (moved to FileMenu)", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: "test-session",
      employees: [],
      changes: [],
      filename: "test.xlsx",
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    // Import button is no longer in AppBar
    const importButton = screen.queryByText("Import");
    expect(importButton).not.toBeInTheDocument();
  });

  it("does not render Apply button (moved to FileMenu)", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: "test-session",
      employees: [],
      changes: [
        {
          employee_id: 1,
          old_performance: "3",
          old_potential: "3",
          new_performance: "4",
          new_potential: "4",
        },
      ],
      filename: "test.xlsx",
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    // Apply button is no longer in AppBar
    const applyButton = screen.queryByText(/Apply/);
    expect(applyButton).not.toBeInTheDocument();
  });

  it("does not render Donut Mode button (moved to grid)", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: "test-session",
      employees: [],
      changes: [],
      filename: "test.xlsx",
      donutModeActive: false,
      toggleDonutMode: vi.fn(),
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    // Donut Mode button is no longer in AppBar
    const donutButton = screen.queryByTestId("donut-mode-button");
    expect(donutButton).not.toBeInTheDocument();
  });

  it("opens Settings dialog when Settings button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: "test-session",
      employees: [],
      changes: [],
      filename: "test.xlsx",
    } as any);

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    );

    const settingsButton = screen.getByTestId("settings-button");
    await user.click(settingsButton);

    // SettingsDialog should open (check for dialog content)
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
