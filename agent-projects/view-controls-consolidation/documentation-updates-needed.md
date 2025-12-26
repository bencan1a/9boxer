# User Documentation & Screenshot Updates Needed

## Summary

The ViewControls consolidation project has changed the UI significantly. This document outlines all user-facing documentation and screenshots that need to be updated.

## Changes Made

1. **Moved view mode toggle** from AppBar to floating ViewControls component (top-right of grid)
2. **Moved zoom controls** from bottom-left to unified ViewControls component
3. **Moved language selector** from AppBar to Settings dialog (as dropdown)
4. **Simplified AppBar** to show only: Logo, FileMenu, HelpButton, SettingsButton

## USER_GUIDE.md Updates Required

### 1. Quick Tour Section (Lines 43-94)
**Current**: References "Upload" button in top bar, "Filters" button, "Donut Mode" button, "Apply" button

**Update Needed**:
- Remove references to "Donut Mode" button in toolbar
- Add mention of View Controls floating toolbar (top-right of grid)
- Update screenshots showing the new toolbar layout

### 2. Donut Mode Exercise Section (Lines 324-346)
**Current**:
```
2. **Click the "Donut Mode" button** in the top application bar
   - Located next to the Filters button
```

**Update To**:
```
2. **Click the Grid/Donut toggle** in the View Controls toolbar
   - Located at the top-right corner of the grid area
   - Toggle between Grid view and Donut view icons
```

**Additional Updates**:
- Explain the unified View Controls component
- Document keyboard shortcut: Press **D** to toggle view modes
- Update visual indicators (button is now in floating toolbar, not AppBar)

### 3. New Section Needed: "View Controls"

Add new section after "Understanding the 9-Box Grid" documenting:

````markdown
## View Controls

The View Controls toolbar floats at the top-right of the grid and provides quick access to visualization options.

### Location
Look for the floating toolbar with three control groups in the top-right corner of the grid area.

### View Mode Toggle
- **Grid View** (default) - Shows all employees in the 9-box layout
- **Donut View** - Interactive donut exercise mode for collaborative sessions
- **Keyboard Shortcut**: Press **D** to toggle between views

### Zoom Controls
Control the grid zoom level for better visibility:
- **Zoom In** (+) - Increase grid size
- **Zoom Out** (−) - Decrease grid size
- **Reset** (↺) - Return to 100% zoom
- **Percentage Display** - Shows current zoom level

**Keyboard Shortcuts**:
- **Ctrl/Cmd + Plus**: Zoom in
- **Ctrl/Cmd + Minus**: Zoom out
- **Ctrl/Cmd + 0**: Reset zoom
- **Ctrl/Cmd + Scroll**: Zoom with mouse wheel

### Fullscreen Mode
- Click the fullscreen icon (⛶) to enter/exit fullscreen
- **Keyboard Shortcut**: Press **F11**
- Useful for presentations or focused work sessions

**Note**: View Controls are hidden on small screens (< 600px width) to maximize workspace.
````

### 4. New Section Needed: "Settings and Preferences"

Add new section documenting the Settings dialog:

````markdown
## Settings and Preferences

Access application settings by clicking the **Settings button** (⚙) in the top-right corner of the toolbar.

### Theme Settings
Choose your preferred visual theme:
- **Light Mode** - Bright interface for well-lit environments
- **Dark Mode** - Reduces eye strain in low-light conditions
- **Auto (Follow System)** - Automatically matches your operating system theme

The current effective theme is displayed below the theme options.

### Language Settings
Select your preferred language from the dropdown menu:
- **English** - Default
- **Español** - Spanish

More languages will be added in future releases.

**Note**: Settings are saved automatically and persist across sessions.
````

### 5. Interface Tour Section Updates

If there's an "Interface Overview" or "Understanding the Interface" section, update it to show:
- Simplified AppBar with 4 controls (Logo, File, Help, Settings)
- Floating View Controls at top-right of grid
- Settings dialog for theme and language preferences

## Screenshot Updates Required

### Priority 1: Core UI Changes
1. **main-interface.png** - Update to show new AppBar and floating ViewControls
2. **view-controls-grid.png** - NEW: Show ViewControls toolbar in context
3. **view-controls-donut.png** - NEW: Show ViewControls with donut view active
4. **settings-dialog.png** - NEW: Show Settings dialog with theme and language options
5. **toolbar-overview.png** - Update to show simplified AppBar

### Priority 2: Donut Mode
6. **donut-mode-activation.png** - Update to show toggle in ViewControls (not AppBar)
7. **donut-mode-active.png** - Update to reflect new UI

### Priority 3: Zoom Controls
8. **zoom-controls.png** - NEW: Show zoom controls in ViewControls
9. **zoom-levels.png** - NEW: Demonstrate different zoom levels (50%, 100%, 150%)
10. **fullscreen-mode.png** - NEW: Show fullscreen mode

### Priority 4: Quick Tour
11. **quick-tour-step1.png** through **quick-tour-step5.png** - Update all quick tour screenshots to show new UI

## Screenshot Generation Commands

From `frontend/` directory:

```bash
# Generate automated screenshots (if configured)
npm run screenshots:generate

# Manual screenshots needed (8 total - see MANUAL_SCREENSHOTS.md):
# - settings-dialog-theme.png
# - settings-dialog-language.png
# - view-controls-context.png
# - zoom-demonstration.png
# - fullscreen-mode.png
# - donut-mode-activation-new.png
# - simplified-toolbar.png
# - main-interface-updated.png
```

## Translation Updates

### English (`frontend/src/i18n/locales/en/translation.json`)
```json
{
  "settings": {
    "selectLanguage": "Select Language",
    "language": "Language"
  },
  "zoom": {
    "zoomIn": "Zoom In (Ctrl++)",
    "zoomOut": "Zoom Out (Ctrl+-)",
    "resetZoom": "Reset Zoom (Ctrl+0)",
    "enterFullScreen": "Full-Screen (F11)",
    "exitFullScreen": "Exit Full-Screen (F11)"
  },
  "grid": {
    "viewModeToggle": {
      "gridViewActive": "Grid view active (Press D for Donut view)",
      "donutViewActive": "Donut view active (Press D for Grid view)",
      "ariaLabelToggle": "View mode toggle",
      "ariaLabelGrid": "Grid view",
      "ariaLabelDonut": "Donut view"
    }
  }
}
```

### Spanish (`frontend/src/i18n/locales/es/translation.json`)
```json
{
  "settings": {
    "selectLanguage": "Seleccionar idioma",
    "language": "Idioma"
  },
  "zoom": {
    "zoomIn": "Acercar (Ctrl++)",
    "zoomOut": "Alejar (Ctrl+-)",
    "resetZoom": "Restablecer zoom (Ctrl+0)",
    "enterFullScreen": "Pantalla completa (F11)",
    "exitFullScreen": "Salir de pantalla completa (F11)"
  },
  "grid": {
    "viewModeToggle": {
      "gridViewActive": "Vista de cuadrícula activa (Presione D para vista de dona)",
      "donutViewActive": "Vista de dona activa (Presione D para vista de cuadrícula)",
      "ariaLabelToggle": "Alternar modo de vista",
      "ariaLabelGrid": "Vista de cuadrícula",
      "ariaLabelDonut": "Vista de dona"
    }
  }
}
```

## Validation Checklist

Before marking documentation as complete:
- [ ] All references to "Donut Mode button" updated to "View Controls toggle"
- [ ] All toolbar screenshots show new simplified layout
- [ ] Settings dialog documented with theme and language options
- [ ] View Controls floating toolbar documented with all features
- [ ] Keyboard shortcuts documented (D, Ctrl+/-/0, F11, Ctrl+Scroll)
- [ ] Zoom controls documented
- [ ] Fullscreen mode documented
- [ ] All screenshots regenerated
- [ ] Screenshots match actual UI (no outdated images)
- [ ] Translation files updated for all new UI text

## Estimated Effort

- **USER_GUIDE.md updates**: 2-3 hours
- **Screenshot generation**: 3-4 hours (8 manual + validation)
- **Translation updates**: 1 hour
- **Review and testing**: 1 hour

**Total**: ~7-9 hours

## Notes

- Some screenshots may be auto-generated using the existing Playwright screenshot workflow
- Manual screenshots require the application to be built and running
- Screenshots should be taken at consistent window size (1920x1080 recommended)
- Ensure both light and dark themes are demonstrated where relevant
