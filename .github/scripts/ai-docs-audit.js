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
const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 4096;

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
function loadDocumentation() {
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
 * Build context for Claude API
 *
 * @param {Object} changes - Recent changes
 * @param {Array<Object>} docs - Documentation files
 * @returns {string} Context prompt
 */
function buildAuditContext(changes, docs) {
  const context = [];

  context.push('# 9Boxer Documentation Audit');
  context.push('\nYou are auditing the documentation for 9Boxer, a desktop application for visualizing employee performance using the 9-box talent grid methodology.');
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

  if (changes.categories.frontend.length > 0) {
    context.push('\n### Frontend Files Changed:');
    changes.categories.frontend.slice(0, 30).forEach((file) => {
      context.push(`- ${file}`);
    });
  }

  context.push('\n## Current Documentation');
  context.push(`\nTotal documentation files: ${docs.length}`);

  // Include first few lines of each doc for context
  docs.forEach((doc) => {
    context.push(`\n### ${doc.path}`);
    const lines = doc.content.split('\n').slice(0, 10);
    context.push(lines.join('\n'));
    if (doc.content.split('\n').length > 10) {
      context.push('...(content continues)');
    }
  });

  return context.join('\n');
}

/**
 * Call Claude API to analyze documentation
 *
 * @param {string} context - Audit context
 * @returns {Promise<Object>} Audit results
 */
async function analyzeWithClaude(context) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const prompt = `${context}

## Your Task

Analyze the recent code changes and current documentation to identify documentation issues.

For each issue you find, provide:
1. **Type**: One of: outdated, missing, incorrect, screenshot-needed
2. **Severity**: One of: high, medium, low
3. **Location**: Which documentation file is affected (or "new" if docs don't exist)
4. **Title**: Brief description of the issue
5. **Description**: Detailed explanation of what needs to be fixed
6. **Recommendation**: Specific action to resolve the issue

Focus on:
- New features in code that aren't documented
- Changed functionality where docs are outdated
- Screenshots mentioned in docs that may be outdated based on UI changes
- Incorrect instructions based on code analysis

Return your findings in this JSON format:
{
  "findings": [
    {
      "type": "outdated|missing|incorrect|screenshot-needed",
      "severity": "high|medium|low",
      "location": "path/to/doc.md or 'new'",
      "title": "Brief title",
      "description": "Detailed description",
      "recommendation": "Specific action to take"
    }
  ],
  "summary": {
    "totalIssues": number,
    "byType": { "outdated": number, "missing": number, "incorrect": number, "screenshot-needed": number },
    "bySeverity": { "high": number, "medium": number, "low": number }
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
    console.error('❌ Claude API call failed:', error.message);
    throw error;
  }
}

/**
 * Create GitHub issues for findings
 *
 * @param {Array<Object>} findings - Audit findings
 * @param {boolean} dryRun - If true, don't actually create issues
 * @returns {Promise<Array<Object>>} Created issues
 */
async function createGitHubIssues(findings, dryRun = false) {
  const issues = [];

  for (const finding of findings) {
    const labels = ['documentation'];

    // Add severity label
    if (finding.severity === 'high') {
      labels.push('priority: high');
    }

    // Add type label
    if (finding.type === 'screenshot-needed') {
      labels.push('screenshot');
    } else if (finding.type === 'missing') {
      labels.push('enhancement');
    } else {
      labels.push('bug');
    }

    const issueBody = `## Issue
${finding.description}

## Location
${finding.location === 'new' ? 'New documentation needed' : `File: \`${finding.location}\``}

## Recommendation
${finding.recommendation}

## Type
${finding.type}

## Severity
${finding.severity}

---
*This issue was automatically generated by the AI documentation audit system.*
*Audit Date: ${new Date().toISOString()}*`;

    const issueData = {
      title: `[Docs Audit] ${finding.title}`,
      body: issueBody,
      labels,
    };

    if (dryRun) {
      console.log(`\n📋 [DRY RUN] Would create issue:`);
      console.log(`   Title: ${issueData.title}`);
      console.log(`   Labels: ${issueData.labels.join(', ')}`);
      issues.push({ ...issueData, number: 'DRY-RUN' });
    } else {
      let bodyFile = null;
      try {
        // Create issue using gh CLI with proper escaping
        // Use OS temp directory to avoid polluting project root
        const tempDir = os.tmpdir();
        bodyFile = path.join(tempDir, `gh-issue-${process.pid}-${Date.now()}.md`);

        fs.writeFileSync(bodyFile, issueData.body);

        // Escape shell arguments to prevent command injection
        const escapedTitle = issueData.title.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        const labelsArg = issueData.labels
          .map((l) => `--label "${l.replace(/"/g, '\\"')}"`)
          .join(' ');

        const result = execSync(
          `gh issue create --title "${escapedTitle}" --body-file "${bodyFile}" ${labelsArg}`,
          {
            cwd: PROJECT_ROOT,
            encoding: 'utf-8',
          }
        );

        const issueUrl = result.trim();
        const issueNumber = issueUrl.split('/').pop();

        console.log(`\n✅ Created issue #${issueNumber}: ${issueData.title}`);
        issues.push({ ...issueData, number: issueNumber, url: issueUrl });
      } catch (error) {
        console.error(`❌ Failed to create issue: ${error.message}`);
      } finally {
        // Always clean up temp file
        if (bodyFile && fs.existsSync(bodyFile)) {
          try {
            fs.unlinkSync(bodyFile);
          } catch (cleanupError) {
            console.warn(`⚠️  Failed to clean up temp file: ${bodyFile}`);
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Save audit report to file
 *
 * @param {Object} report - Complete audit report
 */
function saveAuditReport(report) {
  const reportPath = path.join(PROJECT_ROOT, '.docs-audit-report.json');

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

  // Get recent changes
  console.log(`📅 Analyzing changes from the last ${days} days...`);
  const changes = getRecentChanges(days);
  console.log(`   Found ${changes.stats.totalCommits} commits, ${changes.stats.totalFiles} files changed`);

  // Load documentation
  console.log('\n📚 Loading user guide documentation...');
  const docs = loadDocumentation();
  console.log(`   Found ${docs.length} documentation files`);

  // Build context for Claude
  console.log('\n🔨 Building audit context...');
  const context = buildAuditContext(changes, docs);
  console.log(`   Context size: ${context.length} characters`);

  // Analyze with Claude
  console.log('\n🤖 Analyzing with Claude API...');
  const auditResults = await analyzeWithClaude(context);
  console.log(`   Analysis complete: ${auditResults.summary.totalIssues} issues found`);

  // Create GitHub issues
  const issues = await createGitHubIssues(auditResults.findings, dryRun);

  // Build complete report
  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai-docs-audit.js',
      daysScanned: days,
      dryRun,
    },
    changes: {
      stats: changes.stats,
      recentCommits: changes.commits.slice(0, 10),
    },
    documentation: {
      totalFiles: docs.length,
      files: docs.map((d) => ({ path: d.path, size: d.size })),
    },
    findings: auditResults.findings,
    summary: auditResults.summary,
    issues,
  };

  // Save report
  saveAuditReport(report);

  // Print summary
  printSummary(report);

  // Exit
  if (auditResults.summary.totalIssues > 0) {
    console.log('\n⚠️  Documentation issues detected!');
    console.log(`   ${issues.length} GitHub issue(s) created`);
  } else {
    console.log('\n✅ Documentation is up to date!');
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
  loadDocumentation,
  buildAuditContext,
  analyzeWithClaude,
  createGitHubIssues,
};
