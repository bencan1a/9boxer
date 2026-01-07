import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileMenuButton } from "../FileMenuButton";
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

describe("FileMenuButton", () => {
  it("renders with file name", () => {
    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={0}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId("file-menu-button")).toBeInTheDocument();
    expect(screen.getByText("employees.xlsx")).toBeInTheDocument();
  });

  it("renders placeholder when no file name", () => {
    render(
      <TestWrapper>
        <FileMenuButton
          changeCount={0}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText("No file selected")).toBeInTheDocument();
  });

  it("displays change count badge", () => {
    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={5}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("opens menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={0}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("file-menu-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("file-menu")).toBeInTheDocument();
    });
  });

  it("calls onImportClick when import menu item is clicked", async () => {
    const user = userEvent.setup();
    const onImportClick = vi.fn();

    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={0}
          onImportClick={onImportClick}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("file-menu-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("file-menu")).toBeInTheDocument();
    });

    const importItem = screen.getByTestId("import-data-menu-item");
    await user.click(importItem);

    expect(onImportClick).toHaveBeenCalledOnce();
  });

  it("calls onExportClick when export menu item is clicked", async () => {
    const user = userEvent.setup();
    const onExportClick = vi.fn();

    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={3}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={onExportClick}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("file-menu-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("file-menu")).toBeInTheDocument();
    });

    const exportItem = screen.getByTestId("export-changes-menu-item");
    await user.click(exportItem);

    expect(onExportClick).toHaveBeenCalledOnce();
  });

  it("hides export when no changes", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={0}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("file-menu-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("file-menu")).toBeInTheDocument();
    });

    // Export menu item should not exist when there are no changes
    const exportItem = screen.queryByTestId("export-changes-menu-item");
    expect(exportItem).not.toBeInTheDocument();
  });

  it("disables export when isExporting is true", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={3}
          isExporting={true}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("file-menu-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("file-menu")).toBeInTheDocument();
    });

    const exportItem = screen.getByTestId("export-changes-menu-item");
    expect(exportItem).toHaveAttribute("aria-disabled", "true");
  });

  it("disables button when disabled prop is true", () => {
    render(
      <TestWrapper>
        <FileMenuButton
          fileName="employees.xlsx"
          changeCount={0}
          disabled={true}
          onImportClick={vi.fn()}
          onLoadSampleClick={vi.fn()}
          onExportClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("file-menu-button");
    expect(button).toBeDisabled();
  });
});
