# Quick Start Guide

Welcome to the Python Template! This guide will help you get started quickly.

## Initial Setup

1. **Use this template**: Click the "Use this template" button on GitHub to create your own repository.

2. **Clone your repository**:
   ```bash
   git clone https://github.com/yourusername/your-project.git
   cd your-project
   ```

3. **Choose your development environment**:

   ### Option A: DevContainer (Recommended)
   - Open in VS Code
   - Click "Reopen in Container" when prompted
   - Everything is automatically set up!

   ### Option B: Local Setup
   ```bash
   # Create virtual environment (use venv for consistency with devcontainer)
   python3 -m venv venv
   
   # Activate virtual environment (CRITICAL - do this every time!)
   . venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install --upgrade pip
   pip install -e '.[dev]'

   # Set up pre-commit hooks
   pre-commit install
   ```

> **⚠️ Important**: Always activate the virtual environment before running any Python commands. If you see "module not found" errors, you likely forgot to activate the venv. See [AGENTS.md](AGENTS.md) for more details.

## Customization Checklist

- [ ] Update `pyproject.toml`:
  - Change project name from `python-template` to your project name
  - Update author information
  - Update description and URLs
  
- [ ] Rename package directory:
  ```bash
  mv src/python_template src/your_package_name
  ```

- [ ] Update imports in:
  - `src/your_package_name/__init__.py`
  - Test files
  - README examples

- [ ] Update README.md with your project information

- [ ] Update CONTRIBUTING.md if you have specific contribution guidelines

- [ ] Review and customize GitHub Actions workflows in `.github/workflows/`

## Daily Development Workflow

> **⚠️ Remember**: Always activate the virtual environment first: `. venv/bin/activate`

### Making Changes

1. **Activate virtual environment**:
   ```bash
   . venv/bin/activate  # Do this every time you start working!
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes** to the code

4. **Run checks locally** (pre-commit hooks will run automatically on commit):
   ```bash
   make check-all  # Runs all checks: format, lint, type, security, test
   ```

   Or run individual checks:
   ```bash
   make format      # Format code
   make lint        # Lint code
   make type-check  # Type check
   make security    # Security scan
   make test        # Run tests
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Add awesome feature"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature
   ```
   Then create a pull request on GitHub.

### Using GitHub Copilot Agents

This template includes custom agent profiles for specialized tasks:

- **Architecture decisions**: `@workspace /agent .github/agents/architecture.md Design X`
- **Writing tests**: `@workspace /agent .github/agents/test.md Write tests for Y`
- **Debugging issues**: `@workspace /agent .github/agents/debug.md Help debug Z`
- **Documentation**: `@workspace /agent .github/agents/documentation.md Document feature A`

### Agent Output Organization

Agents follow a consistent file organization:

- **`agent-tmp/`**: Temporary files (debug scripts, analysis) - automatically gitignored
- **`agent-projects/<project-name>/`**: Active project documentation with progress tracking
- **`docs/`**: Permanent documentation (architecture, guides, API docs, ADRs)

**Example workflow:**
1. Agent creates `agent-projects/feature-auth/` for active work
2. Agent uses `agent-tmp/` for debug scripts during development
3. When complete, final docs go to `docs/architecture/` and `docs/guides/`

## Common Tasks

### Adding Dependencies

1. Add to `pyproject.toml` under `dependencies` or `dev` optional-dependencies
2. Install: `pip install -e '.[dev]'`
3. Update requirements if needed

### Writing Tests

- Place tests in `tests/` directory
- Name files `test_*.py`
- Run with: `pytest` or `make test`
- Check coverage: `make coverage`

### Running Quality Checks

```bash
# All checks
make check-all

# Individual checks
make format       # Auto-format code
make lint         # Check code quality
make type-check   # Type checking
make security     # Security scan
make test         # Run tests
```

### Building and Publishing

```bash
make build         # Build distribution packages
make publish-test  # Publish to TestPyPI
make publish       # Publish to PyPI
```

## GitHub Actions Workflows

The template includes three workflows:

1. **CI Workflow** (`ci.yml`): Runs on every push and PR
   - Linting and formatting
   - Type checking
   - Security scanning
   - Tests across multiple OS and Python versions

2. **PR Workflow** (`pr.yml`): Validates pull requests
   - Runs all quality checks
   - Posts validation summary

3. **Nightly Regression** (`nightly.yml`): Runs daily at 2 AM UTC
   - Full test suite
   - Performance tests
   - Dependency audit
   - Creates issue on failure

## Project Structure

```
your-project/
├── .devcontainer/       # VS Code dev container config
├── .github/
│   ├── agents/         # GitHub Copilot agent profiles
│   └── workflows/      # GitHub Actions
├── agent-tmp/          # Temporary agent outputs (gitignored)
├── agent-projects/     # Active project documentation
├── docs/              # Permanent documentation
├── src/
│   └── your_package/   # Your Python package
├── tests/              # Test files
├── pyproject.toml      # Project configuration
├── Makefile           # Development commands
└── README.md          # Project documentation
```

## Getting Help

## Getting Help

- Check [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
- Review [README.md](README.md) for complete documentation
- Explore custom agents in `.github/agents/`
- Open an issue if you find problems

## Tips

- Use `make help` to see all available commands
- Pre-commit hooks will catch issues before they're committed
- GitHub Actions will validate all PRs automatically
- Custom agents can help with complex tasks
- Keep test coverage high (aim for >80%)

Happy coding! 🎉
