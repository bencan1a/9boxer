# GitHub Actions Workflows

This directory contains the GitHub Actions workflows for the 9Boxer repository.

For complete workflow documentation, see **[docs/WORKFLOWS.md](../../docs/WORKFLOWS.md)**.

## Quick Reference

### CI/CD Workflows

- **`ci.yml`** - Main CI pipeline (lint, test, coverage)
- **`nightly.yml`** - Nightly regression testing
- **`docs.yml`** - Documentation generation
- **`dependency-review.yml`** - Security review of dependency changes
- **`code-quality.yml`** - Code quality analysis and metrics
- **`release.yml`** - Automated release process

### Build Workflows

- **`build-electron.yml`** - Build Electron desktop installers for all platforms

### Environment Setup

- **`copilot-setup-steps.yml`** - GitHub Copilot environment setup
- **`reusable-setup.yml`** - Reusable Python setup workflow

## Documentation

See **[docs/WORKFLOWS.md](../../docs/WORKFLOWS.md)** for:
- Detailed workflow descriptions
- Configuration options
- Troubleshooting guides
- Testing instructions
- Maintenance procedures

Also see:
- **[docs/COPILOT_SETUP.md](../../docs/COPILOT_SETUP.md)** - Copilot environment setup details
- **[BUILD.md](../../BUILD.md)** - Build instructions
- **[DEPLOYMENT.md](../../DEPLOYMENT.md)** - Deployment guide
