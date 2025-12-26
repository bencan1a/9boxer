import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReportingChainFilter } from "./ReportingChainFilter";
import { Box } from "@mui/material";
import { fn } from "@storybook/test";

const meta: Meta<typeof ReportingChainFilter> = {
  title: "Dashboard/Filters/ReportingChainFilter",
  component: ReportingChainFilter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays an active reporting chain filter as a dismissible chip. " +
          "Used in the FilterDrawer to show which manager's reporting chain is currently being filtered. " +
          "Features a manager icon, delete button, and optional employee count badge. " +
          "Supports light and dark themes.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 400,
          padding: 2,
          bgcolor: "background.default",
        }}
      >
        <Story />
      </Box>
    ),
  ],
  args: {
    onClear: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ReportingChainFilter>;

/**
 * Simple filter showing only the manager name without employee count.
 * This is the most basic usage of the component.
 */
export const Simple: Story = {
  args: {
    managerName: "John Smith",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Basic reporting chain filter showing only the manager name. " +
          "The delete button allows users to clear the filter. " +
          "Uses the AccountTreeIcon to indicate organizational hierarchy.",
      },
    },
  },
};

/**
 * Filter with employee count badge showing how many employees are in the chain.
 * The badge is displayed in the top-right corner of the chip.
 */
export const WithEmployeeCount: Story = {
  args: {
    managerName: "Jane Doe",
    employeeCount: 12,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Reporting chain filter with an employee count badge. " +
          "The badge displays the number of employees in the reporting chain, " +
          "providing quick visual feedback about the filter's scope. " +
          "Badge is positioned in the top-right corner using design tokens.",
      },
    },
  },
};

/**
 * Filter with a large employee count to show how the badge handles numbers.
 * Tests the visual appearance with larger numbers.
 */
export const LargeEmployeeCount: Story = {
  args: {
    managerName: "Sarah Johnson",
    employeeCount: 156,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Filter showing a larger employee count (100+). " +
          "The badge component automatically handles larger numbers, " +
          "truncating if necessary (e.g., '99+' for counts over 99).",
      },
    },
  },
};

/**
 * Filter with a very long manager name to test text overflow handling.
 * Shows how the component handles edge cases with long names.
 */
export const LongManagerName: Story = {
  args: {
    managerName: "Dr. Alexander Montgomery-Richardson III",
    employeeCount: 8,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Filter with a longer manager name to demonstrate text handling. " +
          "The chip component may wrap or truncate the text depending on container width. " +
          "The full name should remain accessible via tooltip or other means.",
      },
    },
  },
};

/**
 * Interactive state showing hover and focus effects.
 * Demonstrates the visual feedback when users interact with the filter.
 */
export const Interactive: Story = {
  args: {
    managerName: "Michael Chen",
    employeeCount: 25,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Hover over the delete button to see the interaction states. " +
          "The success color provides good visual distinction from other filters. " +
          "All interactive elements have proper ARIA labels for accessibility.",
      },
    },
  },
};

/**
 * Dark mode variant to ensure theme compatibility.
 * Tests the component's appearance in dark theme.
 */
export const DarkMode: Story = {
  args: {
    managerName: "Emily Rodriguez",
    employeeCount: 18,
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story:
          "The component in dark mode. " +
          "Uses theme tokens to ensure proper contrast and readability. " +
          "The success color adapts to the dark theme palette.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 400,
          padding: 2,
          bgcolor: "background.default",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

/**
 * Accessibility demonstration showing keyboard navigation and ARIA labels.
 * Documents the component's accessibility features.
 */
export const Accessibility: Story = {
  args: {
    managerName: "David Lee",
    employeeCount: 7,
  },
  parameters: {
    docs: {
      description: {
        story:
          "**Accessibility Features:**\n\n" +
          "- **ARIA Labels**: Chip has descriptive label for screen readers\n" +
          "- **Delete Button**: Separate ARIA label for the delete action\n" +
          "- **Keyboard Navigation**: Tab to focus, Enter/Space to delete\n" +
          "- **Color Contrast**: Success color meets WCAG AA standards\n" +
          "- **Visual Indicators**: Icon provides non-color identification\n\n" +
          "Try tabbing to the component and using keyboard to interact.",
      },
    },
  },
};
