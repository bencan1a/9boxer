# Playwright Test Helpers

This directory contains reusable helper functions for Playwright E2E tests, replicating the functionality of Cypress custom commands.

## Migration Mapping

### Cypress → Playwright Command Mapping

| Cypress Command | Playwright Helper | Location |
|----------------|-------------------|----------|
| `cy.uploadExcelFile(fileName)` | `uploadExcelFile(page, fileName)` | `helpers/upload.ts` |
| `cy.waitForBackend()` | `waitForBackend(page)` | `helpers/backend.ts` |
| N/A (new) | `checkBackendHealth(page)` | `helpers/backend.ts` |

## Usage Examples

### Upload Excel File

**Cypress:**
```typescript
cy.uploadExcelFile('sample-employees.xlsx');
```

**Playwright:**
```typescript
import { uploadExcelFile } from '../helpers';

await uploadExcelFile(page, 'sample-employees.xlsx');
```

### Wait for Backend

**Cypress:**
```typescript
cy.waitForBackend();
```

**Playwright:**
```typescript
import { checkBackendHealth } from '../helpers';

await checkBackendHealth(page);
```

## Key Differences

1. **Async/Await**: Playwright uses promises and async/await instead of Cypress chainable commands
2. **Page Parameter**: All Playwright helpers require the `page` object as the first parameter
3. **Locators**: Playwright uses `page.locator()` instead of `cy.get()`
4. **Assertions**: Playwright uses `expect()` from `@playwright/test` with matchers like `toBeVisible()`

## File Organization

```
playwright/
├── e2e/              # Test files (*.spec.ts)
├── fixtures/         # Test data files
│   └── sample-employees.xlsx
└── helpers/          # Reusable helper functions
    ├── index.ts      # Barrel export for all helpers
    ├── upload.ts     # File upload helpers
    └── backend.ts    # Backend health check helpers
```

## Implementation Details

### uploadExcelFile()

This helper replicates the complete file upload workflow:
1. Clicks the upload button using `[data-testid="upload-button"]`
2. Waits for the file upload dialog to appear `[data-testid="file-upload-dialog"]`
3. Selects the file using `#file-upload-input` with `setInputFiles()`
4. Clicks the submit button `[data-testid="upload-submit-button"]`
5. Waits for the dialog to close (10s timeout)

### waitForBackend()

Waits for a response from the backend health endpoint (`http://localhost:38000/health`) with status 200.

### checkBackendHealth()

Alternative implementation that makes direct API requests with retry logic (10 retries, 1s delay between attempts). Useful for setup/teardown operations.
