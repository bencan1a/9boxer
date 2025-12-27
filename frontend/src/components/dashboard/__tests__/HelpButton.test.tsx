import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelpButton } from "../HelpButton";
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

describe("HelpButton", () => {
  it("renders help button", () => {
    render(
      <TestWrapper>
        <HelpButton
          onUserGuideClick={vi.fn()}
          onAboutClick={vi.fn()}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  it("opens menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <HelpButton
          onUserGuideClick={vi.fn()}
          onAboutClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("help-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("help-menu")).toBeInTheDocument();
    });
  });

  it("calls onUserGuideClick when user guide menu item is clicked", async () => {
    const user = userEvent.setup();
    const onUserGuideClick = vi.fn();

    render(
      <TestWrapper>
        <HelpButton
          onUserGuideClick={onUserGuideClick}
          onAboutClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("help-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("help-menu")).toBeInTheDocument();
    });

    const userGuideItem = screen.getByTestId("user-guide-menu-item");
    await user.click(userGuideItem);

    expect(onUserGuideClick).toHaveBeenCalledOnce();
  });

  it("calls onAboutClick when about menu item is clicked", async () => {
    const user = userEvent.setup();
    const onAboutClick = vi.fn();

    render(
      <TestWrapper>
        <HelpButton
          onUserGuideClick={vi.fn()}
          onAboutClick={onAboutClick}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("help-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("help-menu")).toBeInTheDocument();
    });

    const aboutItem = screen.getByTestId("about-menu-item");
    await user.click(aboutItem);

    expect(onAboutClick).toHaveBeenCalledOnce();
  });

  it("disables button when disabled prop is true", () => {
    render(
      <TestWrapper>
        <HelpButton
          disabled={true}
          onUserGuideClick={vi.fn()}
          onAboutClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("help-button");
    expect(button).toBeDisabled();
  });

  it("closes menu after selecting an item", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <HelpButton
          onUserGuideClick={vi.fn()}
          onAboutClick={vi.fn()}
        />
      </TestWrapper>
    );

    const button = screen.getByTestId("help-button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("help-menu")).toBeInTheDocument();
    });

    const userGuideItem = screen.getByTestId("user-guide-menu-item");
    await user.click(userGuideItem);

    await waitFor(() => {
      expect(screen.queryByTestId("help-menu")).not.toBeInTheDocument();
    });
  });
});
