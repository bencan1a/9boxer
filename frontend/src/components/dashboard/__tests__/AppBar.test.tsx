import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppBar } from '../AppBar'
import { useSessionStore } from '../../../store/sessionStore'
import { ThemeProvider } from '@mui/material/styles'
import { getTheme } from '../../../theme/theme'

// Mock dependencies
vi.mock('../../../store/sessionStore')
vi.mock('../../../hooks/useFilters', () => ({
  useFilters: () => ({
    toggleDrawer: vi.fn(),
    hasActiveFilters: false,
    applyFilters: (employees: any[]) => employees,
    selectedLevels: [],
    selectedJobFunctions: [],
    selectedLocations: [],
    selectedManagers: [],
    excludedEmployeeIds: [],
  }),
}))
vi.mock('../../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}))

// Wrapper with theme provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = getTheme('light')
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

describe('AppBar - Donut Mode', () => {
  const mockToggleDonutMode = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders donut mode button when component loads', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      employees: [],
      changes: [],
      filename: 'test.xlsx',
      donutModeActive: false,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const donutButton = screen.getByTestId('donut-mode-button')
    expect(donutButton).toBeInTheDocument()
  })

  it('disables donut mode button when no session is active', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: null,
      employees: [],
      changes: [],
      filename: null,
      donutModeActive: false,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const donutButton = screen.getByTestId('donut-mode-button')
    expect(donutButton).toBeDisabled()
  })

  it('calls toggleDonutMode when donut mode button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      employees: [],
      changes: [],
      filename: 'test.xlsx',
      donutModeActive: false,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const donutButton = screen.getByTestId('donut-mode-button')
    await user.click(donutButton)

    await waitFor(() => {
      expect(mockToggleDonutMode).toHaveBeenCalledWith(true)
    })
  })

  it('displays ACTIVE indicator chip when donut mode is active', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      employees: [],
      changes: [],
      filename: 'test.xlsx',
      donutModeActive: true,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const activeIndicator = screen.getByTestId('donut-mode-indicator')
    expect(activeIndicator).toBeInTheDocument()
    expect(activeIndicator).toHaveTextContent('ACTIVE')
  })

  it('does not display ACTIVE indicator when donut mode is inactive', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      employees: [],
      changes: [],
      filename: 'test.xlsx',
      donutModeActive: false,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const activeIndicator = screen.queryByTestId('donut-mode-indicator')
    expect(activeIndicator).not.toBeInTheDocument()
  })

  it('applies secondary color styling when donut mode is active', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      employees: [],
      changes: [],
      filename: 'test.xlsx',
      donutModeActive: true,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const donutButton = screen.getByTestId('donut-mode-button')
    // Check that button has the MuiButton-containedSecondary class (applied when color="secondary" and variant="contained")
    expect(donutButton).toHaveClass('MuiButton-containedSecondary')
  })

  it('applies default inherit styling when donut mode is inactive', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      employees: [],
      changes: [],
      filename: 'test.xlsx',
      donutModeActive: false,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const donutButton = screen.getByTestId('donut-mode-button')
    // When inactive, button should be text variant (MuiButton-text) with colorInherit
    expect(donutButton).toHaveClass('MuiButton-text')
    expect(donutButton).toHaveClass('MuiButton-colorInherit')
  })

  it('toggles donut mode off when button is clicked while active', async () => {
    const user = userEvent.setup()
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      employees: [],
      changes: [],
      filename: 'test.xlsx',
      donutModeActive: true,
      toggleDonutMode: mockToggleDonutMode,
    } as any)

    render(
      <TestWrapper>
        <AppBar />
      </TestWrapper>
    )

    const donutButton = screen.getByTestId('donut-mode-button')
    await user.click(donutButton)

    await waitFor(() => {
      expect(mockToggleDonutMode).toHaveBeenCalledWith(false)
    })
  })
})
