# Implement Internationalization (i18n) with react-i18next

## Overview

Implement comprehensive internationalization support for the 9boxer frontend application using react-i18next. This project will externalize all ~400-500 user-facing strings currently hardcoded across 42 React components into a maintainable, translatable system supporting multiple languages.

## Context

**Current State:**
- 100% hardcoded inline strings across all components
- No i18n infrastructure
- Manual pluralization logic scattered throughout code
- Difficult to update copy (requires code changes)
- No support for multiple languages

**Target State:**
- react-i18next fully integrated (~15-20KB bundle cost)
- All strings externalized to JSON translation files
- At least 2 languages fully supported (English + Spanish/other)
- Automatic pluralization using ICU MessageFormat
- Type-safe translation keys with TypeScript
- Language switcher in UI
- Professional translation workflow ready

**Technology:** react-i18next (industry standard, 11M weekly downloads)

---

## Implementation Tasks

### ✅ Task 1: Foundation Setup (2-3 hours)

**Goal:** Set up core i18n infrastructure and prove it works

**Subtasks:**
- [ ] Install dependencies: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- [ ] Create directory structure: `frontend/src/i18n/`
- [ ] Create i18n configuration file
- [ ] Set up English locale file with ~20 sample strings
- [ ] Create Spanish locale starter (empty/partial)
- [ ] Initialize i18n in `main.tsx`
- [ ] Create `LanguageSelector` component (proof of concept)
- [ ] Verify language switching works

**Files to Create:**
```
frontend/src/i18n/
  config.ts                           # i18next configuration
  index.ts                            # Exports
  locales/
    en/
      translation.json                # English strings
    es/
      translation.json                # Spanish starter
frontend/src/components/common/
  LanguageSelector.tsx                # Language switcher component
```

**Files to Update:**
- `frontend/src/main.tsx` - Initialize i18n before React render
- `frontend/package.json` - Add dependencies

**Acceptance Criteria:**
- [ ] i18next configured and initialized
- [ ] Sample strings working with `useTranslation()` hook
- [ ] Language selector allows switching between EN/ES
- [ ] No console errors or warnings
- [ ] App renders correctly with i18n

---

### ✅ Task 2: Core Infrastructure & Utilities (2-3 hours)

**Goal:** Build developer tools and patterns for efficient migration

**Subtasks:**
- [ ] Create TypeScript types for translation keys (type safety)
- [ ] Build custom hooks: `useTranslatedError`, `useTranslatedPlural`
- [ ] Create helper utilities for common patterns
- [ ] Build test utilities for components using i18n
- [ ] Document migration patterns
- [ ] Create code examples for common scenarios

**Files to Create:**
```
frontend/src/i18n/
  types.ts                            # TypeScript definitions
  hooks.ts                            # Custom hooks
  utils.ts                            # Helper functions
frontend/src/test/
  i18nTestUtils.ts                    # Test helpers
internal-docs/i18n/
  README.md                           # Developer guide (initial)
  migration-patterns.md               # Code examples
```

**Common Patterns to Document:**
- Simple labels: `t('fileMenu.importData')`
- With variables: `t('fileMenu.exportSuccess', { count, filename })`
- Pluralization: `t('fileMenu.changeCount', { count })`
- Conditional text: `t('changeTracker.empty.normal')` vs `t('changeTracker.empty.donut')`
- Arrays/lists: How to handle dynamic lists
- Accessibility: aria-label patterns

**Acceptance Criteria:**
- [ ] TypeScript autocomplete works for translation keys
- [ ] Custom hooks simplify common patterns
- [ ] Test utilities support i18n testing
- [ ] Migration guide is clear and actionable
- [ ] Code examples cover 80%+ of use cases

---

### ✅ Task 3: Dashboard Components (3-4 hours)

**Goal:** Migrate core navigation and dashboard UI strings

**Components to Migrate:**
- `AppBar.tsx` (~20 strings)
- `FileMenu.tsx` (~15 strings)
- `FilterDrawer.tsx` (~25 strings)
- `ExclusionDialog.tsx` (~18 strings)
- `DashboardPage.tsx` (~10 strings)

**Total:** ~88 strings

**Subtasks:**
- [ ] Extract all hardcoded strings from listed components
- [ ] Add strings to `locales/en/translation.json` under `dashboard.*` namespace
- [ ] Replace hardcoded strings with `t()` calls
- [ ] Update component tests to use i18n test utils
- [ ] Verify all functionality works (manual testing)
- [ ] Add placeholder Spanish translations (can be English for now)

**Translation Namespaces:**
```json
{
  "dashboard": {
    "appBar": { "title": "9Boxer", ... },
    "fileMenu": { "importData": "Import Data", ... },
    "filters": { "title": "Filters", ... },
    "exclusionDialog": { "title": "Excluded Employees", ... }
  }
}
```

**Example Migration:**
```typescript
// Before
<Button>Import Data</Button>

// After
const { t } = useTranslation();
<Button>{t('dashboard.fileMenu.importData')}</Button>
```

**Acceptance Criteria:**
- [ ] All 5 components fully migrated
- [ ] ~88 strings added to translation files
- [ ] All component tests pass
- [ ] Manual testing confirms no regressions
- [ ] TypeScript has no errors

---

### ✅ Task 4: Grid Components (2-3 hours)

**Goal:** Migrate 9-box grid UI strings

**Components to Migrate:**
- `NineBoxGrid.tsx` (~8 strings)
- `GridBox.tsx` (~12 strings)
- `EmployeeTile.tsx` (~6 strings)
- `ViewModeToggle.tsx` (~8 strings)
- `EmployeeCount.tsx` (~4 strings)

**Total:** ~38 strings

**Subtasks:**
- [ ] Extract strings (labels, tooltips, keyboard shortcuts)
- [ ] Add to `locales/en/translation.json` under `grid.*` namespace
- [ ] Handle special cases: keyboard shortcut text, aria-labels
- [ ] Replace with `t()` calls
- [ ] Update tests
- [ ] Verify drag-and-drop still works

**Special Considerations:**
- Tooltip text with keyboard shortcuts
- Accessibility labels for grid interactions
- Dynamic employee counts with pluralization

**Acceptance Criteria:**
- [ ] All grid components migrated
- [ ] ~38 strings in translation files
- [ ] Tests pass
- [ ] Grid interactions work correctly
- [ ] Tooltips and keyboard shortcuts display properly

---

### ✅ Task 5: Panel Components (4-5 hours)

**Goal:** Migrate right panel (details, statistics, changes, intelligence)

**Components to Migrate:**
- `EmployeeDetails.tsx` (~15 strings)
- `StatisticsTab.tsx` (~35 strings)
- `ChangeTrackerTab.tsx` (~18 strings)
- `IntelligenceTab.tsx` (~20 strings)
- `RightPanel.tsx` (~10 strings)

**Total:** ~98 strings

**Subtasks:**
- [ ] Extract field labels, tab titles, table headers
- [ ] Add to `locales/en/translation.json` under `panel.*` namespace
- [ ] Handle dynamic content (tables, charts)
- [ ] Replace with `t()` calls
- [ ] Update tests
- [ ] Verify all tabs render correctly

**Complex Areas:**
- Table column headers (StatisticsTab)
- Empty state messages
- Timeline/history entries
- Chart labels and tooltips

**Acceptance Criteria:**
- [ ] All panel components migrated
- [ ] ~98 strings in translation files
- [ ] All tabs functional
- [ ] Tables display correctly
- [ ] Tests pass

---

### ✅ Task 6: Dialogs & Forms (2-3 hours)

**Goal:** Migrate dialog and form UI strings

**Components to Migrate:**
- `FileUploadDialog.tsx` (~20 strings)
- `SettingsDialog.tsx` (~15 strings)
- `ErrorBoundary.tsx` (~8 strings)
- Other dialogs/modals

**Total:** ~40 strings

**Subtasks:**
- [ ] Extract dialog titles, content, buttons
- [ ] Extract form labels, placeholders, validation messages
- [ ] Add to `locales/en/translation.json` under `dialogs.*` and `forms.*`
- [ ] Integrate with existing `errorMessages.ts` pattern
- [ ] Replace with `t()` calls
- [ ] Update tests

**Special Considerations:**
- Form validation messages
- File upload states (loading, success, error)
- Settings descriptions

**Acceptance Criteria:**
- [ ] All dialogs migrated
- [ ] ~40 strings in translation files
- [ ] Form validation works
- [ ] Error states display correctly
- [ ] Tests pass

---

### ✅ Task 7: Notifications & Messages (2-3 hours)

**Goal:** Centralize toast/snackbar messages

**Scope:**
- All `showSuccess()` calls (~20 messages)
- All `showError()` calls (~30 messages)
- All `showInfo()` / `showWarning()` calls (~15 messages)

**Total:** ~65 messages

**Subtasks:**
- [ ] Audit all components for snackbar usage
- [ ] Extract messages to `locales/en/translation.json` under `messages.*`
- [ ] Update `SnackbarContext` to use i18n
- [ ] Replace inline messages with translation keys
- [ ] Integrate with existing `errorMessages.ts`
- [ ] Handle messages with variables (counts, filenames, etc.)
- [ ] Update tests

**Pattern:**
```typescript
// Before
showSuccess(`Successfully exported ${changes.length} change(s) to ${filename}`);

// After
showSuccess(t('messages.exportSuccess', { count: changes.length, filename }));
```

**Translation with Pluralization:**
```json
{
  "messages": {
    "exportSuccess_one": "Successfully exported {{count}} change to {{filename}}",
    "exportSuccess_other": "Successfully exported {{count}} changes to {{filename}}"
  }
}
```

**Acceptance Criteria:**
- [ ] All notification messages migrated
- [ ] ~65 messages in translation files
- [ ] Pluralization works automatically
- [ ] Variables interpolate correctly
- [ ] Tests pass

---

### ✅ Task 8: Accessibility & Polish (2-3 hours)

**Goal:** Complete migration and prevent regressions

**Subtasks:**
- [ ] Audit all components for remaining hardcoded strings
- [ ] Extract aria-labels (~30 remaining)
- [ ] Extract alt text (~3 remaining)
- [ ] Extract tooltips (~12 remaining)
- [ ] Add ESLint rule: `no-literal-string` for JSX (with exceptions)
- [ ] Fix any violations
- [ ] Document exceptions (numbers, CSS, etc.)

**Files to Create/Update:**
```
frontend/.eslintrc.cjs                # Add i18n linting rules
frontend/src/i18n/eslint-exceptions.md # Document valid exceptions
```

**ESLint Configuration:**
```javascript
// Prevent new hardcoded strings
rules: {
  'react/jsx-no-literals': ['error', {
    noStrings: true,
    allowedStrings: ['/', '-', '•'], // Symbols OK
    ignoreProps: false,
  }],
}
```

**Acceptance Criteria:**
- [ ] Zero hardcoded strings remain (except documented exceptions)
- [ ] ESLint catches new violations
- [ ] All accessibility strings translated
- [ ] Documentation clear on exceptions
- [ ] Audit complete

---

### ✅ Task 9: Documentation & Testing (2-3 hours)

**Goal:** Complete documentation and comprehensive testing

**Subtasks:**
- [ ] Complete developer guide (`internal-docs/i18n/README.md`)
- [ ] Write translator workflow guide
- [ ] Update `CLAUDE.md` with i18n conventions
- [ ] Create E2E test for language switching
- [ ] Create E2E test for pluralization edge cases
- [ ] Generate translation coverage report
- [ ] Document translation management workflow

**Documentation to Create:**
```
internal-docs/i18n/
  README.md                           # Developer guide (complete)
  translation-workflow.md             # For translators
  adding-new-strings.md               # How to add strings
  testing-guide.md                    # How to test i18n
```

**E2E Tests:**
```
frontend/playwright/e2e/
  i18n-language-switching.spec.ts     # Verify language switching
  i18n-pluralization.spec.ts          # Test plural edge cases
```

**Update Files:**
- `CLAUDE.md` - Add i18n patterns and conventions
- `README.md` - Document language support
- `CONTRIBUTING.md` - Link to i18n guide

**Acceptance Criteria:**
- [ ] All documentation complete and clear
- [ ] E2E tests pass
- [ ] Translation coverage at 100% for English
- [ ] `CLAUDE.md` updated
- [ ] Workflow documented for future strings

---

### ✅ Task 10: Second Language Implementation (3-4 hours)

**Goal:** Complete full Spanish translation (or chosen language)

**Subtasks:**
- [ ] Choose target language (Spanish recommended for US market)
- [ ] Translate all ~400-500 strings
- [ ] Review translations for:
  - Cultural appropriateness
  - Technical accuracy
  - Consistent terminology
- [ ] Test language switching thoroughly
- [ ] Fix any pluralization issues (Spanish has different plural rules)
- [ ] Fix any layout issues (Spanish text often 20-30% longer)
- [ ] Fix any date/number formatting issues
- [ ] Manual QA in second language

**Translation File:**
```
frontend/src/i18n/locales/es/
  translation.json                    # Complete Spanish translation
```

**Testing Checklist:**
- [ ] All screens render without layout breaks
- [ ] Pluralization works correctly (Spanish rules)
- [ ] Dates formatted correctly
- [ ] Numbers formatted correctly
- [ ] Currency formatted correctly (if applicable)
- [ ] RTL not needed (Spanish is LTR like English)

**Acceptance Criteria:**
- [ ] 100% of strings translated to second language
- [ ] No layout breaks
- [ ] Pluralization correct
- [ ] Manual QA passed
- [ ] Language selector shows both languages

---

## Final Verification Checklist

Before closing this issue, verify:

- [ ] **Functionality:** All features work in both languages
- [ ] **Tests:** All unit, integration, and E2E tests pass
- [ ] **Performance:** No noticeable performance degradation
- [ ] **Bundle Size:** Bundle increase acceptable (~15-20KB)
- [ ] **TypeScript:** No type errors
- [ ] **Linting:** No ESLint violations
- [ ] **Documentation:** All docs complete and accurate
- [ ] **Code Review:** Code reviewed and approved
- [ ] **Manual QA:** Thorough testing in both languages
- [ ] **Translation Coverage:** 100% in both languages

---

## Success Metrics

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Strings Externalized | 400-500 (100%) | ESLint + manual audit |
| Languages Supported | 2+ (EN + ES) | Test language switcher |
| Translation Coverage | 100% per language | Translation coverage report |
| Tests Passing | 100% | `npm test && npm run test:e2e:pw` |
| Bundle Size Increase | <25KB gzipped | `npm run build` + analyzer |
| TypeScript Errors | 0 | `npx tsc --noEmit` |
| ESLint Violations | 0 | `npm run lint` |

---

## Resources

### Documentation
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

### Tools
- [i18n Ally VSCode Extension](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) - Inline translation editing
- [BabelEdit](https://www.codeandweb.com/babeledit) - Translation editor
- [Locize](https://locize.com/) - Translation management platform (optional)

### Related Files in Codebase
- `frontend/src/constants/positionLabels.ts` - Example of well-structured domain data (may need i18n too)
- `frontend/src/utils/errorMessages.ts` - Existing error structure to integrate with

---

## Estimated Timeline

| Phase | Tasks | Estimated Hours | Can Start After |
|-------|-------|-----------------|-----------------|
| **Foundation** | Tasks 1-2 | 4-6 hours | Immediately |
| **Component Migration** | Tasks 3-7 | 13-18 hours | Task 2 complete |
| **Polish & Docs** | Tasks 8-9 | 4-6 hours | Task 7 complete |
| **Translation** | Task 10 | 3-4 hours | Task 9 complete |
| **TOTAL** | All tasks | **24-34 hours** | - |

**Note:** Tasks 3-7 (component migrations) can partially overlap after Task 2 is complete, potentially reducing calendar time.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing tests | Update tests incrementally per component; use i18n test utils |
| Bundle size too large | Monitor with webpack analyzer; consider lazy loading translations |
| Translation quality issues | Start with machine translation, refine iteratively; hire translator for final pass |
| Layout breaks with longer text | Test with Spanish early (typically 20-30% longer); use flexible layouts |
| Developer resistance to new pattern | Clear docs, good examples, ESLint enforcement |
| Missing strings in production | Translation coverage reports; E2E tests in both languages |

---

## Notes

- This is a **foundational infrastructure change** that affects all components
- Prioritize completeness over speed - missed strings create bad UX
- Use feature flags if you want to gradually roll out language support to users
- Consider adding more languages after Spanish (French, German, Portuguese common next)
- Translation memory will make future language additions faster

---

## Questions?

For questions about this implementation, see:
- Developer guide: `internal-docs/i18n/README.md` (created in Task 9)
- Migration patterns: `internal-docs/i18n/migration-patterns.md` (created in Task 2)
- Project instructions: `CLAUDE.md` (updated in Task 9)
