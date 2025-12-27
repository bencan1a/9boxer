# i18n Implementation Project Plan

```yaml
status: done
owner: bencan1a
created: 2025-12-23
completed: 2025-12-26
summary:
  - Implement react-i18next for internationalization across entire frontend
  - Externalize 400-500 hardcoded strings from 42 React components
  - Support English + Spanish (minimum 2 languages)
  - Break work into 10 agent-sized tasks (24-34 hours total)
completion_notes: |
  Internationalization implementation completed successfully.
```

## Project Goal

Implement comprehensive internationalization (i18n) support in the 9boxer frontend using react-i18next to enable multi-language support and create a maintainable string management system.

## Current State

**String Management:**
- 100% hardcoded inline strings across all components
- ~400-500 user-facing strings scattered across 42 React components
- Manual pluralization logic duplicated throughout code
- No i18n infrastructure
- Difficult to update copy (requires touching component code)

**Partial Externalization:**
- `positionLabels.ts` - Well-structured position labels (domain data)
- `errorMessages.ts` - Structured error configs (Electron main process)

**Pain Points:**
1. Strings scattered across 42 component files
2. Tightly coupled to component code
3. Inconsistent terminology risk
4. Manual pluralization in multiple places
5. Cannot support multiple languages

## Target State

**i18n Infrastructure:**
- react-i18next fully integrated (~15-20KB bundle cost)
- All strings externalized to JSON translation files
- TypeScript type safety for translation keys
- Custom hooks for common patterns
- ESLint rules preventing new hardcoded strings

**Language Support:**
- English (complete)
- Spanish (complete)
- Infrastructure ready for additional languages

**Developer Experience:**
- Clear migration patterns documented
- Test utilities for i18n testing
- Translation workflow defined
- Type-safe translation key autocomplete

## Implementation Approach

### Technology: react-i18next

**Why react-i18next:**
- Industry standard (11M weekly downloads)
- Automatic pluralization via ICU MessageFormat
- Runtime locale switching
- Professional translation workflow support
- Rich ecosystem (dev tools, linters, translation management)
- Handles complex cases (gender, ordinals, date/time formatting)

**Considered Alternatives:**
- Simple constants - Ruled out (no i18n support, manual pluralization)
- rosetta / typesafe-i18n - Ruled out (less ecosystem support, less features)
- react-intl / formatjs - Valid alternative, chose react-i18next for better community

### Directory Structure

```
frontend/src/i18n/
  config.ts                 # i18next configuration
  index.ts                  # Exports
  types.ts                  # TypeScript definitions
  hooks.ts                  # Custom hooks (useTranslatedError, etc.)
  utils.ts                  # Helper functions
  locales/
    en/
      translation.json      # English strings (~400-500 strings)
    es/
      translation.json      # Spanish strings (~400-500 strings)
```

### Translation File Structure

```json
{
  "dashboard": {
    "appBar": {
      "title": "9Boxer",
      "settings": "Settings"
    },
    "fileMenu": {
      "importData": "Import Data",
      "exportChanges_one": "Apply {{count}} Change to Excel",
      "exportChanges_other": "Apply {{count}} Changes to Excel"
    }
  },
  "grid": {
    "viewToggle": {
      "donutActive": "Donut view active (Press D for Grid view)",
      "gridActive": "Grid view active (Press D for Donut view)"
    }
  },
  "panel": {
    "statistics": {
      "title": "Statistics",
      "totalEmployees": "Total Employees"
    }
  },
  "messages": {
    "exportSuccess_one": "Successfully exported {{count}} change to {{filename}}",
    "exportSuccess_other": "Successfully exported {{count}} changes to {{filename}}"
  }
}
```

## Task Breakdown (10 Agent-Sized Tasks)

### Phase 1: Foundation (4-6 hours)

**Task 1: Foundation Setup (2-3 hours)**
- Install dependencies
- Create directory structure
- Configure i18next
- Create English + Spanish starter files
- Initialize in main.tsx
- Build LanguageSelector component
- Verify language switching works

**Task 2: Core Infrastructure & Utilities (2-3 hours)**
- TypeScript types for translation keys
- Custom hooks (useTranslatedError, useTranslatedPlural)
- Helper utilities
- Test utilities
- Migration pattern documentation
- Code examples

### Phase 2: Component Migration (13-18 hours)

**Task 3: Dashboard Components (3-4 hours)**
- AppBar, FileMenu, FilterDrawer, ExclusionDialog, DashboardPage
- ~88 strings
- Navigation, menus, filters

**Task 4: Grid Components (2-3 hours)**
- NineBoxGrid, GridBox, EmployeeTile, ViewModeToggle, EmployeeCount
- ~38 strings
- Grid labels, tooltips, keyboard shortcuts

**Task 5: Panel Components (4-5 hours)**
- EmployeeDetails, StatisticsTab, ChangeTrackerTab, IntelligenceTab, RightPanel
- ~98 strings
- Field labels, table headers, empty states

**Task 6: Dialogs & Forms (2-3 hours)**
- FileUploadDialog, SettingsDialog, ErrorBoundary
- ~40 strings
- Dialog content, form labels, validation

**Task 7: Notifications & Messages (2-3 hours)**
- All toast/snackbar messages
- ~65 strings
- Success/error/warning notifications

### Phase 3: Polish & Documentation (4-6 hours)

**Task 8: Accessibility & Polish (2-3 hours)**
- Extract remaining aria-labels, alt text, tooltips
- Add ESLint rules (no-literal-string)
- Audit for remaining hardcoded strings
- Document exceptions

**Task 9: Documentation & Testing (2-3 hours)**
- Complete developer guide
- Translation workflow guide
- Update CLAUDE.md
- E2E tests for language switching
- Translation coverage report

### Phase 4: Translation (3-4 hours)

**Task 10: Second Language Implementation (3-4 hours)**
- Complete Spanish translation (~400-500 strings)
- Test thoroughly
- Fix pluralization edge cases
- Fix layout issues (Spanish typically 20-30% longer)
- Manual QA

## Key Migration Patterns

### Simple Labels

```typescript
// Before
<Button>Import Data</Button>

// After
const { t } = useTranslation();
<Button>{t('dashboard.fileMenu.importData')}</Button>
```

### With Variables

```typescript
// Before
showSuccess(`Successfully imported ${filename}`);

// After
showSuccess(t('messages.importSuccess', { filename }));

// Translation:
// "importSuccess": "Successfully imported {{filename}}"
```

### Pluralization

```typescript
// Before
`${count} Change${count !== 1 ? "s" : ""}`

// After
t('dashboard.fileMenu.changeCount', { count })

// Translation (automatic plural handling):
// "changeCount_one": "{{count}} Change"
// "changeCount_other": "{{count}} Changes"
```

### Conditional Text

```typescript
// Before
isDonut ? "No donut changes yet" : "No changes yet"

// After
t(`panel.changeTracker.empty.${isDonut ? 'donut' : 'normal'}`)

// Translation:
// "empty": {
//   "normal": "No changes yet",
//   "donut": "No donut changes yet"
// }
```

## Testing Strategy

### Component Tests

```typescript
// Before (brittle)
expect(screen.getByText('Import Data')).toBeInTheDocument();

// After (resilient)
import { renderWithI18n } from '@/test/i18nTestUtils';

renderWithI18n(<FileMenu />);
expect(screen.getByText(t('dashboard.fileMenu.importData'))).toBeInTheDocument();

// Or better - test by role
expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
```

### E2E Tests

```typescript
// New tests to add
test('allows user to switch languages', async ({ page }) => {
  await page.goto('/');

  // Verify English
  await expect(page.getByText('Import Data')).toBeVisible();

  // Switch to Spanish
  await page.click('[data-testid="language-selector"]');
  await page.click('text=Español');

  // Verify Spanish
  await expect(page.getByText('Importar Datos')).toBeVisible();
});

test('handles pluralization correctly in both languages', async ({ page }) => {
  // Test 1 change vs 5 changes in both EN and ES
  // Spanish has different plural rules
});
```

## Success Criteria

### Functionality
- ✅ All features work in both languages
- ✅ Language switcher allows runtime switching
- ✅ No layout breaks with longer Spanish text
- ✅ Pluralization works correctly in both languages
- ✅ All dynamic content interpolates correctly

### Code Quality
- ✅ Zero hardcoded strings in components (except documented exceptions)
- ✅ TypeScript type safety for translation keys
- ✅ ESLint catches new violations
- ✅ All tests pass (unit, integration, E2E)
- ✅ No TypeScript errors
- ✅ No ESLint violations

### Translation Coverage
- ✅ 100% English translation
- ✅ 100% Spanish translation
- ✅ Translation coverage report generated
- ✅ No missing translation warnings

### Documentation
- ✅ Developer guide complete
- ✅ Translation workflow documented
- ✅ CLAUDE.md updated with i18n patterns
- ✅ Migration patterns documented
- ✅ Code examples provided

### Performance
- ✅ Bundle size increase <25KB gzipped
- ✅ No noticeable performance degradation
- ✅ Language switching is instant

## Estimated Timeline

| Phase | Tasks | Hours | Dependencies |
|-------|-------|-------|--------------|
| Foundation | 1-2 | 4-6 | None |
| Migration | 3-7 | 13-18 | Task 2 complete |
| Polish | 8-9 | 4-6 | Task 7 complete |
| Translation | 10 | 3-4 | Task 9 complete |
| **TOTAL** | **1-10** | **24-34** | Sequential |

**Note:** Tasks 3-7 (component migrations) can partially overlap after Task 2 is complete.

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing tests | High | High | Update tests incrementally; use i18n test utils |
| Bundle size too large | Medium | Low | Monitor with analyzer; lazy load if needed |
| Translation quality | Medium | Medium | Machine translate → refine → hire translator for final |
| Layout breaks (long text) | High | Medium | Test with Spanish early; use flexible layouts |
| Missed strings | High | Medium | ESLint enforcement + manual audit + coverage report |
| Developer confusion | Low | Medium | Clear docs + code examples + migration guide |

## Future Considerations

### Additional Languages (Post-MVP)
After English + Spanish, consider:
1. **French** - Canada, European market
2. **Portuguese** - Brazil market
3. **German** - European market
4. **Chinese (Simplified)** - Asia market (requires RTL consideration)

### Translation Management
For scaling beyond 2 languages:
- **Locize** - Translation management platform (SaaS)
- **Crowdin** - Collaborative translation
- **BabelEdit** - Desktop translation editor
- **i18n Ally** - VSCode extension for inline editing

### Feature Flags
Consider adding feature flag for gradual language rollout:
```typescript
// config.ts
export const SUPPORTED_LANGUAGES =
  config.enableI18n ? ['en', 'es'] : ['en'];
```

### Position Labels
The existing `positionLabels.ts` may need i18n too:
```json
{
  "positions": {
    "1": {
      "name": "Underperformer",
      "shortLabel": "[L,L]",
      "fullLabel": "Underperformer [L,L]",
      "guidance": "Low performance, low potential..."
    }
  }
}
```

This should be evaluated in Task 2 or 3.

## Related Documentation

**Existing:**
- `CLAUDE.md` - Project instructions (will update in Task 9)
- `frontend/src/constants/positionLabels.ts` - Example of structured domain data
- `frontend/src/utils/errorMessages.ts` - Example of structured messages

**To Create:**
- `internal-docs/i18n/README.md` - Developer guide
- `internal-docs/i18n/translation-workflow.md` - For translators
- `internal-docs/i18n/migration-patterns.md` - Code examples
- `internal-docs/i18n/adding-new-strings.md` - How to add strings
- `internal-docs/i18n/testing-guide.md` - How to test i18n

## Progress Tracking

Track progress in GitHub Issue: [Link to issue once created]

**Current Status:** Planning complete, ready to start Task 1

**Next Steps:**
1. Create GitHub Issue from `GITHUB_ISSUE.md`
2. Assign to bencan1a
3. Begin Task 1: Foundation Setup

---

**Last Updated:** 2025-12-23
**Status:** Active - Planning Complete
**Owner:** bencan1a
