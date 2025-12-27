# Design Principles

The design principles of 9Boxer guide all UI and UX decisions. These principles ensure a consistent, professional, and accessible experience that serves the needs of talent management professionals.

---

## Table of Contents

- [Core Philosophy](#core-philosophy)
- [Interaction Principles](#interaction-principles)
- [Visual Design Principles](#visual-design-principles)
- [Component Design Guidelines](#component-design-guidelines)
- [Applying the Principles](#applying-the-principles)

---

## Core Philosophy

### 9Boxer is a Professional Tool for Critical Decisions

Every design decision must prioritize **clarity and confidence**. Managers use 9Boxer to make decisions about people's careers. The interface must never obscure data, create confusion, or slow down decision-making.

### The Five Pillars

#### 1. Clarity Over Cleverness

**Principle:** Users need to make confident decisions about people's careers.

**In Practice:**
- ✅ Clear, descriptive labels (not abbreviations)
- ✅ Obvious interaction affordances (buttons look clickable)
- ✅ Predictable behavior (no surprises)
- ✅ Scannable information hierarchy
- ❌ Cute animations that distract
- ❌ Hidden features that require discovery
- ❌ Clever UI patterns that confuse

**Example:**
```tsx
// ❌ Clever but unclear
<IconButton><SomeIcon /></IconButton>

// ✅ Clear and accessible
<IconButton aria-label="Edit employee details">
  <EditIcon />
</IconButton>
<Tooltip title="Edit employee details">
  <IconButton><EditIcon /></IconButton>
</Tooltip>
```

---

#### 2. Data Integrity

**Principle:** Visual design must never obscure or misrepresent data.

**In Practice:**
- ✅ Accurate data visualization (no misleading charts)
- ✅ Statistical significance clearly indicated
- ✅ Sample sizes visible (context for percentages)
- ✅ Color coding consistent and meaningful
- ✅ Empty states explicitly shown (not hidden)
- ❌ Cherry-picked data displays
- ❌ Truncated charts (must show full scale)
- ❌ Color-only information (always pair with text/icons)

**Example:**
```tsx
// ❌ Misleading - no context
<Typography>45% High Performers</Typography>

// ✅ Complete context
<Typography>
  45% High Performers (12 of 27 employees)
  {isSignificant && <Chip label="Statistically significant" color="warning" />}
</Typography>
```

---

#### 3. Efficiency

**Principle:** Managers have limited time; respect it.

**In Practice:**
- ✅ Common tasks require minimal clicks
- ✅ Keyboard shortcuts for power users
- ✅ Drag-and-drop for direct manipulation
- ✅ Bulk operations where appropriate
- ✅ Smart defaults (minimize configuration)
- ❌ Multi-step wizards for simple tasks
- ❌ Unnecessary confirmation dialogs
- ❌ Forms that repeat information

**Example:**
```tsx
// ❌ Inefficient - requires navigation
<Button onClick={() => navigate('/employee/123/edit')}>
  Edit Employee
</Button>

// ✅ Efficient - inline editing
<EmployeeTile
  employee={emp}
  onEdit={handleQuickEdit}  // Opens inline editor
  onDragEnd={handleMove}    // Direct manipulation
/>
```

---

#### 4. Accessibility

**Principle:** WCAG 2.1 Level AA compliance is non-negotiable.

**In Practice:**
- ✅ Minimum contrast ratio: 4.5:1 (text), 3:1 (UI)
- ✅ Keyboard navigation for all features
- ✅ Screen reader compatible
- ✅ Focus indicators always visible
- ✅ Semantic HTML elements
- ✅ ARIA labels for dynamic content
- ❌ Color-only status indicators
- ❌ Mouse-only interactions
- ❌ Invisible focus states

**Example:**
```tsx
// ❌ Inaccessible
<div onClick={handleClick} style={{ color: isActive ? 'green' : 'red' }}>
  Status
</div>

// ✅ Accessible
<Button
  onClick={handleClick}
  aria-pressed={isActive}
  sx={{
    color: isActive ? 'success.main' : 'error.main',
    '&:focus': { outline: '2px solid', outlineColor: 'primary.main' }
  }}
>
  <CheckIcon /> {isActive ? 'Active' : 'Inactive'}
</Button>
```

---

#### 5. Consistency

**Principle:** Predictable patterns reduce cognitive load.

**In Practice:**
- ✅ Same action, same location (Save button always bottom-right)
- ✅ Same visual style (all cards use same shadow)
- ✅ Same interaction pattern (all modals dismissed with Esc)
- ✅ Same terminology (Performance vs Potential, not Rating vs Score)
- ✅ Design tokens for all values
- ❌ Different button styles for same action
- ❌ Inconsistent spacing between sections
- ❌ Mixed terminology

**Example:**
```tsx
// ❌ Inconsistent
<Button variant="contained" color="primary">Save</Button>
<Button variant="outlined" color="secondary">Save</Button>

// ✅ Consistent
<Button variant="contained" color="primary">Save</Button>  // Always primary
<Button variant="outlined">Cancel</Button>                 // Always outlined
```

---

## Interaction Principles

### Progressive Disclosure

**Show the right amount of detail at the right time.**

Users shouldn't be overwhelmed with all information at once, but critical data should never be hidden.

**Levels of Detail:**

1. **Overview (Grid View - Collapsed)**
   - Position labels (High Performer, Needs Attention, etc.)
   - Employee count per box
   - Collapsed height (60-80px)
   - Purpose: Scan distribution at a glance

2. **Preview (Grid View - Normal)**
   - Employee names and IDs
   - Drag-and-drop enabled
   - Normal height (150-400px)
   - Purpose: Review and reorganize employees

3. **Expanded Detail (Grid View - Expanded)**
   - Full employee list with all metadata
   - Quick action buttons
   - Expanded height (maximized)
   - Purpose: Focus on one position

4. **Comprehensive Detail (Right Panel)**
   - Full employee profile
   - Performance history
   - Management chain
   - Notes and comments
   - Purpose: Deep analysis and documentation

**Example:**
```tsx
// Progressive disclosure in GridBox
<GridBox
  isCollapsed={viewMode === 'overview'}    // Level 1: Minimal
  isExpanded={expandedBox === position}     // Level 3: Maximum
  // Level 2: Normal (default)
>
  {isCollapsed ? (
    <EmployeeCount count={employees.length} />  // Just the number
  ) : isExpanded ? (
    <EmployeeListWithMetadata employees={employees} />  // Everything
  ) : (
    <EmployeeTileList employees={employees} />  // Names only
  )}
</GridBox>
```

---

### Immediate Feedback

**Users must always know what just happened.**

Every action should have visible feedback within 100ms (perceived as instantaneous).

**Feedback Types:**

1. **Visual Confirmation**
   - Button state changes (pressed, loading)
   - Color changes (success green, error red)
   - Check marks or icons
   - Animation (subtle, purposeful)

2. **Notifications (Snackbar)**
   - Success: "Employee saved" (green)
   - Error: "Failed to save: [reason]" (red)
   - Warning: "Unsaved changes" (orange)
   - Info: "Export in progress" (blue)

3. **Loading States**
   - Spinner for long operations (>300ms)
   - Skeleton screens for initial loads
   - Progress bars for known durations
   - Disabled state for buttons during processing

**Example:**
```tsx
// Immediate feedback for save action
const handleSave = async () => {
  setIsSaving(true);  // Immediate: Button shows loading

  try {
    await saveEmployee(employee);
    showSuccess(t('employee.saved'));  // 100ms: Green snackbar
    setIsSaving(false);
  } catch (error) {
    showError(t('employee.save_failed', { error }));  // Red snackbar with reason
    setIsSaving(false);
  }
};

<Button
  onClick={handleSave}
  disabled={isSaving}
  startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
>
  {isSaving ? t('common.saving') : t('common.save')}
</Button>
```

---

### Graceful Degradation

**Handle errors elegantly; never show blank screens.**

Users should always have a path forward, even when things go wrong.

**Error Handling Hierarchy:**

1. **Prevention** (Best)
   - Validate inputs before submission
   - Disable invalid actions
   - Show helpful hints

2. **Recovery** (Good)
   - Retry failed operations
   - Offer alternative actions
   - Cache data locally

3. **Explanation** (Minimum)
   - Clear error messages
   - Suggest next steps
   - Provide contact/support info

**Example - Connection Lost:**
```tsx
{isOffline ? (
  <Alert severity="warning" sx={{ mb: 2 }}>
    <AlertTitle>Connection Lost</AlertTitle>
    You can continue viewing employee data, but changes won't be saved until
    connection is restored.
    <Button onClick={handleRetry} sx={{ mt: 1 }}>
      Retry Connection
    </Button>
  </Alert>
) : null}
```

**Example - Empty State:**
```tsx
// ❌ Bad: Blank screen confuses users
{employees.length === 0 ? null : <EmployeeList />}

// ✅ Good: Explain and guide
{employees.length === 0 ? (
  <EmptyState
    icon={<PeopleIcon />}
    title={t('employees.empty.title')}
    description={t('employees.empty.description')}
    action={
      <Button variant="contained" onClick={handleUpload}>
        {t('employees.upload')}
      </Button>
    }
  />
) : (
  <EmployeeList employees={employees} />
)}
```

---

### Confirmations & Undos

**Balance safety with efficiency.**

**When to Confirm:**
- ✅ Destructive actions (delete, clear all)
- ✅ Bulk operations (affect >10 items)
- ✅ Irreversible changes (cannot undo)

**When NOT to Confirm:**
- ❌ Reversible actions (provide undo instead)
- ❌ Non-destructive actions (save, edit)
- ❌ Frequent operations (frustrates users)

**Undo Pattern:**
```tsx
// Better than confirmation dialog
const handleDelete = (employeeId: number) => {
  const employee = employees.find(e => e.id === employeeId);

  // Optimistic update
  setEmployees(prev => prev.filter(e => e.id !== employeeId));

  // Show undo snackbar
  showSuccess(
    t('employee.deleted', { name: employee.name }),
    {
      action: (
        <Button color="inherit" onClick={() => handleUndo(employee)}>
          {t('common.undo')}
        </Button>
      ),
      autoHideDuration: 5000,
    }
  );

  // Permanent deletion after 5s (unless undone)
  setTimeout(() => deleteEmployeeFromServer(employeeId), 5000);
};
```

---

## Visual Design Principles

### Color Usage

**Color communicates meaning; use it purposefully.**

#### Semantic Colors

Colors have consistent meanings across the entire application:

| Color | Meaning | Usage | Hex |
|-------|---------|-------|-----|
| **Green** | Success, Positive, High Performance | Success messages, high performers, positive deviations | `#4caf50` |
| **Yellow/Orange** | Warning, Attention, Medium Performance | Warnings, moderate anomalies, medium performers | `#ff9800` |
| **Red** | Error, Critical, Low Performance | Errors, severe anomalies, low performers, needs attention | `#f44336` |
| **Blue** | Information, Primary Action, Neutral | Info messages, primary buttons, links | `#1976d2` |
| **Purple** | High Potential, Top Talent | High performer grid boxes | `#d4c4e8` (light) / `#4a3a5c` (dark) |

#### Never Use Color Alone

Color must always be paired with:
- ✅ Text labels
- ✅ Icons
- ✅ Patterns/textures
- ✅ Shapes

**Example:**
```tsx
// ❌ Color-only (inaccessible)
<Box sx={{ backgroundColor: status === 'active' ? 'green' : 'red' }} />

// ✅ Color + icon + text
<Chip
  icon={status === 'active' ? <CheckCircleIcon /> : <ErrorIcon />}
  label={status === 'active' ? 'Active' : 'Inactive'}
  color={status === 'active' ? 'success' : 'error'}
/>
```

#### Color Contrast

All color combinations must meet WCAG AA standards:
- **Normal text** (< 18px): 4.5:1 contrast ratio
- **Large text** (≥ 18px or 14px bold): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.

---

### Typography Hierarchy

**Establish clear information hierarchy.**

| Element | Variant | Usage | Size | Weight |
|---------|---------|-------|------|--------|
| **Page Title** | h1 | Dashboard, Settings | 2.5rem (40px) | 500 |
| **Section Heading** | h2 | Statistics, Changes | 2rem (32px) | 500 |
| **Subsection Heading** | h3 | Performance Distribution | 1.75rem (28px) | 500 |
| **Component Heading** | h4 | Card titles | 1.5rem (24px) | 500 |
| **Small Heading** | h5 | Accordion headers | 1.25rem (20px) | 500 |
| **Tiny Heading** | h6 | List section headers | 1rem (16px) | 500 |
| **Primary Text** | body1 | Employee names, descriptions | 1rem (16px) | 400 |
| **Secondary Text** | body2 | Metadata, timestamps | 0.875rem (14px) | 400 |
| **Tertiary Text** | caption | Hints, counts | 0.75rem (12px) | 400 |

**Hierarchy Example:**
```tsx
<Box>
  <Typography variant="h2">Employee Statistics</Typography>          {/* Section */}
  <Typography variant="h3" sx={{ mt: 3 }}>
    Performance Distribution                                          {/* Subsection */}
  </Typography>
  <Card>
    <CardHeader title="High Performers by Department" />             {/* h4 implicit */}
    <CardContent>
      <Typography variant="body1">Engineering: 45%</Typography>      {/* Primary */}
      <Typography variant="body2" color="text.secondary">
        12 of 27 employees                                            {/* Secondary */}
      </Typography>
    </CardContent>
  </Card>
</Box>
```

---

### Spacing & Rhythm

**Use consistent spacing scale for visual harmony.**

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing (icon-to-label) |
| `sm` | 8px | Small gaps (list items, chip spacing) |
| `md` | 16px | Standard component padding |
| `lg` | 24px | Section separation |
| `xl` | 32px | Large section separation |
| `xxl` | 48px | Page-level margins |

**Vertical Rhythm:**
- Maintain consistent spacing between sections
- Align elements to 8px baseline grid
- Use whitespace to create visual groupings

**Example:**
```tsx
<Box sx={{
  p: theme.tokens.spacing.md,          // Component padding: 16px
  mb: theme.tokens.spacing.lg,         // Section margin: 24px
}}>
  <Typography variant="h3" sx={{ mb: 2 }}>
    Section Heading
  </Typography>
  <Typography sx={{ mb: 1 }}>         {/* Tight paragraph spacing: 8px */}
    Paragraph text...
  </Typography>
</Box>
```

---

### Motion & Animation

**Animation should enhance understanding, not distract.**

#### Animation Principles:

1. **Purposeful**
   - Explains state changes
   - Guides user attention
   - Provides spatial context

2. **Subtle**
   - Doesn't interrupt workflow
   - Completes quickly (< 300ms)
   - Can be disabled (prefers-reduced-motion)

3. **Consistent**
   - Same duration for similar transitions
   - Same easing function within a category
   - Predictable direction (drawers slide from edge)

#### Standard Durations:

| Duration | Usage | Token |
|----------|-------|-------|
| **0.15s** | Micro-interactions (hover, focus) | `tokens.duration.fast` |
| **0.3s** | Component transitions (panel slide, modal) | `tokens.duration.normal` |
| **0.5s** | Large movements (page transitions) | `tokens.duration.slow` |

#### Standard Easing:

| Easing | Usage | Token |
|--------|-------|-------|
| **ease-in-out** | General transitions (default) | `tokens.easing.easeInOut` |
| **ease-out** | Entrances (modals, drawers) | `tokens.easing.easeOut` |
| **ease-in** | Exits (modals, drawers) | `tokens.easing.easeIn` |

**Example:**
```tsx
<Drawer
  open={isOpen}
  sx={{
    '& .MuiDrawer-paper': {
      transition: `transform ${tokens.duration.normal} ${tokens.easing.easeOut}`,
    },
  }}
/>
```

#### Respect User Preferences:

```tsx
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<Box sx={{
  transition: prefersReducedMotion
    ? 'none'
    : `all ${tokens.duration.normal} ${tokens.easing.easeInOut}`,
}} />
```

---

## Component Design Guidelines

### Buttons

**Hierarchy:** Use button variants to establish visual priority.

| Variant | Usage | Example |
|---------|-------|---------|
| **Contained (Primary)** | Main action on screen | Save, Submit, Upload |
| **Outlined (Secondary)** | Secondary actions | Cancel, Close, Back |
| **Text (Tertiary)** | Low-priority actions | Learn More, Skip |

**States Required:**
- Default, Hover, Active, Disabled, Loading, Focus

**Example:**
```tsx
<DialogActions>
  <Button variant="text" onClick={handleCancel}>
    Cancel
  </Button>
  <Button
    variant="contained"
    onClick={handleSave}
    disabled={isSaving}
    startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
  >
    {isSaving ? 'Saving...' : 'Save'}
  </Button>
</DialogActions>
```

**Button Guidelines:**
- ✅ Only one primary action per screen/dialog
- ✅ Destructive actions use error color
- ✅ Loading state shows spinner (don't just disable)
- ✅ Disabled buttons explain why (tooltip)
- ❌ Don't use all caps (textTransform: 'none')

---

### Forms

**Input Design:**

1. **Clear labels above inputs** (not floating)
2. **Helper text below** (character count, format hints)
3. **Inline validation** (real-time feedback)
4. **Error messages specific and actionable**

**Example:**
```tsx
<TextField
  label="Employee ID"                          // Above, not floating
  value={employeeId}
  onChange={handleChange}
  fullWidth
  required
  error={!!error}
  helperText={error || "Format: EMP-12345"}   // Below with hint
  inputProps={{
    'data-testid': 'employee-id-input',
    pattern: 'EMP-\\d{5}',
  }}
/>
```

**Validation Timing:**
- ✅ Validate on blur (not on change for short inputs)
- ✅ Show success state (green checkmark)
- ✅ Group related errors (form-level summary)
- ❌ Don't validate on every keystroke (annoying)

---

### Data Tables & Grids

**Information Density:**

Balance scanability with information richness:
- ✅ Adequate padding (not cramped)
- ✅ Visual grouping (subtle alternating rows)
- ✅ Actionable items clear (hover states)
- ✅ Click targets ≥ 44px (touch-friendly)

**Example:**
```tsx
<TableRow
  hover
  sx={{
    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
    cursor: 'pointer',
    minHeight: 56,  // 44px minimum for accessibility
  }}
>
  <TableCell>{employee.name}</TableCell>
  <TableCell align="right">
    <IconButton
      aria-label="Edit"
      onClick={handleEdit}
      sx={{ minWidth: 44, minHeight: 44 }}  // Touch target
    >
      <EditIcon />
    </IconButton>
  </TableCell>
</TableRow>
```

---

### Empty States

**Never show blank screens.**

Empty states should:
1. Explain what's missing
2. Explain why it's missing (if not obvious)
3. Suggest next action
4. Include helpful imagery (optional)

**Example:**
```tsx
<EmptyState>
  <InboxIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
  <Typography variant="h6" sx={{ mt: 2 }}>
    No Employees Yet
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
    Upload an Excel file to get started with your 9-box grid.
  </Typography>
  <Button variant="contained" onClick={handleUpload}>
    Upload Employee Data
  </Button>
</EmptyState>
```

---

## Applying the Principles

### Before Designing a Feature

Ask yourself:

1. **Clarity:** Can users understand this without explanation?
2. **Data Integrity:** Does this accurately represent the data?
3. **Efficiency:** Is this the fastest way to accomplish the task?
4. **Accessibility:** Can everyone use this (keyboard, screen reader)?
5. **Consistency:** Does this match existing patterns?

### Design Review Checklist

Use this checklist for every UI change:

- [ ] Follows core philosophy (clarity, data integrity, efficiency, accessibility, consistency)
- [ ] Provides immediate feedback for all actions
- [ ] Handles errors gracefully (no blank screens)
- [ ] Uses semantic colors correctly
- [ ] Maintains typography hierarchy
- [ ] Uses spacing tokens (no hardcoded values)
- [ ] Animates purposefully (not decoratively)
- [ ] Meets WCAG AA contrast ratios
- [ ] Works with keyboard navigation
- [ ] Tested in light and dark modes
- [ ] Uses i18n for all text
- [ ] Has empty states
- [ ] Has loading states
- [ ] Has error states

---

## Related Documentation

- [Design Tokens](design-tokens.md) - All design constants
- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - Complete UI guidelines
- [Component Guidelines](component-guidelines.md) - Detailed component patterns (Phase 2)
- [Accessibility Standards](accessibility-standards.md) - WCAG compliance guide (Phase 2)
- [Layout Patterns](layout-patterns.md) - Layout and hierarchy patterns (Phase 2)
- [Interaction Patterns](interaction-patterns.md) - Animation and interaction standards (Phase 2)

---

## Examples in the Codebase

Good examples of these principles in action:

- **`frontend/src/components/intelligence/`** - Consistency, color usage, tooltips
- **`frontend/src/components/common/LoadingSpinner.tsx`** - Loading states, overlay pattern
- **`frontend/src/components/common/ErrorBoundary.tsx`** - Graceful degradation
- **`frontend/src/components/grid/EmployeeTile.tsx`** - Progressive disclosure, efficiency
- **`frontend/src/components/panel/DetailsTab.tsx`** - Information hierarchy, spacing

---

## Questions?

When in doubt, ask:
- **"Is this the clearest way to present this information?"**
- **"Can a colorblind user understand this?"**
- **"Can a keyboard-only user do this?"**
- **"Will this still make sense in 6 months?"**
- **"Does this match existing patterns?"**

If the answer to any question is "no," reconsider the design.
