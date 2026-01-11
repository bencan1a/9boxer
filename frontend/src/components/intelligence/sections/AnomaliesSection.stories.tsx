import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { AnomaliesSection } from "./AnomaliesSection";
import {
  mockMixedAnomalies,
  mockManyAnomalies,
  mockNoAnomalies,
  mockFunctionAnomaly,
  mockLocationAnomaly,
  mockOutlierAnomaly,
  createMockAnomaly,
} from "../../../mocks/mockAnomalies";

/**
 * AnomaliesSection - 🔮 Future Feature
 *
 * This section component is planned for AI-powered insights but not yet
 * implemented in the application. It will display a collection of anomalies
 * detected in employee data with filtering and severity grouping.
 */
const meta: Meta<typeof AnomaliesSection> = {
  title: "Intelligence/Sections/🔮 Future Feature - AnomaliesSection",
  component: AnomaliesSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "🔮 **Future Feature** - This component is planned for AI-powered insights but not yet implemented in the application. It will display a collection of detected anomalies in employee data, organized by severity level with grouping and filtering capabilities.",
      },
    },
  },
  argTypes: {
    anomalies: {
      description: "List of anomalies to display",
    },
    onAnomalyClick: {
      description: "Callback when anomaly card is clicked",
      action: "anomaly-click",
    },
    onAnomalyDismiss: {
      description: "Callback when anomaly is dismissed",
      action: "anomaly-dismiss",
    },
    showActions: {
      control: "boolean",
      description: "Whether to show action buttons",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnomaliesSection>;

/**
 * Empty state - no anomalies detected
 */
export const Empty: Story = {
  args: {
    anomalies: mockNoAnomalies,
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

/**
 * Single critical anomaly - highest severity
 */
export const SingleCritical: Story = {
  args: {
    anomalies: [mockFunctionAnomaly],
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

/**
 * Mixed severity - critical, warning, and info anomalies
 * Tests severity badge display and color coding
 */
export const MixedSeverity: Story = {
  args: {
    anomalies: mockMixedAnomalies,
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

/**
 * Many anomalies - stress test with 7+ items
 * Tests scrolling, performance, and layout with many items
 */
export const ManyAnomalies: Story = {
  args: {
    anomalies: mockManyAnomalies,
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

/**
 * Without actions - anomalies with no action buttons
 * Tests read-only display mode
 */
export const WithoutActions: Story = {
  args: {
    anomalies: mockMixedAnomalies,
    showActions: false,
  },
};

/**
 * All info severity - multiple low-priority anomalies
 * Tests display when all anomalies are informational
 */
export const AllInfo: Story = {
  args: {
    anomalies: [
      mockOutlierAnomaly,
      createMockAnomaly(
        "info-001",
        "function",
        "info",
        "Engineering High Performer Trend",
        "Engineering function shows 5% above average high performer rate.",
        10,
        undefined,
        0.82
      ),
      createMockAnomaly(
        "info-002",
        "location",
        "info",
        "Regional Growth Observed",
        "West Coast offices showing 8% increase in high potential ratings year-over-year.",
        6,
        "Continue monitoring regional trends.",
        0.79
      ),
      createMockAnomaly(
        "info-003",
        "outlier",
        "info",
        "New Hires Showing Strong Potential",
        "Employees with less than 1 year tenure show 35% high potential rating, compared to 25% baseline.",
        7,
        "Continue monitoring and ensure proper onboarding support.",
        0.78
      ),
    ],
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

/**
 * All critical severity - multiple high-priority anomalies
 * Tests display when all anomalies are critical
 */
export const AllCritical: Story = {
  args: {
    anomalies: [
      mockFunctionAnomaly,
      createMockAnomaly(
        "crit-001",
        "distribution",
        "critical",
        "90% Concentrated in Top-Right Quadrant",
        "An unusually high proportion of employees (90%) are placed in the high performance/high potential box. Expected distribution is approximately 11%.",
        45,
        "Review calibration process to ensure proper differentiation across the 9-box grid.",
        0.98
      ),
      createMockAnomaly(
        "crit-002",
        "outlier",
        "critical",
        "Long-Tenured Employees in Low Box",
        "12 employees with 10+ years tenure are rated low performance/low potential.",
        12,
        "Review whether tenure is being properly considered in assessments.",
        0.91
      ),
    ],
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

/**
 * Single warning - moderate severity
 */
export const SingleWarning: Story = {
  args: {
    anomalies: [mockLocationAnomaly],
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

/**
 * No handlers - anomalies without any callbacks
 * Tests component resilience when no event handlers provided
 */
export const NoHandlers: Story = {
  args: {
    anomalies: mockMixedAnomalies,
    showActions: true,
  },
};
