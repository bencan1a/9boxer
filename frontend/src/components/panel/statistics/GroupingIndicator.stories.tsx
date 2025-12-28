import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import { GroupingIndicator } from "./GroupingIndicator";

/**
 * GroupingIndicator shows performance tier groupings with CSS-based colored borders.
 *
 * **Key Features:**
 * - Replaces old SVG curly brace approach
 * - CSS-based with colored border-left and background tint
 * - Dynamic color based on groupType and percentage
 * - Semantic TableCell with rowSpan for grouping
 * - Screen reader accessible
 *
 * **Color Logic:**
 * - High Performers: Green (25-35%), Orange (<20%), Blue (>40%)
 * - Middle Tier: Blue (30-40%), Orange (outside range)
 * - Low Performers: Green (15-25%), Blue (<10%), Red (>30%)
 *
 * **Use Cases:**
 * - Distribution tables showing position groupings
 * - Performance tier summaries
 * - Percentage aggregations with visual indicators
 */
const meta: Meta<typeof GroupingIndicator> = {
  title: "Panel/Statistics/GroupingIndicator",
  component: GroupingIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story, context) => (
      <TableContainer component={Paper} sx={{ width: 400 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Row 1</TableCell>
              {context.args.rowSpan === 3 && <Story />}
              {context.args.rowSpan !== 3 && <Story />}
            </TableRow>
            {context.args.rowSpan === 3 && (
              <>
                <TableRow>
                  <TableCell>Row 2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Row 3</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    ),
  ],
  argTypes: {
    groupType: {
      description: "Type of performance group",
      control: "select",
      options: ["high", "middle", "low"],
    },
    percentage: {
      description: "Total percentage for this group",
      control: { type: "range", min: 0, max: 100, step: 0.1 },
    },
    rowSpan: {
      description: "Number of table rows to span",
      control: { type: "number", min: 1, max: 9 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GroupingIndicator>;

/**
 * High performers with balanced distribution (30%).
 * Shows green color indicating healthy distribution.
 */
export const HighPerformersBalanced: Story = {
  args: {
    groupType: "high",
    percentage: 30.0,
    rowSpan: 3,
  },
};

/**
 * High performers with too low percentage (15%).
 * Shows orange warning color indicating underrepresentation.
 */
export const HighPerformersTooLow: Story = {
  args: {
    groupType: "high",
    percentage: 15.0,
    rowSpan: 3,
  },
};

/**
 * High performers with too high percentage (45%).
 * Shows blue info color indicating possible grade inflation.
 */
export const HighPerformersTooHigh: Story = {
  args: {
    groupType: "high",
    percentage: 45.0,
    rowSpan: 3,
  },
};

/**
 * Middle tier with balanced distribution (35%).
 * Shows blue color indicating healthy distribution.
 */
export const MiddleTierBalanced: Story = {
  args: {
    groupType: "middle",
    percentage: 35.0,
    rowSpan: 3,
  },
};

/**
 * Middle tier with skewed distribution (50%).
 * Shows orange warning color indicating too many in middle tier.
 */
export const MiddleTierSkewed: Story = {
  args: {
    groupType: "middle",
    percentage: 50.0,
    rowSpan: 3,
  },
};

/**
 * Low performers with too high percentage (35%).
 * Shows red error color indicating concerning number of low performers.
 */
export const LowPerformersTooHigh: Story = {
  args: {
    groupType: "low",
    percentage: 35.0,
    rowSpan: 3,
  },
};

/**
 * Low performers with balanced distribution (20%).
 * Shows green color indicating healthy distribution.
 */
export const LowPerformersBalanced: Story = {
  args: {
    groupType: "low",
    percentage: 20.0,
    rowSpan: 3,
  },
};

/**
 * Low performers with very low percentage (5%).
 * Shows blue info color indicating very few low performers (good sign).
 */
export const LowPerformersVeryLow: Story = {
  args: {
    groupType: "low",
    percentage: 5.0,
    rowSpan: 3,
  },
};

/**
 * All three groupings together in a realistic table.
 * Shows how indicators look when used in actual distribution table.
 */
export const AllGroupingsTogether: Story = {
  decorators: [
    () => (
      <TableContainer component={Paper} sx={{ width: 600 }}>
        <Table>
          <TableBody>
            {/* High performers group */}
            <TableRow>
              <TableCell>Position 9</TableCell>
              <TableCell align="right">12</TableCell>
              <GroupingIndicator
                groupType="high"
                percentage={32.5}
                rowSpan={3}
              />
            </TableRow>
            <TableRow>
              <TableCell>Position 8</TableCell>
              <TableCell align="right">15</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Position 6</TableCell>
              <TableCell align="right">14</TableCell>
            </TableRow>

            {/* Middle tier group */}
            <TableRow>
              <TableCell>Position 7</TableCell>
              <TableCell align="right">10</TableCell>
              <GroupingIndicator
                groupType="middle"
                percentage={38.0}
                rowSpan={3}
              />
            </TableRow>
            <TableRow>
              <TableCell>Position 5</TableCell>
              <TableCell align="right">18</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Position 3</TableCell>
              <TableCell align="right">13</TableCell>
            </TableRow>

            {/* Low performers group */}
            <TableRow>
              <TableCell>Position 4</TableCell>
              <TableCell align="right">11</TableCell>
              <GroupingIndicator
                groupType="low"
                percentage={29.5}
                rowSpan={3}
              />
            </TableRow>
            <TableRow>
              <TableCell>Position 2</TableCell>
              <TableCell align="right">9</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Position 1</TableCell>
              <TableCell align="right">9</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    ),
  ],
  args: {
    groupType: "high",
    percentage: 32.5,
    rowSpan: 3,
  },
};
