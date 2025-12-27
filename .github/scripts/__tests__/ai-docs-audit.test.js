/**
 * Unit tests for AI documentation audit script
 *
 * Tests the core functionality of analyzing code changes and generating
 * documentation audit reports using Claude API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import functions from the audit script
import {
  getRecentChanges,
  loadDocumentation,
  buildAuditContext,
  createGitHubIssues,
} from '../ai-docs-audit.js';

describe('getRecentChanges', () => {
  it('returns change summary structure when given valid days', () => {
    const result = getRecentChanges(7);

    expect(result).toHaveProperty('commits');
    expect(result).toHaveProperty('changedFiles');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('stats');

    expect(result.categories).toHaveProperty('frontend');
    expect(result.categories).toHaveProperty('backend');
    expect(result.categories).toHaveProperty('docs');

    expect(result.stats).toHaveProperty('totalCommits');
    expect(result.stats).toHaveProperty('totalFiles');
    expect(result.stats).toHaveProperty('frontendFiles');
    expect(result.stats).toHaveProperty('backendFiles');
    expect(result.stats).toHaveProperty('docsFiles');
  });

  it('handles case when no changes exist', () => {
    // This would need a git repo with no recent changes
    // Just verify it returns valid structure
    const result = getRecentChanges(0.001); // Very short period

    expect(Array.isArray(result.commits)).toBe(true);
    expect(Array.isArray(result.changedFiles)).toBe(true);
  });

  it('categorizes frontend changes correctly', () => {
    const result = getRecentChanges(30); // Longer period to get some data

    // Frontend files should start with 'frontend/src/'
    result.categories.frontend.forEach((file) => {
      expect(file).toMatch(/^frontend\/src\//);
    });
  });

  it('categorizes backend changes correctly', () => {
    const result = getRecentChanges(30);

    // Backend files should start with 'backend/src/'
    result.categories.backend.forEach((file) => {
      expect(file).toMatch(/^backend\/src\//);
    });
  });

  it('categorizes docs changes correctly', () => {
    const result = getRecentChanges(30);

    // Docs files should start with 'resources/user-guide/'
    result.categories.docs.forEach((file) => {
      expect(file).toMatch(/^resources\/user-guide\//);
    });
  });

  it('parses commit information correctly', () => {
    const result = getRecentChanges(7);

    if (result.commits.length > 0) {
      const commit = result.commits[0];
      expect(commit).toHaveProperty('hash');
      expect(commit).toHaveProperty('subject');
      expect(commit).toHaveProperty('author');
      expect(commit).toHaveProperty('date');

      expect(typeof commit.hash).toBe('string');
      expect(typeof commit.subject).toBe('string');
    }
  });
});

describe('loadDocumentation', () => {
  it('loads documentation files from user-guide directory', () => {
    const docs = loadDocumentation();

    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThan(0);
  });

  it('returns documentation with required properties', () => {
    const docs = loadDocumentation();

    if (docs.length > 0) {
      const doc = docs[0];
      expect(doc).toHaveProperty('path');
      expect(doc).toHaveProperty('fullPath');
      expect(doc).toHaveProperty('content');
      expect(doc).toHaveProperty('size');

      expect(typeof doc.path).toBe('string');
      expect(typeof doc.content).toBe('string');
      expect(typeof doc.size).toBe('number');
    }
  });

  it('loads only markdown files', () => {
    const docs = loadDocumentation();

    docs.forEach((doc) => {
      expect(doc.path).toMatch(/\.md$/);
    });
  });

  it('includes content from documentation files', () => {
    const docs = loadDocumentation();

    docs.forEach((doc) => {
      expect(doc.content.length).toBeGreaterThan(0);
      expect(doc.size).toBe(doc.content.length);
    });
  });

  it('handles nested directories', () => {
    const docs = loadDocumentation();

    // Should include files from workflows subdirectory
    // Use path.sep agnostic check (works on both Windows and Unix)
    const workflowDocs = docs.filter((doc) =>
      doc.path.includes('workflows/') || doc.path.includes('workflows\\')
    );
    expect(workflowDocs.length).toBeGreaterThan(0);
  });

  it('uses relative paths from docs directory', () => {
    const docs = loadDocumentation();

    docs.forEach((doc) => {
      // Path should not contain absolute path components
      expect(doc.path).not.toMatch(/^[A-Z]:\\/); // Windows
      expect(doc.path).not.toMatch(/^\//); // Unix
      // Should be relative like "getting-started.md" or "workflows/making-changes.md"
    });
  });
});

describe('buildAuditContext', () => {
  it('builds context string from changes and docs', () => {
    const changes = {
      commits: [
        { hash: 'abc123', subject: 'Fix bug', author: 'Test', date: '1 hour ago' },
      ],
      changedFiles: ['frontend/src/components/Test.tsx'],
      categories: {
        frontend: ['frontend/src/components/Test.tsx'],
        backend: [],
        docs: [],
      },
      stats: {
        totalCommits: 1,
        totalFiles: 1,
        frontendFiles: 1,
        backendFiles: 0,
        docsFiles: 0,
      },
    };

    const docs = [
      {
        path: 'test.md',
        fullPath: '/path/to/test.md',
        content: '# Test\n\nTest content',
        size: 20,
      },
    ];

    const context = buildAuditContext(changes, docs);

    expect(typeof context).toBe('string');
    expect(context.length).toBeGreaterThan(0);
  });

  it('includes commit information in context', () => {
    const changes = {
      commits: [
        { hash: 'abc123', subject: 'Add feature X', author: 'Dev', date: '2 hours ago' },
      ],
      changedFiles: [],
      categories: { frontend: [], backend: [], docs: [] },
      stats: {
        totalCommits: 1,
        totalFiles: 0,
        frontendFiles: 0,
        backendFiles: 0,
        docsFiles: 0,
      },
    };

    const context = buildAuditContext(changes, []);

    expect(context).toContain('abc123');
    expect(context).toContain('Add feature X');
  });

  it('includes documentation file information', () => {
    const changes = {
      commits: [],
      changedFiles: [],
      categories: { frontend: [], backend: [], docs: [] },
      stats: {
        totalCommits: 0,
        totalFiles: 0,
        frontendFiles: 0,
        backendFiles: 0,
        docsFiles: 0,
      },
    };

    const docs = [
      {
        path: 'getting-started.md',
        fullPath: '/path/to/getting-started.md',
        content: '# Getting Started\n\nWelcome to the app',
        size: 40,
      },
    ];

    const context = buildAuditContext(changes, docs);

    expect(context).toContain('getting-started.md');
    expect(context).toContain('Getting Started');
  });

  it('includes statistics in context', () => {
    const changes = {
      commits: [],
      changedFiles: [],
      categories: { frontend: [], backend: [], docs: [] },
      stats: {
        totalCommits: 5,
        totalFiles: 10,
        frontendFiles: 7,
        backendFiles: 3,
        docsFiles: 0,
      },
    };

    const docs = [{ path: 'test.md', fullPath: '/test.md', content: 'test', size: 4 }];

    const context = buildAuditContext(changes, docs);

    expect(context).toContain('Total commits: 5');
    expect(context).toContain('Total files changed: 10');
  });

  it('limits commit history to prevent excessive context size', () => {
    const manyCommits = Array.from({ length: 50 }, (_, i) => ({
      hash: `hash${i}`,
      subject: `Commit ${i}`,
      author: 'Dev',
      date: '1 day ago',
    }));

    const changes = {
      commits: manyCommits,
      changedFiles: [],
      categories: { frontend: [], backend: [], docs: [] },
      stats: {
        totalCommits: 50,
        totalFiles: 0,
        frontendFiles: 0,
        backendFiles: 0,
        docsFiles: 0,
      },
    };

    const context = buildAuditContext(changes, []);

    // Should limit to 20 commits
    const commitMatches = context.match(/hash\d+/g);
    expect(commitMatches.length).toBeLessThanOrEqual(20);
  });

  it('limits frontend file list to prevent excessive context size', () => {
    const manyFiles = Array.from(
      { length: 50 },
      (_, i) => `frontend/src/components/Component${i}.tsx`
    );

    const changes = {
      commits: [],
      changedFiles: manyFiles,
      categories: { frontend: manyFiles, backend: [], docs: [] },
      stats: {
        totalCommits: 0,
        totalFiles: 50,
        frontendFiles: 50,
        backendFiles: 0,
        docsFiles: 0,
      },
    };

    const context = buildAuditContext(changes, []);

    // Should limit to 30 files
    const fileMatches = context.match(/Component\d+\.tsx/g);
    expect(fileMatches.length).toBeLessThanOrEqual(30);
  });

  it('truncates long documentation content', () => {
    const longContent = Array.from({ length: 100 }, (_, i) => `Line ${i}`).join('\n');

    const changes = {
      commits: [],
      changedFiles: [],
      categories: { frontend: [], backend: [], docs: [] },
      stats: {
        totalCommits: 0,
        totalFiles: 0,
        frontendFiles: 0,
        backendFiles: 0,
        docsFiles: 0,
      },
    };

    const docs = [
      {
        path: 'long-doc.md',
        fullPath: '/long-doc.md',
        content: longContent,
        size: longContent.length,
      },
    ];

    const context = buildAuditContext(changes, docs);

    // Should show first 10 lines and indicate continuation
    expect(context).toContain('...(content continues)');
  });
});

describe('createGitHubIssues', () => {
  it('handles dry run mode without creating issues', async () => {
    const findings = [
      {
        type: 'outdated',
        severity: 'high',
        location: 'getting-started.md',
        title: 'Test finding',
        description: 'Test description',
        recommendation: 'Test recommendation',
      },
    ];

    const issues = await createGitHubIssues(findings, true);

    expect(Array.isArray(issues)).toBe(true);
    expect(issues.length).toBe(1);
    expect(issues[0].number).toBe('DRY-RUN');
  });

  it('formats issue title correctly', async () => {
    const findings = [
      {
        type: 'missing',
        severity: 'medium',
        location: 'new',
        title: 'Missing feature documentation',
        description: 'Feature X is not documented',
        recommendation: 'Add documentation for feature X',
      },
    ];

    const issues = await createGitHubIssues(findings, true);

    expect(issues[0].title).toBe('[Docs Audit] Missing feature documentation');
  });

  it('assigns correct labels based on severity', async () => {
    const findings = [
      {
        type: 'outdated',
        severity: 'high',
        location: 'test.md',
        title: 'High severity issue',
        description: 'Test',
        recommendation: 'Test',
      },
    ];

    const issues = await createGitHubIssues(findings, true);

    expect(issues[0].labels).toContain('documentation');
    expect(issues[0].labels).toContain('priority: high');
  });

  it('assigns correct labels based on type', async () => {
    const findingsScreenshot = [
      {
        type: 'screenshot-needed',
        severity: 'medium',
        location: 'test.md',
        title: 'Screenshot needed',
        description: 'Test',
        recommendation: 'Test',
      },
    ];

    const findingsMissing = [
      {
        type: 'missing',
        severity: 'low',
        location: 'new',
        title: 'Missing docs',
        description: 'Test',
        recommendation: 'Test',
      },
    ];

    const issuesScreenshot = await createGitHubIssues(findingsScreenshot, true);
    const issuesMissing = await createGitHubIssues(findingsMissing, true);

    expect(issuesScreenshot[0].labels).toContain('screenshot');
    expect(issuesMissing[0].labels).toContain('enhancement');
  });

  it('includes all required information in issue body', async () => {
    const findings = [
      {
        type: 'incorrect',
        severity: 'medium',
        location: 'troubleshooting.md',
        title: 'Incorrect instructions',
        description: 'The instructions for feature Y are incorrect',
        recommendation: 'Update the instructions to reflect current behavior',
      },
    ];

    const issues = await createGitHubIssues(findings, true);

    expect(issues[0].body).toContain('The instructions for feature Y are incorrect');
    expect(issues[0].body).toContain('troubleshooting.md');
    expect(issues[0].body).toContain('Update the instructions to reflect current behavior');
    expect(issues[0].body).toContain('incorrect');
    expect(issues[0].body).toContain('medium');
  });

  it('handles new documentation location', async () => {
    const findings = [
      {
        type: 'missing',
        severity: 'high',
        location: 'new',
        title: 'New feature needs docs',
        description: 'Feature Z is completely undocumented',
        recommendation: 'Create new documentation file',
      },
    ];

    const issues = await createGitHubIssues(findings, true);

    expect(issues[0].body).toContain('New documentation needed');
  });

  it('processes multiple findings', async () => {
    const findings = [
      {
        type: 'outdated',
        severity: 'high',
        location: 'doc1.md',
        title: 'Issue 1',
        description: 'Desc 1',
        recommendation: 'Rec 1',
      },
      {
        type: 'missing',
        severity: 'medium',
        location: 'new',
        title: 'Issue 2',
        description: 'Desc 2',
        recommendation: 'Rec 2',
      },
      {
        type: 'screenshot-needed',
        severity: 'low',
        location: 'doc3.md',
        title: 'Issue 3',
        description: 'Desc 3',
        recommendation: 'Rec 3',
      },
    ];

    const issues = await createGitHubIssues(findings, true);

    expect(issues.length).toBe(3);
    expect(issues[0].title).toContain('Issue 1');
    expect(issues[1].title).toContain('Issue 2');
    expect(issues[2].title).toContain('Issue 3');
  });
});

describe('Integration scenarios', () => {
  it('handles complete audit workflow with no changes', () => {
    const changes = getRecentChanges(0.001); // Very short period
    const docs = loadDocumentation();
    const context = buildAuditContext(changes, docs);

    expect(context).toBeTruthy();
    expect(context.length).toBeGreaterThan(0);
  });

  it('handles complete audit workflow with real data', () => {
    const changes = getRecentChanges(7);
    const docs = loadDocumentation();
    const context = buildAuditContext(changes, docs);

    expect(changes.stats.totalCommits).toBeGreaterThanOrEqual(0);
    expect(docs.length).toBeGreaterThan(0);
    expect(context).toContain('9Boxer Documentation Audit');
  });
});
