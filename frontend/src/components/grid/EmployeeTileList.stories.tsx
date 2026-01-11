import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GridZoomProvider } from "../../contexts/GridZoomContext";
import { EmployeeTileList } from "./EmployeeTileList";
import type {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";

/**
 * EmployeeTileList is a wrapper component that manages the layout
 * of employee tiles within a grid box.
 *
 * **Layout Modes:**
 * - Normal: Vertical stack (block layout)
 * - Expanded: Multi-column grid (auto-fill, minmax(280px, 1fr))
 *
 * **Key Features:**
 * - Responsive grid layout when expanded
 * - Consistent gap spacing (12px in expanded mode)
 * - Handles empty state gracefully
 * - Wraps EmployeeTile components
 *
 * **Props:**
 * - employees: Array of employee objects
 * - isExpanded: Controls layout mode
 * - onSelectEmployee: Callback for tile clicks
 * - donutModeActive: Passes through to tiles
 */
const meta: Meta<typeof EmployeeTileList> = {
  title: "App/Grid/EmployeeTileList",
  component: EmployeeTileList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Wrapper component for employee tiles that manages layout based on expansion state.",
      },
    },
  },
  decorators: [
    (Story) => (
      <GridZoomProvider>
        <Story />
      </GridZoomProvider>
    ),
  ],
  argTypes: {
    employees: {
      description: "Array of employee objects to display",
    },
    isExpanded: {
      control: "boolean",
      description: "Whether to use multi-column grid layout (expanded mode)",
    },
    onSelectEmployee: {
      description: "Callback fired when an employee tile is clicked",
      action: "employee-selected",
    },
    donutModeActive: {
      control: "boolean",
      description: "Whether donut mode is active (passed to tiles)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmployeeTileList>;

// Helper to create mock employees
const createEmployee = (
  id: number,
  name: string,
  title: string,
  overrides?: Partial<Employee>
): Employee => ({
  employee_id: id,
  name,
  business_title: title,
  job_title: title,
  job_profile: "Engineering-USA",
  job_level: "MT5",
  job_function: "Engineering",
  location: "USA",
  manager: "Manager Name",
  management_chain_01: null,
  management_chain_02: null,
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-01-01",
  tenure_category: "3-5 years",
  time_in_job_profile: "2 years",
  performance: "High" as PerformanceLevel,
  potential: "High" as PotentialLevel,
  grid_position: 9,
  talent_indicator: "Star",
  ratings_history: [],
  development_focus: null,
  development_action: null,
  notes: null,
  promotion_status: null,
  promotion_readiness: null,
  modified_in_session: false,
  last_modified: null,
  flags: [],
  ...overrides,
});

const threeEmployees: Employee[] = [
  createEmployee(1, "Alice Johnson", "Senior Software Engineer"),
  createEmployee(2, "Bob Smith", "Product Manager"),
  createEmployee(3, "Carol White", "Data Scientist"),
];

const manyEmployees: Employee[] = Array.from({ length: 12 }, (_, i) =>
  createEmployee(i + 1, `Employee ${i + 1}`, `Job Title ${i + 1}`)
);

/**
 * Empty list - no employees to display.
 * Renders empty container, ready for drag-drop.
 */
export const Empty: Story = {
  args: {
    employees: [],
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty employee list. Container renders but no tiles are displayed.",
      },
    },
  },
};

/**
 * Normal layout - vertical stack.
 * Shows 3 employees in standard vertical block layout.
 * Tiles stack with small margins, no grid columns.
 */
export const NormalLayout: Story = {
  args: {
    employees: threeEmployees,
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Normal (collapsed) layout with vertical stacking. Tiles display in single column.",
      },
    },
  },
};

/**
 * Expanded layout - multi-column grid.
 * Shows 12 employees in responsive grid with 2-3 columns.
 * Auto-fill ensures optimal column count based on container width.
 */
export const ExpandedLayout: Story = {
  args: {
    employees: manyEmployees,
    isExpanded: true,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Expanded layout with multi-column grid. Uses auto-fill with minmax(280px, 1fr) for responsive columns.",
      },
    },
  },
};

/**
 * Few employees - optimal grid usage.
 * Shows 3 employees in normal layout.
 * Demonstrates grid behavior with fewer items.
 */
export const FewEmployees: Story = {
  args: {
    employees: threeEmployees,
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Normal layout with only 3 employees. Shows typical small box population.",
      },
    },
  },
};

/**
 * Single employee - minimal case.
 * Shows single employee in both normal and expanded modes.
 */
export const SingleEmployee: Story = {
  args: {
    employees: [createEmployee(1, "Alice Johnson", "Senior Software Engineer")],
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Single employee in normal layout. Minimal case for testing.",
      },
    },
  },
};

/**
 * Donut mode active - special styling.
 * Shows employees with donut mode indicators.
 * Some employees have donut_modified flag set.
 */
export const DonutMode: Story = {
  args: {
    employees: [
      createEmployee(1, "Alice Johnson", "Senior Software Engineer", {
        donut_modified: true,
        donut_position: 9,
      }),
      createEmployee(2, "Bob Smith", "Product Manager"),
      createEmployee(3, "Carol White", "Data Scientist", {
        donut_modified: true,
        donut_position: 8,
      }),
    ],
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Donut mode with some employees modified. Shows purple borders and donut indicators.",
      },
    },
  },
};

/**
 * With flags - employees with status indicators.
 * Shows employees with various flags:
 * - Flight risk
 * - New hire
 * - Promotion ready
 *
 * Flags appear as colored chips on tiles.
 */
export const WithFlags: Story = {
  args: {
    employees: [
      createEmployee(1, "Alice Johnson", "Senior Software Engineer", {
        flags: ["flight_risk"],
      }),
      createEmployee(2, "Bob Smith", "Product Manager", {
        flags: ["new_hire"],
      }),
      createEmployee(3, "Carol White", "Data Scientist", {
        flags: ["promotion_ready"],
      }),
    ],
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Employees with status flags. Shows colored chips for quick status identification.",
      },
    },
  },
};

/**
 * With modified employees - session changes.
 * Shows employees marked as modified in current session.
 * Modified employees have orange left border.
 */
export const WithModifiedEmployees: Story = {
  args: {
    employees: [
      createEmployee(1, "Alice Johnson", "Senior Software Engineer", {
        modified_in_session: true,
      }),
      createEmployee(2, "Bob Smith", "Product Manager"),
      createEmployee(3, "Carol White", "Data Scientist", {
        modified_in_session: true,
      }),
    ],
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Employees with session modifications. Orange borders indicate recent changes.",
      },
    },
  },
};

/**
 * Many employees scrollable - overflow behavior.
 * Shows 20+ employees requiring scroll in normal mode.
 * In expanded mode, uses multi-column grid to maximize space.
 */
export const ManyEmployeesScrollable: Story = {
  args: {
    employees: Array.from({ length: 20 }, (_, i) =>
      createEmployee(i + 1, `Employee ${i + 1}`, `Job Title ${i + 1}`)
    ),
    isExpanded: false,
    onSelectEmployee: fn(),
    donutModeActive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Many employees (20+) in normal layout. Container becomes scrollable when content overflows.",
      },
    },
  },
};
