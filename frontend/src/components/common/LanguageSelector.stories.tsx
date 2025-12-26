import type { Meta, StoryObj } from "@storybook/react-vite";
import { LanguageSelector } from "./LanguageSelector";
import { Box } from "@mui/material";

const meta: Meta<typeof LanguageSelector> = {
  title: "Common/LanguageSelector",
  component: LanguageSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Language selector dropdown for switching between supported languages. " +
          "Currently supports English and Spanish (Español). " +
          "The selected language is persisted to localStorage and affects all UI text. " +
          "Includes a language icon and a compact dropdown menu.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ padding: 2, minWidth: 200 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LanguageSelector>;

/**
 * Default state with English selected.
 * The initial language when the app is first loaded (or no preference is saved).
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default state showing English as the selected language. " +
          "The language selector displays a globe icon and the current language name. " +
          "Clicking opens a dropdown with all available languages.",
      },
    },
  },
};

/**
 * Spanish selected - shows Español in the dropdown.
 * Demonstrates the language selector with Spanish as the active language.
 */
export const SpanishSelected: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When Spanish is selected, the dropdown shows "Español". ' +
          "This affects all translatable text throughout the application. " +
          "The selection is automatically saved to localStorage.",
      },
    },
  },
  play: async () => {
    // Note: In actual implementation, this would trigger i18n.changeLanguage('es')
    // In Storybook, the language is controlled by the i18n instance
  },
};

/**
 * All languages available - shows the full dropdown menu.
 * Demonstrates all supported languages in the selector.
 */
export const AllLanguagesAvailable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Currently Supported Languages:**\n\n" +
          "- **en**: English\n" +
          "- **es**: Español (Spanish)\n\n" +
          "The language selector automatically detects the user's browser language " +
          "on first load. If the detected language is not supported, it falls back to English. " +
          'Language preferences are stored in localStorage under the key "9boxer-language".',
      },
    },
  },
};

/**
 * Compact size - shows the selector in a smaller container.
 * Demonstrates how the selector adapts to limited space.
 */
export const CompactSize: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ padding: 1, minWidth: 120 }}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "The language selector is designed to work in compact spaces. " +
          'It uses MUI\'s "small" size variant and a minimum width of 120px. ' +
          "The globe icon provides visual recognition even when space is limited.",
      },
    },
  },
};
