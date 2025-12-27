#!/usr/bin/env node
/**
 * AI-powered documentation audit using Claude API
 *
 * This script analyzes recent code changes and reviews user guide documentation
 * to identify documentation issues such as:
 * - Outdated documentation
 * - Missing screenshots
 * - New features that are undocumented
 * - Incorrect instructions
 *
 * Usage:
 *   node .github/scripts/ai-docs-audit.js [--days=7] [--dry-run]
 *
 * Options:
 *   --days=N      Number of days to look back for changes (default: 7)
 *   --dry-run     Run audit without creating GitHub issues
 *
 * Environment Variables:
 *   ANTHROPIC_API_KEY  Required: API key for Claude
 *   GITHUB_TOKEN       Required for creating issues (auto-provided in GitHub Actions)
 *
 * Outputs:
 *   - Audit report in JSON format
 *   - Creates GitHub issues for findings (unless --dry-run)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Constants
const ANTHROPIC_API_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-5-20250929';  // Claude Sonnet 4 (current model)
const MAX_TOKENS = 4096;

// Core internal docs that should be updated, not replaced
const CORE_INTERNAL_DOCS = [
  'CLAUDE.md',
  'AGENTS.md',
  'GITHUB_AGENT.md',
  'internal-docs/CONTEXT.md',
  'internal-docs/facts.json',
  'internal-docs/SUMMARY.md',
  'internal-docs/architecture/',
  'internal-docs/design-system/',
  'internal-docs/testing/',
  'internal-docs/i18n/',
  'internal-docs/contributing/',
];

// Days to consider a doc "new" for consolidation
const NEW_DOC_THRESHOLD_DAYS = 30;

/**
 * Get recent code changes from git history
 *
 * @param {number} days - Number of days to look back
 * @returns {Object} Change summary
 */
function getRecentChanges(days) {
  try {
    const since = `${days}.days.ago`;

    // Get commit log
    const commitLog = execSync(
      `git log --since="${since}" --pretty=format:"%h|%s|%an|%ar" --no-merges`,
      {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
      }
    );

    const commits = commitLog
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, subject, author, date] = line.split('|');
        return { hash, subject, author, date };
      });

    // Get changed files
    // First get the commit count
    let commitCount;
    try {
      commitCount = execSync(
        `git rev-list --count --since="${since}" HEAD`,
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
        }
      ).trim();
    } catch (error) {
      commitCount = '0';
    }

    let changedFiles = [];
    if (parseInt(commitCount, 10) > 0) {
      try {
        changedFiles = execSync(
          `git diff --name-only HEAD~${commitCount} HEAD`,
          {
            cwd: PROJECT_ROOT,
            encoding: 'utf-8',
          }
        )
          .split('\n')
          .filter(Boolean);
      } catch (error) {
        // If diff fails, try a different approach
        changedFiles = execSync(
          `git diff --name-only --since="${since}"`,
          {
            cwd: PROJECT_ROOT,
            encoding: 'utf-8',
          }
        )
          .split('\n')
          .filter(Boolean);
      }
    }

    // Categorize changes
    const frontend = changedFiles.filter((f) => f.startsWith('frontend/src/'));
    const backend = changedFiles.filter((f) => f.startsWith('backend/src/'));
    const docs = changedFiles.filter((f) => f.startsWith('resources/user-guide/'));

    return {
      commits,
      changedFiles,
      categories: {
        frontend,
        backend,
        docs,
      },
      stats: {
        totalCommits: commits.length,
        totalFiles: changedFiles.length,
        frontendFiles: frontend.length,
        backendFiles: backend.length,
        docsFiles: docs.length,
      },
    };
  } catch (error) {
    console.error('❌ Failed to get recent changes:', error.message);
    return {
      commits: [],
      changedFiles: [],
      categories: { frontend: [], backend: [], docs: [] },
      stats: { totalCommits: 0, totalFiles: 0, frontendFiles: 0, backendFiles: 0, docsFiles: 0 },
    };
  }
}

/**
 * Load all user guide documentation
 *
 * @returns {Array<Object>} Documentation files
 */
function loadUserDocumentation() {
  const docsDir = path.join(PROJECT_ROOT, 'resources/user-guide/docs');
  const docs = [];

  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativePath = path.relative(docsDir, fullPath);

        docs.push({
          path: relativePath,
          fullPath,
          content,
          size: content.length,
        });
      }
    }
  }

  if (fs.existsSync(docsDir)) {
    scanDirectory(docsDir);
  }

  return docs;
}

/**
 * Load internal documentation files
 *
 * @returns {Array<Object>} Internal documentation files
 */
function loadInternalDocumentation() {
  const docs = [];
  const internalDocsDir = path.join(PROJECT_ROOT, 'internal-docs');

  // Core root-level docs
  const rootDocs = ['CLAUDE.md', 'AGENTS.md', 'GITHUB_AGENT.md', 'README.md'];

  rootDocs.forEach((docName) => {
    const fullPath = path.join(PROJECT_ROOT, docName);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      docs.push({
        path: docName,
        fullPath,
        content,
        size: content.length,
        isCore: true,
      });
    }
  });

  // Internal docs directory
  function scanDirectory(dir, baseDir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== '_generated') {
        scanDirectory(fullPath, baseDir);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativePath = path.relative(baseDir, fullPath);

        // Check if it's a core doc
        const isCore = CORE_INTERNAL_DOCS.some((coreDoc) =>
          relativePath.includes(coreDoc) || coreDoc.includes(relativePath)
        );

        docs.push({
          path: relativePath,
          fullPath,
          content,
          size: content.length,
          isCore,
        });
      }
    }
  }

  if (fs.existsSync(internalDocsDir)) {
    scanDirectory(internalDocsDir, PROJECT_ROOT);
  }

  return docs;
}

/**
 * Identify new internal docs created recently that may need consolidation
 *
 * @param {Array<Object>} internalDocs - Internal documentation files
 * @returns {Array<Object>} New docs that may need consolidation
 */
function identifyNewInternalDocs(internalDocs) {
  const newDocs = [];
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - NEW_DOC_THRESHOLD_DAYS);

  for (const doc of internalDocs) {
    // Skip core docs and generated docs
    if (doc.isCore || doc.path.includes('_generated/')) {
      continue;
    }

    try {
      // Get file creation date from git
      const creationDate = execSync(
        `git log --follow --format=%aI --reverse -- "${doc.fullPath}" | head -1`,
        {
          cwd: PROJECT_ROOT,
          encoding: 'utf-8',
        }
      ).trim();

      if (creationDate && new Date(creationDate) > thresholdDate) {
        newDocs.push({
          ...doc,
          createdDate: creationDate,
          daysOld: Math.floor((new Date() - new Date(creationDate)) / (1000 * 60 * 60 * 24)),
        });
      }
    } catch (error) {
      // If git log fails, skip this doc
      continue;
    }
  }

  return newDocs;
}

/**
 * Build context for internal docs audit
 *
 * @param {Object} changes - Recent changes
 * @param {Array<Object>} internalDocs - Internal documentation files
 * @param {Array<Object>} newDocs - New docs that may need consolidation
 * @returns {string} Context prompt
 */
function buildInternalDocsContext(changes, internalDocs, newDocs) {
  const context = [];

  context.push('# 9Boxer Internal Documentation Audit');
  context.push('\n## Purpose');
  context.push('You are auditing INTERNAL documentation for AI agents working on 9Boxer.');
  context.push('This is NOT user-facing documentation - it is for AI agents like yourself.');
  context.push('\n## Key Principles for Internal Docs:');
  context.push('1. **Anti-Proliferation**: Update existing docs, do NOT create new ones');
  context.push('2. **Current State Only**: Document "how it works now", not "changed from X to Y"');
  context.push('3. **No Memory Assumption**: Agents have no context of how things used to work');
  context.push('4. **Agent-Optimized Language**: Present tense, active voice, actionable commands');
  context.push('5. **Single Source of Truth**: No duplicates, no conflicts');

  context.push('\n## Core Internal Docs Structure:');
  context.push('- `CLAUDE.md` - Main entry point for AI agents');
  context.push('- `AGENTS.md` - Development workflow guidance');
  context.push('- `internal-docs/architecture/` - System design');
  context.push('- `internal-docs/design-system/` - UI component guidelines');
  context.push('- `internal-docs/testing/` - Testing strategies');
  context.push('- `internal-docs/i18n/` - Internationalization');
  context.push('- `internal-docs/contributing/` - Writing standards');

  context.push('\n## Recent Code Changes (Last 7 Days)');
  context.push(`\nTotal commits: ${changes.stats.totalCommits}`);
  context.push(`Total files changed: ${changes.stats.totalFiles}`);
  context.push(`- Frontend changes: ${changes.stats.frontendFiles} files`);
  context.push(`- Backend changes: ${changes.stats.backendFiles} files`);
  context.push(`- Documentation changes: ${changes.stats.docsFiles} files`);

  if (changes.commits.length > 0) {
    context.push('\n### Recent Commits:');
    changes.commits.slice(0, 20).forEach((commit) => {
      context.push(`- ${commit.hash}: ${commit.subject} (${commit.date})`);
    });
  }

  // Include core docs content (abbreviated)
  context.push('\n## Current Core Internal Docs:');
  const coreDocs = internalDocs.filter((d) => d.isCore);
  coreDocs.forEach((doc) => {
    context.push(`\n### ${doc.path} (${doc.size} bytes)`);
    const lines = doc.content.split('\n').slice(0, 20);
    context.push(lines.join('\n'));
    if (doc.content.split('\n').length > 20) {
      context.push('...(content continues)');
    }
  });

  // Highlight new docs that may need consolidation
  if (newDocs.length > 0) {
    context.push('\n## 🚨 NEW INTERNAL DOCS DETECTED (May Need Consolidation):');
    newDocs.forEach((doc) => {
      context.push(`\n### ${doc.path} (Created: ${doc.createdDate}, ${doc.daysOld} days old)`);
      context.push('**FULL CONTENT:**');
      context.push(doc.content);
    });
    context.push('\n⚠️ **ACTION REQUIRED**: For each new doc above, determine:');
    context.push('1. What valuable information it contains');
    context.push('2. Which EXISTING core doc(s) should be updated with this info');
    context.push('3. What sections to add/update in those core docs');
    context.push('4. Recommend DELETION of the new doc after consolidation');
  }

  return context.join('\n');
}

/**
 * Build context for user docs audit
 *
 * @param {Object} changes - Recent changes
 * @param {Array<Object>} userDocs - User documentation files
 * @returns {string} Context prompt
 */
function buildUserDocsContext(changes, userDocs) {
  const context = [];

  context.push('# 9Boxer User Documentation Audit');
  context.push('\n## Purpose');
  context.push('You are auditing USER-FACING documentation for end users of 9Boxer.');
  context.push('This documentation must be accessible, well-illustrated, and localization-ready.');

  context.push('\n## Key Requirements for User Docs:');
  context.push('1. **Screenshots**: All features should have current screenshots');
  context.push('2. **Voice & Tone**: Conversational, second person, active voice, contractions OK');
  context.push('3. **Localization Ready**: Avoid idioms, use simple language');
  context.push('4. **Accessibility**: WCAG 2.1 Level AA (alt text, heading hierarchy)');
  context.push('5. **Cross-References**: Features may be mentioned in multiple guides');

  context.push('\n## Recent Code Changes (Last 7 Days)');
  context.push(`\nTotal commits: ${changes.stats.totalCommits}`);
  context.push(`Total files changed: ${changes.stats.totalFiles}`);
  context.push(`- Frontend changes: ${changes.stats.frontendFiles} files`);
  context.push(`- Backend changes: ${changes.stats.backendFiles} files`);

  if (changes.commits.length > 0) {
    context.push('\n### Recent Commits:');
    changes.commits.slice(0, 20).forEach((commit) => {
      context.push(`- ${commit.hash}: ${commit.subject} (${commit.date})`);
    });
  }

  if (changes.categories.frontend.length > 0) {
    context.push('\n### Frontend Files Changed:');
    changes.categories.frontend.slice(0, 30).forEach((file) => {
      context.push(`- ${file}`);
    });
  }

  // Include FULL content of user docs for cross-reference analysis
  context.push('\n## Current User Documentation (FULL CONTENT):');
  userDocs.forEach((doc) => {
    context.push(`\n### ${doc.path}`);
    context.push('**FULL CONTENT:**');
    context.push(doc.content);
    context.push('\n---');
  });

  return context.join('\n');
}

/**
 * Analyze internal documentation with Claude API
 *
 * @param {string} context - Audit context
 * @returns {Promise<Object>} Audit results
 */
async function analyzeInternalDocs(context) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const prompt = `${context}

## Your Task: Internal Documentation Audit

Analyze the recent code changes and current INTERNAL documentation to identify issues.

**Remember**: This is documentation for AI AGENTS, not end users. Focus on:

1. **New Features Not in CLAUDE.md**: Any new features/systems that agents need to know about
2. **Outdated Agent Instructions**: Instructions that no longer match current code
3. **Testing Docs Drift**: Testing patterns that don't reflect current test structure
4. **Conflicting Recommendations**: Contradictory guidance in different docs
5. **Stale Examples**: Code examples that are >30 days old without verification
6. **NEW DOCS CONSOLIDATION**: For any new internal docs detected, provide specific consolidation plan

For each issue you find, provide:
1. **Type**: One of: outdated, missing, conflict, consolidation, stale-example
2. **Priority**: One of: critical, high, medium, low
3. **Location**: Which documentation file is affected (or target file for consolidation)
4. **Title**: Brief description (max 80 chars)
5. **Description**: Detailed explanation
6. **Action**: Specific, actionable steps to resolve
7. **Rationale**: Why this matters for AI agents

**For CONSOLIDATION tasks**, provide:
- **sourceDoc**: The new doc to be consolidated
- **targetDoc**: The existing core doc to update
- **contentToExtract**: What valuable info to extract
- **sectionToUpdate**: Which section of target doc to update
- **deleteAfter**: true (always recommend deletion after consolidation)

Return your findings in this JSON format:
{
  "findings": [
    {
      "type": "outdated|missing|conflict|consolidation|stale-example",
      "priority": "critical|high|medium|low",
      "location": "path/to/doc.md",
      "title": "Brief title",
      "description": "Detailed description",
      "action": "Specific actionable steps",
      "rationale": "Why this matters",
      "consolidation": {
        "sourceDoc": "path/to/new-doc.md",
        "targetDoc": "path/to/core-doc.md",
        "contentToExtract": "What to extract",
        "sectionToUpdate": "Which section to update",
        "deleteAfter": true
      }
    }
  ],
  "summary": {
    "totalIssues": number,
    "byType": { "outdated": number, "missing": number, "conflict": number, "consolidation": number, "stale-example": number },
    "byPriority": { "critical": number, "high": number, "medium": number, "low": number }
  }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response (Claude might wrap it in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    const result = JSON.parse(jsonMatch[1]);
    return result;
  } catch (error) {
    console.error('❌ Internal docs analysis failed:', error.message);
    throw error;
  }
}

/**
 * Analyze user documentation with Claude API
 *
 * @param {string} context - Audit context
 * @returns {Promise<Object>} Audit results
 */
async function analyzeUserDocs(context) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const prompt = `${context}

## Your Task: User Documentation Audit

Analyze the recent code changes and current USER-FACING documentation to identify issues.

**Remember**: This is documentation for END USERS, not developers. Focus on:

1. **Outdated Screenshots**: UI changes that make screenshots incorrect
2. **Missing Documentation**: New user-visible features not documented
3. **Incorrect Instructions**: Steps that no longer work due to code changes
4. **Cross-Reference Issues**: Features mentioned in multiple guides that need updates
5. **Accessibility Issues**: Missing alt text, poor heading hierarchy
6. **Localization Readiness**: Idioms or complex language that won't translate well

For each issue you find, provide:
1. **Type**: One of: outdated, missing, incorrect, screenshot-needed, accessibility, localization
2. **Priority**: One of: critical, high, medium, low
3. **Location**: Which user doc file(s) are affected
4. **Title**: Brief description (max 80 chars)
5. **Description**: Detailed explanation
6. **Action**: Specific, actionable steps to resolve
7. **Flags**: Array of required actions (e.g., ["needs_screenshot", "needs_i18n_review", "needs_tone_review"])
8. **AffectedPages**: List of ALL doc pages that reference this feature

Return your findings in this JSON format:
{
  "findings": [
    {
      "type": "outdated|missing|incorrect|screenshot-needed|accessibility|localization",
      "priority": "critical|high|medium|low",
      "location": "path/to/doc.md",
      "title": "Brief title",
      "description": "Detailed description",
      "action": "Specific actionable steps",
      "flags": ["needs_screenshot", "needs_i18n_review", "needs_tone_review"],
      "affectedPages": ["page1.md", "page2.md"]
    }
  ],
  "summary": {
    "totalIssues": number,
    "byType": { "outdated": number, "missing": number, "incorrect": number, "screenshot-needed": number, "accessibility": number, "localization": number },
    "byPriority": { "critical": number, "high": number, "medium": number, "low": number }
  }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response (Claude might wrap it in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    const result = JSON.parse(jsonMatch[1]);
    return result;
  } catch (error) {
    console.error('❌ User docs analysis failed:', error.message);
    throw error;
  }
}

/**
 * Create consolidated GitHub issue for internal or user docs
 *
 * @param {string} type - Type of docs ('internal' or 'user')
 * @param {Array<Object>} findings - Audit findings
 * @param {string} auditDate - Audit date ISO string
 * @param {boolean} dryRun - If true, don't actually create issue
 * @returns {Promise<Object|null>} Created issue or null
 */
async function createConsolidatedIssue(type, findings, auditDate, dryRun = false) {
  if (findings.length === 0) {
    console.log(`\n✨ No ${type} documentation issues found!`);
    return null;
  }

  const isInternal = type === 'internal';
  const weekOf = new Date(auditDate).toISOString().split('T')[0];

  // Group findings by priority
  const grouped = {
    critical: findings.filter((f) => f.priority === 'critical'),
    high: findings.filter((f) => f.priority === 'high'),
    medium: findings.filter((f) => f.priority === 'medium'),
    low: findings.filter((f) => f.priority === 'low'),
  };

  // Build issue body
  const sections = [];

  sections.push(`## ${isInternal ? '🤖' : '📚'} ${isInternal ? 'Internal' : 'User'} Documentation Audit Results`);
  sections.push(`\n**Audit Period:** Last 7 days`);
  sections.push(`**Audit Date:** ${auditDate}`);
  sections.push(`**Total Tasks:** ${findings.length}`);
  sections.push('\n---');

  // Add findings grouped by priority
  const priorityConfig = {
    critical: { emoji: '🔴', label: 'CRITICAL PRIORITY' },
    high: { emoji: '🟠', label: 'High Priority' },
    medium: { emoji: '🟡', label: 'Medium Priority' },
    low: { emoji: '🟢', label: 'Low Priority' },
  };

  for (const [priority, config] of Object.entries(priorityConfig)) {
    if (grouped[priority].length === 0) continue;

    sections.push(`\n## ${config.emoji} ${config.label}\n`);

    grouped[priority].forEach((finding, index) => {
      sections.push(`### ${index + 1}. ${finding.title}`);
      sections.push(`**Location:** \`${finding.location}\``);
      sections.push(`**Type:** ${finding.type}`);
      sections.push(`\n**Issue:**`);
      sections.push(finding.description);
      sections.push(`\n**Action:**`);
      sections.push(finding.action);

      if (finding.rationale) {
        sections.push(`\n**Why this matters:** ${finding.rationale}`);
      }

      // For user docs: show flags
      if (!isInternal && finding.flags && finding.flags.length > 0) {
        sections.push(`\n**Flags:** ${finding.flags.map((f) => `\`${f}\``).join(', ')}`);
      }

      // For user docs: show affected pages
      if (!isInternal && finding.affectedPages && finding.affectedPages.length > 0) {
        sections.push(`\n**Affected Pages:** ${finding.affectedPages.map((p) => `\`${p}\``).join(', ')}`);
      }

      // For internal docs: show consolidation details
      if (isInternal && finding.consolidation) {
        sections.push(`\n**Consolidation Plan:**`);
        sections.push(`- Source: \`${finding.consolidation.sourceDoc}\``);
        sections.push(`- Target: \`${finding.consolidation.targetDoc}\``);
        sections.push(`- Extract: ${finding.consolidation.contentToExtract}`);
        sections.push(`- Update Section: ${finding.consolidation.sectionToUpdate}`);
        if (finding.consolidation.deleteAfter) {
          sections.push(`- ⚠️ **Delete source doc after consolidation**`);
        }
      }

      sections.push('\n---\n');
    });
  }

  sections.push(`\n*This issue was automatically generated by the AI documentation audit system.*`);
  sections.push(`*Generated: ${auditDate}*`);

  const issueBody = sections.join('\n');

  // Determine labels
  const labels = ['documentation'];
  if (isInternal) {
    labels.push('internal-documentation');
  } else {
    labels.push('user-documentation');
  }

  // Add priority label if there are critical/high priority items
  if (grouped.critical.length > 0) {
    labels.push('priority: critical');
  } else if (grouped.high.length > 0) {
    labels.push('priority: high');
  }

  const issueTitle = `${isInternal ? 'Internal' : 'User'} Documentation Updates (Week of ${weekOf})`;

  const issueData = {
    title: issueTitle,
    body: issueBody,
    labels,
  };

  if (dryRun) {
    console.log(`\n📋 [DRY RUN] Would create ${type} docs issue:`);
    console.log(`   Title: ${issueData.title}`);
    console.log(`   Labels: ${issueData.labels.join(', ')}`);
    console.log(`   Tasks: ${findings.length}`);
    return { ...issueData, number: 'DRY-RUN', type };
  }

  // Create actual issue
  let bodyFile = null;
  try {
    const tempDir = os.tmpdir();
    bodyFile = path.join(tempDir, `gh-issue-${type}-${process.pid}-${Date.now()}.md`);

    fs.writeFileSync(bodyFile, issueData.body);

    const escapedTitle = issueData.title.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const labelsArg = issueData.labels.map((l) => `--label "${l.replace(/"/g, '\\"')}"`).join(' ');

    const result = execSync(`gh issue create --title "${escapedTitle}" --body-file "${bodyFile}" ${labelsArg}`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
    });

    const issueUrl = result.trim();
    const issueNumber = issueUrl.split('/').pop();

    console.log(`\n✅ Created ${type} docs issue #${issueNumber}: ${issueData.title}`);
    return { ...issueData, number: issueNumber, url: issueUrl, type };
  } catch (error) {
    console.error(`❌ Failed to create ${type} docs issue: ${error.message}`);
    return null;
  } finally {
    if (bodyFile && fs.existsSync(bodyFile)) {
      try {
        fs.unlinkSync(bodyFile);
      } catch (cleanupError) {
        console.warn(`⚠️  Failed to clean up temp file: ${bodyFile}`);
      }
    }
  }
}

/**
 * Save audit report to file
 *
 * @param {Object} report - Complete audit report
 */
function saveAuditReport(report) {
  const reportPath = path.join(PROJECT_ROOT, 'docs-audit-report.json');

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Saved audit report to: ${path.relative(PROJECT_ROOT, reportPath)}`);
  } catch (error) {
    console.error('❌ Failed to save audit report:', error.message);
  }
}

/**
 * Print summary report
 *
 * @param {Object} report - Audit report
 */
function printSummary(report) {
  console.log('\n' + '─'.repeat(60));
  console.log('📊 AI Documentation Audit Summary');
  console.log('─'.repeat(60));

  console.log(`\n📅 Audit Period: Last ${report.metadata.daysScanned} days`);
  console.log(`📝 Total Issues Found: ${report.summary.totalIssues}`);

  console.log('\n📋 By Type:');
  Object.entries(report.summary.byType).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`   - ${type}: ${count}`);
    }
  });

  console.log('\n🚨 By Severity:');
  Object.entries(report.summary.bySeverity).forEach(([severity, count]) => {
    if (count > 0) {
      const icon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${icon} ${severity}: ${count}`);
    }
  });

  if (report.findings.length > 0) {
    console.log('\n📌 Findings:');
    report.findings.forEach((finding, index) => {
      const icon = finding.severity === 'high' ? '🔴' : finding.severity === 'medium' ? '🟡' : '🟢';
      console.log(`\n   ${index + 1}. ${icon} ${finding.title}`);
      console.log(`      Type: ${finding.type} | Location: ${finding.location}`);
      console.log(`      ${finding.description.slice(0, 100)}${finding.description.length > 100 ? '...' : ''}`);
    });
  }

  if (report.issues.length > 0) {
    console.log('\n\n🎫 GitHub Issues Created:');
    report.issues.forEach((issue) => {
      console.log(`   - Issue #${issue.number}: ${issue.title}`);
      if (issue.url) {
        console.log(`     ${issue.url}`);
      }
    });
  }

  console.log('\n' + '─'.repeat(60));
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 Starting AI-powered documentation audit...\n');
  console.log('📋 Separate analysis for internal docs (for agents) and user docs (for end users)\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const daysArg = args.find((arg) => arg.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1], 10) : 7;
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('🏃 Running in DRY RUN mode (no issues will be created)\n');
  }

  // Validate environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  const auditDate = new Date().toISOString();

  // Get recent changes
  console.log(`📅 Analyzing changes from the last ${days} days...`);
  const changes = getRecentChanges(days);
  console.log(`   Found ${changes.stats.totalCommits} commits, ${changes.stats.totalFiles} files changed`);

  // ========== INTERNAL DOCS ANALYSIS ==========
  console.log('\n' + '='.repeat(60));
  console.log('🤖 INTERNAL DOCUMENTATION AUDIT (for AI agents)');
  console.log('='.repeat(60));

  console.log('\n📚 Loading internal documentation...');
  const internalDocs = loadInternalDocumentation();
  console.log(`   Found ${internalDocs.length} internal documentation files`);

  console.log('\n🔍 Identifying new internal docs (last 30 days)...');
  const newInternalDocs = identifyNewInternalDocs(internalDocs);
  if (newInternalDocs.length > 0) {
    console.log(`   ⚠️  Found ${newInternalDocs.length} new doc(s) that may need consolidation:`);
    newInternalDocs.forEach((doc) => {
      console.log(`      - ${doc.path} (${doc.daysOld} days old)`);
    });
  } else {
    console.log(`   ✅ No new internal docs detected`);
  }

  console.log('\n🔨 Building internal docs context...');
  const internalContext = buildInternalDocsContext(changes, internalDocs, newInternalDocs);
  console.log(`   Context size: ${internalContext.length} characters`);

  console.log('\n🤖 Analyzing internal docs with Claude API...');
  const internalResults = await analyzeInternalDocs(internalContext);
  console.log(`   Analysis complete: ${internalResults.summary.totalIssues} issue(s) found`);

  // ========== USER DOCS ANALYSIS ==========
  console.log('\n' + '='.repeat(60));
  console.log('📚 USER DOCUMENTATION AUDIT (for end users)');
  console.log('='.repeat(60));

  console.log('\n📖 Loading user guide documentation...');
  const userDocs = loadUserDocumentation();
  console.log(`   Found ${userDocs.length} user documentation files`);

  console.log('\n🔨 Building user docs context (FULL CONTENT)...');
  const userContext = buildUserDocsContext(changes, userDocs);
  console.log(`   Context size: ${userContext.length} characters`);

  console.log('\n🤖 Analyzing user docs with Claude API...');
  const userResults = await analyzeUserDocs(userContext);
  console.log(`   Analysis complete: ${userResults.summary.totalIssues} issue(s) found`);

  // ========== ISSUE CREATION ==========
  console.log('\n' + '='.repeat(60));
  console.log('🎫 CREATING CONSOLIDATED GITHUB ISSUES');
  console.log('='.repeat(60));

  const issues = [];

  // Create internal docs issue
  const internalIssue = await createConsolidatedIssue('internal', internalResults.findings, auditDate, dryRun);
  if (internalIssue) {
    issues.push(internalIssue);
  }

  // Create user docs issue
  const userIssue = await createConsolidatedIssue('user', userResults.findings, auditDate, dryRun);
  if (userIssue) {
    issues.push(userIssue);
  }

  // Build complete report
  const report = {
    metadata: {
      generatedAt: auditDate,
      generatedBy: 'ai-docs-audit.js (refactored v2)',
      daysScanned: days,
      dryRun,
    },
    changes: {
      stats: changes.stats,
      recentCommits: changes.commits.slice(0, 10),
    },
    internalDocs: {
      totalFiles: internalDocs.length,
      coreFiles: internalDocs.filter((d) => d.isCore).length,
      newDocsDetected: newInternalDocs.length,
      findings: internalResults.findings,
      summary: internalResults.summary,
    },
    userDocs: {
      totalFiles: userDocs.length,
      findings: userResults.findings,
      summary: userResults.summary,
    },
    issues,
  };

  // Save report
  saveAuditReport(report);

  // Print summary
  printSummary(report);

  // Exit
  const totalIssues = internalResults.summary.totalIssues + userResults.summary.totalIssues;
  if (totalIssues > 0) {
    console.log('\n⚠️  Documentation issues detected!');
    console.log(`   Internal docs: ${internalResults.summary.totalIssues} issue(s)`);
    console.log(`   User docs: ${userResults.summary.totalIssues} issue(s)`);
    console.log(`   GitHub issues created: ${issues.length}`);
  } else {
    console.log('\n✅ All documentation is up to date!');
  }
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('\n❌ Audit failed:', error.message);
    process.exit(1);
  });
}

// Export functions for testing
export {
  getRecentChanges,
  loadUserDocumentation,
  loadInternalDocumentation,
  identifyNewInternalDocs,
  buildInternalDocsContext,
  buildUserDocsContext,
  analyzeInternalDocs,
  analyzeUserDocs,
  createConsolidatedIssue,
};
