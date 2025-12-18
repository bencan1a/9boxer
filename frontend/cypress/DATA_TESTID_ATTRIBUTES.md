# Data TestID Attributes Added for E2E Testing

This document lists all `data-testid` attributes added to components for Cypress E2E testing.

## App Bar Component (`AppBar.tsx`)

- `upload-button` - Main upload button in the app bar
- `filter-button` - Filter toggle button in the app bar
- `export-button` - Export/Apply button in the app bar

## File Upload Dialog (`FileUploadDialog.tsx`)

- `file-upload-dialog` - The main dialog container
- `upload-submit-button` - The submit button inside the upload dialog

## Grid Components

### NineBoxGrid (`NineBoxGrid.tsx`)

- `nine-box-grid` - The main 9-box grid container

### GridBox (`GridBox.tsx`)

- `grid-box-{position}` - Individual grid boxes (positions 1-9)
  - Example: `grid-box-1`, `grid-box-9`
- `grid-box-{position}-count` - Employee count badge for each box
  - Example: `grid-box-1-count`, `grid-box-9-count`

### EmployeeTile (`EmployeeTile.tsx`)

- `employee-card-{employee_id}` - Individual employee cards/tiles
  - Example: `employee-card-1`, `employee-card-15`
- `modified-indicator` - Badge showing an employee has been modified

## Filter Components

### FilterDrawer (`FilterDrawer.tsx`)

- `clear-filter-button` - Button to clear all active filters

## Right Panel Components

### RightPanel (`RightPanel.tsx`)

- `details-tab` - Details tab button
- `statistics-tab` - Statistics tab button
- `intelligence-tab` - Intelligence tab button

## HTML Elements

### FileUploadDialog

- `#file-upload-input` - Native HTML file input element (uses ID instead of data-testid)

## Usage in Tests

These data-testid attributes are used in the following Cypress E2E test files:

1. **upload-flow.cy.ts** - Tests file upload functionality
2. **employee-movement.cy.ts** - Tests drag-and-drop employee movement
3. **filter-flow.cy.ts** - Tests filtering functionality
4. **export-flow.cy.ts** - Tests export functionality
5. **intelligence-flow.cy.ts** - Tests intelligence analysis views

## Best Practices

- Use data-testid for unique, stable selectors
- Avoid using CSS classes or text content that may change
- Keep data-testid values descriptive and kebab-case
- For dynamic elements (like employee cards), include the ID in the data-testid
- Document all new data-testid attributes added to components
