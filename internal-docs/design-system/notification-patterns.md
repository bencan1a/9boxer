# Notification Patterns

**Part of:** [9Boxer Design System](README.md)
**Related:** [Interaction Patterns](interaction-patterns.md)
**Last Updated:** 2026-01-09

---

## Overview

9Boxer uses a tiered notification system to provide user feedback:
- **Banners** - Persistent, top-of-page, requires user action
- **Toasts** - Transient, bottom-right, auto-dismiss

---

## Decision Tree: Banner vs Toast

```
Does it require user action to resolve?
├─ YES → Use Banner
│   └─ Examples: "Update ready - restart?", "Unsaved changes"
│
└─ NO → Is it system-level importance?
    ├─ YES → Use Banner
    │   └─ Examples: "Network disconnected", "System maintenance"
    │
    └─ NO → Use Toast
        └─ Examples: "File saved", "LLM complete", "Copied to clipboard"
```

### Quick Reference

| Use Case | Component | Rationale |
|----------|-----------|-----------|
| Auto-update ready | Banner | Requires decision (restart or later) |
| System error | Banner | Affects entire app, needs acknowledgment |
| Session expiring | Banner | User must act to prevent data loss |
| LLM complete | Toast | Background task, optional action |
| File saved | Toast | Confirmation, no action needed |
| Item copied | Toast | Transient confirmation |

---

## Visual Placement

```
┌─────────────────────────────────────────────────────────────────┐
│  App Header / Title Bar                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔄 Update 0.9.1 ready - Restart to install    Restart  ✕ │ │ ← Banner
│  └───────────────────────────────────────────────────────────┘ │    (Top, persistent)
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Main App Content Area                        │   │
│  │           (Dashboard, Grid, etc.)                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                              ┌────────────────┐ │
│                                              │ ✓ LLM summary │ │ ← Toast
│                                              │   completed   │ │   (Bottom-right,
│                                              │         View  │ │    auto-dismiss)
│                                              └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Z-Index Layering:**
- Banner: 1100 (below modals, above content)
- Toast: 1400 (above banners, below modals)

---

## Component APIs

### NotificationBanner

**Location:** `frontend/src/components/notifications/NotificationBanner.tsx`

```typescript
interface NotificationBannerProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  progress?: {
    value: number;        // 0-100
    transferred?: string; // "12.3 MB / 27.5 MB"
    speed?: string;       // "450 KB/s"
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'inherit';
  }>;
  onClose?: () => void;
  closable?: boolean;
  sx?: SxProps<Theme>;
}
```

**Usage:**
```tsx
<NotificationBanner
  variant="success"
  title="Update 0.9.1 is ready"
  description="Restart to install latest features"
  actions={[
    { label: "Restart Now", onClick: handleRestart, variant: "contained" },
    { label: "Later", onClick: handleDismiss, variant: "text" }
  ]}
  closable={false}
/>
```

### Toast (via NotificationContext)

**Location:** `frontend/src/contexts/NotificationContext.tsx`

```typescript
// Hook
const { showToast, showSuccessToast, showErrorToast } = useNotifications();

// Methods
showToast({
  variant: 'info' | 'success' | 'warning' | 'error',
  message: string,
  title?: string,
  action?: {
    label: string,
    onClick: () => void,
  },
  persistent?: boolean,
  duration?: number, // default 4000ms
});

// Convenience methods
showSuccessToast("Changes saved");
showErrorToast("Save failed", { label: "Retry", onClick: retry });
```

**Usage:**
```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { showSuccessToast } = useNotifications();

  const handleSave = async () => {
    await saveData();
    showSuccessToast("Changes saved", {
      label: "View",
      onClick: () => navigate("/dashboard")
    });
  };
}
```

---

## Common Patterns

### Auto-Update Flow (Simplified)

Since auto-update downloads silently in background, only one state needs notification:

```tsx
// Update ready to install
<NotificationBanner
  variant="success"
  title="Update 0.9.1 is ready"
  description="Restart to install and enjoy the latest features"
  icon={<CloudDownload />}
  actions={[
    { label: "Restart Now", onClick: handleRestart, variant: "contained" },
    { label: "Later", onClick: handleDismiss, variant: "text" }
  ]}
  closable={false}
/>
```

### LLM Processing Flow

```tsx
// Start (brief info toast)
showInfoToast("Generating summary...", { duration: 2000 });

// Complete (with action)
showSuccessToast("LLM summary completed", {
  label: "View",
  onClick: () => navigateToIntelligence()
});

// Error (persistent with retry)
showErrorToast("Summary generation failed", {
  label: "Retry",
  onClick: retryLLM,
  persistent: true
});
```

### Error Handling

**Critical errors (use Banner):**
```tsx
<NotificationBanner
  variant="error"
  title="Connection Lost"
  description="Working in offline mode. Changes won't sync until reconnected."
  actions={[{ label: "Retry", onClick: retry, variant: "outlined" }]}
/>
```

**Non-critical errors (use Toast):**
```tsx
showErrorToast("Failed to load preview");
```

---

## Design Specifications

### Banner Styling

- **Background:** `palette.{variant}.main` with alpha 0.1 (light) / 0.15 (dark)
- **Border:** 1px solid `palette.{variant}.main` with alpha 0.3
- **Border-left:** 4px solid `palette.{variant}.main` (accent)
- **Padding:** `spacing.md` (16px)
- **Max-width:** 100% (constrained by container)
- **Border-radius:** `borderRadius.md` (8px)

### Toast Styling

- **Position:** Fixed bottom-right, 16px from edges
- **Elevation:** 6dp shadow
- **Padding:** `spacing.sm` vertical, `spacing.md` horizontal
- **Max-width:** 400px
- **Min-width:** 300px
- **Auto-dismiss:** 4000ms default

### Animation

- **Banner entry:** Slide-down with ease-out (0.3s)
- **Toast entry:** Slide-up with ease-out (0.3s)
- **Exit:** Fade-out with ease-in (0.15s)
- **Pause on hover:** Auto-dismiss pauses when user hovers

---

## Accessibility

### ARIA Attributes

```tsx
// Banner
<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>

// Toast (error variant)
<div
  role="alert"
  aria-live="assertive"  // Interrupts screen reader
>
```

### Keyboard Navigation

- **Tab:** Navigate between action buttons
- **Escape:** Dismiss (if closable)
- **Enter/Space:** Activate focused action button

### Screen Reader Support

- Announcements include full message and available actions
- Focus automatically moves to primary action for critical banners
- Auto-dismiss pauses when screen reader is active

---

## Anti-Patterns (Avoid These)

### ❌ Using Banner for routine actions
```tsx
// BAD - too intrusive for simple save
<NotificationBanner variant="success" title="File saved" />

// GOOD - quick confirmation
showSuccessToast("File saved");
```

### ❌ Using Toast for critical decisions
```tsx
// BAD - user might miss it
showWarningToast("Unsaved changes will be lost");

// GOOD - persistent until decided
<NotificationBanner
  variant="warning"
  title="Unsaved changes"
  actions={[
    { label: "Save", variant: "contained" },
    { label: "Discard", variant: "outlined" }
  ]}
/>
```

### ❌ Multiple banners stacking
```tsx
// BAD - overwhelming
<NotificationBanner title="Update ready" />
<NotificationBanner title="Warning" />
<NotificationBanner title="Another alert" />

// GOOD - prioritize most important
<NotificationBanner title="Update ready" />
// Use toasts for secondary messages
```

---

## Integration Guide

### 1. Setup Provider

Wrap your app in `NotificationProvider`:

```tsx
// main.tsx
import { NotificationProvider } from './contexts/NotificationContext';

<NotificationProvider>
  <App />
</NotificationProvider>
```

### 2. Place Banner in Layout

```tsx
// App.tsx
function App() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Banner area - sticky at top */}
      <Box sx={{ px: 2, pt: 2 }}>
        <UpdateNotification /> {/* Shows when update ready */}
      </Box>

      {/* Main content */}
      <Router>...</Router>
    </Box>
  );
}
```

### 3. Use Toasts Anywhere

```tsx
import { useNotifications } from '@/contexts/NotificationContext';

const { showSuccessToast, showErrorToast } = useNotifications();
```

---

## Storybook Reference

**View examples:**
```bash
npm run storybook
```

Navigate to:
- `App/Notifications/NotificationBanner` - All banner variants
- `App/Notifications/Toast` - All toast variants

**Key stories:**
- **All Variants Comparison** - Side-by-side view
- **Auto-Update Use Cases** - Real-world scenarios
- **LLM Processing Flow** - Toast sequence examples

---

## Summary

**Banner = "You need to know this and decide/act"**
- Persistent, top-of-page
- Requires user attention
- System-level importance
- Examples: Updates, critical errors, warnings

**Toast = "FYI, something happened"**
- Transient, bottom-right
- Optional awareness
- Action-level feedback
- Examples: Saves, completions, confirmations

**When in doubt:** If user can safely miss it and continue working → Toast. If they need to know and act → Banner.

---

**Related Documentation:**
- [Interaction Patterns](interaction-patterns.md) - Animation & feedback mechanisms
- [Component Guidelines](component-guidelines.md) - Component creation patterns
- [Accessibility Standards](accessibility-standards.md) - WCAG compliance
