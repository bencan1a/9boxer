import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExclusionList } from "./ExclusionList";
import Box from "@mui/material/Box";
import { fn } from "@storybook/test";

const meta: Meta<typeof ExclusionList> = {
  title: "Dashboard/Filters/ExclusionList",
  component: ExclusionList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays a compact list of excluded employees with individual remove buttons and a 'Clear All' action. " +
          "Part of the FilterDrawer refactoring to improve modularity and testability. " +
          "Shows an empty state when no employees are excluded. " +
          "Supports scrolling for many exclusions with custom scrollbar styling.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ padding: 2, width: 300, minHeight: 200 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    onRemoveExclusion: fn(),
    onClearAll: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ExclusionList>;

/**
 * Empty state - no employees excluded.
 * Shows a friendly message with an info icon.
 */
export const Empty: Story = {
  args: {
    excludedEmployees: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "When no employees are excluded, shows an empty state with an informative message. " +
          "The icon and text use the secondary text color for a subtle appearance. " +
          "This provides clear feedback that the exclusion list is currently empty.",
      },
    },
  },
};

/**
 * Few exclusions (1-3 employees).
 * Shows a compact list without scrolling.
 */
export const FewExclusions: Story = {
  args: {
    excludedEmployees: [
      { id: 101, name: "Alice Johnson" },
      { id: 202, name: "Bob Smith" },
      { id: 303, name: "Carol Williams" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a small number of excluded employees in a compact list. " +
          "Each item displays the employee name and ID, with a remove button (X icon). " +
          "The 'Clear All' button appears at the bottom to remove all exclusions at once. " +
          "No scrolling is needed for this small number of items.",
      },
    },
  },
};

/**
 * Many exclusions (10+ employees).
 * Demonstrates scrolling behavior with custom scrollbar.
 */
export const ManyExclusions: Story = {
  args: {
    excludedEmployees: [
      { id: 101, name: "Alice Johnson" },
      { id: 102, name: "Bob Smith" },
      { id: 103, name: "Carol Williams" },
      { id: 104, name: "David Brown" },
      { id: 105, name: "Emma Davis" },
      { id: 106, name: "Frank Miller" },
      { id: 107, name: "Grace Wilson" },
      { id: 108, name: "Henry Moore" },
      { id: 109, name: "Ivy Taylor" },
      { id: 110, name: "Jack Anderson" },
      { id: 111, name: "Karen Thomas" },
      { id: 112, name: "Leo Jackson" },
      { id: 113, name: "Mia White" },
      { id: 114, name: "Noah Harris" },
      { id: 115, name: "Olivia Martin" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "When many employees are excluded, the list becomes scrollable with a max height of 240px. " +
          "Custom scrollbar styling matches the application theme (light/dark mode). " +
          "The 'Clear All' button remains visible at the bottom, outside the scrollable area. " +
          "Hover effects on list items provide visual feedback.",
      },
    },
  },
};

/**
 * Single exclusion - minimal case.
 * Shows the component with just one excluded employee.
 */
export const SingleExclusion: Story = {
  args: {
    excludedEmployees: [{ id: 101, name: "Alice Johnson" }],
  },
  parameters: {
    docs: {
      description: {
        story:
          "The minimal case with a single excluded employee. " +
          "Shows all the same functionality as with multiple exclusions. " +
          "The 'Clear All' button still appears, even though there's only one item.",
      },
    },
  },
};

/**
 * Long employee names - tests text overflow.
 * Ensures names are properly displayed even when very long.
 */
export const LongNames: Story = {
  args: {
    excludedEmployees: [
      { id: 101, name: "Alexandrina Evangeline Montgomery-Fitzwilliam III" },
      { id: 102, name: "Bartholomew Christopher Wellington-Smythe" },
      { id: 103, name: "Catherine Elizabeth Victoria Hamilton-Jones" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests the component with very long employee names. " +
          "The layout should handle text overflow gracefully, ensuring the remove button remains accessible. " +
          "Names may wrap or truncate depending on the available space.",
      },
    },
  },
};

/**
 * Dark theme - demonstrates theme support.
 * Shows the component in dark mode.
 */
export const DarkTheme: Story = {
  args: {
    excludedEmployees: [
      { id: 101, name: "Alice Johnson" },
      { id: 202, name: "Bob Smith" },
      { id: 303, name: "Carol Williams" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "The ExclusionList component fully supports dark mode. " +
          "All colors, including the scrollbar, adjust to the dark theme. " +
          "Hover effects and text colors maintain proper contrast ratios for accessibility.",
      },
    },
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          padding: 2,
          width: 300,
          minHeight: 200,
          backgroundColor: "#1e1e1e",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};
