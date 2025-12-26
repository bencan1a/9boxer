# Known Issues - Zoom Feature

## Grid Layout at Zoom Out Levels

**Issue:** When zooming out (< 100%), the grid doesn't expand vertically to fill the entire viewport, leaving empty space at the bottom.

**Root Cause:** CSS `zoom` property affects visual rendering but not layout calculations. The grid container calculates its size based on logical pixels, then the zoom scales the visual rendering down, creating a gap.

**Workaround:** Use Electron's native `webFrame` zoom (works correctly in production Electron builds). The CSS zoom fallback is primarily for E2E tests and web development mode.

**Potential Fixes:**
1. Use `transform: scale()` with inverse container scaling instead of CSS zoom
2. Dynamically adjust container heights based on zoom factor
3. Use viewport units with zoom-factor compensation

**Priority:** Low - Issue only affects development/web mode, not production Electron builds

**Tracked in:** To be created as GitHub issue
