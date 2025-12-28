import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { DndContext } from "@dnd-kit/core";
import { EmployeeTile } from "./EmployeeTile";
import type {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "@/types/employee";

/**
 * EmployeeTile is the core draggable employee card component displayed within grid boxes.
 * It shows employee information including name, title, job level, and various status indicators.
 *
 * **Key Features:**
 * - Drag handle for drag-and-drop functionality
 * - Consistent full border for movement highlighting:
 *   - Session Modified: Full orange border (2px)
 *   - Donut Mode: Full purple border (2px)
 * - Individual flag badges (Treatment 2 - Badge Strip):
 *   - 16px colored circular badges at top-right
 *   - Each flag shows its semantic color
 *   - Tooltip displays flag name on hover
 * - Responsive layout with text truncation
 *
 * **Data Attributes:**
 * - `data-testid="employee-card-{employee_id}"` - Main card container
 * - `data-testid="donut-indicator"` - Donut mode chip
 * - `data-testid="flag-badge-{index}"` - Individual flag badges
 */
const meta: Meta<typeof EmployeeTile> = {
  title: "Grid/EmployeeTile",
  component: EmployeeTile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <DndContext>
        <div style={{ width: 350 }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
  argTypes: {
    employee: {
      description: "Employee data object with all employee information",
    },
    onSelect: {
      description: "Callback fired when employee tile is clicked",
      action: "selected",
    },
    donutModeActive: {
      control: "boolean",
      description:
        "Whether donut mode is currently active (shows donut position indicators)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmployeeTile>;

// Base employee template
const baseEmployee: Employee = {
  employee_id: 12345,
  name: "Alice Johnson",
  business_title: "Senior Software Engineer",
  job_title: "Software Engineer III",
  job_profile: "Engineering-USA",
  job_level: "MT5",
  job_function: "Engineering",
  location: "USA",
  manager: "Bob Smith",
  management_chain_01: "Carol White",
  management_chain_02: "David Brown",
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-03-15",
  tenure_category: "3-5 years",
  time_in_job_profile: "2 years",
  performance: "High" as PerformanceLevel,
  potential: "High" as PotentialLevel,
  grid_position: 9,
  talent_indicator: "Star",
  ratings_history: [
    { year: 2024, rating: "Strong" },
    { year: 2023, rating: "Leading" },
  ],
  development_focus: "Leadership skills",
  development_action: "Mentor junior engineers",
  notes: null,
  promotion_status: "Ready",
  promotion_readiness: true,
  modified_in_session: false,
  last_modified: null,
  flags: [],
};

/**
 * Default employee tile with complete data.
 * Shows standard appearance with all key information.
 */
export const Default: Story = {
  args: {
    employee: baseEmployee,
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee tile with modified_in_session flag set.
 * Displays full orange border (2px) to indicate session modification.
 */
export const Modified: Story = {
  args: {
    employee: {
      ...baseEmployee,
      modified_in_session: true,
      last_modified: "2025-12-25T10:30:00Z",
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee in donut mode with a donut position set.
 * Shows full purple border (2px) and "Donut" chip with position label.
 */
export const DonutModified: Story = {
  args: {
    employee: {
      ...baseEmployee,
      donut_position: 6,
      donut_performance: "High" as PerformanceLevel,
      donut_potential: "Medium" as PotentialLevel,
      donut_modified: true,
      donut_last_modified: "2025-12-25T11:00:00Z",
    },
    onSelect: fn(),
    donutModeActive: true,
  },
};

/**
 * Employee with very long name and title.
 * Tests text overflow and truncation behavior.
 */
export const LongName: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: "Dr. Elizabeth Alexandra Montgomery-Winthrop III",
      business_title:
        "Chief Distinguished Principal Senior Staff Software Architect",
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee tile with all fields populated.
 * Includes multiple flags and all metadata.
 */
export const WithAllFields: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: ["high-potential", "flight-risk", "new-hire"],
      modified_in_session: true,
      development_focus: "Technical leadership and architecture",
      development_action: "Lead cross-functional initiatives",
      notes: "Excellent performer with strong team collaboration",
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee tile with minimal data.
 * Only required fields populated, tests sparse data handling.
 */
export const MinimalData: Story = {
  args: {
    employee: {
      employee_id: 99999,
      name: "John Doe",
      business_title: "Engineer",
      job_title: "Engineer",
      job_profile: "Engineering-USA",
      job_level: "MT3",
      job_function: "Engineering",
      location: "USA",
      manager: "Manager",
      management_chain_01: null,
      management_chain_02: null,
      management_chain_03: null,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
      hire_date: "2024-01-01",
      tenure_category: "0-1 years",
      time_in_job_profile: "< 1 year",
      performance: "Medium" as PerformanceLevel,
      potential: "Medium" as PotentialLevel,
      grid_position: 5,
      talent_indicator: "Solid",
      ratings_history: [],
      development_focus: null,
      development_action: null,
      notes: null,
      promotion_status: null,
      promotion_readiness: null,
      modified_in_session: false,
      last_modified: null,
      flags: [],
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Employee with flags only.
 * Shows the flag badge with count and tooltip.
 */
export const WithFlags: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: ["high-potential", "promotion-ready", "key-talent"],
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * Low performer in needs attention box.
 * Shows employee at grid position 1 (Low/Low).
 */
export const LowPerformer: Story = {
  args: {
    employee: {
      ...baseEmployee,
      employee_id: 11111,
      name: "Sarah Williams",
      business_title: "Junior Analyst",
      job_level: "MT2",
      performance: "Low" as PerformanceLevel,
      potential: "Low" as PotentialLevel,
      grid_position: 1,
      talent_indicator: "Development Needed",
      flags: ["performance-plan"],
    },
    onSelect: fn(),
    donutModeActive: false,
  },
};

/**
 * ORIGINAL POSITION VARIANTS - Donut Mode
 *
 * These stories showcase different visual designs for displaying where
 * an employee was originally positioned. Useful for showing movement
 * history in both donut mode and normal session modifications.
 *
 * Employee shown: Moved from position 5 (Solid, M/M) to position 9 (Star, H/H) in donut mode
 */

const movedEmployeeDonut: Employee = {
  ...baseEmployee,
  grid_position: 5, // Original position (Medium/Medium)
  performance: "Medium" as PerformanceLevel,
  potential: "Medium" as PotentialLevel,
  donut_position: 9, // Moved to High/High in donut mode
  donut_performance: "High" as PerformanceLevel,
  donut_potential: "High" as PotentialLevel,
  donut_modified: true,
};

/**
 * Variant 1: Chip Badge
 * Small chip showing "Was: <position>" - subtle but clear
 */
export const OriginalPosition_Chip_DonutMode: Story = {
  name: "Original Position: Chip (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "chip",
  },
};

/**
 * Variant 2: Full Text
 * Complete text "Originally: <position>" - most descriptive
 */
export const OriginalPosition_Text_DonutMode: Story = {
  name: "Original Position: Text (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "text",
  },
};

/**
 * Variant 3: Compact Text
 * Minimal text "was <position>" - most space-efficient
 */
export const OriginalPosition_TextCompact_DonutMode: Story = {
  name: "Original Position: Text Compact (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "text-compact",
  },
};

/**
 * Variant 4: Arrow Notation
 * Shows movement with arrow: "Original → Current"
 */
export const OriginalPosition_Arrow_DonutMode: Story = {
  name: "Original Position: Arrow (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "arrow",
  },
};

/**
 * Variant 5: Icon + Text
 * History icon with position label - visual indicator
 */
export const OriginalPosition_IconText_DonutMode: Story = {
  name: "Original Position: Icon+Text (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "icon-text",
  },
};

/**
 * COMPARISON: All Variants Side-by-Side (Donut Mode)
 *
 * Interactive story with controls to switch between all variants.
 * Use the "originalPositionVariant" control in Storybook to compare.
 */
export const OriginalPosition_AllVariants_DonutMode: Story = {
  name: "Original Position: All Variants (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "chip",
  },
  argTypes: {
    originalPositionVariant: {
      control: "select",
      options: ["none", "chip", "text", "text-compact", "arrow", "icon-text"],
      description: "Visual style for showing original position",
    },
  },
};

/**
 * No Original Position Indicator
 * For comparison - employee moved but no indicator shown (current behavior)
 */
export const OriginalPosition_None_DonutMode: Story = {
  name: "Original Position: None (Donut Mode)",
  args: {
    employee: movedEmployeeDonut,
    onSelect: fn(),
    donutModeActive: true,
    originalPositionVariant: "none",
  },
};
