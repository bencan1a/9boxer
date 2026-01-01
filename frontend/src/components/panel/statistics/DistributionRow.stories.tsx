import type { Meta, StoryObj } from "@storybook/react-vite";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { DistributionRow } from "./DistributionRow";
import { GroupingIndicator } from "./GroupingIndicator";

/**
 * DistributionRow displays a single position's distribution data in a table row.
 *
 * **Key Features:**
 * - Position label with full description
 * - Employee count (bold when > 0)
 * - Colored percentage bar based on position
 * - Empty state styling for zero-count positions
 * - Optional grouping indicator support
 *
 * **Use Cases:**
 * - Distribution tables
 * - Position breakdown displays
 * - Employee allocation summaries
 */
const meta: Meta<typeof DistributionRow> = {
  title: "App/Right Panel/Statistics/DistributionRow",
  component: DistributionRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <TableContainer component={Paper} sx={{ width: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell align="left">Percentage</TableCell>
              <TableCell align="center">Group %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Story />
          </TableBody>
        </Table>
      </TableContainer>
    ),
  ],
  argTypes: {
    position: {
      description: "Grid position (1-9)",
      control: { type: "select", options: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    },
    positionLabel: {
      description: "Human-readable position label",
      control: "text",
    },
    count: {
      description: "Number of employees in this position",
      control: { type: "number", min: 0 },
    },
    percentage: {
      description: "Percentage of total employees",
      control: { type: "range", min: 0, max: 100, step: 0.1 },
    },
    isEmpty: {
      description: "Whether this position has zero employees",
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DistributionRow>;

/**
 * Default row with normal data.
 * Position 9 (Star Performer) with 12 employees and 10.8% distribution.
 */
export const Default: Story = {
  args: {
    position: 9,
    positionLabel: "9 - Star Performer",
    count: 12,
    percentage: 10.8,
    isEmpty: false,
  },
};

/**
 * Empty position (zero employees).
 * Shows different background color to indicate unpopulated position.
 */
export const EmptyPosition: Story = {
  args: {
    position: 7,
    positionLabel: "7 - High Potential",
    count: 0,
    percentage: 0,
    isEmpty: true,
  },
};

/**
 * High count row.
 * Position 5 with many employees (35 employees, 30% distribution).
 */
export const HighCount: Story = {
  args: {
    position: 5,
    positionLabel: "5 - Solid Performer",
    count: 35,
    percentage: 30.0,
    isEmpty: false,
  },
};

/**
 * Low percentage row.
 * Position with very few employees (2 employees, 1.8%).
 */
export const LowPercentage: Story = {
  args: {
    position: 1,
    positionLabel: "1 - Needs Attention",
    count: 2,
    percentage: 1.8,
    isEmpty: false,
  },
};

/**
 * Row with grouping indicator.
 * Shows how row appears with grouping cell (first row of a group).
 */
export const WithGroupIndicator: Story = {
  args: {
    position: 9,
    positionLabel: "9 - Star Performer",
    count: 12,
    percentage: 10.8,
    isEmpty: false,
    groupIndicator: (
      <GroupingIndicator groupType="high" percentage={32.5} rowSpan={3} />
    ),
  },
};

/**
 * Low performer with high count (concerning).
 * Position 4 with 30% of employees - red bar indicates concern.
 */
export const LowPerformerTooMany: Story = {
  args: {
    position: 4,
    positionLabel: "4 - Development Needed",
    count: 35,
    percentage: 30.0,
    isEmpty: false,
  },
};

/**
 * Multiple rows showing complete distribution.
 * Demonstrates how rows look together in a realistic table.
 */
export const MultipleRows: Story = {
  decorators: [
    () => (
      <TableContainer component={Paper} sx={{ width: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell align="left">Percentage</TableCell>
              <TableCell align="center">Group %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <DistributionRow
              position={9}
              positionLabel="9 - Star Performer"
              count={12}
              percentage={10.8}
            />
            <DistributionRow
              position={8}
              positionLabel="8 - High Performer"
              count={15}
              percentage={13.5}
            />
            <DistributionRow
              position={7}
              positionLabel="7 - High Potential"
              count={0}
              percentage={0}
              isEmpty={true}
            />
            <DistributionRow
              position={6}
              positionLabel="6 - Strong Contributor"
              count={14}
              percentage={12.6}
            />
            <DistributionRow
              position={5}
              positionLabel="5 - Solid Performer"
              count={35}
              percentage={31.5}
            />
          </TableBody>
        </Table>
      </TableContainer>
    ),
  ],
  args: {
    position: 9,
    positionLabel: "9 - Star Performer",
    count: 12,
    percentage: 10.8,
  },
};
