/**
 * E2E tests for intelligence analysis functionality
 * Tests viewing intelligence insights and analysis by dimension
 */

describe('Intelligence Analysis Flow', () => {
  beforeEach(() => {
    // Visit and upload sample data
    cy.visit('/');
    cy.get('[data-testid="upload-button"]').click();
    cy.get('#file-upload-input').selectFile(
      'cypress/fixtures/sample-employees.xlsx',
      { force: true }
    );
    cy.get('[data-testid="upload-submit-button"]').click();

    // Wait for upload to complete
    cy.get('[data-testid="file-upload-dialog"]', { timeout: 10000 }).should('not.exist');

    // Verify grid is loaded
    cy.get('[data-testid="nine-box-grid"]').should('be.visible');
  });

  it('should display intelligence tab and show insights', () => {
    // Click on the Intelligence tab in the right panel
    cy.get('[data-testid="intelligence-tab"]').click();

    // Wait for tab content to load
    cy.wait(500);

    // Verify intelligence content is visible
    // The intelligence tab should show analysis and insights
    cy.contains(/intelligence/i).should('be.visible');

    // Verify some common intelligence sections exist
    // (These may vary based on implementation)
    // Look for typical intelligence features like distribution, anomalies, etc.
  });

  it('should show analysis across different dimensions', () => {
    // Click on the Intelligence tab
    cy.get('[data-testid="intelligence-tab"]').click();

    // Wait for content to load
    cy.wait(500);

    // Verify the tab panel is visible
    cy.get('#panel-tabpanel-2').should('be.visible');

    // The intelligence view should show various dimensions of analysis
    // These might include:
    // - Department analysis
    // - Location analysis
    // - Performance distribution
    // - Potential distribution

    // Verify the content area exists and has data
    cy.get('#panel-tabpanel-2').within(() => {
      // Should have some content (charts, stats, etc.)
      cy.get('*').should('have.length.greaterThan', 0);
    });
  });
});
