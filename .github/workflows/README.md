# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the 9Boxer repository.

For complete workflow documentation, see **CI/CD Pipeline section in [CLAUDE.md](../../CLAUDE.md)**.

## Workflow Files

### CI/CD Workflows
- `ci.yml` - Continuous integration (push to main/develop)
- `pr.yml` - Pull request validation
- `weekly.yml` - Weekly comprehensive testing
- `release.yml` - Automated release process

### Build Workflows
- `build-electron.yml` - Electron desktop builds (Windows, macOS, Linux)

### Documentation Workflows
- `docs.yml` - Documentation generation
- `docs-audit.yml` - AI documentation audit (weekly)
- `docs-auto-update.yml` - Documentation impact detection
- `screenshots.yml` - Screenshot generation (weekly)

### Testing Workflows
- `visual-regression.yml` - Visual regression tests
- `update-visual-baselines.yml` - Update visual baselines

### Development Workflows
- `feature-checklist.yml` - Feature development checklist validation

### Environment Setup
- `copilot-setup-steps.yml` - GitHub Copilot environment setup

---

**Total Workflows:** 13

See **CI/CD Pipeline section in [CLAUDE.md](../../CLAUDE.md)** for:
- Detailed workflow descriptions
- Trigger conditions and schedules
- Key steps and features
- Configuration options
- Troubleshooting guides
- Cross-references to related documentation
