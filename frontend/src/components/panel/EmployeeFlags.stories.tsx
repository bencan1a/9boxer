import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmployeeFlags } from "./EmployeeFlags";
import type { Employee } from "@/types/employee";

/**
 * EmployeeFlags displays and manages employee flag tags.
 * Shows colored flag chips with remove functionality and Add Flag picker.
 *
 * **Key Features:**
 * - Colored flag chips with distinct colors per flag type
 * - Remove flag via X button on chip
 * - Add flags via autocomplete picker
 * - Flag type definitions from constants/flags.ts
 * - Supports multiple flags per employee
 *
 * **Flag Types:**
 * 1. Promotion Ready (Blue)
 * 2. Flagged for Discussion (Orange)
 * 3. Flight Risk (Red)
 * 4. New Hire (Green)
 * 5. Succession Candidate (Purple)
 * 6. Performance Improvement Plan (Red)
 * 7. High Retention Priority (Gold)
 * 8. Ready for Lateral Move (Teal)
 *
 * **Interactions:**
 * - Click X on chip to remove flag
 * - Type in picker to search/add flags
 * - Multiple flags can be added
 *
 * **Data Attributes:**
 * - `data-testid="employee-flags-section"` - Container
 * - `data-testid="flag-chip-{flagKey}"` - Individual flag chips
 */
const meta: Meta<typeof EmployeeFlags> = {
  title: "App/Right Panel/Details/EmployeeFlags",
  component: EmployeeFlags,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    employee: {
      description: "Employee data object with flags array",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmployeeFlags>;

// Base employee template
const baseEmployee: Partial<Employee> = {
  employee_id: 12345,
  name: "Alice Johnson",
  flags: [],
};

/**
 * No flags assigned.
 * Shows empty state with only the Add Flag picker.
 * Default view for employees without any flags.
 */
export const NoFlags: Story = {
  args: {
    employee: baseEmployee as Employee,
  },
};

/**
 * Single flag assigned.
 * Shows one flag chip with remove button.
 * Common for employees tagged for specific tracking.
 */
export const SingleFlag: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: ["promotion_ready"],
    } as Employee,
  },
};

/**
 * Multiple flags assigned (3 flags).
 * Shows variety of colored flag chips.
 * Demonstrates typical multi-flag scenario for documentation screenshots.
 */
export const WithMultipleFlags: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "details-flags-ui" },
  },
  args: {
    employee: {
      ...baseEmployee,
      flags: ["promotion_ready", "flight_risk", "high_retention_priority"],
    } as Employee,
  },
};

/**
 * Maximum flags assigned (5+ flags).
 * Shows many flag chips with wrapping layout.
 * Tests UI with high number of flags.
 */
export const ManyFlags: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: [
        "promotion_ready",
        "flight_risk",
        "new_hire",
        "succession_candidate",
        "high_retention_priority",
        "flagged_for_discussion",
      ],
    } as Employee,
  },
};

/**
 * Performance-related flags.
 * Shows employee on Performance Improvement Plan flagged for discussion.
 * Demonstrates concern flags for documentation.
 */
export const PerformanceFlags: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: ["pip", "flagged_for_discussion"],
    } as Employee,
  },
};

/**
 * Talent development flags.
 * Shows high-potential employee ready for promotion and succession.
 * Demonstrates positive tracking flags.
 */
export const TalentDevelopmentFlags: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: [
        "promotion_ready",
        "succession_candidate",
        "high_retention_priority",
      ],
    } as Employee,
  },
};

/**
 * Risk management flags.
 * Shows employee with flight risk and retention priority flags.
 * Demonstrates retention-focused tracking.
 */
export const RiskFlags: Story = {
  args: {
    employee: {
      ...baseEmployee,
      flags: ["flight_risk", "high_retention_priority"],
    } as Employee,
  },
};
