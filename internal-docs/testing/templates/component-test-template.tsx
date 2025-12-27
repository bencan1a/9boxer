/**
 * TEMPLATE: React Component Test
 *
 * Use this template when writing Vitest + React Testing Library component tests.
 *
 * Location: frontend/src/components/__tests__/ComponentName.test.tsx
 * or colocated as: frontend/src/components/ComponentName.test.tsx
 *
 * Key Principles:
 * - Test user-visible behavior, not implementation details
 * - No conditional logic in tests
 * - Use data-testid for reliable selectors
 * - Mock external dependencies
 * - Keep tests simple and focused
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import ComponentName from '@/components/ComponentName';

/**
 * Describe block: Use the component name
 */
describe('ComponentName', () => {
  /**
   * Optional: Setup before each test
   * Use for common test data or mocking
   */
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  /**
   * TEST 1: Happy path - component renders correctly
   * Tests the most basic behavior: the component displays expected content
   */
  it('displays expected content when rendered', () => {
    // Arrange: Set up test data
    const testProps = {
      title: 'Test Title',
      content: 'Test Content',
    };

    // Act: Render component
    render(<ComponentName {...testProps} />);

    // Assert: Verify component displays correctly
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  /**
   * TEST 2: User interaction
   * Tests that component responds correctly to user actions
   */
  it('calls callback when user clicks button', () => {
    // Arrange: Mock the callback handler
    const handleClick = vi.fn();
    const testProps = {
      label: 'Click me',
      onClick: handleClick,
    };

    // Act: Render and click button
    render(<ComponentName {...testProps} />);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    // Assert: Verify handler was called
    expect(handleClick).toHaveBeenCalledOnce();
  });

  /**
   * TEST 3: Props variation or conditional rendering
   * Tests component behavior with different props
   */
  it('displays error state when error prop is provided', () => {
    // Arrange: Set props with error state
    const errorMessage = 'Something went wrong';
    const testProps = {
      error: errorMessage,
      status: 'error' as const,
    };

    // Act: Render component with error state
    render(<ComponentName {...testProps} />);

    // Assert: Verify error is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  /**
   * TEST 4: Async behavior
   * Tests components that load data or perform async operations
   */
  it('displays loading state then content after data loads', async () => {
    // Arrange: Mock async data fetch
    const mockData = { id: 1, name: 'Test Item' };
    const testProps = {
      itemId: 1,
    };

    // Act: Render component
    render(<ComponentName {...testProps} />);

    // Assert: Verify loading state appears first
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Assert: Verify content appears after loading completes
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  /**
   * TEST 5: Edge case or error handling
   * Tests component behavior with invalid or edge case inputs
   */
  it('handles missing data gracefully', () => {
    // Arrange: Render with minimal/missing props
    const testProps = {
      data: undefined,
    };

    // Act: Render component
    render(<ComponentName {...testProps} />);

    // Assert: Verify component displays empty state or default message
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    // Component should not crash
    expect(screen.getByTestId('component-root')).toBeInTheDocument();
  });
});

/**
 * Common Testing Patterns
 *
 * 1. Mock Functions:
 *    const mockFn = vi.fn();
 *    expect(mockFn).toHaveBeenCalled();
 *    expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
 *
 * 2. Find Elements:
 *    screen.getByText('text')           // By text content
 *    screen.getByRole('button')         // By ARIA role
 *    screen.getByTestId('test-id')      // By data-testid
 *    screen.queryByText('text')         // Returns null if not found
 *
 * 3. User Interaction:
 *    fireEvent.click(element)
 *    fireEvent.change(input, { target: { value: 'new' } })
 *    fireEvent.submit(form)
 *
 * 4. Async Operations:
 *    await waitFor(() => {
 *      expect(screen.getByText('loaded')).toBeInTheDocument();
 *    });
 *
 * 5. Custom Render with Providers:
 *    render(<Component />) uses @/test/utils which includes all providers
 *
 * 6. Assertions:
 *    expect(element).toBeInTheDocument()
 *    expect(element).toHaveTextContent('text')
 *    expect(element).toBeVisible()
 *    expect(element).toHaveAttribute('data-testid', 'value')
 *    expect(fn).toHaveBeenCalledWith(args)
 *
 * 7. Cleanup:
 *    Automatic after each test (handled by setup.ts)
 */
