# Self-Managing Documentation System Design

## Question 2: How to Make Docs Auto-Update with UX Changes?

Design for an automated, agent-driven system that keeps user documentation screenshots current as the application evolves.

---

## Vision: Documentation That Never Goes Stale 🎯

**Goal:** When a component's UX changes, documentation automatically:
1. Detects the change
2. Regenerates affected screenshots
3. Updates user guide content
4. Creates a PR for review
5. Notifies team of significant changes

**Key Principle:** Documentation is a first-class artifact that updates automatically with code changes, not a manual afterthought.

---

## System Architecture

### High-Level Flow

```
┌─────────────────┐
│  Code Change    │ (Developer commits to PR)
│  (Component)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Change         │ (GitHub Actions)
│  Detection      │ Analyzes git diff, identifies changed components
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Screenshot     │ (Maps components → screenshots)
│  Impact Map     │ Identifies which screenshots need regeneration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Regenerate     │ (Playwright + Storybook)
│  Screenshots    │ Generates new screenshots for affected components
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Visual Diff    │ (Playwright visual regression)
│  Analysis       │ Compares old vs new screenshots
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Documentation  │ (AI Agent)
│  Update Check   │ Reviews user guide for outdated content
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create PR      │ (GitHub Actions)
│  or Comment     │ Commits updated screenshots, notifies team
└─────────────────┘
```

---

## Component 1: Change Detection System 🔍

### Implementation: Git Diff Analysis

**Trigger:** Every PR that touches frontend code

**GitHub Actions Workflow:**

```yaml
# .github/workflows/docs-auto-update.yml
name: Documentation Auto-Update

on:
  pull_request:
    paths:
      - 'frontend/src/components/**'
      - 'frontend/src/pages/**'
      - 'frontend/src/theme/**'

jobs:
  detect-doc-impact:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for diff

      - name: Analyze Changed Components
        run: |
          node .github/scripts/detect-doc-impact.js

      - name: Regenerate Screenshots
        if: steps.analyze.outputs.screenshots_affected == 'true'
        run: |
          npm run screenshots:generate:affected

      - name: Visual Diff Analysis
        run: |
          npm run test:visual:update

      - name: Create Documentation PR
        if: steps.visual-diff.outputs.changes_detected == 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          title: "docs: Auto-update screenshots for PR #${{ github.event.number }}"
          body: |
            ## Automated Documentation Update

            This PR was automatically created because PR #${{ github.event.number }} modified components that affect user documentation.

            **Changed Components:**
            ${{ steps.analyze.outputs.changed_components }}

            **Affected Screenshots:**
            ${{ steps.analyze.outputs.affected_screenshots }}

            **Visual Changes:**
            See attached visual diff report.

            **Action Required:**
            - [ ] Review visual changes
            - [ ] Update user guide text if needed
            - [ ] Verify screenshots are accurate

            cc: @${{ github.event.pull_request.user.login }}
          branch: internal-docs/auto-update-${{ github.event.number }}
          labels: documentation, automated
```

---

### Change Detection Script

**File:** `.github/scripts/detect-doc-impact.js`

```javascript
/**
 * Analyzes git diff to detect component changes that affect documentation
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Component → Screenshot mapping
const COMPONENT_SCREENSHOT_MAP = {
  'components/grid/NineBoxGrid.tsx': [
    'grid-normal',
    'quickstart-grid-populated',
    'hero-grid-sample',
    'donut-mode-active-layout',
  ],
  'components/grid/EmployeeTile.tsx': [
    'employee-tile-normal',
    'changes-orange-border',
    'details-flag-badges',
  ],
  'components/panel/EmployeeDetails.tsx': [
    'changes-employee-details',
    'details-current-assessment',
  ],
  'components/panel/IntelligencePanel.tsx': [
    'calibration-intelligence-anomalies',
  ],
  'components/layout/AppBar.tsx': [
    'view-controls-simplified-appbar',
    'quickstart-file-menu-button',
    'view-controls-main-interface',
  ],
  // ... complete mapping
};

async function detectChanges() {
  // Get changed files in PR
  const baseBranch = process.env.GITHUB_BASE_REF || 'main';
  const changedFiles = execSync(
    `git diff --name-only origin/${baseBranch}...HEAD`,
    { encoding: 'utf-8' }
  )
    .split('\n')
    .filter(Boolean);

  console.log('Changed files:', changedFiles);

  // Map changed files to affected screenshots
  const affectedScreenshots = new Set();
  const changedComponents = [];

  for (const file of changedFiles) {
    if (file.startsWith('frontend/src/')) {
      const relativePath = file.replace('frontend/src/', '');

      // Check if file affects screenshots
      for (const [componentPath, screenshots] of Object.entries(COMPONENT_SCREENSHOT_MAP)) {
        if (relativePath.includes(componentPath) || componentPath.includes(relativePath)) {
          changedComponents.push(relativePath);
          screenshots.forEach(s => affectedScreenshots.add(s));
        }
      }
    }
  }

  // Output results
  console.log('Changed components:', changedComponents);
  console.log('Affected screenshots:', Array.from(affectedScreenshots));

  // Set GitHub Actions outputs
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `screenshots_affected=${affectedScreenshots.size > 0}\n`);
    fs.appendFileSync(outputFile, `changed_components=${changedComponents.join(', ')}\n`);
    fs.appendFileSync(outputFile, `affected_screenshots=${Array.from(affectedScreenshots).join(', ')}\n`);
  }

  // Write affected screenshots to file for next step
  fs.writeFileSync(
    '.affected-screenshots.json',
    JSON.stringify(Array.from(affectedScreenshots), null, 2)
  );

  return {
    changedComponents,
    affectedScreenshots: Array.from(affectedScreenshots),
  };
}

detectChanges().catch(err => {
  console.error('Error detecting changes:', err);
  process.exit(1);
});
```

---

## Component 2: Automated Screenshot Regeneration 📸

### Implementation: Selective Screenshot Generation

**Script:** `frontend/scripts/regenerate-affected-screenshots.js`

```javascript
/**
 * Regenerates only the screenshots affected by code changes
 */

import { execSync } from 'child_process';
import fs from 'fs';

async function regenerateAffectedScreenshots() {
  // Read affected screenshots from previous step
  const affectedScreenshots = JSON.parse(
    fs.readFileSync('.affected-screenshots.json', 'utf-8')
  );

  if (affectedScreenshots.length === 0) {
    console.log('No screenshots affected by changes.');
    return;
  }

  console.log(`Regenerating ${affectedScreenshots.length} screenshots...`);

  // Regenerate each affected screenshot
  for (const screenshotId of affectedScreenshots) {
    console.log(`Regenerating: ${screenshotId}`);

    try {
      execSync(
        `npm run screenshots:generate ${screenshotId}`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.error(`Failed to regenerate ${screenshotId}:`, error.message);
      // Continue with other screenshots
    }
  }

  console.log('Screenshot regeneration complete.');
}

regenerateAffectedScreenshots();
```

**Package.json script:**

```json
{
  "scripts": {
    "screenshots:generate:affected": "node scripts/regenerate-affected-screenshots.js"
  }
}
```

---

## Component 3: Component Metadata System 📋

### Implementation: JSDoc Annotations

**Annotate components with screenshot metadata:**

```typescript
/**
 * NineBoxGrid Component
 *
 * Displays employees in a 3x3 grid based on performance and potential ratings.
 *
 * @component
 * @screenshots
 *   - grid-normal: Standard 9-box grid with employee tiles
 *   - quickstart-grid-populated: Populated grid after successful file upload
 *   - hero-grid-sample: Hero image showing full grid with sample data
 *   - donut-mode-active-layout: Active donut mode layout with concentric circles
 *
 * @example
 * <NineBoxGrid
 *   employees={employees}
 *   viewMode="grid"
 *   onEmployeeClick={handleClick}
 * />
 */
export const NineBoxGrid: React.FC<NineBoxGridProps> = ({ ... }) => {
  // ...
};
```

**Script to extract metadata:**

```javascript
/**
 * Extracts screenshot metadata from component JSDoc comments
 */

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

function extractScreenshotMetadata() {
  const componentFiles = globSync('frontend/src/components/**/*.tsx');
  const mapping = {};

  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Parse JSDoc @screenshots annotation
    const screenshotMatch = content.match(/@screenshots\n([\s\S]*?)(?=\n \*\/|\n \* @)/);

    if (screenshotMatch) {
      const screenshotLines = screenshotMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('*   -'))
        .map(line => {
          const match = line.match(/\* {3}- ([^:]+):/);
          return match ? match[1].trim() : null;
        })
        .filter(Boolean);

      if (screenshotLines.length > 0) {
        const relativePath = file.replace('frontend/src/', '');
        mapping[relativePath] = screenshotLines;
      }
    }
  }

  // Write mapping to file
  fs.writeFileSync(
    '.github/component-screenshot-map.json',
    JSON.stringify(mapping, null, 2)
  );

  console.log('Extracted screenshot metadata from', Object.keys(mapping).length, 'components');
  return mapping;
}

extractScreenshotMetadata();
```

**Benefits:**
- ✅ Documentation lives with code (single source of truth)
- ✅ Developers see which screenshots their changes affect
- ✅ Automated extraction for CI/CD
- ✅ Easy to maintain and update

---

## Component 4: Visual Regression System 👁️

### Implementation: Playwright Visual Testing

**Extend existing visual tests to detect documentation changes:**

```typescript
// frontend/playwright/visual-regression/screenshot-validation.spec.ts

import { test, expect } from '@playwright/test';
import { screenshotConfig } from '../screenshots/config';

test.describe('Documentation Screenshot Validation', () => {
  for (const [screenshotId, metadata] of Object.entries(screenshotConfig)) {
    if (metadata.manual) continue; // Skip manual screenshots

    test(`${screenshotId} matches baseline`, async ({ page }) => {
      // Generate screenshot
      await generateScreenshot(page, screenshotId);

      // Compare against baseline
      await expect(page).toHaveScreenshot(`${screenshotId}-baseline.png`, {
        maxDiffPixelRatio: 0.05, // 5% tolerance
        threshold: 0.2,
      });
    });
  }
});
```

**Visual diff report generation:**

```javascript
// .github/scripts/generate-visual-diff-report.js

import fs from 'fs';
import path from 'path';

function generateVisualDiffReport(resultsDir) {
  const results = [];

  // Read Playwright visual regression results
  const reportPath = path.join(resultsDir, 'playwright-report', 'results.json');
  const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  // Extract visual differences
  for (const test of reportData.suites[0].specs) {
    if (test.ok === false && test.tests[0].results[0].attachments) {
      const attachments = test.tests[0].results[0].attachments;
      const diff = attachments.find(a => a.name === 'diff');

      if (diff) {
        results.push({
          screenshot: test.title.replace(' matches baseline', ''),
          diffPath: diff.path,
          diffPixels: test.tests[0].results[0].error?.matcherResult?.diffPixelRatio,
        });
      }
    }
  }

  // Generate HTML report
  const html = generateHTMLReport(results);
  fs.writeFileSync('visual-diff-report.html', html);

  return results;
}

function generateHTMLReport(results) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Visual Diff Report</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .diff-item { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; }
        img { max-width: 100%; }
      </style>
    </head>
    <body>
      <h1>Documentation Screenshot Changes</h1>
      <p>Found ${results.length} screenshot(s) with visual changes.</p>
      ${results.map(r => `
        <div class="diff-item">
          <h3>${r.screenshot}</h3>
          <p>Diff pixels: ${(r.diffPixels * 100).toFixed(2)}%</p>
          <img src="${r.diffPath}" alt="Visual diff for ${r.screenshot}">
        </div>
      `).join('')}
    </body>
    </html>
  `;
}
```

---

## Component 5: AI Agent Documentation Reviewer 🤖

### Implementation: Weekly Documentation Audit

**GitHub Actions Workflow:**

```yaml
# .github/workflows/docs-audit.yml
name: Weekly Documentation Audit

on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  audit-documentation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run AI Documentation Audit
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          node .github/scripts/ai-docs-audit.js

      - name: Create Issue if Problems Found
        if: steps.audit.outputs.issues_found == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            const issueBody = require('.audit-results.json');
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '📋 Weekly Documentation Audit Results',
              body: issueBody.summary,
              labels: ['documentation', 'audit', 'automated'],
            });
```

**AI Audit Script:**

```javascript
// .github/scripts/ai-docs-audit.js

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import { globSync } from 'glob';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function auditDocumentation() {
  console.log('Starting AI-powered documentation audit...');

  // 1. Analyze git history for recent component changes
  const recentChanges = getRecentComponentChanges(7); // Last 7 days

  // 2. Read user guide documentation
  const userGuideDocs = readUserGuideDocs();

  // 3. Read component code
  const componentCode = readComponentCode(recentChanges.map(c => c.file));

  // 4. Analyze with Claude
  const auditResults = await analyzeWithClaude({
    recentChanges,
    userGuideDocs,
    componentCode,
  });

  // 5. Generate report
  const report = generateAuditReport(auditResults);

  // 6. Save results
  fs.writeFileSync('.audit-results.json', JSON.stringify(report, null, 2));

  // 7. Set GitHub Actions output
  const hasIssues = auditResults.outdatedDocs.length > 0 ||
                    auditResults.missingScreenshots.length > 0 ||
                    auditResults.newFeaturesUndocumented.length > 0;

  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `issues_found=${hasIssues}\n`);
  }

  return report;
}

async function analyzeWithClaude({ recentChanges, userGuideDocs, componentCode }) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a technical documentation auditor for a React application.

**Your Task:** Analyze recent code changes and identify documentation issues.

**Recent Component Changes (last 7 days):**
${JSON.stringify(recentChanges, null, 2)}

**Current User Guide Documentation:**
${userGuideDocs.map(doc => `
### ${doc.path}
${doc.content.substring(0, 1000)}...
`).join('\n\n')}

**Component Code:**
${componentCode.map(c => `
### ${c.path}
\`\`\`typescript
${c.content.substring(0, 2000)}...
\`\`\`
`).join('\n\n')}

**Please analyze and identify:**

1. **Outdated Documentation:** Docs that reference old component behavior/UI that has changed
2. **Missing Screenshots:** Features shown in code but not documented with screenshots
3. **New Features Undocumented:** New component props, features, or UX changes not mentioned in docs
4. **Incorrect Instructions:** Steps in the user guide that no longer work due to code changes

**Return your analysis as JSON:**
{
  "outdatedDocs": [
    {
      "docPath": "path/to/doc.md",
      "issue": "Description of what's outdated",
      "componentChanged": "Component that changed",
      "suggestedFix": "What should be updated"
    }
  ],
  "missingScreenshots": [
    {
      "feature": "Feature name",
      "component": "Component path",
      "suggestedScreenshot": "Description of screenshot needed"
    }
  ],
  "newFeaturesUndocumented": [
    {
      "feature": "Feature name",
      "component": "Component path",
      "addedDate": "ISO date",
      "description": "What the feature does"
    }
  ],
  "incorrectInstructions": [
    {
      "docPath": "path/to/doc.md",
      "oldInstruction": "What the doc says",
      "actualBehavior": "How it actually works now",
      "suggestedFix": "Corrected instruction"
    }
  ]
}`,
      },
    ],
  });

  // Parse Claude's JSON response
  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Claude did not return valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}

function generateAuditReport(auditResults) {
  const summary = `
## 📋 Weekly Documentation Audit Results

**Audit Date:** ${new Date().toISOString().split('T')[0]}

### Summary

- 🟥 **Outdated Docs:** ${auditResults.outdatedDocs.length} found
- 📸 **Missing Screenshots:** ${auditResults.missingScreenshots.length} found
- 🆕 **New Features Undocumented:** ${auditResults.newFeaturesUndocumented.length} found
- ⚠️ **Incorrect Instructions:** ${auditResults.incorrectInstructions.length} found

---

### Outdated Documentation

${auditResults.outdatedDocs.map(item => `
- **${item.docPath}**
  - Issue: ${item.issue}
  - Component Changed: \`${item.componentChanged}\`
  - Suggested Fix: ${item.suggestedFix}
`).join('\n')}

---

### Missing Screenshots

${auditResults.missingScreenshots.map(item => `
- **${item.feature}**
  - Component: \`${item.component}\`
  - Suggested Screenshot: ${item.suggestedScreenshot}
`).join('\n')}

---

### New Features Undocumented

${auditResults.newFeaturesUndocumented.map(item => `
- **${item.feature}** (added ${item.addedDate})
  - Component: \`${item.component}\`
  - Description: ${item.description}
`).join('\n')}

---

### Incorrect Instructions

${auditResults.incorrectInstructions.map(item => `
- **${item.docPath}**
  - Old Instruction: "${item.oldInstruction}"
  - Actual Behavior: "${item.actualBehavior}"
  - Suggested Fix: "${item.suggestedFix}"
`).join('\n')}

---

### Recommended Actions

1. Review and update outdated documentation
2. Generate missing screenshots using \`npm run screenshots:generate\`
3. Document new features in appropriate user guide sections
4. Correct instruction steps to match current UX

**Auto-generated by AI Documentation Auditor**
`;

  return {
    summary,
    details: auditResults,
  };
}

// Helper functions
function getRecentComponentChanges(days) {
  // Use git log to get recent changes
  // ... implementation
}

function readUserGuideDocs() {
  return globSync('resources/user-guide/internal-docs/**/*.md').map(path => ({
    path,
    content: fs.readFileSync(path, 'utf-8'),
  }));
}

function readComponentCode(files) {
  return files.map(path => ({
    path,
    content: fs.readFileSync(path, 'utf-8'),
  }));
}

auditDocumentation().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
```

---

## Component 6: Screenshot Coverage Tracker 📊

### Implementation: Dashboard for Screenshot Health

**Create a screenshot coverage report:**

```javascript
// .github/scripts/screenshot-coverage.js

import fs from 'fs';
import { screenshotConfig } from '../../frontend/playwright/screenshots/config.js';
import { globSync } from 'glob';

function analyzeScreenshotCoverage() {
  const components = globSync('frontend/src/components/**/*.tsx');
  const stories = globSync('frontend/src/**/*.stories.tsx');

  const coverage = {
    totalComponents: components.length,
    componentsWithStories: 0,
    componentsWithScreenshots: 0,
    totalScreenshots: Object.keys(screenshotConfig).length,
    storybookScreenshots: 0,
    fullAppScreenshots: 0,
    manualScreenshots: 0,
    componentBreakdown: [],
  };

  // Analyze each component
  for (const componentPath of components) {
    const relativePath = componentPath.replace('frontend/src/', '');
    const componentName = relativePath.split('/').pop().replace('.tsx', '');

    // Check if has story
    const hasStory = stories.some(s => s.includes(componentName));

    // Check if has screenshots
    const screenshots = findScreenshotsForComponent(relativePath);

    if (hasStory) coverage.componentsWithStories++;
    if (screenshots.length > 0) coverage.componentsWithScreenshots++;

    coverage.componentBreakdown.push({
      path: relativePath,
      name: componentName,
      hasStory,
      screenshots: screenshots,
    });
  }

  // Count screenshot types
  for (const metadata of Object.values(screenshotConfig)) {
    if (metadata.manual) {
      coverage.manualScreenshots++;
    } else if (metadata.source === 'storybook') {
      coverage.storybookScreenshots++;
    } else {
      coverage.fullAppScreenshots++;
    }
  }

  // Generate report
  const report = generateCoverageReport(coverage);

  fs.writeFileSync('.screenshot-coverage-report.json', JSON.stringify(coverage, null, 2));
  fs.writeFileSync('.screenshot-coverage-report.md', report);

  console.log('Screenshot coverage report generated.');
  return coverage;
}

function generateCoverageReport(coverage) {
  const storybookPercent = ((coverage.storybookScreenshots / coverage.totalScreenshots) * 100).toFixed(1);
  const componentStoryPercent = ((coverage.componentsWithStories / coverage.totalComponents) * 100).toFixed(1);

  return `
# Screenshot Coverage Report

**Generated:** ${new Date().toISOString()}

## Summary Statistics

- **Total Components:** ${coverage.totalComponents}
- **Components with Stories:** ${coverage.componentsWithStories} (${componentStoryPercent}%)
- **Components with Screenshots:** ${coverage.componentsWithScreenshots}

## Screenshot Breakdown

- **Total Screenshots:** ${coverage.totalScreenshots}
- **Storybook Screenshots:** ${coverage.storybookScreenshots} (${storybookPercent}%)
- **Full-App Screenshots:** ${coverage.fullAppScreenshots}
- **Manual Screenshots:** ${coverage.manualScreenshots}

## Coverage Goals

- ✅ **Storybook Coverage:** ${storybookPercent}% (Target: 40%)
- ${componentStoryPercent >= 50 ? '✅' : '❌'} **Component Story Coverage:** ${componentStoryPercent}% (Target: 50%)

## Components Without Stories

${coverage.componentBreakdown
  .filter(c => !c.hasStory)
  .map(c => `- ${c.path}`)
  .join('\n')}

## Components Without Screenshots

${coverage.componentBreakdown
  .filter(c => c.screenshots.length === 0)
  .map(c => `- ${c.path}`)
  .join('\n')}

## Recommendations

1. Create stories for components without stories (improve testability)
2. Add screenshot coverage for components shown in user docs
3. Migrate full-app screenshots to Storybook where possible
`;
}

analyzeScreenshotCoverage();
```

**Add to GitHub Actions:**

```yaml
# .github/workflows/screenshot-coverage.yml
name: Screenshot Coverage Report

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate Coverage Report
        run: node .github/scripts/screenshot-coverage.js

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: screenshot-coverage-report
          path: .screenshot-coverage-report.*
```

---

## Component 7: New Feature Detection 🆕

### Implementation: PR Checklist Enforcement

**GitHub Actions to remind developers:**

```yaml
# .github/workflows/pr-docs-check.yml
name: PR Documentation Check

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for New User-Facing Features
        id: check
        run: |
          node .github/scripts/detect-new-features.js

      - name: Comment on PR
        if: steps.check.outputs.new_features_detected == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            const features = JSON.parse(process.env.FEATURES);

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 📸 Documentation Reminder

This PR adds new user-facing features that may need documentation:

${features.map(f => `- **${f.name}** in \`${f.component}\``).join('\n')}

**Please ensure:**
- [ ] User guide updated with feature description
- [ ] Screenshots generated for new UI elements
- [ ] Example workflows added if applicable

Run \`npm run screenshots:generate\` to update screenshots.
Run \`npm run docs:preview\` to preview user guide changes.
              `,
            });
        env:
          FEATURES: ${{ steps.check.outputs.features }}
```

**Feature detection script:**

```javascript
// .github/scripts/detect-new-features.js

import { execSync } from 'child_process';
import fs from 'fs';

function detectNewFeatures() {
  // Get diff for this PR
  const diff = execSync('git diff origin/main...HEAD', { encoding: 'utf-8' });

  const newFeatures = [];

  // Heuristics for detecting new user-facing features:
  // 1. New React components exported
  // 2. New props added to existing components
  // 3. New routes added
  // 4. New menu items or buttons

  // Check for new exported components
  const newComponentPattern = /export (?:const|function) (\w+)(?:Component)?(?:: React\.FC|= \(\))/g;
  let match;

  while ((match = newComponentPattern.exec(diff)) !== null) {
    const componentName = match[1];

    // Check if this is a newly added export (starts with +)
    const linesBefore = diff.substring(0, match.index).split('\n');
    const lastLine = linesBefore[linesBefore.length - 1];

    if (lastLine.startsWith('+')) {
      newFeatures.push({
        name: componentName,
        type: 'component',
        component: 'New Component',
      });
    }
  }

  // Check for new props in component interfaces
  const newPropPattern = /interface (\w+Props) \{[\s\S]*?\n\+  (\w+)[\?:]:/g;

  while ((match = newPropPattern.exec(diff)) !== null) {
    const [, interfaceName, propName] = match;

    newFeatures.push({
      name: `New prop: ${propName}`,
      type: 'prop',
      component: interfaceName.replace('Props', ''),
    });
  }

  // Output results
  console.log('New features detected:', newFeatures);

  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `new_features_detected=${newFeatures.length > 0}\n`);
    fs.appendFileSync(outputFile, `features=${JSON.stringify(newFeatures)}\n`);
  }

  return newFeatures;
}

detectNewFeatures();
```

---

## System Integration Overview 🔗

### How All Components Work Together

```
Developer Makes Change
         │
         ▼
┌────────────────────┐
│   Git Push to PR   │
└────────┬───────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  DETECTION LAYER                                │
│  - Change Detection (git diff)                  │
│  - Component Metadata Extraction (JSDoc)        │
│  - Screenshot Impact Mapping                    │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  REGENERATION LAYER                             │
│  - Selective Screenshot Generation              │
│  - Visual Regression Testing                    │
│  - Diff Analysis                                │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  REVIEW LAYER                                   │
│  - AI Documentation Audit                       │
│  - Coverage Analysis                            │
│  - New Feature Detection                        │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  UPDATE LAYER                                   │
│  - Create Documentation PR                      │
│  - Post PR Comments                             │
│  - Create GitHub Issues                         │
└────────┬────────────────────────────────────────┘
         │
         ▼
    Team Review & Merge
```

---

## Implementation Roadmap 🗓️

### Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up change detection system
- Create component-screenshot mapping
- Implement selective screenshot regeneration

**Deliverables:**
- ✅ `.github/scripts/detect-doc-impact.js`
- ✅ `.github/workflows/docs-auto-update.yml`
- ✅ Component metadata extraction script
- ✅ Updated `package.json` scripts

---

### Phase 2: Visual Regression (Week 3)

**Goals:**
- Extend Playwright visual tests
- Generate visual diff reports
- Integrate with PR workflow

**Deliverables:**
- ✅ Visual regression test suite
- ✅ Visual diff HTML report generation
- ✅ PR comments with diff images

---

### Phase 3: AI Audit (Week 4-5)

**Goals:**
- Implement weekly AI documentation audit
- Create audit report format
- Set up issue creation for findings

**Deliverables:**
- ✅ `.github/scripts/ai-docs-audit.js`
- ✅ `.github/workflows/docs-audit.yml`
- ✅ Automated issue creation

---

### Phase 4: Coverage & Enforcement (Week 6)

**Goals:**
- Screenshot coverage tracking
- New feature detection
- PR documentation reminders

**Deliverables:**
- ✅ Coverage dashboard
- ✅ PR checklist enforcement
- ✅ Feature detection heuristics

---

## Success Metrics 📈

**Track these metrics to measure system effectiveness:**

1. **Documentation Freshness**
   - % of screenshots updated within 7 days of component change
   - Target: >90%

2. **Coverage**
   - % of components with Storybook stories
   - Target: >50%
   - % of screenshots using Storybook
   - Target: >40%

3. **Automation Rate**
   - % of documentation PRs auto-generated vs manual
   - Target: >70%

4. **Issue Detection**
   - Number of stale docs detected by AI audit
   - Target: <5 per week (decreasing over time)

5. **Developer Friction**
   - Time to update docs after feature change
   - Target: <15 minutes (mostly automated)

---

## Cost & Maintenance Considerations 💰

### GitHub Actions Minutes

**Estimated usage:**
- Per PR: ~5-10 minutes (change detection + screenshot regen)
- Weekly audit: ~15-20 minutes (AI analysis)
- Weekly coverage report: ~5 minutes

**Monthly total:** ~300-400 minutes (free tier includes 2,000 minutes)

### Anthropic API Costs

**Weekly AI audit:**
- Input tokens: ~50K tokens (reading docs + code)
- Output tokens: ~5K tokens (audit results)
- Cost per audit: ~$0.50-1.00
- Monthly cost: ~$2-4

### Maintenance Burden

**Ongoing tasks:**
- Update component-screenshot mapping as components change
- Review and merge auto-generated documentation PRs
- Tune visual regression thresholds
- Update AI audit prompts as needed

**Estimated time:** 1-2 hours per week

---

## Rollout Strategy 🚀

### Stage 1: Silent Monitoring (Week 1-2)

- Run detection scripts but don't create PRs
- Monitor accuracy of change detection
- Tune component-screenshot mapping
- Validate screenshot regeneration quality

### Stage 2: PR Comments Only (Week 3-4)

- Post comments on PRs about affected screenshots
- Don't auto-regenerate yet
- Gather feedback from developers
- Refine detection logic

### Stage 3: Auto-Regeneration (Week 5-6)

- Enable automatic screenshot regeneration
- Create PRs for review (don't auto-merge)
- Monitor false positive rate
- Adjust thresholds

### Stage 4: Full Automation (Week 7+)

- Enable weekly AI audits
- Auto-create issues for findings
- Fully automated documentation pipeline
- Continuous monitoring and refinement

---

## Questions & Answers

**Q: What if the AI audit creates too many false positives?**

A: Start with high confidence thresholds and gradually lower them. Review the first month of audits manually to tune prompts. Add a "dismiss false positive" workflow.

**Q: How do we handle breaking changes that require manual documentation updates?**

A: The system detects changes and creates PRs/issues, but human review is always required before merging. Breaking changes should trigger PR comments reminding developers to update docs.

**Q: What if a developer changes multiple components in one PR?**

A: The system regenerates all affected screenshots and creates a single documentation PR. The PR description lists all changes and affected docs.

**Q: How do we prevent screenshot churn from minor pixel changes?**

A: Use visual regression thresholds (5% diff tolerance). Only create PRs for significant visual changes. Tune thresholds based on historical data.

**Q: What about documentation for backend/API changes?**

A: Extend the system to monitor backend changes and update API documentation. Use similar detection + AI audit approach.

---

## Conclusion

This self-managing documentation system ensures:

✅ **Automatic detection** of UX changes affecting docs
✅ **Selective regeneration** of affected screenshots
✅ **AI-powered audits** to catch stale documentation
✅ **Developer reminders** for new features
✅ **Coverage tracking** to monitor documentation health
✅ **Minimal maintenance** burden (1-2 hours/week)

**Next Steps:**
1. Review and approve this design
2. Implement Phase 1 (foundation) over 2 weeks
3. Test with a few PRs to validate approach
4. Gradually roll out full automation

**Expected Outcome:**
- Documentation stays fresh automatically
- Developers spend minimal time on docs
- User guide always reflects current UX
- No more stale screenshots!
