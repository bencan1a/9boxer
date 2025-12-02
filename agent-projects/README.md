# Agent Projects Directory

This directory contains **ongoing project documentation** created by GitHub Copilot agents.

## Purpose

Use this directory for:
- Active development project plans
- Feature implementation documentation
- Investigation notes and findings
- Work-in-progress architectural decisions
- Refactoring plans and progress tracking

## Structure

Each project should be in its own subdirectory with a descriptive name:

```
agent-projects/
├── feature-user-authentication/
│   ├── README.md
│   ├── architecture.md
│   ├── implementation-plan.md
│   └── progress.md
├── refactor-database-layer/
│   ├── README.md
│   ├── current-state-analysis.md
│   └── migration-plan.md
└── investigation-performance-issue/
    ├── README.md
    ├── findings.md
    └── recommendations.md
```

## Naming Conventions

Use descriptive folder names that clearly indicate the project:
- `feature-<feature-name>` - For new features
- `refactor-<component-name>` - For refactoring work
- `investigation-<issue-name>` - For investigations
- `bugfix-<bug-description>` - For bug fixes

## Lifecycle

1. **Create** - Agent creates a new project folder when starting work
2. **Update** - Agent updates documentation as work progresses
3. **Complete** - Move important documentation to `docs/` when finished
4. **Archive** - Delete or archive the project folder

## When to Move to `docs/`

Move documentation to the `docs/` folder when:
- The project is complete
- The information has long-term value
- It should be part of the permanent project documentation
- Others need to reference it in the future

## Example Project Structure

### feature-user-authentication/README.md
```markdown
# User Authentication Feature

**Status:** In Progress
**Started:** 2024-11-09
**Agent:** Architecture Agent

## Overview
Implementing OAuth2-based user authentication...

## Progress
- [x] Design authentication flow
- [x] Implement token generation
- [ ] Add refresh token support
- [ ] Write tests
```
