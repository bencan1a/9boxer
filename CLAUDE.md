# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Virtual Environment

**ALWAYS activate the virtual environment before running Python commands:**
```bash
. venv/bin/activate
```

If you see "module not found" errors, the venv is not activated. This is the #1 cause of issues.

## Common Commands

### Development Setup
```bash
# First time setup
python3 -m venv venv
. venv/bin/activate
pip install --upgrade pip
pip install -e '.[dev]'
pre-commit install
```

### Testing
```bash
# Always activate venv first: . venv/bin/activate

pytest                              # Run all tests
pytest tests/test_calculator.py     # Run specific test file
pytest -k "test_add"                # Run tests matching pattern
pytest -v                           # Verbose output
pytest --cov=src                    # Run with coverage
```

### Code Quality
```bash
# Run all quality checks at once
make check-all

# Individual checks
ruff format .           # Format code
ruff format --check .   # Check formatting
ruff check .            # Lint code
ruff check --fix .      # Auto-fix linting issues
mypy src/               # Type check with mypy
pyright                 # Type check with pyright
bandit -r src/          # Security scan

# Quick fix
make fix                # Auto-fix formatting and linting
```

### Makefile Targets
- `make test` - Run tests
- `make coverage` - Run tests with HTML coverage report
- `make check-all` - Run all quality checks (format, lint, type, security, test)
- `make fix` - Auto-fix formatting and linting issues
- `make clean` - Clean up generated files
- `make dev` - Set up development environment

## Architecture Overview

### Package Structure
This project uses the standard Python `src/` layout:
- **`src/python_template/`** - Main package source code
  - Type aliases defined inline (e.g., `Number = int | float`)
  - All functions require type annotations
  - Comprehensive docstrings with examples
- **`tests/`** - Test files following pytest conventions
  - Named `test_*.py`
  - Test functions named `test_function_when_condition_then_expected`
  - No conditional assertions in test bodies

### File Organization Conventions
The project has strict conventions for where files belong (see [AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md)):

| Folder | Purpose | Persistence | Git |
|--------|---------|-------------|-----|
| `agent-tmp/` | Scratch/debug/intermediates | Ephemeral (7 days) | ❌ No |
| `agent-projects/<project>/` | Ephemeral plans for refactors/features | Short-lived (21 days active) | ✅ Yes |
| `docs/` | Permanent documentation | Persistent | ✅ Yes |
| `docs/_generated/` | Auto-generated docs | Auto-updated | ✅ Yes |

**Rules:**
- **DO NOT** create analysis reports or planning documents in the project root
- **DO NOT** manually edit files in `docs/_generated/` (auto-generated)
- **DO** use `agent-tmp/` for all temporary work
- **DO** create structured plans in `agent-projects/<project-name>/` with required metadata

### Custom Agent Profiles
Specialized agent profiles exist in `.github/agents/`:
- `architecture.md` - System design and architectural decisions
- `test.md` - Test writing strategies and comprehensive testing guidance
- `debug.md` - Debugging and troubleshooting
- `documentation.md` - Technical writing and documentation

These can be referenced when working on specialized tasks.

### Type Checking
This project uses **both mypy and pyright** for comprehensive type checking:
- **mypy**: Configured via `[tool.mypy]` in `pyproject.toml`
- **pyright**: Configured via `pyrightconfig.json`

All code must have type annotations:
- ALL function parameters must be typed
- ALL function returns must be typed
- Use modern Python typing: `list[str]`, `dict[str, int]`, `Optional[T]`
- `self` in classes is untyped; all other parameters must be typed
- Run both checkers: `make type-check` (runs mypy + pyright)

**Why both tools?**
- Different type checkers can catch different issues
- mypy is the "official" Python type checker
- pyright/Pylance is used by VSCode for real-time type checking
- Both passing ensures consistency between CLI and IDE

### Testing Approach
1. **Run existing tests first** to establish baseline
2. Follow TDD approach when practical
3. Test naming: `test_function_when_condition_then_expected`
4. No conditional logic in test bodies (no `if` statements)
5. Avoid testing types - test behavior instead
6. Avoid over-mocking (don't mock business logic)
7. Aim for >80% coverage

See `.github/agents/test.md` for comprehensive testing guidance.

### CI/CD Pipeline
GitHub Actions workflows in `.github/workflows/`:
- **`ci.yml`** - Main CI pipeline:
  - Lint, format, type check, security scan
  - Tests across multiple OS (Ubuntu, Windows, macOS) and Python versions (3.10, 3.11, 3.12)
  - Smart test selection based on changed files
  - Coverage enforcement on changed files (70% threshold)
- **`nightly.yml`** - Nightly regression testing
- **`docs.yml`** - Documentation updates

The CI uses smart test selection via `.github/scripts/smart_test_selection.py` to only run relevant tests for PRs.

## Documentation System

This project has an automated documentation generation system that creates a "self-healing documentation loop."

### Documentation Command
```bash
# Regenerate all documentation
python tools/build_context.py
```

This happens automatically via GitHub Actions on push and nightly at 2 AM UTC.

### What Gets Generated
The `tools/build_context.py` script automatically:
1. **Generates API docs** from Python docstrings using pdoc3 → `docs/_generated/api/`
2. **Collects active plans** from `agent-projects/` (status=active, <21 days old)
3. **Builds CONTEXT.md** - Comprehensive project context for AI agents
4. **Updates SUMMARY.md** - Quick index of all documentation components
5. **Updates CHANGELOG.md** - Appends entry with timestamp and changes
6. **Cleans agent-tmp/** - Removes files older than 7 days

### Key Documentation Files

**For AI Agents to Read:**
- **`docs/CONTEXT.md`** - Main entry point; comprehensive project context (~150KB)
- **`docs/facts.json`** - Stable, hand-maintained project truths (highest authority)
- **`docs/SUMMARY.md`** - Quick index of all documentation
- **`docs/_generated/plans_index.md`** - Summary of active plans
- **`docs/_generated/api/`** - Auto-generated API documentation

**Trust Hierarchy** (when information conflicts):
1. `docs/facts.json` (highest authority)
2. Permanent content in `docs/`
3. Active plans summaries (hints only)

### Working with Documentation

**When writing permanent documentation:**
- Create/update files in `docs/` directory
- Use clear, descriptive filenames
- Update existing docs rather than duplicating

**When creating project plans:**
- Create `agent-projects/<project-name>/plan.md`
- Include required metadata:
  ```yaml
  status: active|paused|done
  owner: <name>
  created: YYYY-MM-DD
  summary:
    - short bullet point
    - another bullet point
  ```

**When doing temporary work:**
- Use `agent-tmp/` for all scratch work
- Files auto-deleted after 7 days
- Never commit these files (gitignored)

### Configuration
Environment variables for `tools/build_context.py`:
- `CONTEXT_MAX_CHARS` - Max size of CONTEXT.md (default: 150000)
- `PLANS_MAX_AGE_DAYS` - Max age for active plans (default: 21)
- `CLEAN_TMP_AGE_DAYS` - Max age for agent-tmp files (default: 7)

### Automation
- **Trigger**: Push to main affecting `src/`, `docs/`, `agent-plans/`, or `tools/build_context.py`
- **Schedule**: Nightly at 2 AM UTC
- **Action**: Auto-generates docs and commits changes via GitHub Actions

See [AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md) for complete documentation system rules.

## Code Quality Standards

All code must pass these checks before commit:
1. **Formatting**: ruff format (100 char line length)
2. **Linting**: ruff check (pycodestyle, pyflakes, isort, bugbear, etc.)
3. **Type Checking**: Both mypy and pyright (relaxed for tests)
4. **Security**: bandit security scanner
5. **Testing**: All tests pass with >80% coverage

Use `make check-all` to run all checks at once.

### Handling Exceptions
For unavoidable warnings:
- `# noqa: <code>` for linting false positives (add justification comment)
- `# type: ignore[<error>]` for typing false positives (add justification)
- `# nosec` for security false positives (add explanation)

## Important Files to Review
- **`AGENTS.md`** - Comprehensive development workflow guidance
- **`AGENT_DOCS_CONTRACT.md`** - Documentation system rules and folder structure
- **`README.md`** - Project overview, features, and quick start
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`docs/CONTEXT.md`** - Main documentation context for AI agents
- **`docs/facts.json`** - Stable project truths (highest authority)
- **`pyproject.toml`** - All tool configurations and dependencies
- **`.github/agents/test.md`** - Comprehensive testing guidance
