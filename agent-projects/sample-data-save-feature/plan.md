# Sample Data Save Feature - Implementation Plan

```yaml
status: active
owner: bencan1a
created: 2024-12-30
github_issue: 139
summary:
  - Enable users to save sample data immediately without requiring changes
  - Add hasSampleData flag to track loaded but unsaved sample data
  - Show "Save Sample Data" menu item with green dot badge
  - Update quickstart documentation
```

## Problem Statement

When users load sample data, they cannot save it to Excel without first making at least one change. This creates UX friction where users must make a dummy change just to enable the Apply button.

## Solution Approach

**Option B: Indicator with dot badge** (approved by user)

Add a `hasSampleData` flag to track when fresh sample data has been loaded but not yet saved:
- Menu item text: "Save Sample Data"
- Badge: Green dot "•" (not a number)
- Behavior: Apply button becomes enabled

## Implementation Tasks

### Phase 1: Session State Management
- Add `hasSampleData: boolean` to SessionState interface
- Initialize to `false` in store
- Set to `true` when sample data loads successfully
- Clear to `false` when:
  - Session is cleared/closed
  - Any event is recorded (user makes changes)
  - Export/save completes successfully

### Phase 2: UI Components
- Update ChangeIndicator.tsx:
  - Add `showDot?: boolean` prop
  - Display "•" instead of count when `showDot=true`
  - Keep green color consistent

- Update FileMenuButton.tsx:
  - Add `hasSampleData: boolean` prop
  - Show "Save Sample Data" when `hasSampleData && events.length === 0`
  - Pass `showDot={hasSampleData && events.length === 0}` to ChangeIndicator
  - Update condition: `{(hasChanges || hasSampleData) && (...) }`

- Update AppBarContainer.tsx:
  - Read `hasSampleData` from session store
  - Pass to FileMenuButton via PureAppBar
  - Clear flag after successful export
  - Handle flag when sample data loads

- Update PureAppBar.tsx:
  - Pass through `hasSampleData` prop

### Phase 3: Translations
Add "saveSampleData" key to all 7 language files:
- English: "Save Sample Data"
- Spanish: "Guardar Datos de Muestra"
- French: "Enregistrer les Données d'Exemple"
- German: "Beispieldaten Speichern"
- Japanese: "サンプルデータを保存"
- Czech: "Uložit Ukázková Data"
- Hindi: "नमूना डेटा सहेजें"

### Phase 4: Testing
- Unit tests for sessionStore hasSampleData logic
- Unit tests for ChangeIndicator dot badge variant
- Update FileMenuButton.test.tsx for sample data scenario
- Integration test: Load sample data → Apply enabled → Save succeeds

### Phase 5: Documentation
- Update quickstart documentation to mention this feature
- No screenshots needed (user confirmed)

## Edge Cases to Handle

1. Sample data loaded → User makes change → Events take over (flag becomes irrelevant)
2. Sample data loaded → User loads different file → Clear flag
3. Sample data loaded → User closes file → Clear flag
4. Sample data saved → New sample data loaded → Flag should be set again

## Files to Modify

**Frontend - Session Store:**
- `frontend/src/store/sessionStore.ts`

**Frontend - UI Components:**
- `frontend/src/components/dashboard/ChangeIndicator.tsx`
- `frontend/src/components/dashboard/FileMenuButton.tsx`
- `frontend/src/components/dashboard/AppBarContainer.tsx`
- `frontend/src/components/dashboard/PureAppBar.tsx`

**Frontend - Translations (7 files):**
- `frontend/src/i18n/locales/en/translation.json`
- `frontend/src/i18n/locales/es/translation.json`
- `frontend/src/i18n/locales/fr/translation.json`
- `frontend/src/i18n/locales/de/translation.json`
- `frontend/src/i18n/locales/ja/translation.json`
- `frontend/src/i18n/locales/cs/translation.json`
- `frontend/src/i18n/locales/hi/translation.json`

**Frontend - Tests:**
- `frontend/src/store/sessionStore.test.ts` (new or update)
- `frontend/src/components/dashboard/ChangeIndicator.test.tsx` (new or update)
- `frontend/src/components/dashboard/FileMenuButton.test.tsx` (update)
- Integration test (location TBD)

**Documentation:**
- `resources/user-guide/docs/quickstart.md`

## Backend Changes

No backend changes needed - export API already supports saving sessions with 0 events.

## Acceptance Criteria

- [ ] User can load sample dataset and immediately see enabled "Save Sample Data" option
- [ ] Green dot badge appears (not a number) when sample data is loaded
- [ ] Clicking "Save Sample Data" successfully saves to Excel
- [ ] After save, badge and special menu item disappear
- [ ] If user makes changes after loading sample data, normal "Apply N Changes" takes over
- [ ] All existing file operations continue to work
- [ ] All edge cases handled correctly
- [ ] Unit and integration tests pass
- [ ] Quickstart documentation updated
- [ ] Pre-commit checks pass

## Testing Strategy

- **Unit tests**: Session store logic, ChangeIndicator variants
- **Integration tests**: Full sample data save flow
- **Manual validation**: User smoke test
- **No E2E tests needed** (user confirmed)

## Notes

- Keep events system clean (events = actual user changes only)
- Sample data loading is NOT an event
- Visual consistency: green badge for both scenarios (changes and sample data)
