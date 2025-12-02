# 📘 Project: Automated Doc Management System for Solo Developer + Agents

## Purpose

We want to set up a simple but reliable doc management system so that all documentation for this project stays coherent and automatically up to date.
The system will support both permanent docs and ephemeral agent work, allowing agents to collaborate safely without creating drift or clutter.

---

## Folder Model and Rules

You must respect these folder purposes:

| Folder | Purpose | Persistence | Rules |
|--------|---------|-------------|-------|
| `agent-tmp/` | Scratch / debug / intermediates | Ephemeral (gitignored) | Agents may freely create or delete temporary files. Nothing here is committed. |
| `agent-plans/<project>/` | Ephemeral plan docs for refactors, experiments, migrations, etc. | Short-lived | Each plan has its own subfolder and a plan.md file with required metadata. |
| `docs/` | Permanent, canonical documentation for the codebase | Persistent | This is the single source of truth. Agents must prefer this folder when writing long-term docs. |

---

## Required Files and Structure

```
/agent-tmp/                 # scratch (gitignored)
/agent-plans/               # ephemeral plans
/docs/
  CONTEXT.md                # main generated context for agents
  SUMMARY.md                # quick index for agent navigation
  facts.json                # stable, hand-maintained truths
  CHANGELOG.md
  _generated/               # generated references (API, schemas, active plan summaries)
/tools/
  build_context.py          # script that assembles all docs
/.github/workflows/
  docs.yml                  # GitHub Action for nightly + push builds
AGENTS.md                   # human/agent-readable folder rules and guidance
.gitignore
```

---

## Plan File Specification

Each `agent-plans/<project>/plan.md` must begin with the following fields:

```yaml
status: active|paused|done
owner: <name>
created: YYYY-MM-DD
summary:
  - short bullet
  - another bullet
```

### Notes

- Only `status: active` plans less than 21 days old will be summarized into `docs/_generated/plans_index.md`.
- Old or completed plans are ignored but remain in history.

---

## Automation Behavior

A GitHub Action (`.github/workflows/docs.yml`) will:

1. Run on pushes that change source, schema, or docs files, and every night.
2. Execute `tools/build_context.py` to:
   - Regenerate API docs (Python via pdoc3, TS via typedoc).
   - Summarize active plans.
   - Merge everything into `docs/CONTEXT.md` (capped ~150 kB).
   - Update `SUMMARY.md` and append an entry to `CHANGELOG.md`.
   - Prune `agent-tmp/` files older than a week.
3. Auto-commit updated docs directly to the repo (no manual approval required).

Environment defaults:

```yaml
CONTEXT_MAX_CHARS: "150000"
PLANS_MAX_AGE_DAYS: "21"
CLEAN_TMP_AGE_DAYS: "7"
```

---

## Agent Operating Rules

### Reading

- Primary context: `docs/CONTEXT.md`
- Trust order:
  1. `docs/facts.json` → 2. permanent `docs/` content → 3. Active Plans summaries
- Treat "Active Plans" as hints only; permanent docs override them.

### Writing

- Permanent knowledge: write or update files under `docs/`.
- Ephemeral tasks or refactors: write to `agent-plans/<project>/`.
- Never commit anything under `agent-tmp/`.
- Always include required metadata fields in plan files.

### Updating

- The nightly Action will refresh the docs automatically.
- Manual run: execute `python tools/build_context.py`.
- Each refresh updates `CHANGELOG.md` and stamps `source_sha` in generated files.

---

## Outputs for Agents to Reference

- `docs/CONTEXT.md` → single canonical context file.
- `docs/_generated/` → sub-components (API, schemas, plans).
- `docs/SUMMARY.md` → list of components and update timestamp.
- `docs/CHANGELOG.md` → chronological record of doc rebuilds.

---

## Implementation Checklist

1. Create the folder structure exactly as shown.
2. Copy in `AGENTS.md`, `.gitignore`, `build_context.py`, and `docs.yml`.
3. Install pdoc3 (`pip install pdoc3`) and optionally typedoc (`npm i -g typedoc typedoc-plugin-markdown`).
4. Commit everything.
5. Verify the workflow runs successfully on the next commit.

---

## Success Criteria

- Running `python tools/build_context.py` locally produces updated `docs/CONTEXT.md` with correct front-matter (`source_sha`, `provenance`).
- GitHub nightly action auto-commits doc updates if any changes occur.
- Agents writing plans see them appear in `docs/_generated/plans_index.md` within 24 h.

---

## Goal

Create a self-healing documentation loop where agents always operate from up-to-date context, permanent docs stay consistent with code, and ephemeral plan content decays naturally without polluting long-term knowledge.

---

✅ **End of agent prompt. Implement exactly as described.**
