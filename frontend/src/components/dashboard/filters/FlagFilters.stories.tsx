import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlagFilters } from "./FlagFilters";
import { Box } from "@mui/material";
import { fn } from "@storybook/test";
import { FLAGS } from "../../../constants/flags";

const meta: Meta<typeof FlagFilters> = {
  title: "Dashboard/Filters/FlagFilters",
  component: FlagFilters,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Flag filter component for the FilterDrawer. " +
          "Displays checkboxes for all flag types with employee counts. " +
          "Allows users to filter employees by flags such as Promotion Ready, Flight Risk, etc. " +
          "Includes the flag emoji 🏷️ and supports both light and dark themes.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ padding: 2, minWidth: 300, maxWidth: 400 }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    selectedFlags: {
      description: "Array of currently selected flag keys",
      control: "object",
    },
    flagOptions: {
      description: "Available flag options with employee counts",
      control: "object",
    },
    onFlagToggle: {
      description: "Callback when a flag checkbox is toggled",
      action: "flagToggled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof FlagFilters>;

// Helper to create flag options from FLAGS constant
const createFlagOptions = (counts: Record<string, number>) => {
  return Object.values(FLAGS).map((flag) => ({
    key: flag.key,
    displayName: flag.displayName,
    count: counts[flag.key] || 0,
  }));
};

/**
 * Empty state - no employees with any flags
 * All counts are 0
 */
export const Empty: Story = {
  args: {
    selectedFlags: [],
    flagOptions: createFlagOptions({}),
    onFlagToggle: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state when no employees have any flags. " +
          "All flag options show count of 0. " +
          "Users can still select flags, but filtering would yield no results.",
      },
    },
  },
};

/**
 * With counts - varying employee counts per flag
 * Shows realistic distribution of flags across employees
 */
export const WithCounts: Story = {
  args: {
    selectedFlags: [],
    flagOptions: createFlagOptions({
      promotion_ready: 12,
      flagged_for_discussion: 5,
      flight_risk: 3,
      new_hire: 8,
      succession_candidate: 4,
      pip: 2,
      high_retention_priority: 6,
      ready_for_lateral_move: 7,
    }),
    onFlagToggle: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default state with varying employee counts per flag. " +
          "Shows realistic distribution where some flags are more common than others. " +
          "For example, 'Promotion Ready' (12) is more common than 'Performance Improvement Plan' (2).",
      },
    },
  },
};

/**
 * Single flag selected - filter by flight risk
 * Shows what happens when one flag is selected
 */
export const SingleFlagSelected: Story = {
  args: {
    selectedFlags: ["flight_risk"],
    flagOptions: createFlagOptions({
      promotion_ready: 12,
      flagged_for_discussion: 5,
      flight_risk: 3,
      new_hire: 8,
      succession_candidate: 4,
      pip: 2,
      high_retention_priority: 6,
      ready_for_lateral_move: 7,
    }),
    onFlagToggle: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Single flag selected (Flight Risk). " +
          "The checkbox is checked and highlighted. " +
          "Only the 3 employees with Flight Risk flag would be shown in the grid.",
      },
    },
  },
};

/**
 * Multiple flags selected - retention focus
 * Shows multiple flags selected at once
 */
export const MultipleFlagsSelected: Story = {
  args: {
    selectedFlags: [
      "promotion_ready",
      "succession_candidate",
      "high_retention_priority",
    ],
    flagOptions: createFlagOptions({
      promotion_ready: 12,
      flagged_for_discussion: 5,
      flight_risk: 3,
      new_hire: 8,
      succession_candidate: 4,
      pip: 2,
      high_retention_priority: 6,
      ready_for_lateral_move: 7,
    }),
    onFlagToggle: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multiple flags selected for retention focus. " +
          "Shows Promotion Ready, Succession Candidate, and High Retention Priority. " +
          "Useful for identifying high-value employees who need attention. " +
          "Total would show 22 employees (12 + 4 + 6) if flags don't overlap.",
      },
    },
  },
};

/**
 * All flags selected
 * Shows what happens when all flags are selected
 */
export const AllFlagsSelected: Story = {
  args: {
    selectedFlags: [
      "promotion_ready",
      "flagged_for_discussion",
      "flight_risk",
      "new_hire",
      "succession_candidate",
      "pip",
      "high_retention_priority",
      "ready_for_lateral_move",
    ],
    flagOptions: createFlagOptions({
      promotion_ready: 12,
      flagged_for_discussion: 5,
      flight_risk: 3,
      new_hire: 8,
      succession_candidate: 4,
      pip: 2,
      high_retention_priority: 6,
      ready_for_lateral_move: 7,
    }),
    onFlagToggle: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "All 8 flags selected. " +
          "This would show all employees who have at least one flag. " +
          "All checkboxes are checked and highlighted. " +
          "Useful for reviewing all flagged employees at once.",
      },
    },
  },
};

/**
 * Dark theme - shows component in dark mode
 * Demonstrates theme support
 */
export const DarkTheme: Story = {
  args: {
    selectedFlags: ["flight_risk", "pip"],
    flagOptions: createFlagOptions({
      promotion_ready: 12,
      flagged_for_discussion: 5,
      flight_risk: 3,
      new_hire: 8,
      succession_candidate: 4,
      pip: 2,
      high_retention_priority: 6,
      ready_for_lateral_move: 7,
    }),
    onFlagToggle: fn(),
  },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story:
          "Component in dark theme with two critical flags selected (Flight Risk and PIP). " +
          "All colors adapt to dark mode using theme tokens. " +
          "Text remains readable and checkboxes maintain proper contrast.",
      },
    },
  },
};

/**
 * Light theme - shows component in light mode
 * Demonstrates theme support
 */
export const LightTheme: Story = {
  args: {
    selectedFlags: ["promotion_ready", "succession_candidate"],
    flagOptions: createFlagOptions({
      promotion_ready: 12,
      flagged_for_discussion: 5,
      flight_risk: 3,
      new_hire: 8,
      succession_candidate: 4,
      pip: 2,
      high_retention_priority: 6,
      ready_for_lateral_move: 7,
    }),
    onFlagToggle: fn(),
  },
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Component in light theme with positive flags selected (Promotion Ready and Succession Candidate). " +
          "All colors use theme tokens and adapt to light mode. " +
          "Provides excellent readability and proper contrast ratios.",
      },
    },
  },
};
