---
title: "Enable saving sample data immediately without requiring changes"
labels: ["enhancement", "ux"]
---

## Problem

When users load sample data, they cannot save it to Excel without first making at least one change (e.g., moving an employee). This creates UX friction:

1. User loads sample dataset (200 employees)
2. Apply button remains disabled (requires `changeCount > 0`)
3. User must make a dummy change just to enable the Apply button
4. Only then can they save the sample data

This is unintuitive because loading sample data is an intentional action that changes the application state - users should be able to save it immediately.

## Proposed Solution

**Option B: Indicator with dot badge**

Add a `hasSampleData` flag to track when fresh sample data has been loaded but not yet saved. When this flag is true:

- **Menu item text**: "Save Sample Data"
- **Badge**: Green badge with dot "•" (not a number)
- **Behavior**: Apply button becomes enabled

This approach:
- Keeps the events system clean (events = actual user changes)
- Provides clear visual feedback (green dot = unsaved data)
- Uses semantically accurate labeling (not claiming "N changes")
- Maintains visual consistency (green = needs saving)

## Implementation Tasks

### Backend
- [ ] No backend changes needed (export API already supports saving sessions with 0 events)

### Frontend - Session Store
- [ ] Add `hasSampleData: boolean` to `SessionState` interface in `sessionStore.ts`
- [ ] Initialize `hasSampleData: false` in store
- [ ] Set `hasSampleData: true` when sample data is loaded (after successful generation)
- [ ] Clear `hasSampleData: false` when:
  - Session is cleared/closed
  - Any event is recorded (user makes actual changes)
  - Export/save completes successfully

### Frontend - UI Components
- [ ] Update `ChangeIndicator.tsx` to support dot badge variant:
  - Add optional `showDot?: boolean` prop
  - When `showDot=true`, display "•" instead of count number
  - Keep green color and styling consistent

- [ ] Update `FileMenuButton.tsx`:
  - Accept new prop `hasSampleData: boolean`
  - Show "Save Sample Data" menu item when `hasSampleData && events.length === 0`
  - Pass `showDot={hasSampleData && events.length === 0}` to ChangeIndicator
  - Update condition to show menu item: `{(hasChanges || hasSampleData) && (...) }`

- [ ] Update `AppBarContainer.tsx`:
  - Read `hasSampleData` from session store
  - Pass to FileMenuButton via PureAppBar
  - Clear flag after successful export in `handleApplyChanges`
  - Handle flag when sample data is loaded in `handleLoadSampleConfirm`

- [ ] Update `PureAppBar.tsx`:
  - Accept and pass through `hasSampleData` prop

### Frontend - Translations
- [ ] Add new translation key to all language files (`frontend/src/i18n/locales/*/translation.json`):
  ```json
  "saveSampleData": "Save Sample Data"
  ```
  - English: "Save Sample Data"
  - Spanish: "Guardar Datos de Muestra"
  - French: "Enregistrer les Données d'Exemple"
  - German: "Beispieldaten Speichern"
  - Japanese: "サンプルデータを保存"
  - Czech: "Uložit Ukázková Data"
  - Hindi: "नमूना डेटा सहेजें"

### Testing
- [ ] Add unit tests for session store `hasSampleData` flag logic
- [ ] Add unit tests for `ChangeIndicator` dot badge variant
- [ ] Update `FileMenuButton.test.tsx` to test sample data save scenario
- [ ] Add integration test: Load sample data → Apply button enabled → Save succeeds
- [ ] Add E2E test in `sample-data-flow.spec.ts`:
  - Load sample data
  - Verify "Save Sample Data" menu item appears
  - Verify green dot badge shows
  - Click save
  - Verify save succeeds and badge/menu item disappear

## Technical Notes

**Files to modify:**
- `frontend/src/store/sessionStore.ts` - Add flag and logic
- `frontend/src/components/dashboard/ChangeIndicator.tsx` - Dot badge support
- `frontend/src/components/dashboard/FileMenuButton.tsx` - Sample data menu item
- `frontend/src/components/dashboard/AppBarContainer.tsx` - Wire up flag
- `frontend/src/components/dashboard/PureAppBar.tsx` - Pass through prop
- `frontend/src/i18n/locales/*/translation.json` - New translation key (7 files)
- Test files as listed above

**Edge cases to handle:**
- Sample data loaded → User makes change → Events take over (flag becomes irrelevant)
- Sample data loaded → User loads different file → Clear flag
- Sample data loaded → User closes file → Clear flag
- Sample data saved → New sample data loaded → Flag should be set again

## Acceptance Criteria

- [ ] User can load sample dataset and immediately see enabled "Save Sample Data" option
- [ ] Green dot badge appears (not a number) when sample data is loaded
- [ ] Clicking "Save Sample Data" successfully saves to Excel
- [ ] After save, badge and special menu item disappear
- [ ] If user makes any changes after loading sample data, normal "Apply N Changes" takes over
- [ ] All existing file operations continue to work as before
