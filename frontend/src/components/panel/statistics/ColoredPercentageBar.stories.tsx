import type { Meta, StoryObj } from "@storybook/react";
import { ColoredPercentageBar } from "./ColoredPercentageBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * ColoredPercentageBar displays a progress bar with dynamic color based on position and percentage.
 *
 * **Key Features:**
 * - Position-aware color logic (different for high/middle/low performers)
 * - Visual feedback about distribution health
 * - Formatted percentage label
 * - Responsive and accessible
 *
 * **Color Logic:**
 * - High Performers (9, 8, 6): Green (≥8%), Orange (<8%)
 * - Middle Tier (7, 5, 3): Blue (8-15%), Orange (outside range)
 * - Low Performers (4, 2, 1): Green (≤8%), Red (>8%)
 *
 * **Use Cases:**
 * - Distribution tables showing position percentages
 * - Performance metrics with visual indicators
 * - Progress bars with conditional formatting
 */
const meta: Meta<typeof ColoredPercentageBar> = {
  title: "Panel/Statistics/ColoredPercentageBar",
  component: ColoredPercentageBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 300 }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    percentage: {
      description: "Percentage value (0-100)",
      control: { type: "range", min: 0, max: 100, step: 0.1 },
    },
    position: {
      description: "Grid position (1-9) for color logic",
      control: { type: "select", options: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    },
    showLabel: {
      description: "Whether to show percentage label",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColoredPercentageBar>;

/**
 * High performer with good representation (25%, green).
 * Position 9 (Star Performer) with healthy percentage.
 */
export const HighPerformerGood: Story = {
  args: {
    percentage: 25.0,
    position: 9,
    showLabel: true,
  },
};

/**
 * High performer with low representation (4%, orange).
 * Position 8 (High Performer) with concerning low percentage - warning color.
 */
export const HighPerformerLow: Story = {
  args: {
    percentage: 4.0,
    position: 8,
    showLabel: true,
  },
};

/**
 * Middle tier with balanced percentage (12%, blue).
 * Position 5 (Solid Performer) with ideal distribution.
 */
export const MiddleTierBalanced: Story = {
  args: {
    percentage: 12.0,
    position: 5,
    showLabel: true,
  },
};

/**
 * Middle tier with too high percentage (32%, orange).
 * Position 5 with skewed distribution - warning color.
 */
export const MiddleTierTooHigh: Story = {
  args: {
    percentage: 32.0,
    position: 5,
    showLabel: true,
  },
};

/**
 * Low performer with healthy low percentage (3%, green).
 * Position 1 (Needs Attention) with few employees - good sign, green color.
 */
export const LowPerformerGood: Story = {
  args: {
    percentage: 3.0,
    position: 1,
    showLabel: true,
  },
};

/**
 * Low performer with concerning high percentage (30%, red).
 * Position 4 (Development Needed) with too many employees - error color.
 */
export const LowPerformerTooHigh: Story = {
  args: {
    percentage: 30.0,
    position: 4,
    showLabel: true,
  },
};

/**
 * Zero percentage edge case.
 * Tests rendering when no employees in position.
 */
export const ZeroPercentage: Story = {
  args: {
    percentage: 0.0,
    position: 7,
    showLabel: true,
  },
};

/**
 * Full width (100%) edge case.
 * Tests rendering when all employees in one position.
 */
export const FullWidth: Story = {
  args: {
    percentage: 100.0,
    position: 5,
    showLabel: true,
  },
};

/**
 * Without label.
 * Shows bar only, without percentage text.
 */
export const WithoutLabel: Story = {
  args: {
    percentage: 45.0,
    position: 9,
    showLabel: false,
  },
};

/**
 * All positions comparison.
 * Shows how each position renders with same percentage.
 */
export const AllPositionsComparison: Story = {
  decorators: [
    () => (
      <Box
        sx={{ width: 600, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6">All Positions at 12%</Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 9 (High): Green (≥8%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={9} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 8 (High): Green (≥8%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={8} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 7 (Middle): Blue (8-15%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={7} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 6 (High): Green (≥8%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={6} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 5 (Middle): Blue (8-15%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={5} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 4 (Low): Red (&gt;8%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={4} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 3 (Middle): Blue (8-15%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={3} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 2 (Low): Red (&gt;8%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={2} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Position 1 (Low): Red (&gt;8%)
          </Typography>
          <ColoredPercentageBar percentage={12} position={1} />
        </Box>
      </Box>
    ),
  ],
  args: {
    percentage: 12.0,
    position: 5,
  },
};

/**
 * Decimal precision test.
 * Tests formatting of percentage with one decimal place.
 */
export const DecimalPrecision: Story = {
  args: {
    percentage: 12.456,
    position: 5,
    showLabel: true,
  },
};
