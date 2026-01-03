# CI/CD Documentation

This directory contains documentation for the 9Boxer CI/CD system, including workflows, reliability patterns, and troubleshooting guides.

## Documentation Files

### Core Documentation

**[CI_RELIABILITY.md](CI_RELIABILITY.md)** - Comprehensive CI/CD reliability guide
- Makefile-centric architecture overview
- Adding new code quality checks
- Wrapper script patterns
- Environment setup actions
- Troubleshooting guide
- Success metrics and targets

**Read this first** to understand the CI/CD architecture and patterns.

## Quick Reference

### Running Checks Locally

```bash
# Run all checks (reproduces CI)
make check-all

# Individual checks
make lint          # Ruff linting
make format-check  # Formatting check
make type-check    # Mypy type checking
make security      # Bandit security scan
make test          # Pytest

# Auto-fix issues
make fix
```

### Key Files

| File | Purpose |
|------|---------|
| `Makefile` | Single source of truth for all checks |
| `.pre-commit-config.yaml` | Git hook configuration |
| `.github/workflows/pr.yml` | PR validation |
| `.github/workflows/ci.yml` | Post-merge CI |
| `tools/*.sh` | Wrapper scripts for hooks |

### Version Standards

| Tool | Version |
|------|---------|
| Python | 3.13 |
| Node.js | 20 |

## Related Documentation

- **[testing/README.md](../testing/README.md)** - Testing documentation
- **[AGENTS.md](../../AGENTS.md)** - Developer command reference
- **[BUILD.md](../../BUILD.md)** - Build documentation

---

*Last Updated: January 2025*
