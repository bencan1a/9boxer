# AI Documentation Audit System

## Overview

The AI Documentation Audit System is an automated workflow that uses Claude API to analyze code changes and identify documentation issues. It runs weekly and creates **two consolidated GitHub issues**: one for internal documentation (for AI agents) and one for user documentation (for end users).

**Key Features:**
- **Separate Analysis**: Internal docs and user docs analyzed with different contexts and criteria
- **Active Consolidation**: Identifies new internal docs and recommends merging into core docs
- **Consolidated Issues**: One issue per documentation type with tasks grouped by priority
- **Full Context**: User docs analyzed with full content to identify cross-references
- **Priority Indicators**: Clear visual priority markers in generated issues

## Components

### 1. Audit Script (`.github/scripts/ai-docs-audit.js`)

The core script that performs the documentation audit:

**What it does:**
- Analyzes recent code changes (default: last 7 days)
- Performs **two separate analyses**:
  1. **Internal docs** (for AI agents): Reviews CLAUDE.md, internal-docs/, agent instructions
  2. **User docs** (for end users): Reviews resources/user-guide/ with full content
- Identifies new internal docs created in last 30 days for consolidation
- Uses Claude API with specialized prompts for each documentation type
- Creates **two consolidated GitHub issues** (one for internal, one for user)
- Generates a comprehensive audit report

**Internal Docs Issue Types:**
- **outdated**: Agent instructions that no longer match current code
- **missing**: New features not in CLAUDE.md or internal docs
- **conflict**: Contradictory guidance in different docs
- **consolidation**: New docs that should be merged into core docs
- **stale-example**: Code examples >30 days old without verification

**User Docs Issue Types:**
- **outdated**: Documentation that no longer reflects current UI/features
- **missing**: New user-visible features not documented
- **incorrect**: Instructions that don't match actual behavior
- **screenshot-needed**: Screenshots that may be outdated
- **accessibility**: Missing alt text, poor heading hierarchy
- **localization**: Idioms or complex language that won't translate well

**Priority Levels:**
- **critical**: Completely missing docs for major features, blocking issues
- **high**: Important issues affecting usability
- **medium**: Noticeable issues that should be fixed soon
- **low**: Minor issues, nice-to-have improvements

### 2. Documentation Separation Strategy

**Why Separate Internal and User Docs?**

Internal docs and user docs serve fundamentally different audiences and have different requirements:

| Aspect | Internal Docs (Agents) | User Docs (End Users) |
|--------|------------------------|----------------------|
| **Audience** | AI agents working on codebase | End users of the application |
| **Purpose** | Enable agents to understand and modify code | Help users accomplish tasks |
| **Style** | Present tense, actionable commands, technical | Conversational, second person, accessible |
| **Quality Bar** | Factual accuracy, no conflicts, current state only | Screenshots, tone, i18n-ready, accessible |
| **Update Workflow** | Edit in place, consolidate new docs | Screenshot regeneration, localization |
| **Key Principle** | Anti-proliferation: update existing, don't add new | Comprehensive coverage with visuals |

**Consequences of Mixing:**
- ❌ AI analyzes user screenshots with agent criteria (irrelevant)
- ❌ AI analyzes internal docs with user criteria (misses consolidation opportunities)
- ❌ Single consolidated issue mixes unrelated tasks
- ❌ Implementing agent gets confusing, fragmented view

**Solution:**
- ✅ Two separate Claude API calls with specialized prompts
- ✅ Internal docs analysis focuses on consolidation and conflicts
- ✅ User docs analysis focuses on cross-references and accessibility
- ✅ Two consolidated issues with clear, focused tasks

### 3. Active Documentation Consolidation

**Problem:** Agents often create new internal docs when working on features, leading to proliferation and fragmentation.

**Solution:** The audit system automatically:

1. **Detects new internal docs** (created in last 30 days)
2. **Analyzes their content** with full context
3. **Recommends consolidation** into existing core docs
4. **Provides specific merge plan**:
   - Which core doc to update
   - What content to extract
   - Which section to update
   - Recommends deletion of new doc after merge

**Example Consolidation Task:**
```markdown
### Consolidate new documentation into core docs

**Location:** `internal-docs/new-feature-explanation.md`
**Type:** consolidation

**Issue:**
New internal doc created 15 days ago documenting the visual regression system.
This information should be integrated into existing testing documentation.

**Action:**
1. Extract valuable info from `internal-docs/new-feature-explanation.md`
2. Update `internal-docs/testing/visual-regression.md` section "How It Works"
3. Add any new examples to the existing workflow section
4. Delete `internal-docs/new-feature-explanation.md` after consolidation

**Consolidation Plan:**
- Source: `internal-docs/new-feature-explanation.md`
- Target: `internal-docs/testing/visual-regression.md`
- Extract: Screenshot detection logic and component metadata details
- Update Section: "How It Works" and "Component Metadata"
- ⚠️ **Delete source doc after consolidation**
```

**Core Internal Docs (Never Consolidated Away):**
- `CLAUDE.md` - Main entry point for AI agents
- `AGENTS.md` - Development workflow guidance
- `internal-docs/architecture/` - System design
- `internal-docs/design-system/` - UI component guidelines
- `internal-docs/testing/` - Testing strategies
- `internal-docs/i18n/` - Internationalization
- `internal-docs/contributing/` - Writing standards

### 4. GitHub Actions Workflow (`.github/workflows/docs-audit.yml`)

Automated workflow that runs the audit:

**Schedule:**
- Runs every Monday at 2 AM UTC
- Can be manually triggered via workflow_dispatch

**Inputs:**
- `days`: Number of days to look back for changes (default: 7)
- `dry_run`: Run without creating GitHub issues (default: false)

**Outputs:**
- Creates **two consolidated GitHub issues**:
  - `Internal Documentation Updates (Week of YYYY-MM-DD)` (label: `internal-documentation`)
  - `User Documentation Updates (Week of YYYY-MM-DD)` (label: `user-documentation`)
- Each issue contains:
  - Tasks grouped by priority (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low)
  - Specific, actionable steps for each task
  - Consolidation plans for new internal docs
  - Flags for user docs (needs_screenshot, needs_i18n_review, needs_tone_review)
- Uploads comprehensive audit report as workflow artifact
- Posts summary comment with statistics

### 3. Unit Tests (`.github/scripts/__tests__/ai-docs-audit.test.js`)

Comprehensive test suite covering:
- Change detection from git history
- Documentation file loading
- Context building for Claude API
- GitHub issue creation
- Edge cases and error handling

## Usage

### Manual Trigger

Run the audit manually via GitHub Actions:

```bash
# Via GitHub UI:
# 1. Go to Actions tab
# 2. Select "AI Documentation Audit" workflow
# 3. Click "Run workflow"
# 4. Configure options (days, dry_run)
# 5. Click "Run workflow"

# Via gh CLI:
gh workflow run docs-audit.yml
gh workflow run docs-audit.yml -f days=14 -f dry_run=true
```

### Local Testing

Run the script locally for testing:

```bash
# Set up environment
export ANTHROPIC_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"

# Run audit (dry run mode)
node .github/scripts/ai-docs-audit.js --dry-run

# Run audit for last 14 days
node .github/scripts/ai-docs-audit.js --days=14

# Run audit and create issues
node .github/scripts/ai-docs-audit.js
```

### Run Tests

```bash
cd .github/scripts
npm test __tests__/ai-docs-audit.test.js
```

## Configuration

### Environment Variables

**Required:**
- `ANTHROPIC_API_KEY`: API key for Claude (stored in GitHub Secrets)
- `GITHUB_TOKEN`: Token for creating issues (auto-provided by GitHub Actions)

**Optional:**
- None (all configuration via command-line arguments)

### GitHub Secrets

The following secret must be configured in the repository:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your Anthropic API key from https://console.anthropic.com/

## How It Works

### 1. Change Analysis

The script analyzes git history to identify recent changes:

```javascript
// Get commits from last N days
git log --since="N.days.ago" --pretty=format:"%h|%s|%an|%ar"

// Get changed files
git diff --name-only HEAD~X HEAD
```

Changes are categorized:
- **Frontend**: `frontend/src/**/*`
- **Backend**: `backend/src/**/*`
- **Docs**: `resources/user-guide/**/*`

### 2. Documentation Loading

All markdown files in `resources/user-guide/docs/` are loaded recursively:

```javascript
// Load all .md files
const docs = loadDocumentation();
// Returns: [{ path, fullPath, content, size }, ...]
```

### 3. Context Building

A comprehensive context is built for Claude:

```javascript
const context = buildAuditContext(changes, docs);
```

The context includes:
- Recent commits (last 20)
- Changed files by category (last 30 per category)
- Documentation file summaries (first 10 lines each)
- Statistics (commits, files, categories)

### 4. Claude API Analysis

The context is sent to Claude with a structured prompt:

```javascript
const auditResults = await analyzeWithClaude(context);
```

Claude returns JSON with:
```json
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
    "totalIssues": 5,
    "byType": { "outdated": 2, "missing": 1, ... },
    "bySeverity": { "high": 1, "medium": 3, "low": 1 }
  }
}
```

### 5. Issue Creation

For each finding, a GitHub issue is created:

```javascript
const issues = await createGitHubIssues(findings, dryRun);
```

**Issue format:**
- **Title**: `[Docs Audit] {finding.title}`
- **Labels**:
  - Always: `documentation`
  - Severity: `priority: high` (if high)
  - Type: `screenshot`, `enhancement`, or `bug`
- **Body**: Structured template with issue details

### 6. Report Generation

A comprehensive report is saved:

```javascript
// Saved to: docs-audit-report.json
{
  "metadata": { generatedAt, generatedBy, daysScanned, dryRun },
  "changes": { stats, recentCommits },
  "documentation": { totalFiles, files },
  "findings": [...],
  "summary": {...},
  "issues": [...]
}
```

## Cost Estimation

**Claude API costs:**
- Model: `claude-sonnet-4-5-20250929`
- **Two API calls per audit** (internal + user docs)

**Internal Docs Audit:**
- Input: ~15,000-25,000 tokens (includes core docs + new docs for consolidation)
- Output: ~2,000-3,000 tokens
- Cost: ~$0.30-0.50 per audit

**User Docs Audit:**
- Input: ~20,000-40,000 tokens (FULL user docs content for cross-reference analysis)
- Output: ~2,000-4,000 tokens
- Cost: ~$0.40-0.80 per audit

**Total per Audit:** $0.70-1.30
**Monthly cost** (4 audits): **$2.80-5.20**

**Note**: Costs may vary based on:
- Amount of code changes
- Number of documentation files
- Number of new internal docs detected
- Complexity of analysis required

**Cost remains within budget** (~$2-4/month target from Issue #69), though slightly higher due to full user docs content analysis. The improved accuracy and consolidation features justify the marginal cost increase.

## Troubleshooting

### "ANTHROPIC_API_KEY environment variable is required"

**Problem**: API key not set
**Solution**: Configure the secret in GitHub Settings → Secrets

### "Failed to get recent changes"

**Problem**: Git history issues
**Solution**: Ensure the workflow has `fetch-depth: 0` to get full history

### "Claude API error: 401"

**Problem**: Invalid API key
**Solution**: Verify the API key is correct in GitHub Secrets

### "Failed to create issue"

**Problem**: GitHub token permissions
**Solution**: Ensure workflow has `issues: write` permission

### No issues created even though findings exist

**Problem**: Running in dry-run mode
**Solution**: Check workflow input parameters or remove `--dry-run` flag

## Maintenance

### Updating the Audit Logic

To modify what issues are detected:

1. Edit the prompt in `.github/scripts/ai-docs-audit.js`
2. Update the `analyzeWithClaude()` function
3. Test locally with `--dry-run`
4. Run unit tests: `npm test`

### Updating Issue Labels

To change issue labels:

1. Edit the `createGitHubIssues()` function
2. Modify the `labels` array based on finding type/severity
3. Ensure labels exist in the repository

### Adjusting Audit Frequency

To change when audits run:

1. Edit `.github/workflows/docs-audit.yml`
2. Modify the `cron` expression:
   - Current: `0 2 * * 1` (Monday at 2 AM UTC)
   - Daily: `0 2 * * *`
   - Bi-weekly: `0 2 * * 1,4` (Mon & Thu)

## Best Practices

### For Developers

1. **Review audit issues promptly**: High-severity issues indicate missing docs for new features
2. **Keep docs in sync**: Update documentation when changing features
3. **Test instructions**: Verify documented workflows actually work
4. **Update screenshots**: Regenerate screenshots when UI changes

### For Documentation Maintainers

1. **Prioritize high-severity issues**: Address missing docs first
2. **Batch screenshot updates**: Use automated screenshot tools when possible
3. **Verify with actual app**: Test all documented workflows
4. **Close resolved issues**: Update issue status when fixed

### For Repository Admins

1. **Monitor API costs**: Check Anthropic console for usage
2. **Review audit effectiveness**: Analyze issue close rates
3. **Adjust audit frequency**: If too noisy, reduce frequency
4. **Tune severity thresholds**: Adjust prompts if needed

## Integration with Existing Systems

### Self-Managing Documentation System

This audit system is part of the larger self-managing documentation ecosystem:

1. **Screenshot generation** (Phase 3): Automated screenshot capture
2. **Change detection** (Phase 2): Detects component changes affecting docs
3. **Visual regression** (Phase 3): Compares screenshots for differences
4. **AI audit** (Phase 4 - THIS): Identifies documentation issues ✓
5. **Auto-remediation** (Future): Automated doc fixes

### Related Workflows

- `.github/workflows/screenshots.yml`: Regenerates screenshots weekly
- `.github/workflows/docs-auto-update.yml`: Detects doc impact from PRs
- `.github/workflows/visual-regression.yml`: Compares screenshot changes

## Future Enhancements

### Planned Improvements

1. **Auto-remediation**: Generate documentation updates automatically
2. **Smart screenshot detection**: Analyze which screenshots are affected
3. **Integration with PRs**: Run audit on pull requests
4. **Slack/Discord notifications**: Alert team of critical issues
5. **Historical tracking**: Track documentation health over time
6. **Multi-language support**: Audit localized documentation

### Potential Optimizations

1. **Caching**: Cache documentation content between runs
2. **Incremental analysis**: Only analyze changed files
3. **Parallel processing**: Analyze multiple docs concurrently
4. **Cost reduction**: Use smaller model for simple checks

## References

- [Anthropic Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [9Boxer Documentation Writing Guide](contributing/documentation-writing-guide.md)

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section above
2. Review audit report artifact in GitHub Actions
3. Check script output in workflow logs
4. Create an issue in the repository
