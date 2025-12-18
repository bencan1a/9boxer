/**
 * E2E tests for employee upload workflow
 * Tests the complete flow from file selection to viewing employees in the grid
 */

describe('Employee Upload Flow', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');

    // Verify we start with no data
    cy.contains('Upload an Excel file to begin').should('be.visible');
  });

  it('should upload Excel file and view employees in the grid', () => {
    // Click upload button
    cy.get('[data-testid="upload-button"]').click();

    // Verify dialog opens
    cy.get('[data-testid="file-upload-dialog"]').should('be.visible');

    // Select the sample file
    cy.get('#file-upload-input').selectFile(
      'cypress/fixtures/sample-employees.xlsx',
      { force: true }
    );

    // Verify file is selected
    cy.contains('sample-employees.xlsx').should('be.visible');

    // Click upload button in dialog
    cy.get('[data-testid="upload-submit-button"]').click();

    // Wait for upload to complete and dialog to close
    cy.get('[data-testid="file-upload-dialog"]', { timeout: 10000 }).should('not.exist');

    // Verify grid is visible
    cy.get('[data-testid="nine-box-grid"]').should('be.visible');

    // Verify employees are loaded (we created 15 employees in the fixture)
    cy.get('[data-testid^="employee-card-"]').should('have.length.at.least', 10);

    // Verify specific employees are present
    cy.contains('Alice Smith').should('be.visible');
    cy.contains('David Chen').should('be.visible');
    cy.contains('Emma Wilson').should('be.visible');

    // Verify grid boxes are populated
    cy.get('[data-testid="grid-box-9"]').should('contain', 'Alice Smith');
  });

  it('should show error for invalid file format', () => {
    // Click upload button
    cy.get('[data-testid="upload-button"]').click();

    // Create and select an invalid file (text file)
    cy.get('#file-upload-input').selectFile(
      {
        contents: Cypress.Buffer.from('This is not an Excel file'),
        fileName: 'invalid.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );

    // Should show error message
    cy.contains(/please select an excel file/i).should('be.visible');

    // Upload button should be disabled or show error
    cy.get('[data-testid="upload-submit-button"]').should('be.disabled');
  });

  it('should display employee count in grid boxes after upload', () => {
    // Upload the sample file
    cy.get('[data-testid="upload-button"]').click();
    cy.get('#file-upload-input').selectFile(
      'cypress/fixtures/sample-employees.xlsx',
      { force: true }
    );
    cy.get('[data-testid="upload-submit-button"]').click();

    // Wait for upload to complete
    cy.get('[data-testid="file-upload-dialog"]', { timeout: 10000 }).should('not.exist');

    // Verify grid boxes show employee counts
    // Position 9 should have 2 employees (Alice Smith and David Chen)
    cy.get('[data-testid="grid-box-9-count"]').should('be.visible');

    // Verify we can see employee details in tiles
    cy.get('[data-testid="grid-box-9"]').within(() => {
      cy.contains('Alice Smith').should('be.visible');
      cy.contains('Senior Engineer').should('be.visible');
    });

    // Verify total employee count in app bar
    cy.contains(/employees/).should('be.visible');
  });
});
