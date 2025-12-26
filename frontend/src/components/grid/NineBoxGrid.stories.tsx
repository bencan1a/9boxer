import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { DndContext } from "@dnd-kit/core";
import { NineBoxGrid } from "./NineBoxGrid";

/**
 * NineBoxGrid is the main 9-box talent grid component that displays employees
 * organized by performance and potential levels. It supports drag-and-drop,
 * expansion/collapse, and multiple view modes.
 *
 * **Key Features:**
 * - 3x3 grid layout (Performance × Potential)
 * - Drag-and-drop employee placement
 * - Box expansion/collapse with localStorage persistence
 * - Donut mode for focused calibration
 * - Position-based color coding
 * - Axis labels (Performance, Potential)
 * - Employee count display
 *
 * **Component Hierarchy:**
 * - NineBoxGrid (container)
 *   - GridAxes (axis labels)
 *   - GridBox[] (9 boxes)
 *     - BoxHeader (label, count, expand button)
 *     - EmployeeTileList
 *       - EmployeeTile[] (draggable employees)
 *
 * **Grid Positions:**
 * - Row 1 (top): 7, 8, 9 (High Potential)
 * - Row 2 (middle): 4, 5, 6 (Medium Potential)
 * - Row 3 (bottom): 1, 2, 3 (Low Potential)
 * - Columns: Low, Medium, High (Performance, left to right)
 *
 * **Data Attributes:**
 * - `data-testid="nine-box-grid"` - Main grid container
 * - `data-testid="grid-box-{position}"` - Individual grid boxes
 * - `data-testid="grid-box-{position}-count"` - Employee count badges
 */
const meta: Meta<typeof NineBoxGrid> = {
  title: "Grid/NineBoxGrid",
  component: NineBoxGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The main nine-box grid component for talent management visualization. This component integrates with the application's state management and provides a complete drag-and-drop experience.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", overflow: "auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NineBoxGrid>;

/**
 * Default grid state - renders with current application data.
 * This story shows the grid as it appears in the running application,
 * using data from the global state management hooks.
 *
 * **Note:** This story requires mocked hooks to render properly in Storybook.
 * In production, it connects to real Redux/Context state.
 */
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "The default grid state as it appears in the application. Requires application context (hooks, stores) to function properly.",
      },
    },
  },
};

/**
 * Empty grid - no employees loaded yet.
 * Shows the initial state when the application first loads
 * or when all employees are filtered out.
 *
 * All boxes are empty with count of 0.
 * Grid maintains proper layout and styling with no data.
 */
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty state with no employees. Useful for testing loading states and initial renders.",
      },
    },
  },
};

/**
 * Populated grid - balanced distribution.
 * Shows a typical organizational distribution with
 * employees spread across all performance/potential levels.
 *
 * This is the most common production state with:
 * - Some high performers (positions 6, 8, 9)
 * - Core talent in middle (position 5)
 * - Development opportunities (positions 3, 7)
 * - Some needing attention (positions 1, 2, 4)
 */
export const Populated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Balanced distribution across all grid positions, representing a healthy organizational talent profile.",
      },
    },
  },
};

/**
 * Skewed distribution - realistic organizational pattern.
 * Most employees in middle boxes (4, 5, 6) with fewer at extremes.
 *
 * This represents a typical organization where:
 * - Most employees are solid performers (positions 5, 6)
 * - Few are underperforming (positions 1, 2)
 * - Few are exceptional stars (position 9)
 * - Some are in development (positions 4, 7)
 */
export const Skewed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Realistic skewed distribution with most employees in middle positions. This is typical of most organizations.",
      },
    },
  },
};

/**
 * Single box populated - all employees in one position.
 * Extreme case for testing scrolling and overflow behavior.
 *
 * Shows position 5 (Core Talent) with 20+ employees
 * to demonstrate:
 * - Scrollable content
 * - Box expansion behavior
 * - Performance with many tiles
 */
export const SingleBox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Edge case with all employees in a single box. Tests overflow, scrolling, and expansion behavior.",
      },
    },
  },
};

/**
 * Drag active - employee being dragged.
 * Shows the visual state during a drag operation with:
 * - Dragged tile in overlay (semi-transparent)
 * - Source box showing gap
 * - Target boxes highlighting on hover
 * - Cursor changes
 *
 * **Note:** This is a visual reference. Interactive drag behavior
 * requires play functions or manual interaction in Storybook.
 */
export const DragActive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Visual state during drag-and-drop operation. Shows drag overlay and drop target highlights.",
      },
    },
  },
};

/**
 * Box expanded - one box in full-screen mode.
 * Position 9 (Star - High Performance/High Potential) expanded to show:
 * - Multi-column grid layout
 * - Collapse button
 * - Full viewport height
 * - Other boxes minimized
 *
 * ESC key or collapse button returns to normal view.
 * Expansion state persists in localStorage.
 */
export const BoxExpanded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Single box expanded to full height with multi-column layout. Other boxes are minimized. Demonstrates focus mode for detailed review.",
      },
    },
  },
};

/**
 * Donut mode active - calibration mode.
 * Shows grid in donut mode where:
 * - Only employees from position 5 are shown
 * - Employees can be temporarily moved for calibration
 * - Donut position indicators shown on tiles
 * - Purple/teal color scheme
 *
 * Donut mode is used for "what-if" scenarios during calibration
 * without permanently changing employee positions.
 */
export const DonutMode: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Donut mode for calibration. Shows only position 5 employees that can be temporarily moved for 'what-if' analysis.",
      },
    },
  },
};

/**
 * With modified employees - session changes highlighted.
 * Shows employees that have been moved during the current session
 * with orange border indicators.
 *
 * Modified employees are:
 * - Marked with orange left border
 * - Show "Modified" chip
 * - Tracked for session history
 * - Can be reverted or saved
 */
export const WithModifications: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Grid showing employees with session modifications. Orange borders indicate recent moves.",
      },
    },
  },
};

/**
 * High performers view - positions 6, 8, 9 highlighted.
 * Focus on top talent for succession planning:
 * - Position 9: Stars (High/High)
 * - Position 8: Growth (Medium/High)
 * - Position 6: High Impact (High/Medium)
 *
 * These boxes have green tint for visual distinction.
 */
export const HighPerformers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Focus on high performer boxes (6, 8, 9) for succession planning and talent retention strategies.",
      },
    },
  },
};

/**
 * Needs attention view - positions 1, 2, 4 highlighted.
 * Focus on employees requiring intervention:
 * - Position 1: Underperformer (Low/Low)
 * - Position 2: Effective Pro (Medium/Low)
 * - Position 4: Inconsistent (Low/Medium)
 *
 * These boxes have red/pink tint for visual distinction.
 */
export const NeedsAttention: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Focus on boxes requiring attention (1, 2, 4) for performance improvement plans and coaching.",
      },
    },
  },
};
