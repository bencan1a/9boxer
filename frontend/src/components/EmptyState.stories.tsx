/**
 * Storybook stories for EmptyState component
 *
 * Demonstrates all states of the EmptyState component:
 * - Default (normal) state
 * - Loading state
 * - Dark mode
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import EmptyState from "./EmptyState";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "EmptyState component displays when no employees are loaded. Provides clear call-to-action for users to load sample data or upload their own Excel file.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isLoading: {
      control: "boolean",
      description: "Shows loading spinner and disables buttons when true",
    },
    onLoadSampleData: {
      description: "Callback when 'Load Sample Data' button is clicked",
    },
    onUploadFile: {
      description: "Callback when 'Upload Excel File' button is clicked",
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          height: "600px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - ready for user interaction
 */
export const Default: Story = {
  args: {
    onLoadSampleData: fn(),
    onUploadFile: fn(),
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default state showing both action buttons. Users can load sample data or upload their own Excel file.",
      },
    },
  },
};

/**
 * Loading state - sample data being loaded
 */
export const Loading: Story = {
  args: {
    onLoadSampleData: fn(),
    onUploadFile: fn(),
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Loading state with spinner displayed. Buttons are disabled and tutorial hint is hidden.",
      },
    },
  },
};

/**
 * Dark mode variant
 */
export const DarkMode: Story = {
  args: {
    onLoadSampleData: fn(),
    onUploadFile: fn(),
    isLoading: false,
  },
  decorators: [
    (Story) => {
      const darkTheme = createTheme({
        palette: {
          mode: "dark",
        },
      });

      return (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Box
            sx={{
              height: "600px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "background.default",
            }}
          >
            <Story />
          </Box>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          "EmptyState component in dark mode. Icon background and text colors adapt to dark theme.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
};

/**
 * Dark mode with loading state
 */
export const DarkModeLoading: Story = {
  args: {
    onLoadSampleData: fn(),
    onUploadFile: fn(),
    isLoading: true,
  },
  decorators: [
    (Story) => {
      const darkTheme = createTheme({
        palette: {
          mode: "dark",
        },
      });

      return (
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Box
            sx={{
              height: "600px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "background.default",
            }}
          >
            <Story />
          </Box>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: "Loading state in dark mode with spinner and disabled buttons.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
};

/**
 * Interactive example - try clicking the buttons
 */
export const Interactive: Story = {
  args: {
    onLoadSampleData: () => {
      alert("Loading sample data with 200 employees...");
    },
    onUploadFile: () => {
      alert("Opening file upload dialog...");
    },
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive example with alert callbacks. Try clicking the buttons to see the actions.",
      },
    },
  },
};

/**
 * Mobile viewport simulation
 */
export const Mobile: Story = {
  args: {
    onLoadSampleData: fn(),
    onUploadFile: fn(),
    isLoading: false,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "EmptyState in mobile viewport. Buttons stack vertically on smaller screens.",
      },
    },
  },
};

/**
 * Tablet viewport simulation
 */
export const Tablet: Story = {
  args: {
    onLoadSampleData: fn(),
    onUploadFile: fn(),
    isLoading: false,
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story:
          "EmptyState in tablet viewport. Layout adapts to medium screen sizes.",
      },
    },
  },
};
