import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { SettingsDialog } from "./SettingsDialog";

/**
 * SettingsDialog provides user preferences and application settings.
 * Accessed from the top toolbar settings button.
 *
 * **Settings Sections:**
 * 1. **Appearance** - Theme mode selection
 *    - Light Mode: Always light theme
 *    - Dark Mode: Always dark theme
 *    - Auto: Follow system preference
 *
 * 2. **Language** - UI language selection
 *    - English
 *    - Spanish (Español)
 *
 * **Key Features:**
 * - Modal dialog with close button
 * - Radio button group for theme selection
 * - Dropdown selector for language
 * - Current selection preview showing effective theme
 * - Auto mode displays current system preference
 * - Persists settings to localStorage
 *
 * **Theme Integration:**
 * - Connects to uiStore for theme state
 * - Updates immediately on selection
 * - System preference detection for auto mode
 *
 * **Language Integration:**
 * - Connects to i18n for language changes
 * - Supports language variants (e.g., en-US → en)
 * - Updates all UI text immediately
 *
 * **Data Attributes:**
 * - `data-testid="language-select"` - Language dropdown
 * - `data-testid="language-option-{code}"` - Language options
 */
const meta: Meta<typeof SettingsDialog> = {
  title: "Settings/SettingsDialog",
  component: SettingsDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the dialog is open",
    },
    onClose: {
      description: "Callback fired when dialog is closed",
      action: "closed",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDialog>;

/**
 * Closed state.
 * Dialog is not visible. Useful for API documentation.
 * In actual usage, dialog is opened via toolbar button.
 */
export const Closed: Story = {
  args: {
    open: false,
    onClose: fn(),
  },
};

/**
 * Open state showing settings dialog.
 * Default view when user clicks settings button.
 * Shows all preference sections with current selections.
 */
export const Open: Story = {
  args: {
    open: true,
    onClose: fn(),
  },
};

/**
 * Open with light theme selected.
 * Shows dialog with light mode preference active.
 * Current selection preview displays light theme icon.
 */
export const LightThemeSelected: Story = {
  args: {
    open: true,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Settings dialog with light theme mode selected. The current selection preview shows the light mode icon and "Light Mode" label.',
      },
    },
  },
};

/**
 * Open with dark theme selected.
 * Shows dialog with dark mode preference active.
 * Current selection preview displays dark theme icon.
 */
export const DarkThemeSelected: Story = {
  args: {
    open: true,
    onClose: fn(),
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story:
          "Settings dialog with dark theme mode selected. Best viewed with dark background in Storybook. The current selection preview shows the dark mode icon.",
      },
    },
  },
};

/**
 * Open with auto theme mode selected.
 * Shows dialog with system preference mode active.
 * Current selection preview displays current effective theme (light or dark).
 */
export const AutoThemeSelected: Story = {
  args: {
    open: true,
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Settings dialog with auto theme mode selected. The preview section shows both the auto mode icon and the current effective theme based on system preference.",
      },
    },
  },
};
