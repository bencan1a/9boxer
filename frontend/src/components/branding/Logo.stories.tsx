import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logo, LogoVariant } from "./Logo";
import { Box, Typography, Paper, Grid } from "@mui/material";

const meta: Meta<typeof Logo> = {
  title: "Branding/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "gradient-center-focus",
        "solid-primary",
        "outlined",
        "gradient-diagonal",
        "rounded-modern",
        "minimal-center",
        "split-tone",
        "neon-accent",
        "depth-shadow",
        "geometric-bold",
        "gradient-bordered",
      ],
      description: "Logo design variant",
    },
    size: {
      control: { type: "number", min: 16, max: 256, step: 16 },
      description: "Size in pixels",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

/**
 * Default logo - Gradient Center Focus
 * Inspired by the splash screen, with gradient background and glowing center
 */
export const Default: Story = {
  args: {
    variant: "gradient-center-focus",
    size: 64,
  },
};

/**
 * Solid Primary - Clean and professional
 * Simple primary color background with white grid boxes
 */
export const SolidPrimary: Story = {
  args: {
    variant: "solid-primary",
    size: 64,
  },
};

/**
 * Outlined - Minimal and modern
 * Outlined boxes with filled center, perfect for light backgrounds
 */
export const Outlined: Story = {
  args: {
    variant: "outlined",
    size: 64,
  },
};

/**
 * Gradient Diagonal - Dynamic and energetic
 * Diagonal gradient from primary to secondary with varying opacity boxes
 */
export const GradientDiagonal: Story = {
  args: {
    variant: "gradient-diagonal",
    size: 64,
  },
};

/**
 * Rounded Modern - Soft and approachable
 * Large rounded corners for a friendly, modern look
 */
export const RoundedModern: Story = {
  args: {
    variant: "rounded-modern",
    size: 64,
  },
};

/**
 * Minimal Center - Emphasis on core
 * Only the center box is filled, others are outlined
 */
export const MinimalCenter: Story = {
  args: {
    variant: "minimal-center",
    size: 64,
  },
};

/**
 * Split Tone - Blue + Orange
 * Horizontal gradient combining primary and secondary colors
 */
export const SplitTone: Story = {
  args: {
    variant: "split-tone",
    size: 64,
  },
};

/**
 * Neon Accent - Modern and tech-forward
 * Dark background with neon cyan glow on center
 */
export const NeonAccent: Story = {
  args: {
    variant: "neon-accent",
    size: 64,
  },
};

/**
 * Depth Shadow - 3D effect
 * Drop shadows create depth and dimension
 */
export const DepthShadow: Story = {
  args: {
    variant: "depth-shadow",
    size: 64,
  },
};

/**
 * Geometric Bold - High contrast
 * Sharp corners and bold color contrasts
 */
export const GeometricBold: Story = {
  args: {
    variant: "geometric-bold",
    size: 64,
  },
};

/**
 * Gradient Bordered - RECOMMENDED
 * Continuous gradient across boxes with clear borders and transparent gaps
 * Best of both "Minimal Center" and "Gradient Center Focus"
 * - Gradient flows continuously across all boxes (blue → purple)
 * - Clear borders (dark in light mode, light in dark mode)
 * - Transparent gaps show page background
 * - Glowing center for emphasis
 */
export const GradientBordered: Story = {
  args: {
    variant: "gradient-bordered",
    size: 64,
  },
};

/**
 * All Variants Comparison
 * Grid view of all 11 logo variants for easy comparison
 */
export const AllVariants: Story = {
  args: {
    variant: "gradient-bordered",
  },

  render: () => {
    const variants: Array<{
      variant: LogoVariant;
      name: string;
      description: string;
    }> = [
      {
        variant: "gradient-center-focus",
        name: "Gradient Center Focus",
        description: "Splash screen inspired, glowing center",
      },
      {
        variant: "solid-primary",
        name: "Solid Primary",
        description: "Clean and professional",
      },
      {
        variant: "outlined",
        name: "Outlined",
        description: "Minimal and modern",
      },
      {
        variant: "gradient-diagonal",
        name: "Gradient Diagonal",
        description: "Dynamic blue to orange",
      },
      {
        variant: "rounded-modern",
        name: "Rounded Modern",
        description: "Soft and approachable",
      },
      {
        variant: "minimal-center",
        name: "Minimal Center",
        description: "Emphasis on core",
      },
      {
        variant: "split-tone",
        name: "Split Tone",
        description: "Blue + Orange horizontal",
      },
      {
        variant: "neon-accent",
        name: "Neon Accent",
        description: "Tech-forward with glow",
      },
      {
        variant: "depth-shadow",
        name: "Depth Shadow",
        description: "3D effect with shadows",
      },
      {
        variant: "geometric-bold",
        name: "Geometric Bold",
        description: "High contrast, sharp edges",
      },
      {
        variant: "gradient-bordered",
        name: "Gradient Bordered ⭐",
        description: "Continuous gradient + transparent gaps",
      },
    ];

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Logo Design Options
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          11 alternative logo designs based on the 9-box grid concept. All
          designs use the application's color palette and support light/dark
          modes. The "Gradient Bordered" variant combines the best features of
          "Minimal Center" and "Gradient Center Focus".
        </Typography>

        <Grid container spacing={3}>
          {variants.map(({ variant, name, description }) => (
            <Grid item xs={12} sm={6} md={4} key={variant}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                {/* Logo at multiple sizes */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    alignItems: "flex-end",
                  }}
                >
                  <Logo variant={variant} size={28} />
                  <Logo variant={variant} size={64} />
                  <Logo variant={variant} size={128} />
                </Box>

                {/* Name and description */}
                <Typography variant="h6" gutterBottom align="center">
                  {name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  {description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Size comparison section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Size Reference (Gradient Center Focus)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
              <Logo variant="gradient-center-focus" size={16} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                16px (Favicon)
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Logo variant="gradient-center-focus" size={28} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                28px (AppBar)
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Logo variant="gradient-center-focus" size={32} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                32px (Default)
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Logo variant="gradient-center-focus" size={64} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                64px (About dialog)
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Logo variant="gradient-center-focus" size={128} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                128px (Large display)
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Logo variant="gradient-center-focus" size={256} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                256px (Installer)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },

  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Dark Mode Comparison
 * Compare all variants in dark mode
 */
export const DarkModeComparison: Story = {
  args: {
    variant: "gradient-center-focus",
  },

  ...AllVariants,

  parameters: {
    ...AllVariants.parameters,
    backgrounds: {
      default: "dark",
    },
  },
};
