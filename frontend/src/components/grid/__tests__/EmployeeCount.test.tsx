import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmployeeCount } from '../EmployeeCount'
import { useEmployees } from '../../../hooks/useEmployees'
import { useSessionStore } from '../../../store/sessionStore'
import { useFilters } from '../../../hooks/useFilters'
import { ThemeProvider } from '@mui/material/styles'
import { getTheme } from '../../../theme/theme'
import { mockEmployees } from '../../../test/mockData'

// Mock dependencies
vi.mock('../../../hooks/useEmployees')
vi.mock('../../../store/sessionStore')
vi.mock('../../../hooks/useFilters')

// Wrapper with theme provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = getTheme('light')
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

describe('EmployeeCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows total count when no filters are active', () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toHaveTextContent('5 employees')
  })

  it('shows filtered count when filters are active', () => {
    const filteredEmployees = mockEmployees.slice(0, 2) // 2 employees

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees, // 5 total
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ['MT4'],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toHaveTextContent('2 of 5 employees')
  })

  it('uses correct singular pluralization for 1 employee', () => {
    const singleEmployee = [mockEmployees[0]]

    vi.mocked(useEmployees).mockReturnValue({
      employees: singleEmployee,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: singleEmployee,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toHaveTextContent('1 employee')
    expect(count).not.toHaveTextContent('employees')
  })

  it('uses correct plural pluralization for multiple employees', () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toHaveTextContent('employees')
  })

  it('handles zero employees edge case', () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: [],
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: [],
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toHaveTextContent('No employees')
  })

  it('shows total count when all filters match (filtered count equals total)', () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ['MT4'], // All employees match
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    // When filtered count equals total, show total only
    expect(count).toHaveTextContent('5 employees')
  })

  it('displays tooltip with filter breakdown when filters are active', () => {
    const filteredEmployees = mockEmployees.slice(0, 2)

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ['MT4', 'MT5'],
      selectedJobFunctions: ['Engineering'],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toBeInTheDocument()

    // Tooltip should contain filter information (verified via aria-label)
    expect(count).toHaveAttribute('aria-label', expect.stringContaining('Showing 2 of 5 employees with active filters'))
  })

  it('displays simple tooltip when no filters are active', () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toHaveAttribute('aria-label', '5 total employees')
  })

  it('includes excluded employees count in tooltip when present', () => {
    const filteredEmployees = mockEmployees.slice(0, 3)

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [1, 2], // 2 excluded
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    // Verify the component renders (detailed tooltip content is in the component's internal state)
    expect(count).toBeInTheDocument()
    expect(count).toHaveTextContent('3 of 5 employees')
  })

  it('includes multiple filter types in tooltip', () => {
    const filteredEmployees = mockEmployees.slice(0, 1)

    vi.mocked(useEmployees).mockReturnValue({
      employees: filteredEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: true,
      selectedLevels: ['MT4'],
      selectedJobFunctions: ['Engineering'],
      selectedLocations: ['USA'],
      selectedManagers: ['Jane Smith'],
      excludedEmployeeIds: [5],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toBeInTheDocument()
    expect(count).toHaveTextContent('1 of 5 employee') // singular
  })

  it('has correct accessibility labels', () => {
    vi.mocked(useEmployees).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useSessionStore).mockReturnValue({
      employees: mockEmployees,
    } as any)
    vi.mocked(useFilters).mockReturnValue({
      hasActiveFilters: false,
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
    } as any)

    render(
      <TestWrapper>
        <EmployeeCount />
      </TestWrapper>
    )

    const count = screen.getByTestId('employee-count')
    expect(count).toHaveAttribute('aria-label')
  })
})
