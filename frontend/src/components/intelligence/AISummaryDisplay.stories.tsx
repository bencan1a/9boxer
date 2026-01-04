import type { Meta, StoryObj } from "@storybook/react";
import { AISummaryDisplay } from "./AISummaryDisplay";

// Mock AI summary data for stories
const mockShortSummary =
  "Your calibration data shows a clear pattern: MT3 level is driving your center box inflation, with 64% of employees rated in the middle vs. 35% expected. For your calibration meeting, allocate 45 minutes to deep-dive MT3 ratings and discuss whether new hire conservatism is justified.";

const mockLongSummary = `Your calibration data shows a clear pattern: MT3 level is driving your center box inflation, with 64% of employees rated in the middle vs. 35% expected. Within MT3, new hires (< 1 year tenure) are particularly concentrated in the center box at 80% vs. 41% company average.

This pattern suggests recent hiring growth at MT3 may be creating rating conservatism. New managers may be reluctant to differentiate their new team members, or insufficient performance data may be limiting confident assessments.

For your calibration meeting, allocate 45 minutes to deep-dive MT3 ratings. Focus discussion on: (1) whether new hire conservatism is justified, (2) if tenured MT3s show better differentiation, and (3) whether you need adjusted expectations for new hire assessment timelines.`;

const mockVeryLongSummary = `Your calibration data reveals three interconnected patterns requiring careful attention during your calibration meeting.

First, MT3 level is driving significant center box inflation, with 64% of employees rated in the middle vs. 35% expected (p<0.001, z-score 3.2). This represents 45 employees and is statistically significant. Within MT3, the pattern is heavily influenced by tenure: new hires (< 1 year) are concentrated in the center box at 80% vs. 41% company average, affecting 28 employees.

Second, your Engineering function shows unusual distribution patterns across multiple levels. While this partially overlaps with MT3 (many MT3s are Engineers), the function as a whole demonstrates 55% center box concentration vs. 30% recommended maximum. This suggests either rating inflation or genuine performance clustering that needs discussion.

Third, your Remote location employees show lower performance ratings than office-based employees (45% lower performers vs. 11.5% company average). This is statistically significant (p<0.001) and affects 23 employees. Consider whether this reflects actual performance differences, rating bias, or insufficient visibility into remote work contributions.

For your calibration meeting, recommend the following approach: (1) Allocate 45 minutes to deep-dive MT3 ratings, starting with new hire assessment practices, (2) Spend 20 minutes on Engineering function distribution to determine if clustering is justified or indicates calibration drift, (3) Reserve 25 minutes for Remote employee discussion to ensure fair assessment practices. Total estimated meeting time: 90 minutes. Suggested sequence: MT3 analysis → Remote employee fairness → Engineering distribution patterns.`;

/**
 * AISummaryDisplay - AI-Generated Calibration Summary Component
 *
 * Displays Claude-generated executive summary of calibration data with
 * expandable/collapsible functionality. Shows 3-line preview by default,
 * full summary when expanded.
 *
 * **Key Features:**
 * - Expandable/collapsible summary text
 * - "Powered by Claude" attribution
 * - Gradient fade effect when collapsed
 * - Primary-themed Paper container with left border accent
 *
 * **Use Cases:**
 * - Pre-meeting preparation overview
 * - Executive summary for calibration leaders
 * - Root cause identification and meeting approach recommendations
 *
 * @screenshots
 *   - ai-summary-expanded: Full AI summary with "Show less" button
 *   - ai-summary-preview: Collapsed 3-line preview with "Read full" button
 */
const meta: Meta<typeof AISummaryDisplay> = {
  title: "Intelligence/CalibrationSummary/AISummaryDisplay",
  component: AISummaryDisplay,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Displays AI-generated executive summary of calibration data. Summary is powered by Claude (Anthropic) and provides root cause analysis, affected employee counts, and recommended meeting approach. Component starts collapsed (3-line preview) and can be expanded to show full summary.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AISummaryDisplay>;

/**
 * Short summary (single paragraph) - typical for simple calibration sessions.
 * Summary fits within collapsed view without much overflow.
 */
export const ShortSummary: Story = {
  args: {
    summary: mockShortSummary,
  },
};

/**
 * Standard summary (3 paragraphs) - most common case.
 * Shows complete analysis with root cause, explanation, and recommendations.
 * This is the primary screenshot story for documentation.
 */
export const ExpandedSummary: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: {
      enabled: true,
      id: "ai-summary-expanded",
    },
  },
  args: {
    summary: mockLongSummary,
  },
};

/**
 * Long summary (4+ paragraphs) - enterprise scale with complex patterns.
 * Demonstrates scrollable content when expanded and gradient fade when collapsed.
 */
export const VeryLongSummary: Story = {
  args: {
    summary: mockVeryLongSummary,
  },
};

/**
 * Collapsed preview state - shows first 3 lines with "Read full" button.
 * Component starts in this state by default.
 * This story demonstrates the preview UX before expansion.
 */
export const CollapsedPreview: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: {
      enabled: true,
      id: "ai-summary-preview",
    },
    docs: {
      description: {
        story:
          "Default collapsed state showing 3-line preview with gradient fade effect. Users click 'Read full' to expand.",
      },
    },
  },
  args: {
    summary: mockLongSummary,
  },
};

/**
 * Real-world example with specific numbers and recommendations.
 * Mirrors actual Claude API output format.
 */
export const RealWorldExample: Story = {
  args: {
    summary: `Analysis of your 200-employee calibration session identifies three critical focus areas. Center box overcrowding (42% vs. 30% recommended) affects 84 employees and requires immediate attention. New York office shows 45% lower performers (23 employees) vs. 11.5% company average (p<0.001), suggesting potential systemic issues. Engineering function has 55% in center box, indicating possible rating inflation or role misalignment.

Recommend 90-minute meeting structured as follows: Start with 30-minute deep-dive on New York lower performer concentration to identify root causes (management, expectations, or support gaps). Follow with 25-minute Engineering calibration review focusing on differentiation practices. Conclude with 35-minute center box discussion across all groups to establish clearer rating standards.

Key questions to address: (1) Are New York performance issues systemic or coincidental? (2) Is Engineering's center box concentration justified by role similarity or indicative of rating drift? (3) What support mechanisms exist for the 23 lower performers?`,
  },
};
