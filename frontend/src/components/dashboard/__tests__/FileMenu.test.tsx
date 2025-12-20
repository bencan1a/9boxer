import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileMenu } from '../FileMenu';
import { useSessionStore } from '../../../store/sessionStore';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../../../theme/theme';
import { apiClient } from '../../../services/api';

// Mock dependencies
vi.mock('../../../store/sessionStore');
vi.mock('../../../services/api', () => ({
  apiClient: {
    exportSession: vi.fn(),
  },
}));
vi.mock('../../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

// Wrapper with theme provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = getTheme('light');
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('FileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays "No file selected" when no session is active', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: null,
      filename: null,
      changes: [],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    expect(screen.getByText('No file selected')).toBeInTheDocument();
  });

  it('displays filename when session is active', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
  });

  it('displays badge with changes count when changes exist', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [
        { employee_id: 1, old_performance: '3', old_potential: '3', new_performance: '4', new_potential: '4' },
        { employee_id: 2, old_performance: '3', old_potential: '3', new_performance: '5', new_potential: '5' },
      ],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    // Badge should show "2"
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens menu when button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('file-menu')).toBeInTheDocument();
    });

    expect(screen.getByText('Import Data')).toBeInTheDocument();
  });

  it('displays "Apply 0 Changes to Excel" when no changes exist', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Apply 0 Changes to Excel')).toBeInTheDocument();
    });
  });

  it('displays "Apply X Changes to Excel" with correct count', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [
        { employee_id: 1, old_performance: '3', old_potential: '3', new_performance: '4', new_potential: '4' },
        { employee_id: 2, old_performance: '3', old_potential: '3', new_performance: '5', new_potential: '5' },
        { employee_id: 3, old_performance: '3', old_potential: '3', new_performance: '2', new_potential: '2' },
      ],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Apply 3 Changes to Excel')).toBeInTheDocument();
    });
  });

  it('disables export menu item when no changes exist', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      const exportMenuItem = screen.getByTestId('export-changes-menu-item');
      expect(exportMenuItem).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('enables export menu item when changes exist', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [
        { employee_id: 1, old_performance: '3', old_potential: '3', new_performance: '4', new_potential: '4' },
      ],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      const exportMenuItem = screen.getByTestId('export-changes-menu-item');
      expect(exportMenuItem).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('disables "Open Recent File" menu item (future feature)', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      const recentFileMenuItem = screen.getByTestId('recent-file-menu-item');
      expect(recentFileMenuItem).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByText('(Coming Soon)')).toBeInTheDocument();
    });
  });

  it('calls exportSession API when export menu item is clicked', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    vi.mocked(apiClient.exportSession).mockResolvedValue(mockBlob);

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [
        { employee_id: 1, old_performance: '3', old_potential: '3', new_performance: '4', new_potential: '4' },
      ],
    } as any);

    render(
      <TestWrapper>
        <FileMenu />
      </TestWrapper>
    );

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    const exportMenuItem = await screen.findByTestId('export-changes-menu-item');
    await user.click(exportMenuItem);

    await waitFor(() => {
      expect(apiClient.exportSession).toHaveBeenCalled();
    });
  });
});
