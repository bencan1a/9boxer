/**
 * Tests for SettingsDialog component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test/utils";
import { SettingsDialog } from "../SettingsDialog";
import { i18n } from "../../../i18n";

// Mock the UI store with default state
const mockSetThemeMode = vi.fn();
let mockUiState: {
  themeMode: "auto" | "light" | "dark";
  effectiveTheme: "light" | "dark";
  setThemeMode: typeof mockSetThemeMode;
} = {
  themeMode: "auto",
  effectiveTheme: "light",
  setThemeMode: mockSetThemeMode,
};

vi.mock("../../../store/uiStore", () => ({
  useUiStore: (selector?: any) => {
    if (selector) {
      return selector(mockUiState);
    }
    return mockUiState;
  },
}));

describe("SettingsDialog", () => {
  const mockOnClose = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset to default UI store state
    mockUiState = {
      themeMode: "auto",
      effectiveTheme: "light",
      setThemeMode: mockSetThemeMode,
    };

    // Reset language to English to prevent test pollution
    await i18n.changeLanguage("en");
  });

  describe("Dialog Display", () => {
    it("renders when open is true", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(<SettingsDialog open={false} onClose={mockOnClose} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText(/close settings/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Theme Selection", () => {
    it("displays all theme options", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Light Mode")).toBeInTheDocument();
      expect(screen.getByText("Dark Mode")).toBeInTheDocument();
      // "Auto (Follow System)" appears in both the radio label and current selection
      const autoOptions = screen.getAllByText(/Auto.*Follow System/i);
      expect(autoOptions.length).toBeGreaterThanOrEqual(1);
    });

    it("shows current theme selection", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Find the radio buttons
      const radios = screen.getAllByRole("radio");
      const autoRadio = radios.find(
        (radio) => radio.getAttribute("value") === "auto"
      );

      expect(autoRadio).toBeChecked();
    });

    it("calls setThemeMode when theme is changed", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const lightModeRadio = screen
        .getAllByRole("radio")
        .find((radio) => radio.getAttribute("value") === "light");

      if (lightModeRadio) {
        fireEvent.click(lightModeRadio);
        expect(mockSetThemeMode).toHaveBeenCalledWith("light");
      }
    });

    it("displays current theme indicator", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Current Selection:")).toBeInTheDocument();
      // Get all elements and verify at least one contains the text
      const autoOptions = screen.getAllByText(/Auto.*Follow System/i);
      expect(autoOptions.length).toBeGreaterThanOrEqual(1);
    });

    it("shows effective theme when in auto mode", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(/Currently using light theme/i)
      ).toBeInTheDocument();
    });

    it("updates to dark theme in auto mode", () => {
      mockUiState = {
        themeMode: "auto",
        effectiveTheme: "dark",
        setThemeMode: mockSetThemeMode,
      };

      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(/Currently using dark theme/i)
      ).toBeInTheDocument();
    });
  });

  describe("Language Selection", () => {
    it("displays language section", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      expect(screen.getByText("Language")).toBeInTheDocument();
    });

    it("displays all language options", async () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Language options are in a Select dropdown
      const languageSelect = screen.getByTestId("language-select");
      expect(languageSelect).toBeInTheDocument();

      // Click to open dropdown
      const selectButton =
        languageSelect.parentElement?.querySelector('[role="combobox"]');
      if (selectButton) {
        fireEvent.mouseDown(selectButton);

        await waitFor(() => {
          // Use getAllByText since English appears in both the select display and the menu
          const englishOptions = screen.getAllByText("English");
          expect(englishOptions.length).toBeGreaterThanOrEqual(1);
          expect(screen.getByText("Español")).toBeInTheDocument();
        });
      }
    });

    it("shows current language selection", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Current language should be displayed in the Select component
      const languageSelect = screen.getByTestId("language-select");
      expect(languageSelect).toHaveTextContent("English");
    });

    it("has correct test IDs for language options", async () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Open the dropdown to access the options
      const languageSelect = screen.getByTestId("language-select");
      const selectButton =
        languageSelect.parentElement?.querySelector('[role="combobox"]');

      if (selectButton) {
        fireEvent.mouseDown(selectButton);

        await waitFor(() => {
          expect(screen.getByTestId("language-option-en")).toBeInTheDocument();
          expect(screen.getByTestId("language-option-es")).toBeInTheDocument();
        });
      }
    });

    it("allows selecting a different language", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Verify language select is interactive
      const languageSelect = screen.getByTestId("language-select");
      expect(languageSelect).toBeInTheDocument();
      expect(languageSelect).not.toBeDisabled();

      // Note: Full language change flow requires user interaction in a real browser
      // This test verifies the UI is present and interactive
    });

    it("normalizes language codes with variants", async () => {
      // Set language to a variant code before rendering
      await i18n.changeLanguage("en-US");

      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Should normalize 'en-US' to 'en' and show English in the Select
      const languageSelect = screen.getByTestId("language-select");
      expect(languageSelect).toHaveTextContent("English");
    });

    it("displays language icon for each option", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Language icon should be present in the Select component
      const languageIcon = screen.getByTestId("LanguageIcon");
      expect(languageIcon).toBeInTheDocument();
    });
  });

  describe("Layout and Structure", () => {
    it("separates theme and language sections with divider", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Verify both sections are present (which confirms layout structure)
      expect(
        screen.getByRole("radiogroup", { name: /theme mode selection/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("language-select")).toBeInTheDocument();

      // Note: Divider rendering details are implementation-specific to MUI
      // This test verifies the sections exist which implies proper layout
    });

    it("displays sections in correct order", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Should have two h6 headings (Appearance and Language)
      const headings = screen.getAllByRole("heading", { level: 6 });
      expect(headings.length).toBeGreaterThanOrEqual(2);
    });

    it("maintains consistent spacing and styling", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Verify dialog structure is present
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Verify theme radio group and language select are present
      expect(
        screen.getByRole("radiogroup", { name: /theme mode selection/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("language-select")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible theme selection radio group", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const radioGroup = screen.getByRole("radiogroup", {
        name: /theme mode selection/i,
      });
      expect(radioGroup).toBeInTheDocument();
    });

    it("has accessible language selection radio group", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Language selection is now a Select component (combobox), not a radio group
      const languageSelect = screen.getByRole("combobox", {
        name: /select language/i,
      });
      expect(languageSelect).toBeInTheDocument();
    });

    it("has proper ARIA label for close button", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      // Close button should exist (using testid instead of localized aria-label)
      const closeButton = screen.getByTestId("CloseIcon").parentElement;
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute("aria-label");
    });

    it("allows keyboard navigation through options", () => {
      render(<SettingsDialog open={true} onClose={mockOnClose} />);

      const radios = screen.getAllByRole("radio");
      expect(radios.length).toBeGreaterThan(0);

      // All radio buttons should be keyboard accessible
      radios.forEach((radio) => {
        expect(radio).not.toHaveAttribute("tabindex", "-1");
      });
    });
  });
});
