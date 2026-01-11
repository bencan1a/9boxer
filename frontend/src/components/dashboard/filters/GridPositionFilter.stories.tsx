import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { GridPositionFilter } from "./GridPositionFilter";

/**
 * GridPositionFilter is an interactive 3x3 grid for filtering employees by grid position.
 *
 * **Key Features:**
 * - Multi-select: Click to toggle position selection
 * - Visual feedback: Selected boxes are highlighted with primary border
 * - Employee counts: Shows count per box when provided
 * - Color coding: Matches 9-box grid colors (high performer, needs attention, solid, development)
 * - Clear button: Appears when selections are active
 *
 * **Grid Layout:**
 * ```
 * Position 7 | Position 8 | Position 9 (High Potential)
 * Position 4 | Position 5 | Position 6 (Medium Potential)
 * Position 1 | Position 2 | Position 3 (Low Potential)
 * ```
 *
 * **Position Color Coding:**
 * - High Performers (6, 8, 9): Purple tint
 * - Needs Attention (1, 2, 4): Red tint
 * - Solid Performer (5): Green tint
 * - Development (3, 7): Yellow tint
 *
 * **Data Attributes:**
 * - `data-testid="grid-position-filter"` - Main container
 * - `data-testid="grid-position-{position}"` - Individual position button (1-9)
 * - `data-testid="grid-position-{position}-count"` - Employee count badge
 * - `data-testid="grid-position-clear-button"` - Clear selection button
 */
const meta: Meta<typeof GridPositionFilter> = {
  title: "App/Dashboard/Filters/GridPositionFilter",
  component: GridPositionFilter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    selectedPositions: {
      description: "Array of selected position numbers (1-9)",
      control: { type: "object" },
    },
    onPositionsChange: {
      description: "Callback fired when positions selection changes",
      action: "positions-changed",
    },
    employeeCounts: {
      description: "Optional record of employee counts per position",
      control: { type: "object" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GridPositionFilter>;

/**
 * No positions selected.
 * Default state showing all 9 boxes with no highlights.
 */
export const NoSelection: Story = {
  args: {
    selectedPositions: [],
    onPositionsChange: fn(),
  },
};

/**
 * Single position selected (position 5 - Solid Performer).
 * Shows primary border and full opacity on selected box.
 */
export const SingleSelection: Story = {
  args: {
    selectedPositions: [5],
    onPositionsChange: fn(),
  },
};

/**
 * Multiple positions selected (corner positions: 1, 5, 9).
 * Shows diagonal selection pattern across different color zones.
 */
export const MultipleSelections: Story = {
  args: {
    selectedPositions: [1, 5, 9],
    onPositionsChange: fn(),
  },
};

/**
 * High performers selected (positions 6, 8, 9).
 * Shows selection of all high performer positions (purple tint).
 */
export const HighPerformersSelected: Story = {
  args: {
    selectedPositions: [6, 8, 9],
    onPositionsChange: fn(),
  },
};

/**
 * Needs attention selected (positions 1, 2, 4).
 * Shows selection of all needs attention positions (red tint).
 */
export const NeedsAttentionSelected: Story = {
  args: {
    selectedPositions: [1, 2, 4],
    onPositionsChange: fn(),
  },
};

/**
 * With employee counts.
 * Shows employee count badges in each box when data is provided.
 */
export const WithEmployeeCounts: Story = {
  args: {
    selectedPositions: [5],
    onPositionsChange: fn(),
    employeeCounts: {
      1: 2,
      2: 5,
      3: 3,
      4: 4,
      5: 12,
      6: 8,
      7: 1,
      8: 6,
      9: 9,
    },
  },
};

/**
 * With employee counts and multiple selections.
 * Shows how counts appear with selected boxes.
 */
export const WithCountsAndSelections: Story = {
  args: {
    selectedPositions: [5, 6, 9],
    onPositionsChange: fn(),
    employeeCounts: {
      1: 2,
      2: 5,
      3: 3,
      4: 4,
      5: 12,
      6: 8,
      7: 1,
      8: 6,
      9: 9,
    },
  },
};

/**
 * Empty boxes (zero counts).
 * Shows boxes without employee counts, demonstrating the empty state.
 */
export const EmptyBoxes: Story = {
  args: {
    selectedPositions: [],
    onPositionsChange: fn(),
    employeeCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    },
  },
};

/**
 * Sparse data.
 * Shows realistic scenario where some positions have employees, others don't.
 */
export const SparseData: Story = {
  args: {
    selectedPositions: [5],
    onPositionsChange: fn(),
    employeeCounts: {
      2: 3,
      5: 15,
      6: 7,
      9: 4,
    },
  },
};
