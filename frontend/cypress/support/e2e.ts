import '@testing-library/cypress/add-commands';

// Custom commands for 9boxer E2E tests

/**
 * Upload an Excel file through the file upload dialog
 * @param fileName - Name of the file in cypress/fixtures/
 */
Cypress.Commands.add('uploadExcelFile', (fileName: string) => {
  // Click the upload button in the app bar
  cy.get('[data-testid="upload-button"]').click();

  // Wait for the dialog to open
  cy.get('[data-testid="file-upload-dialog"]').should('be.visible');

  // For web mode (non-Electron), use the file input
  cy.get('#file-upload-input').selectFile(
    `cypress/fixtures/${fileName}`,
    { force: true }
  );

  // Click the upload button in the dialog
  cy.get('[data-testid="upload-submit-button"]').click();

  // Wait for upload to complete (success message or dialog closes)
  cy.get('[data-testid="file-upload-dialog"]', { timeout: 10000 }).should('not.exist');
});

/**
 * Wait for the backend server to be ready
 */
Cypress.Commands.add('waitForBackend', () => {
  cy.request({
    url: 'http://localhost:8000/health',
    retryOnStatusCodeFailure: true,
    timeout: 10000,
  }).its('status').should('eq', 200);
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Upload an Excel file through the file upload dialog
       * @param fileName - Name of the file in cypress/fixtures/
       */
      uploadExcelFile(fileName: string): Chainable<void>;

      /**
       * Wait for the backend server to be ready
       */
      waitForBackend(): Chainable<void>;
    }
  }
}

export {};
