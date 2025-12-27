# Internal Documentation Maintenance Task

**Frequency**: Weekly (Monday 2 AM UTC) or manual trigger
**Last Run**: {TIMESTAMP from marker file}

## Objective
Perform weekly documentation hygiene to prevent drift and duplication in internal developer/agent documentation.

## Context
- **Last run**: {TIMESTAMP}
- **Days since last run**: {DAYS}
- **Files changed since last run**: {FILE_LIST from git log}
- **Location**: internal-docs/ (formerly docs/)

## Tasks

### 1. Inventory New Documentation
Find all .md files in internal-docs/ modified since last run:
- Use: `git log --since="{LAST_RUN_DATE}" --name-only --pretty=format: -- internal-docs/ | sort -u`
- Categorize by concern area (agent instructions, architecture, testing, etc.)
- Flag potential duplications (similar filenames, overlapping topics)

### 2. Detect Duplications
Check for:
- Similar filenames (e.g., "screenshot-*", "test-*", "quick-*")
- Overlapping content (similar headings, topics)
- Conflicting recommendations (different guidance for same task)

### 3. Consolidate Documentation
For each duplication found:
- Identify canonical source (refer to agent-projects/internal-docs-consolidation/GUIDE.md Section 2: Target Structure)
- Prefer newer content (descending date order: `git log --format=%ai`)
- Merge content from duplicates into canonical
- Preserve unique information
- Update cross-references

### 4. Archive Superseded Docs
- Move old versions to internal-docs/archive/{YYYY-MM-DD}/
- Use `git mv` to preserve history
- Update any links pointing to archived docs
- Document why archived (in PR description)

### 5. Update Auto-Generated Docs
Run documentation build:
```bash
.venv\Scripts\activate  # Windows
python tools/build_context.py
```

### 6. Generate Maintenance Report
Create report with:
- Files consolidated (old → new)
- Files archived (with reasons)
- Conflicts requiring user decision
- Recommendations for next run
- Metrics (duplicates found, files consolidated, links updated)

## Decision-Making Framework

**When to consolidate** (prefer newer):
- Check file dates: `git log --follow --format=%ai -- file.md`
- Prefer established locations (internal-docs/category/ over root)
- Prefer comprehensive over partial

**When to ask user**:
- Conflicting recommendations (which is correct?)
- Delete vs. archive for important files
- New structure that differs from existing patterns

**When to archive**:
- Clearly superseded content
- Historical value preserved
- Might be referenced later
- When in doubt

## Output
Create PR with:
- Title: "docs: Weekly internal docs maintenance (YYYY-MM-DD)"
- Description: Maintenance report
- Link to maintenance issue
- Checklist of tasks completed

## Quality Standards
- All links work (no broken references)
- build_context.py runs successfully
- Pre-commit hooks pass
- CI/CD passes
