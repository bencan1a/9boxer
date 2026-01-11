# Screenshot Generation Guide

This document explains how to generate the 12 new screenshots for ViewControls consolidation and Details Panel enhancements.

## Prerequisites

Before generating screenshots:

1. **Build the backend:**
   ```bash
   cd backend
   ./scripts/build_executable.sh  # or build_executable.bat on Windows
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   cd frontend
   npx playwright install chromium
   ```

## Screenshot Generation Commands

### Generate All New Screenshots

```bash
cd frontend

# ViewControls screenshots (6 screenshots)
npm run screenshots:generate view-controls-main-interface
npm run screenshots:generate view-controls-grid-view
npm run screenshots:generate view-controls-donut-view
npm run screenshots:generate view-controls-settings-dialog
npm run screenshots:generate view-controls-simplified-appbar
npm run screenshots:generate view-controls-fullscreen

# Details Panel screenshots (6 screenshots)
npm run screenshots:generate details-current-assessment
npm run screenshots:generate details-flags-ui
npm run screenshots:generate details-flag-badges
npm run screenshots:generate details-flag-filtering
npm run screenshots:generate details-reporting-chain-clickable
npm run screenshots:generate details-reporting-chain-filter-active
```

### Generate All At Once

```bash
cd frontend
npm run screenshots:generate \
  view-controls-main-interface \
  view-controls-grid-view \
  view-controls-donut-view \
  view-controls-settings-dialog \
  view-controls-simplified-appbar \
  view-controls-fullscreen \
  details-current-assessment \
  details-flags-ui \
  details-flag-badges \
  details-flag-filtering \
  details-reporting-chain-clickable \
  details-reporting-chain-filter-active
```

## Screenshot Locations

Generated screenshots will be saved to:

```
resources/user-guide/docs/images/screenshots/
├── view-controls/
│   ├── main-interface.png
│   ├── view-controls-grid.png
│   ├── view-controls-donut.png
│   ├── settings-dialog.png
│   ├── simplified-appbar.png
│   └── fullscreen-mode.png
└── details-panel/
    ├── current-assessment-enhanced.png
    ├── flags-ui.png
    ├── flag-badges.png
    ├── flag-filtering.png
    ├── reporting-chain-clickable.png
    └── reporting-chain-filter-active.png
```

## Storybook Screenshots (Alternative)

For Storybook-based screenshots (settings dialog, flags UI, reporting chain), you can also:

1. **Start Storybook:**
   ```bash
   cd frontend
   npm run storybook
   ```

2. **Navigate to stories:**
   - Settings: `http://localhost:6006/?path=/story/settings-settingsdialog--open`
   - Flags: `http://localhost:6006/?path=/story/panel-employeeflags--with-multiple-flags`
   - Reporting Chain: `http://localhost:6006/?path=/story/panel-managementchain--with-manager`

3. **Take manual screenshots** if automated generation fails

## Troubleshooting

### Backend Not Found Error

```
Error: Backend executable not found at /path/to/backend/dist/ninebox/ninebox
```

**Solution:** Build the backend first:
```bash
cd backend
./scripts/build_executable.sh  # or .bat on Windows
```

### Port Already in Use

```
Error: Port 5173 already in use
```

**Solution:** Kill existing process:
```bash
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173   # Windows (then kill PID)
```

### Missing Dependencies

```
Error: Cannot find module '@playwright/test'
```

**Solution:** Install dependencies:
```bash
cd frontend
npm install
npx playwright install chromium
```

## Screenshot Validation

After generating screenshots, validate they appear correctly in mkdocs:

1. **Build mkdocs site:**
   ```bash
   mkdocs build
   ```

2. **Serve locally:**
   ```bash
   mkdocs serve
   ```

3. **Visit:** `http://localhost:8000`

4. **Check pages:** Navigate through the user guide and verify all screenshots load and display correctly

## Next Steps After Generation

1. **Review screenshots** - Ensure they match expectations
2. **Optimize images** - Run through TinyPNG or similar if >500KB
3. **Commit screenshots** - Add to git and commit
4. **Update documentation** - Add image references to relevant markdown files if needed
5. **Test in Electron** - Verify screenshots display correctly in bundled user guide

## Screenshot Specifications

All screenshots follow these standards:
- **Format:** PNG
- **Resolution:** 2400px width (2x for retina)
- **Color depth:** 24-bit RGB
- **Compression:** Optimized
- **Naming:** Descriptive kebab-case names

See `agent-projects/view-controls-consolidation/screenshot-requirements.md` for detailed specifications.

## Related Files

- **Workflow implementations:**
  - `frontend/playwright/screenshots/workflows/view-controls.ts`
  - `frontend/playwright/screenshots/workflows/details-panel-enhancements.ts`

- **Screenshot config:**
  - `frontend/playwright/screenshots/config.ts`

- **Storybook stories:**
  - `frontend/src/components/settings/SettingsDialog.stories.tsx`
  - `frontend/src/components/panel/EmployeeFlags.stories.tsx`
  - `frontend/src/components/panel/ManagementChain.stories.tsx`
  - `frontend/src/components/panel/EmployeeDetails.stories.tsx`

## Summary

This guide documents the 12 new screenshots that need to be generated for the ViewControls consolidation and Details Panel UX overhaul documentation. The workflows are implemented and ready to run once the backend is built.

**Total screenshots:** 12 (6 ViewControls + 6 Details Panel)
**Automated:** 12 (all can be generated via workflows)
**Manual:** 0 (no manual screenshots required)
