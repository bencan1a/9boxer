import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../../test/utils'
import { NineBoxGrid } from '../NineBoxGrid'
import { mockEmployeesByPosition } from '../../../test/mockData'

// Mock the useEmployees hook
vi.mock('../../../hooks/useEmployees', () => ({
  useEmployees: () => ({
    employeesByPosition: mockEmployeesByPosition,
    getShortPositionLabel: (position: number) => {
      const labels: Record<number, string> = {
        1: '[L,L]',
        2: '[M,L]',
        3: '[H,L]',
        4: '[L,M]',
        5: '[M,M]',
        6: '[H,M]',
        7: '[L,H]',
        8: '[M,H]',
        9: '[H,H]',
      }
      return labels[position] || ''
    },
    positionToLevels: (position: number) => {
      const mapping: Record<number, { performance: string; potential: string }> = {
        1: { performance: 'Low', potential: 'Low' },
        2: { performance: 'Medium', potential: 'Low' },
        3: { performance: 'High', potential: 'Low' },
        4: { performance: 'Low', potential: 'Medium' },
        5: { performance: 'Medium', potential: 'Medium' },
        6: { performance: 'High', potential: 'Medium' },
        7: { performance: 'Low', potential: 'High' },
        8: { performance: 'Medium', potential: 'High' },
        9: { performance: 'High', potential: 'High' },
      }
      return mapping[position] || { performance: 'Medium', potential: 'Medium' }
    },
    moveEmployee: vi.fn(),
    selectEmployee: vi.fn(),
  }),
}))

describe('NineBoxGrid', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders all 9 grid boxes with correct labels', () => {
    render(<NineBoxGrid />)

    // Check for all position labels (now displayed as "Name [X,Y]")
    expect(screen.getByText(/Underperformer \[L,L\]/)).toBeInTheDocument()
    expect(screen.getByText(/Effective Pro \[M,L\]/)).toBeInTheDocument()
    expect(screen.getByText(/Workhorse \[H,L\]/)).toBeInTheDocument()
    expect(screen.getByText(/Inconsistent \[L,M\]/)).toBeInTheDocument()
    expect(screen.getByText(/Core Talent \[M,M\]/)).toBeInTheDocument()
    expect(screen.getByText(/High Impact \[H,M\]/)).toBeInTheDocument()
    expect(screen.getByText(/Enigma \[L,H\]/)).toBeInTheDocument()
    expect(screen.getByText(/Growth \[M,H\]/)).toBeInTheDocument()
    expect(screen.getByText(/Star \[H,H\]/)).toBeInTheDocument()
  })

  it('distributes employees to correct positions', () => {
    render(<NineBoxGrid />)

    // Check employees are in correct boxes
    expect(screen.getByText('Eve Davis')).toBeInTheDocument() // Position 5
    expect(screen.getByText('David Brown')).toBeInTheDocument() // Position 6
    expect(screen.getByText('Carol White')).toBeInTheDocument() // Position 7
    expect(screen.getByText('Bob Smith')).toBeInTheDocument() // Position 8
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument() // Position 9
  })

  it('displays axis labels for Performance and Potential', () => {
    render(<NineBoxGrid />)

    expect(screen.getByText('Performance (Low → High)')).toBeInTheDocument()
    expect(screen.getByText('Potential (Low → High)')).toBeInTheDocument()
  })

  it('renders empty boxes when no employees are in a position', () => {
    render(<NineBoxGrid />)

    // Positions 1-4 have no employees in our mock data
    // The boxes should still render with a count of 0
    const allBoxes = screen.getAllByLabelText(/Expand box/)
    expect(allBoxes.length).toBeGreaterThanOrEqual(9)
  })
})
