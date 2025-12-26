/**
 * Playwright test helpers for 9boxer E2E tests
 *
 * This module provides reusable helper functions that replicate
 * the Cypress custom commands from cypress/support/e2e.ts
 */

export { uploadExcelFile } from "./upload";
export {
  waitForBackend,
  checkBackendHealth,
  restartBackend,
  triggerSessionSave,
} from "./backend";
export { dragEmployeeToPosition } from "./dragAndDrop";
export {
  waitForUiSettle,
  toggleDonutMode,
  clickTabAndWait,
  openFileMenu,
  openFilterDrawer,
  closeAllDialogsAndOverlays,
  resetToEmptyState,
} from "./ui";
export {
  getBadgeCount,
  getEmployeeIdFromCard,
  ensureChangesExist,
} from "./assertions";
export { loadCalibrationData, loadSampleData } from "./fixtures";
export { t, tEn, tEs } from "./translations";
