/**
 * E2E tests for filter functionality
 * Tests filtering employees by department, location, and other criteria
 */

describe('Filter Application Flow', () => {
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

  it('should filter employees by job function', () => {
    // Get initial count of employees
    cy.get('[data-testid^="employee-card-"]').then(($cards) => {
      const initialCount = $cards.length;
      expect(initialCount).to.be.greaterThan(0);

      // Open filter drawer
      cy.get('[data-testid="filter-button"]').click();

      // Wait for drawer to open
      cy.contains('Job Functions').should('be.visible');

      // Find and click on Engineering checkbox
      cy.contains('Engineering').parent().find('input[type="checkbox"]').check({ force: true });

      // Close drawer by clicking outside or wait for filter to apply
      cy.wait(500);

      // Verify filtered results - should show fewer employees
      cy.get('[data-testid^="employee-card-"]').then(($filteredCards) => {
        const filteredCount = $filteredCards.length;

        // We should have fewer employees (only Engineering)
        expect(filteredCount).to.be.lessThan(initialCount);

        // Verify visible employees are from Engineering
        // Note: We can't easily check the department since it's not displayed on the card
        // but we can verify the count changed
      });
    });
  });

  it('should clear filters correctly and show all employees again', () => {
    let initialCount: number;

    // Get initial count
    cy.get('[data-testid^="employee-card-"]').then(($cards) => {
      initialCount = $cards.length;
    });

    // Open filter drawer
    cy.get('[data-testid="filter-button"]').click();

    // Apply a filter (select Engineering)
    cy.contains('Engineering').parent().find('input[type="checkbox"]').check({ force: true });

    // Wait for filter to apply
    cy.wait(500);

    // Verify count decreased
    cy.get('[data-testid^="employee-card-"]').should('have.length.lessThan', initialCount);

    // Clear all filters
    cy.get('[data-testid="clear-filter-button"]').click();

    // Wait for filters to clear
    cy.wait(500);

    // Verify we're back to the original count
    cy.get('[data-testid^="employee-card-"]').should('have.length', initialCount);
  });

  it('should update employee count display based on active filters', () => {
    // Open filter drawer
    cy.get('[data-testid="filter-button"]').click();

    // Check the employee count in the app bar
    cy.contains(/employees/).should('be.visible');

    // Apply a filter
    cy.contains('Job Levels').should('be.visible');
    cy.contains('MT4').parent().find('input[type="checkbox"]').check({ force: true });

    // Wait for filter to apply
    cy.wait(500);

    // Verify the displayed count in app bar reflects filtered employees
    // The format should be "X of Y employees" where X < Y
    cy.contains(/of \d+ employees/).should('be.visible');

    // Clear filters
    cy.get('[data-testid="clear-filter-button"]').click();

    // Wait and verify count returns to normal
    cy.wait(500);
    cy.contains(/employees/).should('be.visible');
  });
});
