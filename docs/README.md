# Documentation

This directory contains **persistent project documentation** that has long-term value.

## Purpose

Use this directory for:
- Architecture documentation
- API documentation
- User guides and tutorials
- Design decisions and rationale
- Deployment guides
- Troubleshooting guides

## Structure

Organize documentation logically by topic:

```
docs/
├── architecture/
│   ├── overview.md
│   ├── database-schema.md
│   └── api-design.md
├── guides/
│   ├── user-guide.md
│   ├── developer-guide.md
│   └── deployment.md
├── api/
│   ├── authentication.md
│   └── endpoints.md
└── decisions/
    ├── adr-001-framework-selection.md
    └── adr-002-database-choice.md
```

## Documentation Standards

### Format
- Use Markdown for all documentation
- Include a table of contents for longer documents
- Use clear headings and subheadings
- Include code examples where applicable

### Architecture Decision Records (ADRs)
When documenting important decisions, use the ADR format:

```markdown
# ADR-001: Framework Selection

**Status:** Accepted
**Date:** 2024-11-09
**Deciders:** Team Name

## Context
What is the issue we're facing?

## Decision
What decision did we make?

## Consequences
What are the positive and negative consequences?
```

### API Documentation
- Document all public APIs
- Include request/response examples
- Specify error codes and handling
- Keep in sync with code changes

## Maintenance

- Review documentation quarterly
- Update when code changes significantly
- Archive outdated documentation
- Link related documents

## Migration from agent-projects

When a project in `agent-projects/` is complete:

1. Review the documentation
2. Extract permanent, valuable information
3. Organize it appropriately in `docs/`
4. Update cross-references
5. Delete the temporary project folder
