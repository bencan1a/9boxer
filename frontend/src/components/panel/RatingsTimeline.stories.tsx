import type { Meta, StoryObj } from '@storybook/react';
import { RatingsTimeline } from './RatingsTimeline';
import type { Employee, PerformanceLevel, PotentialLevel } from '@/types/employee';

/**
 * RatingsTimeline displays a vertical timeline of employee performance ratings over the years.
 * Shows current year (2025) assessment at the top, followed by historical ratings in descending order.
 *
 * **Key Features:**
 * - Vertical timeline with connected dots
 * - Current year highlighted with green dot and "Current Assessment" label
 * - Historical years shown with blue dots
 * - Displays performance and potential for current year
 * - Shows historical rating strings
 * - Empty state message when no history available
 *
 * **Timeline Structure:**
 * - Top: Current year (2025) with performance and potential
 * - Below: Historical ratings sorted by year (most recent first)
 * - Timeline connectors between items
 *
 * **Used In:**
 * - Right panel Details tab
 * - Below employee information section
 */
const meta: Meta<typeof RatingsTimeline> = {
  title: 'Panel/RatingsTimeline',
  component: RatingsTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
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
      description: 'Employee data object with ratings history',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RatingsTimeline>;

// Base employee template
const baseEmployee: Employee = {
  employee_id: 12345,
  name: 'Alice Johnson',
  business_title: 'Senior Software Engineer',
  job_title: 'Software Engineer III',
  job_profile: 'Engineering-USA',
  job_level: 'MT5',
  job_function: 'Engineering',
  location: 'USA',
  manager: 'Bob Smith',
  management_chain_01: null,
  management_chain_02: null,
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: '2018-01-15',
  tenure_category: '5-10 years',
  time_in_job_profile: '3 years',
  performance: 'High' as PerformanceLevel,
  potential: 'High' as PotentialLevel,
  grid_position: 9,
  talent_indicator: 'Star',
  ratings_history: [],
  development_focus: null,
  development_action: null,
  notes: null,
  promotion_status: null,
  promotion_readiness: null,
  modified_in_session: false,
  last_modified: null,
  flags: [],
};

/**
 * Employee with complete rating history (5+ years).
 * Shows progression from "Developing" to "Strong" to "Leading" ratings.
 * Demonstrates upward trajectory in performance over time.
 */
export const WithHistory: Story = {
  args: {
    employee: {
      ...baseEmployee,
      ratings_history: [
        { year: 2024, rating: 'Strong' },
        { year: 2023, rating: 'Leading' },
        { year: 2022, rating: 'Strong' },
        { year: 2021, rating: 'Solid' },
        { year: 2020, rating: 'Developing' },
      ],
    },
  },
};

/**
 * New employee with no historical ratings.
 * Shows only current year (2025) assessment with empty state message.
 * Common for employees hired in the current year.
 */
export const NoHistory: Story = {
  args: {
    employee: {
      ...baseEmployee,
      employee_id: 99999,
      name: 'John Doe',
      hire_date: '2024-10-01',
      tenure_category: '0-1 years',
      performance: 'Medium' as PerformanceLevel,
      potential: 'Medium' as PotentialLevel,
      grid_position: 5,
      ratings_history: [],
    },
  },
};

/**
 * Long-tenured employee with 10+ years of history.
 * Shows extensive performance track record.
 * Tests timeline layout with many items.
 */
export const MultipleYears: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: 'Senior Leader',
      business_title: 'Vice President of Engineering',
      hire_date: '2010-03-01',
      tenure_category: '10+ years',
      ratings_history: [
        { year: 2024, rating: 'Leading' },
        { year: 2023, rating: 'Leading' },
        { year: 2022, rating: 'Strong' },
        { year: 2021, rating: 'Strong' },
        { year: 2020, rating: 'Strong' },
        { year: 2019, rating: 'Solid' },
        { year: 2018, rating: 'Solid' },
        { year: 2017, rating: 'Strong' },
        { year: 2016, rating: 'Solid' },
        { year: 2015, rating: 'Developing' },
      ],
    },
  },
};

/**
 * Employee with inconsistent performance ratings.
 * Shows fluctuation between different rating levels.
 * Useful for identifying performance volatility.
 */
export const InconsistentRatings: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: 'Variable Performer',
      performance: 'Medium' as PerformanceLevel,
      potential: 'Medium' as PotentialLevel,
      grid_position: 5,
      ratings_history: [
        { year: 2024, rating: 'Strong' },
        { year: 2023, rating: 'Developing' },
        { year: 2022, rating: 'Solid' },
        { year: 2021, rating: 'Strong' },
        { year: 2020, rating: 'Solid' },
      ],
    },
  },
};

/**
 * High potential employee with short history.
 * Shows 2-3 years of ratings for a rising star.
 * Demonstrates rapid progression.
 */
export const ShortHistoryHighPotential: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: 'Rising Star',
      hire_date: '2022-01-15',
      tenure_category: '1-3 years',
      performance: 'High' as PerformanceLevel,
      potential: 'High' as PotentialLevel,
      grid_position: 9,
      flags: ['high-potential', 'promotion-ready'],
      ratings_history: [
        { year: 2024, rating: 'Leading' },
        { year: 2023, rating: 'Strong' },
        { year: 2022, rating: 'Developing' },
      ],
    },
  },
};

/**
 * Employee currently on performance plan.
 * Shows decline in ratings leading to low current assessment.
 * Helps identify performance concerns.
 */
export const PerformanceConcern: Story = {
  args: {
    employee: {
      ...baseEmployee,
      name: 'Performance Plan Employee',
      performance: 'Low' as PerformanceLevel,
      potential: 'Low' as PotentialLevel,
      grid_position: 1,
      flags: ['performance-plan'],
      ratings_history: [
        { year: 2024, rating: 'Development Needed' },
        { year: 2023, rating: 'Developing' },
        { year: 2022, rating: 'Solid' },
      ],
    },
  },
};
