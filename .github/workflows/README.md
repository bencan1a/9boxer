# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the 9Boxer repository.

For complete workflow documentation, see **[CLAUDE_INDEX.md](../../CLAUDE_INDEX.md)** and the individual workflow files in this directory.

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

### AI/Code Review Workflows
- `claude.yml` - Claude Code assistant (responds to @claude mentions)
- `claude-code-review.yml` - Automated Claude code review on PRs

### Environment Setup
- `copilot-setup-steps.yml` - GitHub Copilot environment setup

---

**Total Workflows:** 15

For more details on workflows, see:
- Detailed workflow descriptions
- Trigger conditions and schedules
- Key workflow features
- Smart test selection
- Secrets required
