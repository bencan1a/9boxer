# Cypress E2E Testing for 9boxer

This directory contains end-to-end tests for the 9boxer application using Cypress.

## Overview

- **Framework**: Cypress 15.8.0
- **Test Library**: @testing-library/cypress
- **Total Test Files**: 5
- **Total Test Cases**: 12
- **Coverage**: Critical user workflows

## Test Files

### 1. upload-flow.cy.ts (3 tests)
Tests the file upload workflow:
- Upload Excel file and view employees in grid
- Show error for invalid file format
- Display employee count in grid boxes after upload

### 2. employee-movement.cy.ts (2 tests)
Tests drag-and-drop employee movement:
- Allow dragging employee to new grid position with modified indicator
- Update statistics and counts after employee movement

### 3. filter-flow.cy.ts (3 tests)
Tests filtering functionality:
- Filter employees by job function
- Clear filters correctly and show all employees
- Update employee count display based on active filters

### 4. export-flow.cy.ts (2 tests)
Tests export functionality:
- Disable export button when no modifications made
- Show export button with badge when modifications exist

### 5. intelligence-flow.cy.ts (2 tests)
Tests intelligence analysis:
- Display intelligence tab and show insights
- Show analysis across different dimensions

## Directory Structure

```
cypress/
├── e2e/                          # E2E test files
│   ├── upload-flow.cy.ts
│   ├── employee-movement.cy.ts
│   ├── filter-flow.cy.ts
│   ├── export-flow.cy.ts
│   └── intelligence-flow.cy.ts
├── fixtures/                     # Test data
│   ├── sample-employees.xlsx     # Sample Excel file with 15 employees
│   └── create_sample.py          # Script to recreate sample file
├── support/                      # Support files
│   ├── e2e.ts                    # Custom commands and setup
│   └── commands.ts               # Additional commands
├── DATA_TESTID_ATTRIBUTES.md     # Documentation of test selectors
├── README.md                     # This file
└── cypress.config.ts             # Cypress configuration (in root)
```

## Running Tests

### Interactive Mode (Cypress UI)
```bash
cd frontend
npm run cy:open
```

### Headless Mode
```bash
cd frontend
npm run cy:run
```

### Run Specific Test File
```bash
cd frontend
npx cypress run --spec "cypress/e2e/upload-flow.cy.ts"
```

### Run All E2E Tests
```bash
cd frontend
npm run e2e
```

## Prerequisites

Before running E2E tests, ensure:

1. **Backend is running** on `http://localhost:8000`
   ```bash
   cd backend
   python -m uvicorn ninebox.main:app --reload
   ```

2. **Frontend dev server is running** on `http://localhost:5173`
   ```bash
   cd frontend
   npm run dev
   ```

## Custom Commands

### `cy.uploadExcelFile(fileName)`
Uploads an Excel file through the file upload dialog.

**Example:**
```typescript
cy.uploadExcelFile('sample-employees.xlsx');
```

### `cy.waitForBackend()`
Waits for the backend server to be ready.

**Example:**
```typescript
cy.waitForBackend();
cy.visit('/');
```

## Test Data

The test fixture `sample-employees.xlsx` contains:
- 15 employees
- Distributed across all 9 grid positions
- Various job functions: Engineering, Design, Product, Marketing, etc.
- Various job levels: MT1, MT2, MT3, MT4
- Multiple locations: New York, San Francisco, Austin, Boston, etc.

## Data TestID Attributes

All components have been enhanced with `data-testid` attributes for reliable test selectors. See `DATA_TESTID_ATTRIBUTES.md` for the complete list.

Key selectors:
- `upload-button` - Main upload button
- `filter-button` - Filter toggle button
- `export-button` - Export/Apply button
- `nine-box-grid` - Main grid container
- `grid-box-{1-9}` - Individual grid boxes
- `employee-card-{id}` - Employee cards
- `intelligence-tab` - Intelligence tab

## Configuration

Cypress is configured in `cypress.config.ts` with:
- Base URL: `http://localhost:5173`
- Viewport: 1280x720
- Video: Disabled (for faster runs)
- Screenshots: Enabled on failure

## Best Practices

1. **Test Isolation**: Each test starts fresh with a new upload
2. **Deterministic Data**: Use the same sample-employees.xlsx for consistency
3. **Realistic Workflows**: Tests follow actual user journeys
4. **Stable Selectors**: Use data-testid attributes, not CSS classes
5. **Wait Strategies**: Use Cypress's built-in retry and wait mechanisms

## Known Limitations

1. **Drag and Drop**: Native drag-and-drop testing in Cypress is complex. Some tests verify structure rather than full interaction.
2. **File Downloads**: Download verification requires additional setup (downloads folder monitoring).
3. **Electron Mode**: Tests are designed for web mode. Electron-specific features may need adjustment.

## Troubleshooting

### Backend not available
If tests fail with connection errors:
```bash
# Check if backend is running
curl http://localhost:8000/health

# Start backend if needed
cd backend
python -m uvicorn ninebox.main:app --reload
```

### Frontend not available
If tests can't load the page:
```bash
# Check if frontend is running
curl http://localhost:5173

# Start frontend if needed
cd frontend
npm run dev
```

### Tests are flaky
- Increase wait times in tests if needed
- Check for race conditions in component rendering
- Verify backend API responses are consistent

## Contributing

When adding new tests:
1. Follow the naming convention: `{feature}-flow.cy.ts`
2. Add data-testid attributes to new components
3. Document new selectors in `DATA_TESTID_ATTRIBUTES.md`
4. Use custom commands to reduce duplication
5. Write tests that reflect real user workflows

## CI/CD Integration

Tests can be run in CI/CD pipelines:
```bash
# Install dependencies
npm ci

# Run tests in headless mode
npm run cy:run

# Or with specific browser
npx cypress run --browser chrome
```

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library Cypress](https://testing-library.com/docs/cypress-testing-library/intro/)
- [9boxer Project Documentation](../docs/)
