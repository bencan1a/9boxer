#!/usr/bin/env node
/**
 * AI-powered release notes generation using Claude API
 *
 * This script analyzes commits and pull requests between releases to automatically
 * generate structured release notes with:
 * - Executive summary
 * - New features
 * - Bug fixes
 * - Breaking changes
 * - Other improvements
 *
 * Usage:
 *   node .github/scripts/generate-release-notes.js <version> [fromTag]
 *
 * Arguments:
 *   version     The new version being released (e.g., "1.2.0")
 *   fromTag     Optional: Tag to compare from (default: latest tag)
 *
 * Environment Variables:
 *   ANTHROPIC_API_KEY  Required: API key for Claude
 *   GITHUB_REPOSITORY  Auto-provided in GitHub Actions (e.g., "owner/repo")
 *
 * Outputs:
 *   - Updates CHANGELOG.md with new version section
 *   - Outputs generated notes to stdout for verification
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// Constants
const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 4096;

/**
 * Load ANTHROPIC_API_KEY from environment or backend/.env
 */
function loadApiKey() {
  // First check if already set in environment
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  // Try to load from backend/.env
  try {
    const envPath = path.join(PROJECT_ROOT, "backend", ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^ANTHROPIC_API_KEY\s*=\s*(.+)$/m);
      if (match && match[1]) {
        const apiKey = match[1].trim().replace(/^["']|["']$/g, ""); // Remove quotes if present
        console.log("✅ Loaded ANTHROPIC_API_KEY from backend/.env");
        return apiKey;
      }
    }
  } catch (error) {
    // Silently fail and let the error be thrown below
  }

  return null;
}

/**
 * Get git commits between two refs
 */
function getCommitsBetween(fromRef, toRef = "HEAD") {
  try {
    const output = execSync(
      `git log ${fromRef}..${toRef} --pretty=format:"%H|%an|%ae|%ai|%s|%b" --no-merges`,
      { encoding: "utf-8", cwd: PROJECT_ROOT }
    );

    if (!output.trim()) {
      return [];
    }

    return output
      .split("\n")
      .filter((line) => line.trim()) // Filter out empty lines
      .map((line) => {
        const [hash, author, email, date, subject, ...bodyParts] =
          line.split("|");
        return {
          hash: hash?.substring(0, 8),
          author,
          email,
          date,
          subject,
          body: bodyParts.join("|").trim(),
        };
      });
  } catch (error) {
    console.error("❌ Failed to get commits:", error.message);
    return [];
  }
}

/**
 * Get the latest git tag
 */
function getLatestTag() {
  try {
    return execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
      cwd: PROJECT_ROOT,
    }).trim();
  } catch (error) {
    console.warn("⚠️  No previous tags found, will include all commits");
    // If no tags exist, use initial commit
    const initialCommit = execSync("git rev-list --max-parents=0 HEAD", {
      encoding: "utf-8",
      cwd: PROJECT_ROOT,
    }).trim();
    return initialCommit;
  }
}

/**
 * Get changed files between refs
 */
function getChangedFiles(fromRef, toRef = "HEAD") {
  try {
    const output = execSync(`git diff --name-only ${fromRef}..${toRef}`, {
      encoding: "utf-8",
      cwd: PROJECT_ROOT,
    });

    return output.split("\n").filter((f) => f.trim());
  } catch (error) {
    console.error("❌ Failed to get changed files:", error.message);
    return [];
  }
}

/**
 * Categorize commits by type
 */
function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    breaking: [],
    performance: [],
    docs: [],
    tests: [],
    refactor: [],
    chore: [],
    other: [],
  };

  for (const commit of commits) {
    // Skip commits with missing subject (malformed git log output)
    if (!commit.subject) {
      continue;
    }

    const msg = commit.subject.toLowerCase();
    const fullMsg = `${commit.subject} ${commit.body || ""}`.toLowerCase();

    // Check for breaking changes first
    if (
      fullMsg.includes("breaking change") ||
      fullMsg.includes("breaking:") ||
      commit.subject.includes("!")
    ) {
      categories.breaking.push(commit);
    }
    // Conventional commits
    else if (msg.startsWith("feat:") || msg.startsWith("feature:")) {
      categories.features.push(commit);
    } else if (msg.startsWith("fix:")) {
      categories.fixes.push(commit);
    } else if (msg.startsWith("perf:") || msg.startsWith("performance:")) {
      categories.performance.push(commit);
    } else if (msg.startsWith("docs:") || msg.startsWith("doc:")) {
      categories.docs.push(commit);
    } else if (msg.startsWith("test:") || msg.startsWith("tests:")) {
      categories.tests.push(commit);
    } else if (msg.startsWith("refactor:") || msg.startsWith("refactoring:")) {
      categories.refactor.push(commit);
    } else if (
      msg.startsWith("chore:") ||
      msg.startsWith("build:") ||
      msg.startsWith("ci:")
    ) {
      categories.chore.push(commit);
    } else {
      categories.other.push(commit);
    }
  }

  return categories;
}

/**
 * Generate release notes using Claude
 */
async function generateReleaseNotes(version, fromTag, commits, changedFiles) {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not found in environment or backend/.env file"
    );
  }

  const anthropic = new Anthropic({ apiKey });

  // Categorize commits
  const categories = categorizeCommits(commits);

  // Build context for Claude
  const commitSummary = {
    total: commits.length,
    features: categories.features.length,
    fixes: categories.fixes.length,
    breaking: categories.breaking.length,
    performance: categories.performance.length,
    other:
      categories.docs.length +
      categories.tests.length +
      categories.refactor.length +
      categories.chore.length +
      categories.other.length,
  };

  // File change stats
  const fileStats = {
    total: changedFiles.length,
    frontend: changedFiles.filter((f) => f.startsWith("frontend/")).length,
    backend: changedFiles.filter((f) => f.startsWith("backend/")).length,
    docs: changedFiles.filter((f) => f.includes("doc")).length,
    tests: changedFiles.filter((f) => f.includes("test")).length,
  };

  const prompt = `You are generating release notes for 9Boxer v${version}, a desktop talent management application.

## Context

**Previous Version:** ${fromTag}
**New Version:** v${version}
**Total Commits:** ${commitSummary.total}

## Commit Summary

- Features: ${commitSummary.features}
- Bug Fixes: ${commitSummary.fixes}
- Breaking Changes: ${commitSummary.breaking}
- Performance Improvements: ${commitSummary.performance}
- Other (docs, tests, refactor, chore): ${commitSummary.other}

## File Changes

- Total files changed: ${fileStats.total}
- Frontend: ${fileStats.frontend}
- Backend: ${fileStats.backend}
- Documentation: ${fileStats.docs}
- Tests: ${fileStats.tests}

## Detailed Commits

### New Features
${categories.features.map((c) => `- ${c.subject}\n  ${c.body ? c.body : ""}`).join("\n")}

### Bug Fixes
${categories.fixes.map((c) => `- ${c.subject}\n  ${c.body ? c.body : ""}`).join("\n")}

### Breaking Changes
${categories.breaking.map((c) => `- ${c.subject}\n  ${c.body ? c.body : ""}`).join("\n")}

### Performance Improvements
${categories.performance.map((c) => `- ${c.subject}\n  ${c.body ? c.body : ""}`).join("\n")}

### Other Changes
${[
  ...categories.docs,
  ...categories.tests,
  ...categories.refactor,
  ...categories.chore,
  ...categories.other,
]
  .map((c) => `- ${c.subject}`)
  .join("\n")}

## Your Task

Generate professional release notes in the following exact format:

{
  "summary": "A 2-3 sentence executive summary for end users, highlighting the main improvements or theme of this release. Focus on user value, not technical details.",
  "features": [
    "User-facing feature description 1",
    "User-facing feature description 2"
  ],
  "fixes": [
    "Bug fix description 1 (what was broken and how it's fixed)",
    "Bug fix description 2"
  ],
  "breaking": [
    "Breaking change description with migration guidance"
  ],
  "improvements": [
    "Performance improvement or enhancement 1",
    "Internal improvement 2"
  ]
}

## Guidelines

1. **User-Focused Language**: Write for HR professionals and managers, not developers
2. **Concise**: Each item should be 1-2 lines maximum
3. **Value-Oriented**: Explain what users can now do, not how it's implemented
4. **Group Related Changes**: Combine similar commits into single, coherent items
5. **Omit Internal Details**: Skip items about tests, CI/CD, refactoring unless they directly impact users
6. **Breaking Changes**: If any, explain clearly what changed and what users need to do
7. **Empty Arrays OK**: If a category has no relevant items, use an empty array

Return ONLY the JSON object, no additional commentary.`;

  try {
    console.log("🤖 Calling Claude API to generate release notes...");

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0].text;

    // Extract JSON from response
    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) || content.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      console.error("❌ Failed to extract JSON from Claude response");
      console.error("Response preview:", content.slice(0, 500));
      throw new Error("Failed to extract JSON from Claude response");
    }

    const releaseNotes = JSON.parse(jsonMatch[1]);

    // Validate structure
    if (!releaseNotes.summary || !Array.isArray(releaseNotes.features)) {
      throw new Error("Invalid release notes structure from Claude");
    }

    console.log("✅ Release notes generated successfully");
    console.log(
      `📊 Estimated cost: ~$${((message.usage.input_tokens * 0.003 + message.usage.output_tokens * 0.015) / 1000).toFixed(3)}`
    );

    return releaseNotes;
  } catch (error) {
    console.error(
      "❌ Failed to generate release notes with Claude:",
      error.message
    );
    throw error;
  }
}

/**
 * Format release notes as markdown for CHANGELOG
 */
function formatAsChangelog(version, releaseNotes) {
  const date = new Date().toISOString().split("T")[0];
  let markdown = `## [${version}] - ${date}\n\n`;

  // Summary
  markdown += `${releaseNotes.summary}\n\n`;

  // Features
  if (releaseNotes.features && releaseNotes.features.length > 0) {
    markdown += "### What's New\n";
    releaseNotes.features.forEach((feature) => {
      markdown += `- ${feature}\n`;
    });
    markdown += "\n";
  }

  // Bug Fixes
  if (releaseNotes.fixes && releaseNotes.fixes.length > 0) {
    markdown += "### Bug Fixes\n";
    releaseNotes.fixes.forEach((fix) => {
      markdown += `- ${fix}\n`;
    });
    markdown += "\n";
  }

  // Breaking Changes
  if (releaseNotes.breaking && releaseNotes.breaking.length > 0) {
    markdown += "### Breaking Changes\n";
    releaseNotes.breaking.forEach((breaking) => {
      markdown += `- ${breaking}\n`;
    });
    markdown += "\n";
  }

  // Improvements
  if (releaseNotes.improvements && releaseNotes.improvements.length > 0) {
    markdown += "### Improvements\n";
    releaseNotes.improvements.forEach((improvement) => {
      markdown += `- ${improvement}\n`;
    });
    markdown += "\n";
  }

  return markdown;
}

/**
 * Update CHANGELOG.md with new release notes
 */
function updateChangelog(version, releaseNotes) {
  const changelogPath = path.join(PROJECT_ROOT, "CHANGELOG.md");
  const newSection = formatAsChangelog(version, releaseNotes);

  let changelog = "";
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, "utf-8");
  } else {
    // Create new CHANGELOG
    changelog = `# Changelog

All notable changes to 9Boxer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

`;
  }

  // Insert new section after "## [Unreleased]"
  const unreleasedIndex = changelog.indexOf("## [Unreleased]");
  if (unreleasedIndex !== -1) {
    const insertPosition = changelog.indexOf("\n\n", unreleasedIndex) + 2;
    changelog =
      changelog.slice(0, insertPosition) +
      newSection +
      changelog.slice(insertPosition);
  } else {
    // If no unreleased section, add at the top after header
    const headerEnd = changelog.indexOf("\n\n") + 2;
    changelog =
      changelog.slice(0, headerEnd) + newSection + changelog.slice(headerEnd);
  }

  fs.writeFileSync(changelogPath, changelog);
  console.log("✅ CHANGELOG.md updated");
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage: node generate-release-notes.js <version> [fromTag]");
    console.error("Example: node generate-release-notes.js 1.2.0");
    process.exit(1);
  }

  const version = args[0];
  const fromTag = args[1] || getLatestTag();

  console.log("📋 Release Notes Generator");
  console.log("=========================");
  console.log(`New Version: ${version}`);
  console.log(`Comparing from: ${fromTag}`);
  console.log("");

  // Gather data
  console.log("📊 Analyzing changes...");
  const commits = getCommitsBetween(fromTag);
  const changedFiles = getChangedFiles(fromTag);

  console.log(
    `Found ${commits.length} commits and ${changedFiles.length} changed files`
  );
  console.log("");

  if (commits.length === 0) {
    console.warn("⚠️  No commits found between releases");
    console.warn("This might be a re-release or tag issue");
    console.log("");
    console.log("📝 Creating minimal changelog entry for re-release...");

    // Create a minimal changelog entry for re-releases
    const minimalReleaseNotes = {
      summary: "Re-release of existing version with build/packaging updates.",
      features: [],
      fixes: [],
      breaking: [],
      improvements: [],
    };

    // Update CHANGELOG.md with minimal entry
    updateChangelog(version, minimalReleaseNotes);

    console.log("✅ Done! CHANGELOG.md has been updated with minimal entry.");
    console.log("This is a re-release with no code changes.");
    process.exit(0);
  }

  // Generate release notes
  const releaseNotes = await generateReleaseNotes(
    version,
    fromTag,
    commits,
    changedFiles
  );

  // Update CHANGELOG.md
  updateChangelog(version, releaseNotes);

  // Output for verification
  console.log("");
  console.log("📝 Generated Release Notes:");
  console.log("===========================");
  console.log(formatAsChangelog(version, releaseNotes));

  console.log("✅ Done! CHANGELOG.md has been updated.");
  console.log("Review the changes and commit if satisfied.");
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
