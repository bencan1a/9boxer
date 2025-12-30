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
  getBackendUrl,
  isBackendHealthy,
} from "./backend";
export { clickExport, applyChanges } from "./fileOperations";
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
  expectEmployeeHasOrangeBorder,
  expectDetailsPanelVisible,
  expectEmployeeInPosition,
} from "./assertions";
export {
  loadCalibrationData,
  loadSampleData,
  loadSampleDataFromEmptyState,
} from "./fixtures";
export { t, tEn, tEs } from "./translations";
export {
  createChange,
  createMultipleChanges,
  getFirstEmployeeId,
  getEmployeeIdFromPosition,
} from "./testData";

// New helpers for atomic UX tests
export {
  selectEmployee,
  selectFirstEmployee,
  expectDetailsPanelOpen,
  expectDetailsTabSections,
} from "./selection";
export {
  selectLocationFilter,
  selectFunctionFilter,
  clearAllFilters,
  expectFilterActive,
  getVisibleEmployeeCount,
  expectEmployeeCountDisplay,
} from "./filters";
export {
  expectChangeRecordExists,
  expectChangeCount,
  expectChangeNoteExists,
} from "./changeTracking";
export {
  applyFlag,
  expectEmployeeHasFlag,
  removeFlag,
  expectFlagsSectionVisible,
} from "./flags";
export {
  waitForExportedFile,
  verifyExportedEmployeeRating,
  verifyExportedChangeNotes,
  verifyExportedEmployees,
  readExportedFile,
  verifyExportedColumns,
} from "./exportValidation";
