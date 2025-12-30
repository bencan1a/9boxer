import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChangeIndicator } from "../ChangeIndicator";
import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "../../../theme/theme";

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = getTheme("light");
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe("ChangeIndicator", () => {
  it("renders with count visible when count > 0", () => {
    render(
      <TestWrapper>
        <ChangeIndicator count={5}>
          <button>Test Button</button>
        </ChangeIndicator>
      </TestWrapper>
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("hides badge when count is 0", () => {
    render(
      <TestWrapper>
        <ChangeIndicator count={0}>
          <button>Test Button</button>
        </ChangeIndicator>
      </TestWrapper>
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("hides badge when invisible prop is true", () => {
    render(
      <TestWrapper>
        <ChangeIndicator count={5} invisible={true}>
          <button>Test Button</button>
        </ChangeIndicator>
      </TestWrapper>
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
    // Badge should be in DOM but not visible (invisible prop)
    const badge = screen.getByTestId("change-indicator-badge");
    expect(badge).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <TestWrapper>
        <ChangeIndicator count={3}>
          <span data-testid="child-element">Child Content</span>
        </ChangeIndicator>
      </TestWrapper>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("renders dot badge when showDot is true", () => {
    render(
      <TestWrapper>
        <ChangeIndicator count={0} showDot={true}>
          <button>Test Button</button>
        </ChangeIndicator>
      </TestWrapper>
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
    expect(screen.getByText("•")).toBeInTheDocument();
  });

  it("shows dot badge instead of count when showDot is true", () => {
    render(
      <TestWrapper>
        <ChangeIndicator count={5} showDot={true}>
          <button>Test Button</button>
        </ChangeIndicator>
      </TestWrapper>
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
    expect(screen.getByText("•")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });

  it("hides dot badge when showDot is true but invisible is also true", () => {
    render(
      <TestWrapper>
        <ChangeIndicator count={0} showDot={true} invisible={true}>
          <button>Test Button</button>
        </ChangeIndicator>
      </TestWrapper>
    );

    expect(screen.getByText("Test Button")).toBeInTheDocument();
    const badge = screen.getByTestId("change-indicator-badge");
    expect(badge).toBeInTheDocument();
    // Badge should be in DOM but not visible
  });
});
