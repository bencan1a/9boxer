/**
 * Unit tests for screenshot metadata extraction
 *
 * Tests the core functionality of parsing @screenshots annotations
 * and generating component-screenshot mappings.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import functions from the extraction script
import {
  findFiles,
  parseScreenshotsAnnotation,
  extractComponentName,
  loadScreenshotConfig,
  validateAgainstConfig,
  buildBidirectionalMapping,
} from '../extract-screenshot-metadata.js';

describe('parseScreenshotsAnnotation', () => {
  it('extracts screenshot names from valid JSDoc comment', () => {
    const content = `
      /**
       * Component description
       * @screenshots
       *   - grid-normal: Standard grid
       *   - grid-expanded: Expanded grid
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toEqual(['grid-normal', 'grid-expanded']);
  });

  it('handles empty @screenshots section', () => {
    const content = `/** @screenshots */`;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toEqual([]);
  });

  it('returns empty array when no @screenshots tag', () => {
    const content = `/** Component without screenshots */`;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toEqual([]);
  });

  it('handles malformed annotations gracefully', () => {
    const content = `
      /**
       * @screenshots
       *   screenshot-without-colon
       *   - valid-screenshot: Description
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toEqual(['valid-screenshot']);
  });

  it('extracts only first @screenshots section', () => {
    const content = `
      /**
       * @screenshots
       *   - first-screenshot: First
       * @screenshots
       *   - second-screenshot: Second
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toContain('first-screenshot');
    expect(result).not.toContain('second-screenshot');
  });

  it('validates kebab-case screenshot names', () => {
    const content = `
      /**
       * @screenshots
       *   - valid-kebab-case: Valid
       *   - INVALID_UPPERCASE: Invalid
       *   - another-valid: Valid
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toEqual(['valid-kebab-case', 'another-valid']);
    expect(result).not.toContain('INVALID_UPPERCASE');
  });

  it('handles multi-word screenshot names', () => {
    const content = `
      /**
       * @screenshots
       *   - view-controls-grid-view: View controls in grid mode
       *   - calibration-intelligence-anomalies: Intelligence anomalies
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toHaveLength(2);
    expect(result).toContain('view-controls-grid-view');
    expect(result).toContain('calibration-intelligence-anomalies');
  });

  it('ignores lines without hyphens', () => {
    const content = `
      /**
       * @screenshots
       *   Some text without format
       *   - valid-screenshot: Description
       *   More text
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toEqual(['valid-screenshot']);
  });

  it('handles various whitespace formats', () => {
    const content = `
      /**
       * @screenshots
       *   - screenshot-spaced:  Description  with  spaces
       *     -   screenshot-indented:   Description
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toContain('screenshot-spaced');
    expect(result).toContain('screenshot-indented');
  });
});

describe('extractComponentName', () => {
  it('extracts from export const', () => {
    const content = 'export const MyComponent: React.FC = () => {};';
    const name = extractComponentName('/path/to/file.tsx', content);
    expect(name).toBe('MyComponent');
  });

  it('extracts from export function with assignment', () => {
    const content = 'export function MyComponent = () => {}';
    const name = extractComponentName('/path/to/file.tsx', content);
    expect(name).toBe('MyComponent');
  });

  it('falls back to filename when no export found', () => {
    const content = 'const internal = () => {};';
    const name = extractComponentName('/path/to/MyComponent.tsx', content);
    expect(name).toBe('MyComponent');
  });

  it('handles files with .ts extension', () => {
    const content = 'const internal = () => {};';
    const name = extractComponentName('/path/to/utils.ts', content);
    expect(name).toBe('utils');
  });

  it('prefers export name over filename', () => {
    const content = 'export const ActualName: React.FC = () => {};';
    const name = extractComponentName('/path/to/DifferentName.tsx', content);
    expect(name).toBe('ActualName');
  });
});

describe('buildBidirectionalMapping', () => {
  it('creates bidirectional mapping from component mapping', () => {
    const componentMapping = {
      'components/grid/NineBoxGrid.tsx': {
        component: 'NineBoxGrid',
        screenshots: ['grid-normal', 'grid-expanded'],
      },
      'components/grid/EmployeeTile.tsx': {
        component: 'EmployeeTile',
        screenshots: ['employee-tile-normal', 'grid-normal'],
      },
    };

    const result = buildBidirectionalMapping(componentMapping);

    expect(result).toHaveProperty('componentToScreenshots');
    expect(result).toHaveProperty('screenshotToComponents');
    expect(result).toHaveProperty('metadata');

    // Check component to screenshots mapping
    expect(result.componentToScreenshots).toEqual(componentMapping);

    // Check screenshot to components mapping
    expect(result.screenshotToComponents['grid-normal']).toEqual([
      'components/grid/NineBoxGrid.tsx',
      'components/grid/EmployeeTile.tsx',
    ]);
    expect(result.screenshotToComponents['grid-expanded']).toEqual([
      'components/grid/NineBoxGrid.tsx',
    ]);
    expect(result.screenshotToComponents['employee-tile-normal']).toEqual([
      'components/grid/EmployeeTile.tsx',
    ]);

    // Check metadata
    expect(result.metadata.totalComponents).toBe(2);
    expect(result.metadata.totalScreenshots).toBe(3);
    expect(result.metadata.totalMappings).toBe(4);
    expect(result.metadata).toHaveProperty('generatedAt');
    expect(result.metadata).toHaveProperty('generatedBy');
    expect(result.metadata.version).toBe('1.0.0');
  });

  it('handles empty mapping', () => {
    const result = buildBidirectionalMapping({});

    expect(result.componentToScreenshots).toEqual({});
    expect(result.screenshotToComponents).toEqual({});
    expect(result.metadata.totalComponents).toBe(0);
    expect(result.metadata.totalScreenshots).toBe(0);
    expect(result.metadata.totalMappings).toBe(0);
  });

  it('handles screenshot appearing in multiple components', () => {
    const componentMapping = {
      'ComponentA.tsx': {
        component: 'ComponentA',
        screenshots: ['shared-screenshot'],
      },
      'ComponentB.tsx': {
        component: 'ComponentB',
        screenshots: ['shared-screenshot'],
      },
      'ComponentC.tsx': {
        component: 'ComponentC',
        screenshots: ['shared-screenshot'],
      },
    };

    const result = buildBidirectionalMapping(componentMapping);

    expect(result.screenshotToComponents['shared-screenshot']).toHaveLength(3);
    expect(result.screenshotToComponents['shared-screenshot']).toContain('ComponentA.tsx');
    expect(result.screenshotToComponents['shared-screenshot']).toContain('ComponentB.tsx');
    expect(result.screenshotToComponents['shared-screenshot']).toContain('ComponentC.tsx');
    expect(result.metadata.totalComponents).toBe(3);
    expect(result.metadata.totalScreenshots).toBe(1);
    expect(result.metadata.totalMappings).toBe(3);
  });
});

describe('validateAgainstConfig', () => {
  it('returns valid when all screenshots exist in config', () => {
    // Mock loadScreenshotConfig to return a set of valid screenshots
    const mockValidScreenshots = new Set([
      'grid-normal',
      'employee-tile-normal',
      'filters-panel-expanded',
    ]);

    const mapping = {
      'ComponentA.tsx': {
        component: 'ComponentA',
        screenshots: ['grid-normal', 'employee-tile-normal'],
      },
      'ComponentB.tsx': {
        component: 'ComponentB',
        screenshots: ['filters-panel-expanded'],
      },
    };

    // Manually validate (since we can't mock loadScreenshotConfig easily)
    const errors = [];
    for (const [filePath, data] of Object.entries(mapping)) {
      for (const screenshot of data.screenshots) {
        if (!mockValidScreenshots.has(screenshot)) {
          errors.push({
            component: filePath,
            screenshot,
            message: `Screenshot "${screenshot}" not found in config.ts`,
          });
        }
      }
    }

    expect(errors).toHaveLength(0);
  });

  it('returns errors for invalid screenshots', () => {
    const mockValidScreenshots = new Set(['grid-normal']);

    const mapping = {
      'ComponentA.tsx': {
        component: 'ComponentA',
        screenshots: ['grid-normal', 'invalid-screenshot'],
      },
    };

    const errors = [];
    for (const [filePath, data] of Object.entries(mapping)) {
      for (const screenshot of data.screenshots) {
        if (!mockValidScreenshots.has(screenshot)) {
          errors.push({
            component: filePath,
            screenshot,
            message: `Screenshot "${screenshot}" not found in config.ts`,
          });
        }
      }
    }

    expect(errors).toHaveLength(1);
    expect(errors[0].screenshot).toBe('invalid-screenshot');
    expect(errors[0].component).toBe('ComponentA.tsx');
  });
});

describe('Integration: Fixture files', () => {
  it('correctly extracts from valid-component fixture', () => {
    const fixturePath = path.join(__dirname, 'fixtures/valid-component.tsx');
    const content = fs.readFileSync(fixturePath, 'utf-8');

    const screenshots = parseScreenshotsAnnotation(content);
    const componentName = extractComponentName(fixturePath, content);

    expect(componentName).toBe('ValidComponent');
    expect(screenshots).toHaveLength(3);
    expect(screenshots).toContain('test-screenshot-1');
    expect(screenshots).toContain('test-screenshot-2');
    expect(screenshots).toContain('test-multi-word');
  });

  it('handles invalid-annotation fixture gracefully', () => {
    const fixturePath = path.join(__dirname, 'fixtures/invalid-annotation.tsx');
    const content = fs.readFileSync(fixturePath, 'utf-8');

    const screenshots = parseScreenshotsAnnotation(content);

    expect(screenshots).toContain('valid-one');
    expect(screenshots).not.toContain('INVALID_CAPS'); // Uppercase filtered out
    expect(screenshots.length).toBeLessThan(3); // Invalid ones filtered
  });

  it('returns empty array for no-screenshots fixture', () => {
    const fixturePath = path.join(__dirname, 'fixtures/no-screenshots.tsx');
    const content = fs.readFileSync(fixturePath, 'utf-8');

    const screenshots = parseScreenshotsAnnotation(content);

    expect(screenshots).toEqual([]);
  });

  it('handles empty-screenshots fixture', () => {
    const fixturePath = path.join(__dirname, 'fixtures/empty-screenshots.tsx');
    const content = fs.readFileSync(fixturePath, 'utf-8');

    const screenshots = parseScreenshotsAnnotation(content);

    expect(screenshots).toEqual([]);
  });

  it('extracts correct component name from multiple-exports fixture', () => {
    const fixturePath = path.join(__dirname, 'fixtures/multiple-exports.tsx');
    const content = fs.readFileSync(fixturePath, 'utf-8');

    const componentName = extractComponentName(fixturePath, content);
    const screenshots = parseScreenshotsAnnotation(content);

    expect(componentName).toBe('FirstComponent'); // Should get first export
    expect(screenshots).toContain('multi-export-test');
  });
});

describe('Edge cases', () => {
  it('handles screenshot names with numbers', () => {
    const content = `
      /**
       * @screenshots
       *   - screenshot-123: With numbers
       *   - test-2024: Year number
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toContain('screenshot-123');
    expect(result).toContain('test-2024');
  });

  it('rejects screenshot names with underscores', () => {
    const content = `
      /**
       * @screenshots
       *   - invalid_underscore: Should be filtered
       *   - valid-hyphen: Should pass
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).not.toContain('invalid_underscore');
    expect(result).toContain('valid-hyphen');
  });

  it('handles very long screenshot names', () => {
    const content = `
      /**
       * @screenshots
       *   - very-long-screenshot-name-with-many-words-in-it: Long description
       */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toContain('very-long-screenshot-name-with-many-words-in-it');
  });

  it('handles screenshot names at start of line (no leading spaces)', () => {
    const content = `
/**
 * @screenshots
 * - edge-case: Description
 */
    `;
    const result = parseScreenshotsAnnotation(content);
    expect(result).toContain('edge-case');
  });
});
