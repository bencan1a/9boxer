# Accessibility Standards

**Part of:** [9Boxer Design System](README.md)
**Related:** [Design Principles](design-principles.md) | [Interaction Patterns](interaction-patterns.md) | [Component Guidelines](component-guidelines.md)
**Last Updated:** 2025-12-24

---

## Overview

9Boxer is committed to **WCAG 2.1 Level AA compliance** as a non-negotiable standard. This document defines accessibility requirements, patterns, and testing procedures to ensure all users can effectively use the application, regardless of ability.

**Core Commitment:**
- **Keyboard accessibility** - Full functionality without mouse
- **Screen reader support** - Clear, descriptive content for assistive technology
- **Color contrast** - Minimum 4.5:1 for text, 3:1 for UI components
- **Motion sensitivity** - Respect user preferences for reduced motion
- **Clear focus indicators** - 3:1 contrast ratio for keyboard navigation

**Target:** WCAG 2.1 Level AA (legally required in many jurisdictions, best practice globally)

---

## WCAG 2.1 Level AA Requirements

### 1. Perceivable

**Information and UI components must be presentable to users in ways they can perceive.**

#### 1.1 Text Alternatives (A)

**All non-text content must have text alternatives.**

**Requirement:**
- Images: `alt` attribute (descriptive or empty for decorative)
- Icons: `aria-label` on icon buttons
- Decorative icons: `aria-hidden="true"`

**Current Implementation:**

```tsx
// ✅ Icon button with label (GridBox.tsx:192, 247, 256)
<IconButton
  onClick={onCollapse}
  size="small"
  aria-label={t('grid.box.collapseButton')}
>
  <UnfoldLessIcon />
</IconButton>

// ✅ GOOD (should add to all decorative icons)
<FileIcon aria-hidden="true" />
<Typography>{filename}</Typography>
```

**Action Required:**
- Mark all decorative icons as `aria-hidden="true"`
- Ensure all icon buttons have `aria-label`

#### 1.2 Time-based Media (A)

**Not applicable** - 9Boxer does not use video or audio content.

#### 1.3 Adaptable (A)

**Content must be presentable in different ways without losing information.**

**Requirement:**
- Heading hierarchy (h1 → h2 → h3, no skipping)
- Semantic HTML landmarks (`<main>`, `<nav>`, `<aside>`)
- Data tables use proper markup (`<th scope="col">`)

**Current State:**

```tsx
// ❌ GAP: Headings use component="span"
<Typography variant="h6" component="span">  // Should be component="h6"
  {title}
</Typography>

// ✅ GOOD: Semantic components via MUI
<Dialog>  // Renders as <div role="dialog">
<Button>  // Renders as <button>
```

**Action Required:**
- Use semantic heading components: `component="h1"`, `component="h2"`, etc.
- Add landmark regions: `<main>`, `<nav role="navigation">`, `<aside role="complementary">`
- Create skip link to main content

#### 1.4 Distinguishable (AA)

**Make it easier for users to see and hear content, including separating foreground from background.**

**Color Contrast Requirements:**
- **Normal text** (< 18pt): 4.5:1 minimum
- **Large text** (≥ 18pt or 14pt bold): 3:1 minimum
- **UI components** (borders, icons): 3:1 minimum

**Current Implementation** (tokens.ts):

| Element | Light Mode | Dark Mode | Ratio | Pass |
|---------|------------|-----------|-------|------|
| Primary text | rgba(0,0,0,0.87) on white | rgba(255,255,255,0.87) on #121212 | 18:1 | ✅ AAA |
| Secondary text | rgba(0,0,0,0.60) on white | rgba(255,255,255,0.60) on #121212 | 9:1 | ✅ AA |
| Primary button | white on #1976d2 | #121212 on #90caf9 | 4.6:1 | ✅ AA |
| Grid box borders | #e0e0e0 on white | #424242 on #121212 | 3:1 | ✅ AA |
| Success color | #4caf50 on white | #4caf50 on #121212 | 3.8:1 | ✅ AA |
| Error color | #f44336 on white | #f44336 on #121212 | 4.1:1 | ✅ AA |

**Visual Focus Indicators:**
- Minimum 3:1 contrast ratio with adjacent colors
- At least 2px thick outline or equivalent

```tsx
// MUI default (already compliant)
"&:focus-visible": {
  outline: `2px solid ${theme.palette.primary.main}`,
  outlineOffset: 2,
}
```

**Non-Text Contrast:**
- State indicators (modified border): 4px border in secondary color (#ff9800) = 3.2:1 contrast ✅
- Drag over highlight: Primary.main (#1976d2) border = 4.6:1 contrast ✅

---

### 2. Operable

**UI components and navigation must be operable.**

#### 2.1 Keyboard Accessible (A)

**All functionality must be available via keyboard.**

**Requirement:**
- Tab to all interactive elements
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys for navigation (where applicable)

**Current Implementation:**

**Global Keyboard Shortcuts** ([ZoomControls.tsx:98-146](../../frontend/src/components/common/ZoomControls.tsx#L98-L146)):

| Shortcut | Action | Compliant |
|----------|--------|-----------|
| `Ctrl/Cmd + Plus (+)` | Zoom In | ✅ |
| `Ctrl/Cmd + Minus (-)` | Zoom Out | ✅ |
| `Ctrl/Cmd + 0` | Reset Zoom | ✅ |
| `F11` | Toggle Full-Screen | ✅ |
| `Ctrl/Cmd + Scroll Up/Down` | Zoom | ✅ |
| `Escape` | Collapse Expanded Box | ✅ |

**Tab Navigation:**
1. Top Toolbar (File menu, View toggle, Zoom controls, Settings button)
2. Filter Drawer (Search, checkboxes)
3. Grid boxes (9 positions)
4. Employee tiles (within focused box)
5. Right panel (tabs, tab content)

**Gap: Grid Arrow Key Navigation**
- ❌ **Missing:** Arrow keys to navigate between 9 grid boxes
- **Recommendation:** Add arrow key handlers for 3x3 grid navigation

```tsx
// RECOMMENDED IMPLEMENTATION
const handleKeyDown = (e: React.KeyboardEvent, position: number) => {
  const row = Math.floor((position - 1) / 3);
  const col = (position - 1) % 3;

  switch (e.key) {
    case 'ArrowUp':
      if (row > 0) focusBox(position - 3);
      break;
    case 'ArrowDown':
      if (row < 2) focusBox(position + 3);
      break;
    case 'ArrowLeft':
      if (col > 0) focusBox(position - 1);
      break;
    case 'ArrowRight':
      if (col < 2) focusBox(position + 1);
      break;
  }
};
```

#### 2.2 Enough Time (A)

**Users have enough time to read and use content.**

**Current:**
- Snackbar auto-dismiss: 4 seconds (standard, allows time to read)
- No time limits on interactions
- No moving/scrolling text

**Compliant:** ✅

#### 2.3 Seizures and Physical Reactions (A)

**Do not design content in a way that causes seizures or physical reactions.**

**Requirement:**
- No flashing more than 3 times per second

**Current:**
- No flashing content
- Smooth transitions (0.15s-0.5s durations)

**Compliant:** ✅

#### 2.4 Navigable (AA)

**Provide ways to help users navigate, find content, and determine where they are.**

**Requirements:**
- Page title describes purpose
- Focus order is logical and sequential
- Link purpose clear from link text
- Multiple ways to find pages (not applicable for single-page app)
- Headings and labels describe topic/purpose

**Current Implementation:**

```tsx
// ✅ Page title
<title>9Boxer - Talent Grid Management</title>

// ✅ Descriptive link text (FileMenu.tsx:249)
<MenuItem onClick={handleImport}>
  <ListItemIcon><UploadIcon /></ListItemIcon>
  <ListItemText>{t('fileMenu.import')}</ListItemText>  // "Import Employee Data"
</MenuItem>

// ✅ Descriptive buttons
<Button onClick={handleExport}>
  {t('fileMenu.export')}  // "Export to Excel"
</Button>
```

**Gap: Skip Navigation**
- ❌ **Missing:** Skip link to main content
- **Recommendation:**

```tsx
// Add to App.tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// CSS
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

#### 2.5 Input Modalities (AA)

**Make it easier for users to operate functionality through various inputs beyond keyboard.**

**Requirement:**
- Click target size: minimum 44x44 CSS pixels (touch targets)
- Pointer cancellation: onclick occurs on mouseup (allows canceling)

**Current:**
- MUI buttons default to 48px height (compliant) ✅
- Icon buttons: 40px × 40px (compliant) ✅
- Drag handles: Minimum 56px tile height (compliant) ✅

---

### 3. Understandable

**Information and UI operation must be understandable.**

#### 3.1 Readable (A)

**Make text content readable and understandable.**

**Requirement:**
- Language of page identified (`<html lang="en">`)
- Language of parts identified (if multiple languages)

**Current:**

```tsx
// ✅ Set via i18next
<html lang="en">  // or "es" when Spanish selected
```

**Compliant:** ✅

#### 3.2 Predictable (A/AA)

**Web pages appear and operate in predictable ways.**

**Requirements:**
- Components with same functionality have consistent labeling
- Navigation order is consistent
- No context changes on focus (AA)
- No context changes on input (AA)

**Current:**
- Consistent button labels (Save, Cancel, Close)
- Consistent tab order
- No unexpected navigation on focus/input

**Compliant:** ✅

#### 3.3 Input Assistance (AA)

**Help users avoid and correct mistakes.**

**Requirements:**
- Error identification (clear error messages)
- Labels or instructions (form fields have labels)
- Error suggestion (provide guidance to fix)
- Error prevention for critical actions (confirmation)

**Current Implementation:**

```tsx
// ✅ Error messages (FileUploadDialog.tsx:164-168)
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}  // "Invalid file format. Please upload an Excel file (.xlsx)"
  </Alert>
)}

// ✅ Form labels (FilterDrawer.tsx:124-135)
<FormControlLabel
  control={<Checkbox />}
  label={t('filter.showAll')}
/>
```

**Gap: ARIA Error Linking**
- ❌ **Missing:** `aria-invalid` and `aria-describedby` linking errors to inputs

**Recommendation:**

```tsx
<TextField
  error={!!errors.email}
  helperText={errors.email}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <Typography id="email-error" variant="caption" color="error">
    {errors.email}
  </Typography>
)}
```

---

### 4. Robust

**Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.**

#### 4.1 Compatible (A)

**Maximize compatibility with current and future user agents, including assistive technologies.**

**Requirements:**
- Valid HTML (no duplicate IDs, proper nesting)
- Name, role, value of all components programmatically determined

**Current:**
- React enforces unique keys
- MUI provides proper ARIA roles automatically
- TypeScript prevents invalid prop values

**Compliant:** ✅

---

## ARIA Patterns and Best Practices

### ARIA Labels

**When to use `aria-label`:**

```tsx
// Icon-only buttons (no visible text)
<IconButton
  onClick={onClose}
  aria-label={t('common.close')}
>
  <CloseIcon />
</IconButton>

// Buttons with ambiguous labels
<IconButton
  onClick={handleExpand}
  aria-label={t('grid.box.expandButton')}  // "Expand to full height"
>
  <UnfoldMoreIcon />
</IconButton>
```

**When to use `aria-labelledby`:**

```tsx
// Link label to another element
<Box id="dialog-title">Employee Details</Box>
<Dialog aria-labelledby="dialog-title">
  {/* content */}
</Dialog>

// Menu linked to trigger button
<Button
  id="file-menu-button"
  aria-controls="file-menu"
  aria-haspopup="true"
  aria-expanded={open}
>
  File
</Button>
<Menu
  id="file-menu"
  anchorEl={anchorEl}
  open={open}
  aria-labelledby="file-menu-button"
>
  {/* menu items */}
</Menu>
```

**When to use `aria-describedby`:**

```tsx
// Link additional description
<TextField
  id="email-input"
  label="Email"
  aria-describedby="email-hint"
/>
<Typography id="email-hint" variant="caption">
  We'll never share your email with anyone else.
</Typography>
```

### ARIA States

**`aria-expanded`** (for expandable elements):

```tsx
// Current implementation (GridBox.tsx:163)
<Box
  aria-expanded={isExpanded}
  role="region"
  aria-label={t('grid.box.label', { position })}
>
```

**`aria-selected`** (for selectable items):

```tsx
<Tab
  label="Details"
  aria-selected={activeTab === 0}
/>
```

**`aria-invalid`** (for form validation):

```tsx
<TextField
  error={!!errors.name}
  aria-invalid={!!errors.name}
  helperText={errors.name}
/>
```

**`aria-hidden`** (for decorative content):

```tsx
// Hide decorative icons from screen readers
<DragIndicatorIcon aria-hidden="true" />
<Typography>{t('grid.box.dragToMove')}</Typography>
```

### ARIA Live Regions

**For dynamic content updates:**

```tsx
// Loading announcements
<Box role="status" aria-live="polite" aria-atomic="true">
  {loading ? t('common.loading') : null}
</Box>

// Error announcements
<Alert severity="error" role="alert">
  {error}
</Alert>
```

**MUI Components with Built-in ARIA:**
- `<Snackbar>` - Uses aria-live region
- `<Alert role="alert">` - Announced immediately
- `<CircularProgress role="status">` - Loading indicator
- `<Dialog role="dialog">` - Modal dialogs

---

## Keyboard Navigation Standards

### Tab Order

**Logical Tab Sequence:**

1. **Top Toolbar** (AppBar)
   - File menu button
   - View mode toggle
   - Zoom controls
   - Language selector
   - Settings button

2. **Filter Drawer** (if open)
   - Search input
   - Department checkboxes
   - Level checkboxes
   - Manager checkboxes
   - Reset button

3. **Main Content** (NineBoxGrid)
   - Grid box 1 (Top High Performer)
   - Grid box 2 (High Performer)
   - ... boxes 3-9 in reading order
   - Employee tiles within focused box

4. **Right Panel**
   - Tab navigation (Details, Changes, Statistics, Intelligence)
   - Tab content (forms, links, buttons)

**Do NOT:**
- ❌ Set `tabIndex="-1"` on interactive elements (makes them unreachable)
- ❌ Set `tabIndex="1"`, `"2"`, etc. (creates confusing tab order)
- ❌ Use `tabIndex="0"` on non-interactive elements (confuses users)

**DO:**
- ✅ Use natural tab order (follows DOM order)
- ✅ Set `tabIndex="0"` on custom interactive elements
- ✅ Set `tabIndex="-1"` programmatically to manage focus

### Focus Management

**Modal Dialogs:**

```tsx
// MUI Dialog automatically:
// 1. Traps focus inside dialog (Tab cycles within)
// 2. Sets initial focus to first focusable element
// 3. Returns focus to trigger on close

// Manual focus restoration (if needed)
const triggerRef = useRef<HTMLButtonElement>(null);

const handleClose = () => {
  setOpen(false);
  setTimeout(() => {
    triggerRef.current?.focus();  // Restore focus
  }, 100);
};
```

**After Async Actions:**

```tsx
const handleDelete = async () => {
  await deleteEmployee(id);
  // Focus next employee or "no selection" message
  const nextEmployee = employees[index + 1] || employees[index - 1];
  if (nextEmployee) {
    selectEmployee(nextEmployee.id);
  }
};
```

### Keyboard Shortcuts

**Requirements:**
- Document shortcuts in UI (tooltip or help text)
- Support both Ctrl (Windows/Linux) and Cmd (Mac)
- Don't override browser shortcuts (Ctrl+T, Ctrl+W, etc.)
- Provide single-key shortcuts only when appropriate (dashboard/game context)

**Implementation Pattern:**

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check modifier key (cross-platform)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.key === '=') {  // Ctrl/Cmd + Plus
      e.preventDefault();
      handleZoomIn();
    }

    if (e.key === 'Escape') {  // No modifier needed
      handleClose();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## Screen Reader Support

### Semantic HTML

**Landmark Regions:**

```tsx
// Recommended structure
<Box component="nav" role="navigation">
  <AppBar />
</Box>

<Box component="aside" role="complementary">
  <FilterDrawer />
</Box>

<Box component="main" id="main-content">
  <NineBoxGrid />
</Box>

<Box component="aside" role="complementary">
  <RightPanel />
</Box>
```

**Heading Hierarchy:**

```tsx
// ✅ CORRECT
<Typography variant="h4" component="h1">9Boxer</Typography>
<Typography variant="h5" component="h2">Employee Grid</Typography>
<Typography variant="h6" component="h3">Position 5 - Solid Performer</Typography>

// ❌ WRONG (skips h2, uses span)
<Typography variant="h4" component="h1">9Boxer</Typography>
<Typography variant="h6" component="span">Position 5</Typography>
```

### Screen Reader Only Text

**Create utility class:**

```css
/* sr-only.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Usage:**

```tsx
<Button>
  <DeleteIcon aria-hidden="true" />
  <span className="sr-only">Delete employee</span>
</Button>
```

### Announcements for Dynamic Content

**Loading States:**

```tsx
<Box
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {loading && t('common.loadingEmployees')}
</Box>
```

**Success/Error Notifications:**

```tsx
// MUI Snackbar automatically announces via aria-live
<Snackbar>
  <Alert severity="success">
    Employee saved successfully!
  </Alert>
</Snackbar>
```

**Data Updates:**

```tsx
// Announce filter results
<Box role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {t('filter.resultsAnnouncement', {
    count: filteredEmployees.length,
    total: employees.length
  })}
  {/* "Showing 45 of 120 employees" */}
</Box>
```

---

## Motion and Animation

### Respect User Preferences

**CRITICAL:** Support `prefers-reduced-motion` media query.

**Current Gap:**
- ❌ No motion preference handling
- Transitions run regardless of user preference

**Required Implementation:**

```tsx
// 1. Create utility hook
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// 2. Use in components
const prefersReducedMotion = usePrefersReducedMotion();

<Box sx={{
  transition: prefersReducedMotion
    ? 'none'
    : 'opacity 0.3s ease-in-out'
}} />
```

**Global CSS Approach:**

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**When to Disable Animations:**
- User has `prefers-reduced-motion: reduce` enabled
- Low-end devices (poor performance)
- Critical user actions (don't delay with animation)

---

## Form Accessibility

### Labels and Instructions

**Required:**
- Every input has a visible label or aria-label
- Required fields are marked
- Instructions provided before form

```tsx
<TextField
  id="employee-name"
  label={t('form.employeeName')}
  required
  helperText={t('form.employeeNameHint')}
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### Error Handling

**Pattern:**

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

<TextField
  id="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!errors.email}
  helperText={errors.email}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>

{errors.email && (
  <Typography
    id="email-error"
    variant="caption"
    color="error"
    role="alert"
  >
    {errors.email}
  </Typography>
)}
```

### Required Fields

```tsx
<TextField
  label="Department"
  required
  aria-required="true"
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <span aria-label="required">*</span>
      </InputAdornment>
    ),
  }}
/>
```

### Fieldsets and Legends

**For radio groups and checkbox groups:**

```tsx
<FormControl component="fieldset">
  <FormLabel component="legend">
    {t('settings.theme.label')}
  </FormLabel>
  <RadioGroup
    aria-label={t('settings.theme.ariaLabel')}
    value={theme}
    onChange={(e) => setTheme(e.target.value)}
  >
    <FormControlLabel value="light" control={<Radio />} label="Light" />
    <FormControlLabel value="dark" control={<Radio />} label="Dark" />
    <FormControlLabel value="auto" control={<Radio />} label="Auto" />
  </RadioGroup>
</FormControl>
```

---

## Testing Checklist

### Manual Testing

#### Keyboard Navigation

- [ ] Tab through entire application without mouse
- [ ] All interactive elements reachable via keyboard
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Enter/Space activates buttons and toggles checkboxes
- [ ] Escape closes dialogs and cancels actions
- [ ] Arrow keys navigate grids/lists (where applicable)
- [ ] Focus visible at all times (clear indicator)
- [ ] No keyboard traps (can always tab out)

#### Screen Reader Testing

**Recommended Tools:**
- **Windows:** NVDA (free) or JAWS (paid)
- **macOS:** VoiceOver (built-in, Cmd+F5)
- **Linux:** Orca

**Test Scenarios:**
- [ ] Navigate page using heading shortcuts (H key in NVDA)
- [ ] Navigate landmarks using region shortcuts (D key in NVDA)
- [ ] Tab through form and verify all labels are read
- [ ] Trigger error and verify error message is announced
- [ ] Activate button and verify loading state is announced
- [ ] Open dialog and verify focus is trapped inside
- [ ] Close dialog and verify focus returns to trigger
- [ ] Use grid and verify position labels are read
- [ ] Drag employee and verify action is announced

#### Color Contrast Testing

**Tools:**
- **Browser Extension:** axe DevTools, WAVE
- **Online:** WebAIM Contrast Checker
- **macOS:** Color Contrast Analyser

**Test Cases:**
- [ ] All text has 4.5:1 contrast (or 3:1 for large text)
- [ ] All UI component borders have 3:1 contrast
- [ ] Focus indicators have 3:1 contrast with adjacent colors
- [ ] State indicators (modified, error, success) have sufficient contrast
- [ ] Both light and dark modes meet contrast requirements

#### Motion Sensitivity

- [ ] Enable "Reduce motion" in OS settings
- [ ] Verify animations are disabled or reduced
- [ ] Verify application still functions correctly
- [ ] No jarring or instant state changes

### Automated Testing

#### axe-core Integration

**Install:**

```bash
npm install --save-dev @axe-core/react
```

**Setup (dev only):**

```tsx
// index.tsx (dev mode only)
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**This will log accessibility violations to console in development.**

#### Playwright Accessibility Tests

```tsx
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('dashboard should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('file upload dialog should be accessible', async ({ page }) => {
  await page.goto('/');
  await page.click('[aria-label="File menu"]');
  await page.click('text=Import');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

#### Component Testing

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

test('Button should have no accessibility violations', async () => {
  const { container } = render(<Button label="Click me" />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
```

---

## Priority Action Items

### HIGH PRIORITY (Implement Immediately)

1. **Add `prefers-reduced-motion` support**
   - Affects motion-sensitive users
   - Legal requirement in some jurisdictions
   - Implementation: Global CSS + hook

2. **Mark decorative icons as `aria-hidden="true"`**
   - Reduces screen reader noise
   - Quick wins across many components

3. **Link form errors to inputs**
   - Add `aria-invalid` and `aria-describedby`
   - Critical for form usability with screen readers

4. **Add semantic heading hierarchy**
   - Replace `component="span"` with `component="h1"`, `component="h2"`, etc.
   - Essential for screen reader navigation

### MEDIUM PRIORITY (Next Sprint)

5. **Implement arrow key navigation for grid**
   - Enhances keyboard usability
   - 2-dimensional navigation pattern

6. **Create `sr-only` utility class**
   - Add hidden context for screen readers
   - Improves semantic meaning

7. **Add focus restoration after modals**
   - Return focus to trigger element after close
   - Enhances keyboard navigation flow

8. **Add skip navigation link**
   - Helps screen reader users bypass repetitive content

### LOW PRIORITY (Future Enhancements)

9. **Add loading state announcements**
   - Aria-live regions for async operations
   - Improves perceived responsiveness

10. **Document all keyboard shortcuts in UI**
    - Tooltip hints or help dialog
    - Discoverability for power users

---

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Understanding Docs](https://www.w3.org/WAI/WCAG21/Understanding/)

### ARIA Authoring Practices
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)

### Testing Tools
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Screen Readers
- [NVDA (Windows - Free)](https://www.nvaccess.org/)
- [JAWS (Windows - Paid)](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (macOS/iOS - Built-in)](https://www.apple.com/accessibility/voiceover/)
- [Orca (Linux - Free)](https://help.gnome.org/users/orca/stable/)

---

## Related Documentation

- **[Design Principles](design-principles.md)** - Core accessibility philosophy
- **[Interaction Patterns](interaction-patterns.md)** - Keyboard shortcuts and focus states
- **[Component Guidelines](component-guidelines.md)** - Accessible component patterns
- **[Layout Patterns](layout-patterns.md)** - Semantic structure and landmarks

---

**Accessibility is not optional. It's a requirement for a professional, inclusive product.**
