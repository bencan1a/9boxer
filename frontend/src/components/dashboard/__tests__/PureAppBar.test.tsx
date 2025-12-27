import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PureAppBar } from "../PureAppBar";
import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "../../../theme/theme";
import { I18nTestWrapper } from "../../../test/i18nTestUtils";

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = getTheme("light");
  return (
    <I18nTestWrapper>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </I18nTestWrapper>
  );
};

describe("PureAppBar", () => {
  const defaultProps = {
    hasActiveFilters: false,
    filterTooltip: "Filter employees",
    isFilterDisabled: false,
    changeCount: 0,
    onImportClick: vi.fn(),
    onExportClick: vi.fn(),
    onFilterClick: vi.fn(),
    onSettingsClick: vi.fn(),
    onUserGuideClick: vi.fn(),
    onAboutClick: vi.fn(),
  };

  it("renders app title", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("9Boxer")).toBeInTheDocument();
  });

  it("renders file menu button", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} fileName="employees.xlsx" />
      </TestWrapper>
    );

    expect(screen.getByTestId("file-menu-button")).toBeInTheDocument();
  });

  it("renders filter button", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId("filter-button")).toBeInTheDocument();
  });

  it("renders settings button", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId("settings-button")).toBeInTheDocument();
  });

  it("renders help button", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("displays file name when provided", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} fileName="employees.xlsx" />
      </TestWrapper>
    );

    expect(screen.getByText("employees.xlsx")).toBeInTheDocument();
  });

  it("displays placeholder when no file name", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText("No file selected")).toBeInTheDocument();
  });

  it("displays change count badge", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} changeCount={5} fileName="test.xlsx" />
      </TestWrapper>
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows filter badge when filters are active", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} hasActiveFilters={true} />
      </TestWrapper>
    );

    const badge = screen.getByTestId("filter-badge");
    expect(badge).toBeInTheDocument();
  });

  it("disables filter button when isFilterDisabled is true", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} isFilterDisabled={true} />
      </TestWrapper>
    );

    const filterButton = screen.getByTestId("filter-button");
    expect(filterButton).toBeDisabled();
  });

  it("enables filter button when isFilterDisabled is false", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} isFilterDisabled={false} />
      </TestWrapper>
    );

    const filterButton = screen.getByTestId("filter-button");
    expect(filterButton).not.toBeDisabled();
  });

  it("calls onFilterClick when filter button is clicked", async () => {
    const user = userEvent.setup();
    const onFilterClick = vi.fn();

    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} onFilterClick={onFilterClick} />
      </TestWrapper>
    );

    const filterButton = screen.getByTestId("filter-button");
    await user.click(filterButton);

    expect(onFilterClick).toHaveBeenCalledOnce();
  });

  it("calls onSettingsClick when settings button is clicked", async () => {
    const user = userEvent.setup();
    const onSettingsClick = vi.fn();

    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} onSettingsClick={onSettingsClick} />
      </TestWrapper>
    );

    const settingsButton = screen.getByTestId("settings-button");
    await user.click(settingsButton);

    expect(onSettingsClick).toHaveBeenCalledOnce();
  });

  it("passes isExporting prop to FileMenuButton", () => {
    render(
      <TestWrapper>
        <PureAppBar {...defaultProps} isExporting={true} changeCount={3} />
      </TestWrapper>
    );

    // FileMenuButton should be rendered
    expect(screen.getByTestId("file-menu-button")).toBeInTheDocument();
  });
});
