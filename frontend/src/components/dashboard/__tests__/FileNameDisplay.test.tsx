import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileNameDisplay } from "../FileNameDisplay";
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

describe("FileNameDisplay", () => {
  it("displays file name when provided", () => {
    render(
      <TestWrapper>
        <FileNameDisplay fileName="employees.xlsx" />
      </TestWrapper>
    );

    expect(screen.getByTestId("file-name-display")).toHaveTextContent(
      "employees.xlsx"
    );
  });

  it("displays placeholder when no file name provided", () => {
    render(
      <TestWrapper>
        <FileNameDisplay />
      </TestWrapper>
    );

    expect(screen.getByTestId("file-name-display")).toHaveTextContent(
      "No file selected"
    );
  });

  it("shows asterisk when there are unsaved changes", () => {
    render(
      <TestWrapper>
        <FileNameDisplay fileName="employees.xlsx" hasUnsavedChanges={true} />
      </TestWrapper>
    );

    const display = screen.getByTestId("file-name-display");
    expect(display).toHaveTextContent("employees.xlsx *");
  });

  it("does not show asterisk when there are no unsaved changes", () => {
    render(
      <TestWrapper>
        <FileNameDisplay fileName="employees.xlsx" hasUnsavedChanges={false} />
      </TestWrapper>
    );

    const display = screen.getByTestId("file-name-display");
    expect(display).toHaveTextContent("employees.xlsx");
    expect(display).not.toHaveTextContent("*");
  });

  it("does not show asterisk for placeholder text", () => {
    render(
      <TestWrapper>
        <FileNameDisplay hasUnsavedChanges={true} />
      </TestWrapper>
    );

    const display = screen.getByTestId("file-name-display");
    expect(display).not.toHaveTextContent("*");
  });
});
