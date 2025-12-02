# Agent Temporary Directory

This directory is for **ephemeral outputs** from GitHub Copilot agents.

## Purpose

Use this directory for:
- Debug scripts generated during troubleshooting
- Temporary analysis outputs
- Intermediate files during agent operations
- Quick experiments and prototypes

## Guidelines

- **Files here are temporary** - they should not be committed to version control
- Clean up files when no longer needed
- Use descriptive filenames with timestamps when helpful
- This directory is gitignored to prevent accidental commits

## Example Usage

```bash
# Agent creates a debug script
agent-tmp/debug_api_issue_2024-11-09.py

# Agent outputs analysis
agent-tmp/performance_analysis.txt

# Temporary data files
agent-tmp/test_data_sample.json
```

## Cleanup

Periodically clean this directory to avoid clutter:

```bash
# Remove all files older than 7 days
find agent-tmp -type f -mtime +7 -delete

# Or clean everything
rm -rf agent-tmp/*
```
