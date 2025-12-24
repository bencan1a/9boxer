/**
 * Example Component Test with i18n Best Practices
 * 
 * This template demonstrates how to write component tests that use
 * internationalization (i18n) translation keys instead of hardcoded strings.
 * 
 * Key Principles:
 * 1. Import getTranslatedText() helper
 * 2. Use translation keys for all UI text assertions
 * 3. Test pluralization with multiple count values
 * 4. Use data-testid for structural queries
 * 5. Test aria-labels with translations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { getTranslatedText } from '@/test/i18nTestUtils'
import { ExampleComponent } from '../ExampleComponent'

// Mock external dependencies
vi.mock('@/store/exampleStore')

describe('ExampleComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ✓ PATTERN 1: Simple translation key
  it('displays the component title', () => {
    render(<ExampleComponent />)
    
    const title = getTranslatedText('example.title')
    expect(screen.getByText(title)).toBeInTheDocument()
  })

  // ✓ PATTERN 2: Translation with interpolation
  it('displays user greeting with name', () => {
    const userName = 'Alice'
    render(<ExampleComponent userName={userName} />)
    
    const greeting = getTranslatedText('example.greeting', { name: userName })
    expect(screen.getByText(greeting)).toBeInTheDocument()
  })

  // ✓ PATTERN 3: Pluralization testing (singular)
  it('displays singular form for one item', () => {
    render(<ExampleComponent itemCount={1} />)
    
    const count = 1
    const expectedText = `${count} ${getTranslatedText('example.item', { count })}`
    expect(screen.getByText(expectedText)).toBeInTheDocument()
    
    // Verify plural form is NOT present
    const pluralText = getTranslatedText('example.item', { count: 2 })
    expect(screen.queryByText(pluralText)).not.toBeInTheDocument()
  })

  // ✓ PATTERN 4: Pluralization testing (plural)
  it('displays plural form for multiple items', () => {
    render(<ExampleComponent itemCount={5} />)
    
    const count = 5
    const expectedText = `${count} ${getTranslatedText('example.item', { count })}`
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  // ✓ PATTERN 5: Zero case
  it('displays empty state when no items', () => {
    render(<ExampleComponent itemCount={0} />)
    
    const emptyMessage = getTranslatedText('example.noItems')
    expect(screen.getByText(emptyMessage)).toBeInTheDocument()
  })

  // ✓ PATTERN 6: Aria-label with translation
  it('has correct accessibility labels', () => {
    render(<ExampleComponent />)
    
    const button = screen.getByTestId('example-button')
    const expectedAriaLabel = getTranslatedText('example.buttonAriaLabel')
    expect(button).toHaveAttribute('aria-label', expectedAriaLabel)
  })

  // ✓ PATTERN 7: Tooltip text with translation
  it('shows tooltip on hover', async () => {
    const user = userEvent.setup()
    render(<ExampleComponent />)
    
    const element = screen.getByTestId('example-element')
    await user.hover(element)
    
    const tooltipText = getTranslatedText('example.tooltip')
    await waitFor(() => {
      expect(screen.getByText(tooltipText)).toBeInTheDocument()
    })
  })

  // ✓ PATTERN 8: Button labels with translation
  it('calls handler when button is clicked', async () => {
    const mockHandler = vi.fn()
    const user = userEvent.setup()
    render(<ExampleComponent onAction={mockHandler} />)
    
    // Use data-testid for structural queries (not text)
    const button = screen.getByTestId('action-button')
    await user.click(button)
    
    expect(mockHandler).toHaveBeenCalledOnce()
    
    // Optionally verify button text uses translation
    const buttonText = getTranslatedText('example.actionButton')
    expect(button).toHaveTextContent(buttonText)
  })

  // ✓ PATTERN 9: Complex string with multiple translations
  it('displays filtered count with multiple translation keys', () => {
    const filteredCount = 3
    const totalCount = 10
    render(<ExampleComponent filteredCount={filteredCount} totalCount={totalCount} />)
    
    // Build expected string from multiple translation keys
    const expectedText = `${filteredCount} ${getTranslatedText('example.of')} ${totalCount} ${getTranslatedText('example.item', { count: totalCount })}`
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  // ✓ PATTERN 10: Error messages with translation
  it('displays error message when validation fails', () => {
    render(<ExampleComponent hasError={true} />)
    
    const errorMessage = getTranslatedText('example.errorMessage')
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    
    // Verify error has correct role for accessibility
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage)
  })

  // ✓ PATTERN 11: Placeholder text with translation
  it('shows placeholder text in input field', () => {
    render(<ExampleComponent />)
    
    const placeholderText = getTranslatedText('example.inputPlaceholder')
    const input = screen.getByPlaceholderText(placeholderText)
    expect(input).toBeInTheDocument()
  })

  // ✓ PATTERN 12: Success messages with translation
  it('displays success message after action completes', async () => {
    render(<ExampleComponent />)
    
    const button = screen.getByTestId('submit-button')
    await fireEvent.click(button)
    
    await waitFor(() => {
      const successMessage = getTranslatedText('example.successMessage')
      expect(screen.getByText(successMessage)).toBeInTheDocument()
    })
  })

  // ❌ ANTI-PATTERN: DO NOT hardcode strings
  it('should NOT use hardcoded strings like this', () => {
    render(<ExampleComponent />)
    
    // ❌ BAD: This will break when translations change
    expect(screen.getByText('Welcome to 9Boxer')).toBeInTheDocument()
    
    // ✓ GOOD: Use translation helper instead
    const title = getTranslatedText('example.title')
    expect(screen.getByText(title)).toBeInTheDocument()
  })
})

/**
 * Key Takeaways:
 * 
 * 1. ALWAYS import getTranslatedText from @/test/i18nTestUtils
 * 2. Use translation keys for ALL UI text assertions
 * 3. Test pluralization with count: 0, 1, 2, and 5+ values
 * 4. Use data-testid for structural queries (buttons, forms, sections)
 * 5. Test aria-labels and tooltips using translations
 * 6. Build complex strings from multiple translation keys
 * 7. Tests will fail if translation keys are missing (early detection!)
 * 8. Tests remain valid when translations change to other languages
 * 
 * Benefits:
 * - Language-independent tests
 * - Early detection of missing translations
 * - Easier to add new languages
 * - Consistent with production code
 * - More maintainable over time
 */
