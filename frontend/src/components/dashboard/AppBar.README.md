# AppBar Component Architecture

## Overview

The AppBar has been refactored into a composable system of presentational components with explicit state management, enabling isolated development, comprehensive Storybook testing, and improved maintainability.

## Component Hierarchy

```
AppBarContainer (smart component)
├── PureAppBar (presentational)
│   ├── FileMenuButton
│   │   ├── ChangeIndicator
│   │   ├── FileNameDisplay
│   │   └── Menu (dropdown)
│   ├── FilterButton (with Badge)
│   ├── SettingsButton
│   └── HelpButton
│       └── Menu (dropdown)
└── Dialogs
    ├── SettingsDialog
    └── FileUploadDialog
```

## Components

### AppBarContainer
**Location:** `AppBarContainer.tsx`

Smart container component that:
- Connects to session store (file, events)
- Manages local state (dialogs, menus, export status)
- Handles all business logic
- Provides callbacks to presentational components

**Usage:**
```tsx
import { AppBarContainer } from '@/components/dashboard';

<AppBarContainer />
```

### PureAppBar
**Location:** `PureAppBar.tsx`

Pure presentational component that:
- Accepts all data via props
- No direct state access
- Fully testable in isolation
- Works in Storybook

**Props:**
```typescript
interface PureAppBarProps {
  fileName?: string;
  changeCount: number;
  hasActiveFilters: boolean;
  filterTooltip: string;
  isFilterDisabled: boolean;
  isExporting?: boolean;
  // ... callbacks
}
```

**Usage:**
```tsx
<PureAppBar
  fileName="employees.xlsx"
  changeCount={3}
  hasActiveFilters={false}
  filterTooltip="Filter employees"
  isFilterDisabled={false}
  onImportClick={() => {}}
  onExportClick={() => {}}
  // ... other props
/>
```

### FileMenuButton
**Location:** `FileMenuButton.tsx`

File operations dropdown with:
- File name display
- Change count badge
- Import/Export menu items
- Recent files (coming soon)

**Props:**
```typescript
interface FileMenuButtonProps {
  fileName?: string;
  changeCount: number;
  isExporting?: boolean;
  onImportClick: () => void;
  onExportClick: () => void;
  // ... other props
}
```

### FileNameDisplay
**Location:** `FileNameDisplay.tsx`

Displays file name with:
- Placeholder for no file
- Asterisk for unsaved changes
- Text overflow handling

**Props:**
```typescript
interface FileNameDisplayProps {
  fileName?: string;
  hasUnsavedChanges?: boolean;
}
```

### ChangeIndicator
**Location:** `ChangeIndicator.tsx`

Badge component for change count:
- Wraps any child component
- Shows count when > 0
- Auto-hides when count is 0

**Props:**
```typescript
interface ChangeIndicatorProps {
  count: number;
  invisible?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### HelpButton
**Location:** `HelpButton.tsx`

Help menu dropdown with:
- User Guide menu item
- About menu item

**Props:**
```typescript
interface HelpButtonProps {
  onUserGuideClick: () => void;
  onAboutClick: () => void;
  disabled?: boolean;
}
```

## State Management

### Container State (AppBarContainer)
- `settingsDialogOpen` - Settings dialog visibility
- `uploadDialogOpen` - File upload dialog visibility
- `isExporting` - Export operation in progress

### Store State (from sessionStore)
- `sessionId` - Current session ID
- `filename` - Current file name
- `events` - Array of change events

### Computed State
- `filterTooltip` - Built from active filters
- `hasActiveFilters` - Derived from filter state

## UI States

### File States
1. **No File** - No file loaded, filter disabled
2. **File Loaded** - File loaded, no changes
3. **With Changes** - File loaded with unsaved changes

### Menu States
1. **All Closed** - All menus closed (default)
2. **File Menu Open** - File menu dropdown visible
3. **Help Menu Open** - Help menu dropdown visible

### Filter States
1. **No Filters** - No active filters
2. **Active Filters** - Filters applied (badge visible)

### Export States
1. **Idle** - No export in progress
2. **Exporting** - Export in progress (spinner)

## Testing

### Unit Tests
Located in `__tests__/`:
- `ChangeIndicator.test.tsx`
- `FileNameDisplay.test.tsx`
- `FileMenuButton.test.tsx`
- `HelpButton.test.tsx`
- `PureAppBar.test.tsx`

**Run tests:**
```bash
npm test
```

### Storybook Stories
Located in same directory as components:
- `ChangeIndicator.stories.tsx` (7 stories)
- `FileNameDisplay.stories.tsx` (5 stories)
- `FileMenuButton.stories.tsx` (8 stories)
- `HelpButton.stories.tsx` (3 stories)
- `PureAppBar.stories.tsx` (10 stories)

**Total: 33 stories**

**Run Storybook:**
```bash
npm run storybook
```

## Accessibility

All components follow WCAG 2.1 Level AA:
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Minimum contrast ratios

### Keyboard Shortcuts
- `Tab` - Navigate between buttons
- `Enter` / `Space` - Open menus
- `Escape` - Close menus
- `Arrow Keys` - Navigate menu items

## Internationalization

All text uses `useTranslation()` hook:
- Translation keys: `dashboard.appBar.*`
- Translation keys: `dashboard.fileMenu.*`

## Design Tokens

Uses theme tokens for consistency:
- Colors: `theme.palette.*`
- Spacing: `theme.spacing(n)`
- Shadows: `theme.shadows.*`

## Migration Guide

### Before (Old AppBar)
```tsx
import { AppBar } from '@/components/dashboard';

<AppBar />
```

### After (New AppBar)
```tsx
import { AppBarContainer } from '@/components/dashboard';

<AppBarContainer />
```

No other changes required - all functionality is preserved.

## Future Enhancements

1. **Recent Files** - Store and display recently opened files
2. **File Menu Enhancements** - Add "New", "Save As", etc.
3. **Help Menu Enhancements** - Add keyboard shortcuts dialog
4. **About Dialog** - Create dedicated about dialog
5. **Keyboard Shortcuts** - Implement global keyboard shortcuts

## Component Guidelines

### When to Modify

**Modify Container (AppBarContainer):**
- Adding new store connections
- Adding new business logic
- Managing new dialogs

**Modify Presentational (PureAppBar):**
- Adding new UI elements
- Changing layout
- Adding new props

**Create New Component:**
- New reusable UI element
- Complex dropdown menu
- New button type

### Testing Strategy

1. **Unit Tests** - Test component behavior
2. **Storybook** - Visual testing and documentation
3. **Integration Tests** - Test container + store
4. **E2E Tests** - Test full user flows

## Related Documentation

- [Design System Guidelines](../../../../DESIGN_SYSTEM.md)
- [Testing Guide](../../../../docs/testing/quick-reference.md)
- [Component Guidelines](../../../../docs/design-system/component-guidelines.md)
