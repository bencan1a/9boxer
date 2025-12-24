# i18n Testing Guide

This guide explains how to test internationalization (i18n) in the 9Boxer application. It covers component tests (Vitest), E2E tests (Playwright), and common testing patterns.

## Overview

Testing i18n ensures:
- Translations load correctly
- Language switching works
- Variables and pluralization function properly
- All UI text is translatable (no hardcoded strings)
- Layout handles longer translations (Spanish is typically 20-30% longer)

## Quick Reference

```typescript
// Component test with i18n
import { render, screen } from '@/test/utils';  // Auto-includes I18n provider
import { changeTestLanguage } from '@/test/i18nTestUtils';

it('displays translated text', async () => {
  render(<MyComponent />);
  expect(screen.getByText('Import Data')).toBeInTheDocument();

  await changeTestLanguage('es');
  expect(screen.getByText('Importar Datos')).toBeInTheDocument();
});
```

## Test Setup

### Component Tests (Vitest)

The test utilities automatically wrap components with i18n provider:

```typescript
// frontend/src/test/utils.tsx
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const AllTheProviders = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </I18nextProvider>
);

export const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });
```

**Use the custom render from test utils:**
```typescript
import { render, screen } from '@/test/utils';  // ✅ Auto-includes i18n
// NOT from '@testing-library/react' directly
```

### E2E Tests (Playwright)

Playwright tests run against the full application, so i18n is automatically available:

```typescript
import { test, expect } from '@playwright/test';

test('language switching works', async ({ page }) => {
  await page.goto('/');
  // i18n is already configured in the app
});
```

## Testing Patterns

### Pattern 1: Basic Translation Test

Test that a component renders translated text correctly:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { FileUploadDialog } from '../FileUploadDialog';

describe('FileUploadDialog', () => {
  it('displays translated title when rendered', () => {
    render(<FileUploadDialog open={true} onClose={vi.fn()} />);

    // Verify English translation appears
    expect(screen.getByText('Import Excel File')).toBeInTheDocument();
  });
});
```

**Key points:**
- Use the custom `render` from `@/test/utils` (includes i18n provider)
- Test renders in English by default
- Look for the translated text, not the translation key

### Pattern 2: Testing Language Switching

Test that UI updates when language changes:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { changeTestLanguage, resetTestLanguage } from '@/test/i18nTestUtils';
import { FileMenu } from '../FileMenu';

describe('FileMenu - Language Switching', () => {
  it('displays Spanish text when language is changed', async () => {
    render(<FileMenu />);

    // Verify initial English text
    expect(screen.getByText('Import Data')).toBeInTheDocument();

    // Switch to Spanish
    await changeTestLanguage('es');

    // Verify Spanish text appears
    expect(screen.getByText('Importar Datos')).toBeInTheDocument();

    // Clean up - reset to English for other tests
    await resetTestLanguage();
  });
});
```

**Key points:**
- Use `changeTestLanguage(language)` to switch languages
- Use `resetTestLanguage()` in cleanup to avoid test pollution
- Language change is async - use `await`

### Pattern 3: Testing Variables/Interpolation

Test that variables are correctly inserted into translations:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { useSessionStore } from '@/store/sessionStore';
import { FileMenu } from '../FileMenu';

vi.mock('@/store/sessionStore');

describe('FileMenu - Variables', () => {
  it('displays filename in translated text', () => {
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'employees.xlsx',
      changes: [],
    } as any);

    render(<FileMenu />);

    // Verify variable is interpolated
    expect(screen.getByText('employees.xlsx')).toBeInTheDocument();
  });
});
```

**Key points:**
- Variables like `{{filename}}` get replaced with actual values
- Test the final rendered text, not the translation key
- Use realistic test data that matches production usage

### Pattern 4: Testing Pluralization

Test singular and plural forms:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { useSessionStore } from '@/store/sessionStore';
import { FileMenu } from '../FileMenu';

vi.mock('@/store/sessionStore');

describe('FileMenu - Pluralization', () => {
  it('displays singular form when count is 1', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [{ /* one change */ }],
    } as any);

    render(<FileMenu />);

    // Open menu to see the text
    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      // Singular form: "Apply 1 Change to Excel"
      expect(screen.getByText('Apply 1 Change to Excel')).toBeInTheDocument();
    });
  });

  it('displays plural form when count is greater than 1', async () => {
    const user = userEvent.setup();
    vi.mocked(useSessionStore).mockReturnValue({
      sessionId: 'test-session',
      filename: 'test.xlsx',
      changes: [{ /* change 1 */ }, { /* change 2 */ }, { /* change 3 */ }],
    } as any);

    render(<FileMenu />);

    const button = screen.getByTestId('file-menu-button');
    await user.click(button);

    await waitFor(() => {
      // Plural form: "Apply 3 Changes to Excel"
      expect(screen.getByText('Apply 3 Changes to Excel')).toBeInTheDocument();
    });
  });
});
```

**Key points:**
- Test both `_one` and `_other` forms
- Test with count of 0, 1, and 2+ to cover all cases
- Pluralization happens automatically via `count` parameter

### Pattern 5: Testing with Multiple Providers

When component needs additional providers beyond i18n:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { I18nTestWrapper } from '@/test/i18nTestUtils';
import { getTheme } from '@/theme/theme';
import { MyComponent } from '../MyComponent';

// Custom wrapper with theme + i18n
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = getTheme('light');
  return (
    <I18nTestWrapper>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </I18nTestWrapper>
  );
};

describe('MyComponent', () => {
  it('renders with theme and i18n', () => {
    render(
      <TestWrapper>
        <MyComponent />
      </TestWrapper>
    );

    expect(screen.getByText('Translated Text')).toBeInTheDocument();
  });
});
```

**Key points:**
- Wrap `I18nTestWrapper` around other providers
- Create a custom `TestWrapper` for complex provider setups
- Reuse the wrapper across tests in the same suite

### Pattern 6: E2E Language Switching (Playwright)

Test language switching in the full application:

```typescript
import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers';

test.describe('Language Switching', () => {
  test('switches from English to Spanish', async ({ page }) => {
    await page.goto('/');

    // Upload file to get to main interface
    await uploadExcelFile(page, 'sample-employees.xlsx');
    await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();

    // Verify initial English text
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Details');

    // Open language selector (MUI Select component)
    const languageSelect = page.locator('[role="combobox"]').first();
    await languageSelect.click();

    // Select Spanish
    const spanishOption = page.getByRole('option', { name: /Español|Spanish/i });
    await expect(spanishOption).toBeVisible();
    await spanishOption.click();

    // Verify Spanish text appears
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');
  });

  test('persists language across page reloads', async ({ page }) => {
    await page.goto('/');
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Switch to Spanish
    const languageSelect = page.locator('[role="combobox"]').first();
    await languageSelect.click();
    const spanishOption = page.getByRole('option', { name: /Español|Spanish/i });
    await spanishOption.click();

    // Wait for Spanish to activate
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify Spanish persists
    await expect(page.locator('[data-testid="details-tab"]')).toContainText('Detalles');
  });
});
```

**Key points:**
- Test the actual language selector UI component
- Verify text updates throughout the application
- Test persistence via localStorage
- Clean up by clearing localStorage in beforeEach if needed

### Pattern 7: Testing Translation Keys (Development)

Verify that translation keys exist (useful during development):

```typescript
import { describe, it, expect } from 'vitest';
import enTranslation from '@/i18n/locales/en/translation.json';
import esTranslation from '@/i18n/locales/es/translation.json';

describe('Translation Keys', () => {
  it('has Spanish translation for all English keys', () => {
    const checkKeys = (enObj: any, esObj: any, path = '') => {
      for (const key in enObj) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof enObj[key] === 'object' && !Array.isArray(enObj[key])) {
          // Nested object - recurse
          expect(esObj).toHaveProperty(key,
            `Missing Spanish translation for: ${currentPath}`);
          checkKeys(enObj[key], esObj[key], currentPath);
        } else {
          // Leaf node - check exists
          expect(esObj).toHaveProperty(key,
            `Missing Spanish translation for: ${currentPath}`);
        }
      }
    };

    checkKeys(enTranslation, esTranslation);
  });
});
```

**Key points:**
- Ensures all English keys have Spanish equivalents
- Catches missing translations early
- Useful as a pre-commit hook check

## Test Utilities Reference

### i18nTestUtils.tsx

```typescript
import { I18nTestWrapper } from '@/test/i18nTestUtils';
import { changeTestLanguage, resetTestLanguage } from '@/test/i18nTestUtils';
```

**I18nTestWrapper**
- Wraps components with I18nextProvider
- Uses test-specific i18n instance (avoids pollution)
- Includes both English and Spanish translations

**changeTestLanguage(language: string)**
- Switches test i18n instance to specified language
- Returns a Promise - must await
- Use for testing language switching

**resetTestLanguage()**
- Resets test i18n instance to English
- Returns a Promise - must await
- Use in afterEach/cleanup to avoid test pollution

### Example Usage

```typescript
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@/test/utils';
import { changeTestLanguage, resetTestLanguage } from '@/test/i18nTestUtils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  afterEach(async () => {
    await resetTestLanguage();  // Clean up after each test
  });

  it('works in English', () => {
    render(<MyComponent />);
    expect(screen.getByText('English Text')).toBeInTheDocument();
  });

  it('works in Spanish', async () => {
    await changeTestLanguage('es');
    render(<MyComponent />);
    expect(screen.getByText('Texto en Español')).toBeInTheDocument();
  });
});
```

## Common Testing Scenarios

### Scenario 1: Testing a New Component

When adding a new component with translations:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('renders with translated text', () => {
    render(<NewComponent />);

    // Test all visible translated strings
    expect(screen.getByText('Title Text')).toBeInTheDocument();
    expect(screen.getByText('Button Label')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('updates text when language changes', async () => {
    const { rerender } = render(<NewComponent />);

    // Verify English
    expect(screen.getByText('Title Text')).toBeInTheDocument();

    // Switch to Spanish
    await changeTestLanguage('es');
    rerender(<NewComponent />);

    // Verify Spanish
    expect(screen.getByText('Texto del Título')).toBeInTheDocument();

    await resetTestLanguage();
  });
});
```

### Scenario 2: Testing Forms with Validation

Test that form validation messages are translated:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { MyForm } from '../MyForm';

describe('MyForm - Validation', () => {
  it('shows translated error when field is empty', async () => {
    const user = userEvent.setup();
    render(<MyForm />);

    // Submit without filling required field
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Verify English error message
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  it('shows Spanish error when language is Spanish', async () => {
    const user = userEvent.setup();
    await changeTestLanguage('es');

    render(<MyForm />);

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();
    });

    await resetTestLanguage();
  });
});
```

### Scenario 3: Testing Accessibility (aria-labels)

Test that accessibility attributes are translated:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { IconButton } from '../IconButton';

describe('IconButton - Accessibility', () => {
  it('has translated aria-label in English', () => {
    render(<IconButton />);

    const button = screen.getByLabelText('Close dialog');
    expect(button).toBeInTheDocument();
  });

  it('has translated aria-label in Spanish', async () => {
    await changeTestLanguage('es');
    render(<IconButton />);

    const button = screen.getByLabelText('Cerrar diálogo');
    expect(button).toBeInTheDocument();

    await resetTestLanguage();
  });
});
```

### Scenario 4: Testing Dynamic Content

Test components that receive translated props:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { useTranslation } from 'react-i18next';
import { DisplayComponent } from '../DisplayComponent';

// Parent component that uses translations
const TestParent = () => {
  const { t } = useTranslation();
  return <DisplayComponent title={t('mySection.title')} />;
};

describe('DisplayComponent - Dynamic Content', () => {
  it('receives translated title prop', () => {
    render(<TestParent />);
    expect(screen.getByText('Section Title')).toBeInTheDocument();
  });
});
```

## Troubleshooting Test Failures

### Problem: Translation key appears instead of text

**Symptom:**
```
Expected: "Import Data"
Received: "dashboard.fileMenu.importData"
```

**Solutions:**
1. Verify component is wrapped with i18n provider
2. Check that you're using `render` from `@/test/utils`, not directly from `@testing-library/react`
3. Ensure translation key exists in `locales/en/translation.json`
4. Check for typos in translation key

### Problem: Language doesn't change in test

**Symptom:**
```typescript
await changeTestLanguage('es');
// Still seeing English text
```

**Solutions:**
1. Add `await` before `changeTestLanguage('es')`
2. Re-render component after language change: `rerender(<Component />)`
3. Check that component uses `useTranslation()` hook, not hardcoded strings
4. Verify Spanish translation exists in `locales/es/translation.json`

### Problem: Test pollution (language persists across tests)

**Symptom:**
```
Test A: Passes in English
Test B: Fails because Spanish is still active
```

**Solutions:**
1. Add `afterEach` hook with `resetTestLanguage()`:
```typescript
afterEach(async () => {
  await resetTestLanguage();
});
```
2. Use `resetTestLanguage()` at start of tests if needed
3. Create isolated test i18n instance per test file if necessary

### Problem: Variables not interpolating

**Symptom:**
```
Expected: "Welcome back, John"
Received: "Welcome back, {{name}}"
```

**Solutions:**
1. Verify you're passing the variable in component:
```typescript
t('welcome', { name: 'John' })  // ✅ Correct
t('welcome')                    // ❌ Missing variable
```
2. Check translation has correct variable syntax: `{{name}}`
3. Ensure variable name matches in both code and translation

### Problem: Pluralization not working

**Symptom:**
```
Expected: "1 employee"
Received: "1 employees"
```

**Solutions:**
1. Verify translation has both forms:
```json
{
  "employeeCount_one": "{{count}} employee",
  "employeeCount_other": "{{count}} employees"
}
```
2. Check that you're passing `count` parameter:
```typescript
t('employeeCount', { count: 1 })  // ✅ Correct
t('employeeCount')                // ❌ Missing count
```
3. Use base key name without suffix in code: `t('employeeCount', { count })`

### Problem: E2E test can't find translated text

**Symptom:**
```typescript
await expect(page.getByText('Import Data')).toBeVisible();
// Times out - element not found
```

**Solutions:**
1. Wait for element to appear:
```typescript
await page.waitForSelector('text=Import Data');
await expect(page.getByText('Import Data')).toBeVisible();
```
2. Use case-insensitive matching:
```typescript
await expect(page.getByText(/import data/i)).toBeVisible();
```
3. Check actual page content:
```typescript
const text = await page.textContent('body');
console.log('Page content:', text);
```
4. Verify language is correct (check language selector)

## Best Practices

### Do's ✅

- **Always wrap components** with i18n provider (use `@/test/utils`)
- **Reset language** after tests that change language
- **Test both languages** when testing language-switching features
- **Use realistic data** for variable interpolation tests
- **Test accessibility** attributes (aria-label, etc.) are translated
- **Test edge cases** for pluralization (0, 1, 2+)
- **Use data-testid** for reliable element selection
- **Wait for async updates** when changing language

### Don'ts ❌

- **Don't hardcode English** in tests - use translations from JSON
- **Don't skip language reset** in cleanup
- **Don't test implementation details** - test rendered output
- **Don't forget pluralization** - test both singular and plural
- **Don't assume instant updates** - language changes are async
- **Don't duplicate provider setup** - use shared test utils
- **Don't test translation keys** - test the actual translated text

## Testing Checklist

Before committing i18n changes:

- [ ] All new components have i18n tests
- [ ] Tests pass in both English and Spanish
- [ ] Variable interpolation is tested
- [ ] Pluralization is tested (singular and plural forms)
- [ ] Language switching is tested (if applicable)
- [ ] Accessibility attributes are translated and tested
- [ ] Tests clean up language state (resetTestLanguage)
- [ ] E2E tests cover critical user flows in both languages
- [ ] No hardcoded strings in tests
- [ ] All tests pass: `npm test`

## Related Documentation

- [i18n Developer Guide](./README.md) - Main i18n documentation
- [Adding New Strings](./adding-new-strings.md) - How to add translatable strings
- [Translation Workflow](./translation-workflow.md) - Guide for translators
- [Testing Principles](../testing/test-principles.md) - General testing best practices

## Advanced Topics

### Custom Test i18n Instance

For tests that need complete isolation:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '@/i18n/locales/en/translation.json';

const createIsolatedI18n = () => {
  const testI18n = i18n.createInstance();
  testI18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: enTranslation } },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
  return testI18n;
};

// Use in test
const testI18n = createIsolatedI18n();
render(
  <I18nextProvider i18n={testI18n}>
    <MyComponent />
  </I18nextProvider>
);
```

### Testing Missing Translations

Test fallback behavior when translation is missing:

```typescript
it('shows fallback text when translation is missing', () => {
  const testI18n = createIsolatedI18n();
  // Don't add the translation to test fallback

  render(
    <I18nextProvider i18n={testI18n}>
      <MyComponent />
    </I18nextProvider>
  );

  // Should show the key as fallback
  expect(screen.getByText('myFeature.missingKey')).toBeInTheDocument();
});
```

### Performance Testing

Test that i18n doesn't cause performance issues:

```typescript
import { render, screen } from '@/test/utils';
import { performance } from 'perf_hooks';

it('renders large list with translations efficiently', () => {
  const start = performance.now();

  render(<LargeListComponent items={Array(1000).fill(null)} />);

  const end = performance.now();
  const renderTime = end - start;

  expect(renderTime).toBeLessThan(1000); // Should render in < 1s
});
```
