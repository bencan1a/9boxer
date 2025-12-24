# ESLint i18n Exceptions

This document outlines the valid exceptions for the `react/jsx-no-literals` ESLint rule, which enforces that all user-facing strings must be internationalized.

## Rule Configuration

The rule is configured in `.eslintrc.cjs` to:
- **Warn** (not error) on hardcoded strings in JSX children
- **Ignore** prop values (technical configuration doesn't need translation)
- **Allow** specific symbols and single characters

## Valid Exceptions

### 1. Symbols and Punctuation

The following single-character strings are allowed without translation:

```jsx
// ✅ Allowed
<span>/</span>
<span>-</span>
<span>•</span>
<span>:</span>
<span>—</span>
<span>()</span>
<span>,</span>
<span>.</span>
<span>%</span>
<span>+</span>
<span>&</span>
<span>*</span>
<span>=</span>
<span><></span>
```

### 2. Numbers

Pure numbers don't need translation:

```jsx
// ✅ Allowed
<span>{42}</span>
<span>{employee.id}</span>
<span>{percentage}%</span>
```

### 3. Technical Configuration Props

Component props that configure behavior (not user-visible content) don't need translation:

```jsx
// ✅ Allowed - ignoreProps: true
<Button variant="contained" color="primary" size="large" />
<Typography variant="h4" component="div" />
<TextField type="email" name="userEmail" id="email-input" />
<div data-testid="dashboard-container" className="main-content" />
```

### 4. Empty Strings

Empty strings are allowed:

```jsx
// ✅ Allowed
<input value="" />
<span>{value || ''}</span>
```

### 5. CSS Classes and IDs

CSS-related identifiers don't need translation:

```jsx
// ✅ Allowed
<div className="main-container" id="app-root" />
```

### 6. Data Attributes

Technical data attributes don't need translation:

```jsx
// ✅ Allowed
<div data-testid="employee-card" data-id="emp-123" />
```

### 7. Route Paths

URL paths and routes don't need translation:

```jsx
// ✅ Allowed
<Route path="/dashboard" />
<Link to="/settings" />
```

## Strings That MUST Be Translated

### 1. User-Visible Text Content

All user-visible text must use i18n:

```jsx
// ❌ Wrong
<Button>Submit</Button>
<Typography>Welcome to 9Boxer</Typography>

// ✅ Correct
const { t } = useTranslation();
<Button>{t('common.submit')}</Button>
<Typography>{t('app.welcome')}</Typography>
```

### 2. Accessibility Labels

aria-labels, alt text, and title attributes must be translated:

```jsx
// ❌ Wrong
<button aria-label="Close dialog">X</button>
<img alt="Company logo" />
<div title="Click to expand">...</div>

// ✅ Correct
const { t } = useTranslation();
<button aria-label={t('common.closeDialog')}>X</button>
<img alt={t('app.logoAlt')} />
<div title={t('common.clickToExpand')}>...</div>
```

### 3. Placeholder Text

Form placeholders must be translated:

```jsx
// ❌ Wrong
<TextField placeholder="Enter your name" />

// ✅ Correct
const { t } = useTranslation();
<TextField placeholder={t('forms.namePlaceholder')} />
```

### 4. Error and Success Messages

All user-facing messages must be translated:

```jsx
// ❌ Wrong
showError("Failed to save changes");
showSuccess("File uploaded successfully");

// ✅ Correct
const { t } = useTranslation();
showError(t('messages.saveFailed'));
showSuccess(t('messages.uploadSuccess'));
```

### 5. Table Headers and Labels

All table headers, column labels, and data labels must be translated:

```jsx
// ❌ Wrong
<TableCell>Employee Name</TableCell>
<ChartLabel>Performance vs Potential</ChartLabel>

// ✅ Correct
const { t } = useTranslation();
<TableCell>{t('table.employeeName')}</TableCell>
<ChartLabel>{t('charts.performancePotential')}</ChartLabel>
```

## Suppressing False Positives

If you encounter a false positive where the rule incorrectly flags something, you can suppress it with a comment:

```jsx
{/* eslint-disable-next-line react/jsx-no-literals */}
<TechnicalComponent internalId="AUTO_GENERATED_ID_123" />
```

**Important:** Always add a comment explaining WHY the suppression is necessary.

## When in Doubt

Ask yourself:
1. **Will a user see this string?** → Must be translated
2. **Is this technical configuration?** → No translation needed
3. **Is this a symbol or single character?** → Probably allowed
4. **Would this need to be different in another language?** → Must be translated

If you're still unsure, prefer translating it. It's better to have extra translation keys than to miss user-facing strings.

## Related Documentation

- [i18n Developer Guide](../../docs/i18n/README.md)
- [Adding New Strings](../../docs/i18n/adding-new-strings.md)
- [Translation Patterns](../../docs/i18n/migration-patterns.md)
