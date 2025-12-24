# Adding New Strings Guide

This guide explains how to add new translatable strings to the 9Boxer application.

## Quick Steps

1. **Add English translation** to `frontend/src/i18n/locales/en/translation.json`
2. **Add Spanish translation** to `frontend/src/i18n/locales/es/translation.json`
3. **Use in component** with `useTranslation()` hook
4. **Test** that it works in both languages

## Step-by-Step Example

###  Step 1: Choose the Right Namespace

Organize strings by feature area:

- `app.*` - Application-wide strings (title, branding)
- `dashboard.*` - Dashboard components (AppBar, FileMenu, etc.)
- `grid.*` - 9-box grid components
- `panel.*` - Right panel (details, statistics, changes, intelligence)
- `dialogs.*` - Dialog components (modals, popups)
- `forms.*` - Form-related strings (validation, placeholders)
- `messages.*` - Toast/snackbar notifications
- `common.*` - Reusable strings (OK, Cancel, Save, etc.)

### Step 2: Add to English Translation File

Open `frontend/src/i18n/locales/en/translation.json` and add your string:

```json
{
  "myFeature": {
    "title": "My New Feature",
    "description": "This feature does something useful",
    "actionButton": "Click Me",
    "successMessage": "Action completed successfully!",
    "itemCount_one": "{{count}} item found",
    "itemCount_other": "{{count}} items found"
  }
}
```

**Key naming conventions:**
- Use camelCase for keys
- Be descriptive: `importData` not `import`
- Include context: `fileMenu.importData` not just `importData`
- Use `_one` and `_other` suffixes for pluralization

### Step 3: Add Spanish Translation

Open `frontend/src/i18n/locales/es/translation.json` and add the Spanish version:

```json
{
  "myFeature": {
    "title": "Mi Nueva Función",
    "description": "Esta función hace algo útil",
    "actionButton": "Haz clic aquí",
    "successMessage": "¡Acción completada exitosamente!",
    "itemCount_one": "{{count}} elemento encontrado",
    "itemCount_other": "{{count}} elementos encontrados"
  }
}
```

**Translation tips:**
- Spanish text is typically 20-30% longer than English
- Maintain consistent terminology (use a glossary)
- Keep variable placeholders unchanged: `{{count}}`, `{{filename}}`
- Test with actual data to ensure nothing breaks the layout

### Step 4: Use in Component

```typescript
import { useTranslation } from 'react-i18next';

function MyFeatureComponent() {
  const { t } = useTranslation();
  const itemCount = 5;

  return (
    <div>
      <h1>{t('myFeature.title')}</h1>
      <p>{t('myFeature.description')}</p>
      <Button onClick={handleClick}>
        {t('myFeature.actionButton')}
      </Button>
      <p>{t('myFeature.itemCount', { count: itemCount })}</p>
    </div>
  );
}
```

### Step 5: Test Both Languages

1. Run the application: `npm run dev`
2. Navigate to Settings and switch to Spanish
3. Verify all new strings display correctly
4. Check that layout doesn't break with longer Spanish text
5. Switch back to English and verify again

## Common Patterns

### Simple String

```json
// translation.json
{ "greeting": "Hello, World!" }
```

```typescript
// Component
<h1>{t('greeting')}</h1>
```

### String with Variables

```json
// translation.json
{ "welcome": "Welcome back, {{name}}!" }
```

```typescript
// Component
<p>{t('welcome', { name: user.name })}</p>
```

### Pluralization

```json
// translation.json
{
  "fileCount_one": "{{count}} file",
  "fileCount_other": "{{count}} files"
}
```

```typescript
// Component
<p>{t('fileCount', { count: files.length })}</p>
// count=1: "1 file"
// count=5: "5 files"
```

### Conditional Strings

```json
// translation.json
{
  "mode": {
    "grid": "Grid view active",
    "donut": "Donut view active"
  }
}
```

```typescript
// Component
const modeKey = isGrid ? 'mode.grid' : 'mode.donut';
<p>{t(modeKey)}</p>
```

### Strings with HTML (use sparingly)

```json
// translation.json
{  "selected": "Selected: <strong>{{filename}}</strong>"
}
```

```typescript
// Component
<Typography
  dangerouslySetInnerHTML={{
    __html: t('selected', { filename: 'data.xlsx' })
  }}
/>
```

## Validation Checklist

Before committing your changes:

- [ ] English translation added to `locales/en/translation.json`
- [ ] Spanish translation added to `locales/es/translation.json`
- [ ] Key naming follows conventions (camelCase, descriptive, namespaced)
- [ ] Variables use correct syntax: `{{variableName}}`
- [ ] Pluralization uses `_one` and `_other` suffixes
- [ ] Component uses `useTranslation()` hook (or `i18n.t()` for class components)
- [ ] Tested in English and Spanish
- [ ] Layout doesn't break with longer Spanish text
- [ ] ESLint passes (no hardcoded string warnings)
- [ ] All tests pass

## Troubleshooting

### Translation Key Not Found

**Symptom:** You see the key instead of the translated text (e.g., "myFeature.title")

**Solutions:**
1. Check spelling of the key in both JSON and component
2. Verify JSON is valid (no trailing commas, proper quotes)
3. Restart dev server (Ctrl+C, then `npm run dev`)
4. Hard refresh browser (Ctrl+Shift+R)

### Translation Not Updating

**Symptom:** Changes to translation.json don't appear in the app

**Solutions:**
1. Check for JSON syntax errors (invalid JSON will fail silently)
2. Restart dev server
3. Clear browser cache or hard refresh
4. Check browser console for errors

### Layout Breaks in Spanish

**Symptom:** UI elements overlap or get cut off when switched to Spanish

**Solutions:**
1. Use flexible layouts (avoid fixed widths)
2. Test with Spanish early in development
3. Use CSS truncation for long text: `text-overflow: ellipsis`
4. Consider abbreviations for very long Spanish translations

### ESLint Warning: "Strings not allowed in JSX"

**Symptom:** `react/jsx-no-literals` warning on your new code

**Solution:**
- Wrap the string in a translation: `{t('myKey')}` instead of `"My Text"`
- See [eslint-exceptions.md](../../frontend/src/i18n/eslint-exceptions.md) for valid exceptions

## Best Practices

### Do's ✅

- Use descriptive, namespaced keys: `dashboard.fileMenu.importData`
- Keep related strings grouped in the same namespace
- Reuse common strings from the `common` namespace
- Test in both languages before committing
- Use variables for dynamic content
- Follow existing patterns in the codebase

### Don'ts ❌

- Don't use generic keys like `text1`, `label`, `button`
- Don't nest more than 3 levels deep
- Don't duplicate strings (check if one already exists)
- Don't forget to add both English AND Spanish
- Don't use HTML in translations unless necessary
- Don't translate technical values (className, data-testid, variant, etc.)

## Examples from Codebase

See these files for real examples:

- **Simple strings**: `frontend/src/components/common/FileUploadDialog.tsx`
- **Pluralization**: `frontend/src/components/dashboard/FileMenu.tsx`
- **Variables**: `frontend/src/components/panel/EmployeeDetails.tsx`
- **Accessibility**: `frontend/src/components/settings/SettingsDialog.tsx`

## Related Documentation

- [i18n Developer Guide](./README.md) - Main documentation
- [Migration Patterns](./migration-patterns.md) - Code patterns and examples
- [Translation Workflow](./translation-workflow.md) - For professional translators
- [Testing Guide](./testing-guide.md) - How to test i18n
