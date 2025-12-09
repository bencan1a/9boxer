# Documentation Summary

**Last Updated**: 2025-12-09T02:38:53.010302+00:00
**Source SHA**: 6b0b19e579a173b6eb7257bfdbf4975910293fbb

This file provides a quick index of all documentation components in this project.

## Documentation Components

### Core Documentation
- **CONTEXT.md** - Main generated context file for agents
- **facts.json** - Stable project truths and configuration
- **CHANGELOG.md** - Documentation build history

### Generated Documentation (`_generated/`)
- `_generated/api/src/python_template/calculator.html`
- `_generated/api/src/python_template/greeter.html`
- `_generated/api/src/python_template/index.html`
- `_generated/plans_index.md`

## How to Use This Documentation

### For AI Agents
1. Start with `CONTEXT.md` for comprehensive project context
2. Check `facts.json` for stable project information
3. Review `_generated/plans_index.md` for active work
4. Consult specific documentation as needed

### For Developers
1. See `facts.json` for project overview
2. Check API documentation in `_generated/api/`
3. Review architecture and design docs in this directory
4. Check `CHANGELOG.md` for documentation update history

## Regenerating Documentation

To manually regenerate all documentation:
```bash
python tools/build_context.py
```

Documentation is automatically regenerated:
- On every push that changes source, schema, or docs files
- Every night at 2 AM UTC
