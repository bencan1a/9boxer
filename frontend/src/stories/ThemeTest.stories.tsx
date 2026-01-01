import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import MuiTypography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

/**
 * Color Palette showcase component
 * Displays all theme colors including primary, secondary, semantic, and grid colors
 */
const ColorPaletteShowcase = () => {
  const theme = useTheme();

  const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <Box
        sx={{
          width: 60,
          height: 40,
          backgroundColor: color,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      />
      <MuiTypography variant="body2">
        <strong>{label}:</strong> {color}
      </MuiTypography>
    </Box>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800 }}>
      <MuiTypography variant="h4" gutterBottom>
        Color Palette
      </MuiTypography>
      <MuiTypography variant="body2" color="text.secondary" paragraph>
        Complete color system for light and dark modes. Switch themes to see
        colors adapt.
      </MuiTypography>

      <Stack spacing={3}>
        {/* Primary Colors */}
        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Primary Colors
          </MuiTypography>
          <ColorSwatch color={theme.palette.primary.main} label="Main" />
          <ColorSwatch color={theme.palette.primary.light} label="Light" />
          <ColorSwatch color={theme.palette.primary.dark} label="Dark" />
        </Box>

        {/* Secondary Colors */}
        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Secondary Colors
          </MuiTypography>
          <ColorSwatch color={theme.palette.secondary.main} label="Main" />
          <ColorSwatch color={theme.palette.secondary.light} label="Light" />
          <ColorSwatch color={theme.palette.secondary.dark} label="Dark" />
        </Box>

        {/* Semantic Colors */}
        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Semantic Colors
          </MuiTypography>
          <ColorSwatch color={theme.palette.success.main} label="Success" />
          <ColorSwatch color={theme.palette.warning.main} label="Warning" />
          <ColorSwatch color={theme.palette.error.main} label="Error" />
          <ColorSwatch color={theme.palette.info.main} label="Info" />
        </Box>

        {/* Background Colors */}
        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Background Colors
          </MuiTypography>
          <ColorSwatch
            color={theme.palette.background.default}
            label="Default"
          />
          <ColorSwatch color={theme.palette.background.paper} label="Paper" />
        </Box>

        {/* Text Colors */}
        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Text Colors
          </MuiTypography>
          <MuiTypography variant="body1" color="text.primary">
            Primary Text (87% opacity)
          </MuiTypography>
          <MuiTypography variant="body1" color="text.secondary">
            Secondary Text (60% opacity)
          </MuiTypography>
          <MuiTypography variant="body1" color="text.disabled">
            Disabled Text (38% opacity)
          </MuiTypography>
        </Box>
      </Stack>
    </Paper>
  );
};

/**
 * Typography showcase component
 * Displays all typography variants with their respective styles
 */
const TypographyShowcase = () => {
  const theme = useTheme();

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800 }}>
      <MuiTypography variant="h4" gutterBottom>
        Typography System
      </MuiTypography>
      <MuiTypography variant="body2" color="text.secondary" paragraph>
        Complete typography scale with Roboto font family and Material-UI
        variants.
      </MuiTypography>

      <Stack spacing={2} sx={{ mt: 3 }}>
        <Box>
          <MuiTypography variant="h1">Heading 1</MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            h1 - 2.5rem (40px) - {theme.typography.h1.fontWeight}
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="h2">Heading 2</MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            h2 - 2rem (32px) - {theme.typography.h2.fontWeight}
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="h3">Heading 3</MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            h3 - 1.75rem (28px) - {theme.typography.h3.fontWeight}
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="h4">Heading 4</MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            h4 - 1.5rem (24px) - {theme.typography.h4.fontWeight}
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="h5">Heading 5</MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            h5 - 1.25rem (20px) - {theme.typography.h5.fontWeight}
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="h6">Heading 6</MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            h6 - 1rem (16px) - {theme.typography.h6.fontWeight}
          </MuiTypography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <MuiTypography variant="body1" paragraph>
            Body 1: This is the primary body text style. Used for main content
            areas and general paragraphs. Font size: 1rem (16px), weight: 400.
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            body1 - 1rem (16px) - 400
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="body2" paragraph>
            Body 2: This is the secondary body text style. Used for less
            prominent content and supporting text. Font size: 0.875rem (14px),
            weight: 400.
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            body2 - 0.875rem (14px) - 400
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="caption" display="block" gutterBottom>
            Caption: Used for small text like labels, hints, and metadata.
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            caption - 0.75rem (12px) - 400
          </MuiTypography>
        </Box>

        <Box>
          <MuiTypography variant="overline" display="block" gutterBottom>
            Overline: Used for section labels
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            overline - 0.75rem (12px) - 400 - uppercase
          </MuiTypography>
        </Box>
      </Stack>
    </Paper>
  );
};

/**
 * Spacing showcase component
 * Displays the spacing scale and how it's applied
 */
const SpacingShowcase = () => {
  const theme = useTheme();

  const SpacingExample = ({ size, label }: { size: number; label: string }) => (
    <Box sx={{ mb: 2 }}>
      <MuiTypography variant="body2" gutterBottom>
        <strong>{label}:</strong> {size}px
      </MuiTypography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: size,
            height: 40,
            backgroundColor: theme.palette.primary.main,
            opacity: 0.7,
          }}
        />
        <MuiTypography variant="caption" color="text.secondary">
          {size}px
        </MuiTypography>
      </Box>
    </Box>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800 }}>
      <MuiTypography variant="h4" gutterBottom>
        Spacing System
      </MuiTypography>
      <MuiTypography variant="body2" color="text.secondary" paragraph>
        8px base grid system for consistent spacing throughout the application.
      </MuiTypography>

      <Stack spacing={3} sx={{ mt: 3 }}>
        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Spacing Scale
          </MuiTypography>
          <SpacingExample size={4} label="XS (Extra Small)" />
          <SpacingExample size={8} label="SM (Small)" />
          <SpacingExample size={16} label="MD (Medium)" />
          <SpacingExample size={24} label="LG (Large)" />
          <SpacingExample size={32} label="XL (Extra Large)" />
          <SpacingExample size={48} label="XXL (Extra Extra Large)" />
        </Box>

        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Usage Examples
          </MuiTypography>
          <Stack spacing={1}>
            <Chip
              label="XS (4px) - Tight spacing between related elements"
              size="small"
            />
            <Chip
              label="SM (8px) - Small gaps, list item padding"
              size="small"
            />
            <Chip label="MD (16px) - Standard component padding" size="small" />
            <Chip label="LG (24px) - Section separation" size="small" />
            <Chip label="XL (32px) - Large section separation" size="small" />
            <Chip label="XXL (48px) - Page-level margins" size="small" />
          </Stack>
        </Box>

        <Box>
          <MuiTypography variant="h6" gutterBottom>
            Material-UI Spacing Function
          </MuiTypography>
          <MuiTypography variant="body2" paragraph>
            Theme spacing function multiplies by 8px:
          </MuiTypography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="theme.spacing(1) = 8px"
              variant="outlined"
              size="small"
            />
            <Chip
              label="theme.spacing(2) = 16px"
              variant="outlined"
              size="small"
            />
            <Chip
              label="theme.spacing(3) = 24px"
              variant="outlined"
              size="small"
            />
            <Chip
              label="theme.spacing(4) = 32px"
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

const meta = {
  title: "Design System/Theme",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

/**
 * Color Palette story
 * Shows all theme colors including primary, secondary, semantic, and grid colors
 */
export const ColorPalette: StoryObj = {
  render: () => <ColorPaletteShowcase />,
};

/**
 * Typography story
 * Shows all typography variants with their respective styles
 */
export const Typography: StoryObj = {
  render: () => <TypographyShowcase />,
};

/**
 * Spacing story
 * Shows the spacing scale and usage examples
 */
export const Spacing: StoryObj = {
  render: () => <SpacingShowcase />,
};
