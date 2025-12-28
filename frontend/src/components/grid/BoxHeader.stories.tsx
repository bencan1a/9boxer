import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { BoxHeader } from "./BoxHeader";

/**
 * BoxHeader displays the header for a grid box including:
 * - Position name and label (e.g., "Star [H,H]")
 * - Employee count badge
 * - Expand/collapse button
 * - Tooltip with position guidance
 *
 * The header adapts its layout based on expansion state:
 * - Collapsed: Centered vertical layout
 * - Normal/Expanded: Horizontal layout with badge
 *
 * **Key Features:**
 * - Responsive layout
 * - Position-specific guidance tooltips
 * - Smooth expand/collapse animations
 * - Accessible ARIA labels
 *
 * **Data Attributes:**
 * - `data-testid="grid-box-{position}-count"` - Employee count badge
 */
const meta: Meta<typeof BoxHeader> = {
  title: "Grid/BoxHeader",
  component: BoxHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Grid box header component showing position label, employee count, and expand/collapse controls.",
      },
    },
  },
  argTypes: {
    position: {
      control: { type: "number", min: 1, max: 9 },
      description: "Grid position (1-9)",
    },
    positionName: {
      control: "text",
      description: "Name of the position (e.g., 'Star', 'Core Talent')",
    },
    shortLabel: {
      control: "text",
      description: 'Short label showing levels (e.g., "H,H", "M,M")',
    },
    employeeCount: {
      control: { type: "number", min: 0 },
      description: "Number of employees in this box",
    },
    isExpanded: {
      control: "boolean",
      description: "Whether the box is expanded",
    },
    isCollapsed: {
      control: "boolean",
      description: "Whether the box is collapsed",
    },
    onExpand: {
      description: "Callback fired when expand button clicked",
      action: "expand",
    },
    onCollapse: {
      description: "Callback fired when collapse button clicked",
      action: "collapse",
    },
    positionGuidance: {
      control: "text",
      description: "Tooltip text with guidance for this position",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BoxHeader>;

/**
 * Normal state - standard header layout.
 * Shows position name, level label, employee count badge, and expand button.
 */
export const Normal: Story = {
  args: {
    position: 9,
    positionName: "Star",
    shortLabel: "H,H",
    employeeCount: 5,
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    positionGuidance:
      "High performers with high potential - your future leaders",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Normal state with horizontal layout showing all elements. Expand button has subtle opacity.",
      },
    },
  },
};

/**
 * Expanded state - box is expanded to full height.
 * Shows collapse button and slightly larger text.
 */
export const Expanded: Story = {
  args: {
    position: 5,
    positionName: "Core Talent",
    shortLabel: "M,M",
    employeeCount: 12,
    isExpanded: true,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    positionGuidance: "Solid performers - backbone of the organization",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expanded state with collapse button visible. Text is slightly larger (0.85rem).",
      },
    },
  },
};

/**
 * Collapsed state - minimal header for collapsed boxes.
 * Shows centered vertical layout with prominent expand button.
 * Employee list is hidden when collapsed.
 */
export const Collapsed: Story = {
  args: {
    position: 3,
    positionName: "Workhorse",
    shortLabel: "H,L",
    employeeCount: 4,
    isExpanded: false,
    isCollapsed: true,
    onExpand: fn(),
    onCollapse: fn(),
    positionGuidance: "High performers with limited growth potential",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Collapsed state with centered vertical layout. Expand button is prominent for easy access.",
      },
    },
  },
};

/**
 * Empty box - no employees in this position.
 * Shows count badge with 0, indicating available drop target.
 */
export const Empty: Story = {
  args: {
    position: 1,
    positionName: "Underperformer",
    shortLabel: "L,L",
    employeeCount: 0,
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    positionGuidance:
      "Low performance and potential - requires immediate attention",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty box showing 0 count. Still shows all controls for consistency.",
      },
    },
  },
};

/**
 * Many employees - high count badge.
 * Shows double-digit employee count.
 */
export const ManyEmployees: Story = {
  args: {
    position: 6,
    positionName: "High Impact",
    shortLabel: "H,M",
    employeeCount: 24,
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    positionGuidance: "High performers ready for next level",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Box with many employees (20+) showing scrollable content indication.",
      },
    },
  },
};

/**
 * Development box - position 7 with custom styling.
 * Shows "Enigma" position with low performance but high potential.
 */
export const DevelopmentPosition: Story = {
  args: {
    position: 7,
    positionName: "Enigma",
    shortLabel: "L,H",
    employeeCount: 3,
    isExpanded: false,
    isCollapsed: false,
    onExpand: fn(),
    onCollapse: fn(),
    positionGuidance:
      "High potential with low performance - development opportunity",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Development position (7) showing employees with high potential that need coaching.",
      },
    },
  },
};
