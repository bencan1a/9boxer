# Internationalization (i18n) Guide

This guide covers how to use internationalization in the 9Boxer application.

## Overview

9Boxer uses [react-i18next](https://react.i18next.com/) for internationalization. The application currently supports:
- 🇺🇸 English (en) - Default
- 🇪🇸 Spanish (es)

## Quick Start

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('dashboard.appBar.filterEmployees')}</p>
    </div>
  );
}
```

### With Variables

```tsx
const { t } = useTranslation();
const message = t('messages.exportSuccess', { 
  count: 5, 
  filename: 'data.xlsx' 
});
// "Successfully exported 5 change(s) to data.xlsx"
```

### With Pluralization

```tsx
const { t } = useTranslation();
const text = t('dashboard.fileMenu.exportChanges', { count: 1 });
// "Apply 1 Change to Excel"

const text2 = t('dashboard.fileMenu.exportChanges', { count: 5 });
// "Apply 5 Changes to Excel"
```

## Project Structure

```
frontend/src/i18n/
├── config.ts                     # i18next configuration
├── index.ts                      # Module exports
├── types.ts                      # TypeScript type definitions
├── hooks.ts                      # Custom i18n hooks
├── utils.ts                      # Utility functions
└── locales/
    ├── en/
    │   └── translation.json      # English translations
    └── es/
        └── translation.json      # Spanish translations
```

## Adding New Strings

1. Add the string to `frontend/src/i18n/locales/en/translation.json`:
```json
{
  "myComponent": {
    "title": "My Component Title",
    "description": "This is a description"
  }
}
```

2. Add the Spanish translation to `frontend/src/i18n/locales/es/translation.json`:
```json
{
  "myComponent": {
    "title": "Título de Mi Componente",
    "description": "Esta es una descripción"
  }
}
```

3. Use in your component:
```tsx
const { t } = useTranslation();
<h1>{t('myComponent.title')}</h1>
```

## Custom Hooks

### useTypedTranslation
Type-safe translation hook with autocomplete:
```tsx
import { useTypedTranslation } from '../i18n/hooks';

const { t } = useTypedTranslation();
// TypeScript will autocomplete and validate translation keys
```

### useTranslatedError
For translating error messages:
```tsx
import { useTranslatedError } from '../i18n/hooks';

const { translateError } = useTranslatedError();
const errorMsg = translateError('messages.error', error.message);
```

### useTranslatedPlural
Simplified pluralization:
```tsx
import { useTranslatedPlural } from '../i18n/hooks';

const { translatePlural } = useTranslatedPlural();
const msg = translatePlural('items.count', 5);
```

## Testing Components with i18n

Wrap your test components with the i18n provider:

```tsx
import { render, screen } from '@testing-library/react';
import { I18nTestWrapper } from '../../test/i18nTestUtils';
import MyComponent from '../MyComponent';

it('renders translated text', () => {
  render(
    <I18nTestWrapper>
      <MyComponent />
    </I18nTestWrapper>
  );
  
  expect(screen.getByText('Import Data')).toBeInTheDocument();
});
```

### Testing Language Switching

```tsx
import { changeTestLanguage, resetTestLanguage } from '../../test/i18nTestUtils';

it('displays text in Spanish', async () => {
  await changeTestLanguage('es');
  
  render(
    <I18nTestWrapper>
      <MyComponent />
    </I18nTestWrapper>
  );
  
  expect(screen.getByText('Importar Datos')).toBeInTheDocument();
  
  await resetTestLanguage(); // Clean up for other tests
});
```

## Translation Keys Namespacing

Translations are organized by domain:

```
app.*               - Global application strings
dashboard.*         - Dashboard page and components
  appBar.*          - Top application bar
  fileMenu.*        - File menu dropdown
  filters.*         - Filter drawer
grid.*              - 9-box grid components
panel.*             - Right panel (details, stats, changes, intelligence)
dialogs.*           - Dialog components
forms.*             - Form components
messages.*          - Notification messages (success, error, info, warning)
common.*            - Common UI elements (buttons, labels)
```

## Language Selector

The `LanguageSelector` component is integrated into the AppBar and allows users to switch languages. The selected language is persisted to localStorage.

## For Translators

Translation workflow documentation is planned for future phases. For now, translations can be added directly to the JSON files in `frontend/src/i18n/locales/`.

## Best Practices

1. **Use namespacing**: Group related strings (e.g., `dashboard.fileMenu.*`)
2. **Provide context**: Use descriptive keys (`importData` not `btn1`)
3. **Handle plurals properly**: Use `_other` suffix for plural forms
4. **Test with longer text**: Spanish is typically 20-30% longer than English
5. **Include variables**: Use `{{variable}}` syntax for dynamic content
6. **Accessibility**: Don't forget to translate aria-labels, alt text, tooltips
7. **Type safety**: Use `useTypedTranslation` for autocomplete and validation

## Migration Guide

For detailed examples of how to migrate existing components, see:
- [Migration Patterns](./migration-patterns.md)

## Troubleshooting

### Missing translations show keys
If you see `dashboard.fileMenu.importData` instead of `Import Data`, check:
1. The key exists in `locales/en/translation.json`
2. i18n is initialized in `main.tsx`
3. The component is wrapped with i18n provider in tests

### Language not changing
1. Check localStorage: `localStorage.getItem('9boxer-language')`
2. Clear localStorage and reload
3. Verify language code is correct (`en` or `es`)

### TypeScript errors with translation keys
1. Ensure `types.ts` is properly configured
2. Restart TypeScript server in your IDE
3. Check that translation JSON files are valid

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [i18n Ally VSCode Extension](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally)
