import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logo } from "./Logo";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const meta: Meta<typeof Logo> = {
  title: "App/Branding/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: {
      control: { type: "number", min: 16, max: 256, step: 16 },
      description: "Size in pixels",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

/**
 * Official 9Boxer Logo - Gradient Bordered
 *
 * The official logo design for the 9Boxer application.
 * Features a continuous gradient across boxes with clear borders and transparent gaps.
 *
 * **Design characteristics:**
 * - Gradient flows continuously across all boxes (blue → purple)
 * - Clear light borders that work well against the dark gradient background
 * - Transparent gaps show page background
 * - Glowing center for emphasis
 * - Works beautifully in both light and dark modes
 */
export const Official: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "branding-logo-official" },
  },
  args: {
    variant: "gradient-bordered",
    size: 64,
  },
};

/**
 * Size Reference
 *
 * Common sizes used throughout the application.
 * The logo is designed to scale from 16px (favicon) to 256px (installer icon).
 */
export const SizeReference: Story = {
  args: {
    variant: "gradient-bordered",
    size: 64,
  },

  render: () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          9Boxer Logo - Standard Sizes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Common sizes used in the application
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 4,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Logo variant="gradient-bordered" size={16} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              16px (Favicon)
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Logo variant="gradient-bordered" size={28} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              28px (AppBar)
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Logo variant="gradient-bordered" size={32} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              32px (Default)
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Logo variant="gradient-bordered" size={64} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              64px (About dialog)
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Logo variant="gradient-bordered" size={128} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              128px (Large display)
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Logo variant="gradient-bordered" size={256} />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              256px (Installer)
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  },

  parameters: {
    layout: "fullscreen",
  },
};
