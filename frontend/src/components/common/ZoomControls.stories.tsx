import type { Meta, StoryObj } from "@storybook/react-vite";
import { ZoomControls } from "./ZoomControls";
import { Box } from "@mui/material";

const meta: Meta<typeof ZoomControls> = {
  title: "Common/ZoomControls",
  component: ZoomControls,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Zoom controls positioned in the bottom-left corner of the grid area. " +
          "Provides zoom in/out/reset buttons, zoom percentage display, and full-screen toggle. " +
          "Supports keyboard shortcuts: Ctrl+Plus (zoom in), Ctrl+Minus (zoom out), " +
          "Ctrl+0 (reset), F11 (full-screen), and Ctrl+Scroll (mouse wheel zoom). " +
          "Hidden on small screens (<600px width).",
      },
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ZoomControls>;

/**
 * Default zoom controls with all buttons enabled.
 * Shows the controls at 100% zoom (default level).
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default state at 100% zoom. All three zoom buttons are enabled (zoom out, reset, zoom in). " +
          'The percentage display shows "100%" and the full-screen toggle is available.',
      },
    },
  },
};

/**
 * Minimum zoom state - zoom out button disabled.
 * Shows the controls when the minimum zoom level (50%) is reached.
 */
export const MinZoom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When at minimum zoom level (50%), the zoom out button is disabled. " +
          "The reset button is enabled since zoom is not at default. " +
          "Users can only zoom in or reset from this state.",
      },
    },
  },
  play: async () => {
    // Note: In actual implementation, zoom state is managed by zoomService
    // This story shows the visual state - the button will be enabled in Storybook
    // but would be disabled in the real app when at min zoom
  },
};

/**
 * Maximum zoom state - zoom in button disabled.
 * Shows the controls when the maximum zoom level (200%) is reached.
 */
export const MaxZoom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When at maximum zoom level (200%), the zoom in button is disabled. " +
          "The reset button is enabled since zoom is not at default. " +
          "Users can only zoom out or reset from this state.",
      },
    },
  },
  play: async () => {
    // Note: Same as MinZoom - shows visual state
  },
};

/**
 * Custom zoom level (150%).
 * Shows the controls at a non-default zoom level.
 */
export const CustomZoom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "At any custom zoom level (e.g., 150%), all buttons are enabled. " +
          "The percentage display updates to show the current zoom. " +
          "Reset button is enabled to return to 100%.",
      },
    },
  },
};

/**
 * Keyboard shortcuts documentation.
 * All available keyboard shortcuts for zoom controls.
 */
export const KeyboardShortcuts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Keyboard Shortcuts:**\n\n" +
          "- **Ctrl+Plus** (or Ctrl+=): Zoom in\n" +
          "- **Ctrl+Minus**: Zoom out\n" +
          "- **Ctrl+0**: Reset zoom to 100%\n" +
          "- **F11**: Toggle full-screen mode\n" +
          "- **Ctrl+Scroll**: Zoom in/out with mouse wheel\n\n" +
          "All keyboard shortcuts work globally when the app has focus. " +
          "Zoom level is persisted to localStorage and restored on reload.",
      },
    },
  },
};
