# Architecture Documentation

This directory contains comprehensive architectural documentation for the 9Boxer application.

## Documents

### [GUIDELINES.md](GUIDELINES.md)
**Authoritative architectural guidelines** for all developers and agents. This document defines:
- Core architectural principles
- Technology stack guidelines
- Code organization patterns
- Quality standards
- Security requirements
- Performance guidelines
- Testing strategies
- Common patterns and anti-patterns

**Status**: Authoritative for architectural decisions  
**Authority**: Defers to [docs/facts.json](../facts.json) as ultimate source of truth for factual information

### [metrics.md](metrics.md)
**Architectural health metrics** tracking document. Monitors:
- Quality standards compliance
- Architectural review findings
- Issue resolution metrics
- Historical trends
- Common patterns and violations

**Updated**: After each weekly architectural review  
**Purpose**: Track architectural health over time and identify trends

## Architectural Review Process

The 9Boxer project uses an **automated architectural review board** to prevent architectural drift:

### Weekly Review Cycle

1. **Every Sunday at 3 AM UTC**:
   - GitHub Actions workflow runs `tools/architecture_review.py`
   - Analyzes all commits and PRs from the past 7 days
   - Generates detailed review report
   - Creates/updates GitHub issues for findings

2. **Review Report Includes**:
   - Severity breakdown (Critical, High, Medium, Low)
   - Category analysis (Architecture, Quality, Security, etc.)
   - Detailed findings with recommendations
   - Links to affected commits and files
   - Violations of architectural principles

3. **Automated Issue Creation**:
   - Critical findings get individual GitHub issues
   - Weekly summary issue tracks all findings
   - Issues labeled with `architectural-drift` and severity
   - Actionable recommendations included

### How to Use the Review Process

#### As a Developer
1. **Before Committing**: Review [GUIDELINES.md](GUIDELINES.md) to ensure compliance
2. **During PR Review**: Watch for architectural review bot comments
3. **After Weekly Review**: Check for new architectural issues assigned to you
4. **When Fixing Issues**: Follow the recommendations and resolution checklist

#### As a Reviewer
1. **Use the Guidelines**: Reference [GUIDELINES.md](GUIDELINES.md) during code reviews
2. **Check Compliance**: Ensure changes align with architectural principles
3. **Enforce Standards**: All code must pass quality gates before merge
4. **Update Guidelines**: Propose updates when new patterns emerge

#### As the Architecture Review Board Agent
1. **Weekly**: Run automated review and analyze findings
2. **Create Issues**: For significant violations, create detailed issues
3. **Update Metrics**: Track trends in [metrics.md](metrics.md)
4. **Improve Guidelines**: Propose updates based on recurring patterns

## Architectural Decision Records (ADRs)

For significant architectural decisions, create ADRs in `docs/decisions/`:

```markdown
# ADR-XXX: Title

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue or situation we're addressing?

## Decision
What is the change we're making?

## Consequences
What are the positive and negative implications?
```

## Quick Reference

### Key Architectural Principles
1. **Standalone First** - Everything runs locally, offline-capable
2. **Clean Separation of Concerns** - Clear boundaries between layers
3. **Type Safety Everywhere** - 100% type coverage mandatory
4. **Test-Driven Quality** - >80% coverage required
5. **Security by Default** - Security patterns built-in
6. **Performance Conscious** - Fast startup, responsive UI

### Quality Gates (Must Pass)
```bash
# Backend
ruff format .           # Formatting
ruff check .            # Linting  
mypy backend/src/       # Type checking (mypy)
pyright                 # Type checking (pyright)
bandit -r backend/src/  # Security
pytest --cov=backend/src --cov-fail-under=80  # Tests

# Frontend
npm run format          # Prettier
npm run lint            # ESLint
npm run type-check      # TypeScript
npm test                # Vitest
```

### Important Files
- **[docs/facts.json](../facts.json)** - Ultimate source of truth
- **[.github/agents/architecture-review-board.md](../../.github/agents/architecture-review-board.md)** - Review board agent profile
- **[.github/workflows/architecture-review.yml](../../.github/workflows/architecture-review.yml)** - Weekly review automation
- **[.github/ISSUE_TEMPLATE/architectural-issue.yml](../../.github/ISSUE_TEMPLATE/architectural-issue.yml)** - Issue template
- **[tools/architecture_review.py](../../tools/architecture_review.py)** - Review tool

## Getting Help

### Questions About Architecture
1. Review [GUIDELINES.md](GUIDELINES.md) first
2. Check [docs/facts.json](../facts.json) for factual information
3. Search existing architectural issues on GitHub
4. Create an issue with template: "Architectural Question"

### Proposing Architectural Changes
1. Create an issue explaining the rationale
2. Link to code examples demonstrating the need
3. Propose specific guideline changes
4. Get review from architecture review board
5. Update documentation via PR

### Reporting Architectural Issues
1. Use the [architectural issue template](../../.github/ISSUE_TEMPLATE/architectural-issue.yml)
2. Include severity, category, and location
3. Provide clear description and recommendations
4. Link to relevant documentation and principles

## Continuous Improvement

The architectural review process is designed for continuous improvement:

1. **Learn from Findings** - Identify patterns in violations
2. **Update Guidelines** - Improve documentation based on real issues
3. **Automate Checks** - Add automated detection for common problems
4. **Educate Team** - Share learnings and best practices
5. **Track Progress** - Use metrics to measure improvement

---

**Remember**: Architecture is not about rigid rules, but about **maintaining consistency, quality, and long-term maintainability**. When in doubt, refer to [docs/facts.json](../facts.json) as the ultimate source of truth and consult with the architecture review board.
