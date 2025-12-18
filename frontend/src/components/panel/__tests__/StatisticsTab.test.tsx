import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../../test/utils'
import { mockEmployees, mockStatistics } from '../../../test/mockData'

// Mock the DistributionChart component to avoid recharts issues in tests
vi.mock('../DistributionChart', () => ({
  DistributionChart: () => <div data-testid="distribution-chart">Distribution Chart</div>,
}))

describe('StatisticsTab', () => {
  beforeEach(async () => {
    // Reset modules before each test
    vi.resetModules()
  })

  it('displays statistics when data is loaded', async () => {
    // Mock hooks locally for this test
    vi.doMock('../../../hooks/useEmployees', () => ({
      useEmployees: () => ({ employees: mockEmployees }),
    }))

    vi.doMock('../../../hooks/useStatistics', () => ({
      useStatistics: () => ({
        statistics: mockStatistics,
        isLoading: false,
        error: null,
      }),
    }))

    // Import component after mocks are set
    const { StatisticsTab } = await import('../StatisticsTab')

    render(<StatisticsTab />)

    // Check for total employees
    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('Modified')).toBeInTheDocument()
    expect(screen.getByText('High Performers')).toBeInTheDocument()
  })

  it('renders distribution table', async () => {
    vi.doMock('../../../hooks/useEmployees', () => ({
      useEmployees: () => ({ employees: mockEmployees }),
    }))

    vi.doMock('../../../hooks/useStatistics', () => ({
      useStatistics: () => ({
        statistics: mockStatistics,
        isLoading: false,
        error: null,
      }),
    }))

    const { StatisticsTab } = await import('../StatisticsTab')

    render(<StatisticsTab />)

    // Check table headers
    expect(screen.getByText('Position')).toBeInTheDocument()
    expect(screen.getByText('Count')).toBeInTheDocument()
    expect(screen.getByText('Percentage')).toBeInTheDocument()
  })

  it('renders distribution chart component', async () => {
    vi.doMock('../../../hooks/useEmployees', () => ({
      useEmployees: () => ({ employees: mockEmployees }),
    }))

    vi.doMock('../../../hooks/useStatistics', () => ({
      useStatistics: () => ({
        statistics: mockStatistics,
        isLoading: false,
        error: null,
      }),
    }))

    const { StatisticsTab } = await import('../StatisticsTab')

    render(<StatisticsTab />)

    expect(screen.getByTestId('distribution-chart')).toBeInTheDocument()
    expect(screen.getByText('Visual Distribution')).toBeInTheDocument()
  })
})
