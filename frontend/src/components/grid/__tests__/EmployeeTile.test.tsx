import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import { EmployeeTile } from '../EmployeeTile'
import { createMockEmployee } from '../../../test/mockData'
import { DndContext } from '@dnd-kit/core'
import userEvent from '@testing-library/user-event'

// Wrapper for drag-and-drop context
const DndWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>{children}</DndContext>
)

describe('EmployeeTile', () => {
  const mockOnSelect = vi.fn()

  const defaultEmployee = createMockEmployee({
    employee_id: 1,
    name: 'John Doe',
    business_title: 'Software Engineer',
    job_level: 'MT4',
    modified_in_session: false,
  })

  it('displays employee name, title, and job level', () => {
    render(
      <DndWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('MT4')).toBeInTheDocument()
  })

  it('shows modified indicator when employee was modified in session', () => {
    const modifiedEmployee = createMockEmployee({
      ...defaultEmployee,
      modified_in_session: true,
    })

    render(
      <DndWrapper>
        <EmployeeTile employee={modifiedEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
    )

    expect(screen.getByText('Modified')).toBeInTheDocument()
  })

  it('does not show modified indicator when employee was not modified', () => {
    render(
      <DndWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
    )

    expect(screen.queryByText('Modified')).not.toBeInTheDocument()
  })

  it('calls onSelect when employee card is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DndWrapper>
        <EmployeeTile employee={defaultEmployee} onSelect={mockOnSelect} />
      </DndWrapper>
    )

    const card = screen.getByText('John Doe').closest('.MuiCard-root')
    expect(card).toBeInTheDocument()

    if (card) {
      await user.click(card)
      expect(mockOnSelect).toHaveBeenCalledWith(1)
    }
  })
})
