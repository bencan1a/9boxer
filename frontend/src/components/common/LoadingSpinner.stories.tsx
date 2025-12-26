import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingSpinner } from "./LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
  title: "Common/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: { type: "number", min: 20, max: 100, step: 5 },
      description: "Size of the spinner in pixels",
    },
    message: {
      control: "text",
      description: "Optional message to display below the spinner",
    },
    overlay: {
      control: "boolean",
      description: "Whether to display as a full-screen overlay",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

/**
 * Default spinner without any message
 */
export const Default: Story = {
  args: {},
};

/**
 * Spinner with a loading message
 */
export const WithMessage: Story = {
  args: {
    message: "Loading employees...",
  },
};

/**
 * Large spinner for prominent loading states
 */
export const LargeSize: Story = {
  args: {
    size: 60,
    message: "Processing data...",
  },
};

/**
 * Small spinner for compact areas
 */
export const SmallSize: Story = {
  args: {
    size: 24,
  },
};

/**
 * Full-screen overlay spinner
 * Note: Switch to fullscreen layout to see the overlay effect
 */
export const WithOverlay: Story = {
  args: {
    overlay: true,
    message: "Processing...",
  },
  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Overlay with custom size and message
 */
export const OverlayCustom: Story = {
  args: {
    overlay: true,
    size: 50,
    message: "Uploading file... Please wait.",
  },
  parameters: {
    layout: "fullscreen",
  },
};
