# i18n Migration Patterns

This guide provides code examples for common internationalization patterns when migrating components to use react-i18next.

## Basic Patterns

### Simple Labels

**Before:**
```tsx
<Button>Import Data</Button>
```

**After:**
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<Button>{t('dashboard.fileMenu.importData')}</Button>
```

### With Variables

**Before:**
```tsx
showSuccess(`Successfully exported ${changes.length} change(s) to ${filename}`);
```

**After:**
```tsx
const { t } = useTranslation();
showSuccess(t('dashboard.fileMenu.exportSuccess', { count: changes.length, filename }));
```

**Translation file:**
```json
{
  "dashboard": {
    "fileMenu": {
      "exportSuccess": "Successfully exported {{count}} change(s) to {{filename}}"
    }
  }
}
```

### Pluralization

**Before:**
```tsx
`Apply ${changes.length} Change${changes.length !== 1 ? 's' : ''} to Excel`
```

**After:**
```tsx
const { t } = useTranslation();
t('dashboard.fileMenu.exportChanges', { count: changes.length })
```

**Translation file with plural forms:**
```json
{
  "dashboard": {
    "fileMenu": {
      "exportChanges": "Apply {{count}} Change to Excel",
      "exportChanges_other": "Apply {{count}} Changes to Excel"
    }
  }
}
```

### Conditional Text

**Before:**
```tsx
const label = sessionId && filename ? filename : "No file selected";
```

**After:**
```tsx
const { t } = useTranslation();
const label = sessionId && filename ? filename : t('dashboard.fileMenu.noFileSelected');
```

### Tooltips

**Before:**
```tsx
<Tooltip title="Filter employees">
  <IconButton>...</IconButton>
</Tooltip>
```

**After:**
```tsx
const { t } = useTranslation();
<Tooltip title={t('dashboard.appBar.filterEmployees')}>
  <IconButton>...</IconButton>
</Tooltip>
```

### Accessibility Labels (aria-label)

**Before:**
```tsx
<Button aria-label={`File menu: ${filename}, ${changes.length} pending changes`}>
```

**After:**
```tsx
const { t } = useTranslation();
<Button aria-label={t('dashboard.fileMenu.fileMenuAriaLabel', { filename, count: changes.length })}>
```

### Alt Text for Images

**Before:**
```tsx
<img src="/logo.png" alt="9Boxer logo" />
```

**After:**
```tsx
const { t } = useTranslation();
<img src="/logo.png" alt={t('app.logoAlt')} />
```

## Advanced Patterns

### Dynamic Lists

**Before:**
```tsx
const filterParts = [];
if (selectedLevels.length > 0) {
  filterParts.push(`Levels: ${selectedLevels.join(", ")}`);
}
```

**After:**
```tsx
const { t } = useTranslation();
const filterParts = [];
if (selectedLevels.length > 0) {
  filterParts.push(`${t('dashboard.appBar.levels')}: ${selectedLevels.join(", ")}`);
}
```

### Complex Interpolation

**Before:**
```tsx
`${employeeName} moved from ${oldPosition} to ${newPosition}`
```

**After:**
```tsx
const { t } = useTranslation();
t('changeTracker.moveDescription', {
  name: employeeName,
  oldPosition,
  newPosition
})
```

**Translation file:**
```json
{
  "changeTracker": {
    "moveDescription": "{{name}} moved from {{oldPosition}} to {{newPosition}}"
  }
}
```

### Error Messages with Details

**Before:**
```tsx
showError(`Failed to export: ${error.message}`);
```

**After:**
```tsx
const { t } = useTranslation();
showError(t('messages.exportError', { error: error.message }));
```

Or use the custom hook:
```tsx
import { useTranslatedError } from '../i18n/hooks';

const { translateError } = useTranslatedError();
showError(translateError('messages.exportError', error.message));
```

### Snackbar Messages with Pluralization

**Before:**
```tsx
showSuccess(
  changes.length === 1
    ? `Successfully exported 1 change to ${filename}`
    : `Successfully exported ${changes.length} changes to ${filename}`
);
```

**After:**
```tsx
const { t } = useTranslation();
showSuccess(t('messages.exportSuccess', { count: changes.length, filename }));
```

**Translation file:**
```json
{
  "messages": {
    "exportSuccess": "Successfully exported {{count}} change to {{filename}}",
    "exportSuccess_other": "Successfully exported {{count}} changes to {{filename}}"
  }
}
```

## Component Migration Checklist

When migrating a component:

1. ✅ Import `useTranslation` hook at the top
2. ✅ Extract all hardcoded strings to translation files
3. ✅ Replace strings with `t()` calls
4. ✅ Handle pluralization using `_other` suffix
5. ✅ Add Spanish translations (can be placeholder initially)
6. ✅ Update tests to use i18n test wrapper
7. ✅ Verify component still works correctly
8. ✅ Check for accessibility strings (aria-label, alt, title)

## Testing with i18n

### Wrapping Test Components

**Before:**
```tsx
render(<MyComponent />);
```

**After:**
```tsx
import { I18nTestWrapper } from '../../test/i18nTestUtils';

render(
  <I18nTestWrapper>
    <MyComponent />
  </I18nTestWrapper>
);
```

### Testing Language Switching

```tsx
import { changeTestLanguage, resetTestLanguage } from '../../test/i18nTestUtils';

it('displays text in Spanish', async () => {
  await changeTestLanguage('es');
  render(<I18nTestWrapper><MyComponent /></I18nTestWrapper>);
  expect(screen.getByText('Importar Datos')).toBeInTheDocument();
  await resetTestLanguage(); // Clean up
});
```

## Common Mistakes to Avoid

### ❌ Don't: Concatenate translations
```tsx
// Wrong
t('common.page') + ' ' + t('common.number')
```

### ✅ Do: Use interpolation
```tsx
// Correct
t('common.pageNumber', { number: 5 })
```

### ❌ Don't: Use hardcoded pluralization
```tsx
// Wrong
t('item') + (count !== 1 ? 's' : '')
```

### ✅ Do: Use built-in pluralization
```tsx
// Correct
t('item', { count })
```

### ❌ Don't: Split related strings
```tsx
// Wrong - harder for translators
{
  "save": "Save",
  "changes": "changes"
}
```

### ✅ Do: Keep context together
```tsx
// Correct - provides context
{
  "saveChanges": "Save changes"
}
```

## Translation Namespacing

Use clear namespaces to organize translations:

```
app.*          - Global app strings (title, logo)
dashboard.*    - Dashboard-related strings
  appBar.*     - AppBar component
  fileMenu.*   - FileMenu component
  filters.*    - Filter-related
grid.*         - Grid components
panel.*        - Right panel components
dialogs.*      - Dialog components
forms.*        - Form-related
messages.*     - Notification messages
common.*       - Common buttons and labels
```

## Tips

- **Keep keys descriptive**: `dashboard.fileMenu.importData` is better than `d.fm.id`
- **Group by component**: Easier to maintain and find strings
- **Provide context**: Help translators understand where/how text is used
- **Handle edge cases**: Empty states, loading states, error states
- **Test both languages**: Ensure layout works with longer Spanish text
- **Use TypeScript**: Type-safe translation keys prevent typos
