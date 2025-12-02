# AGENT GUIDANCE FOR PYTHON-TEMPLATE PROJECT

This file provides critical guidance for all agents (human and AI) working on this project.

## 🔧 ENVIRONMENT SETUP

### Virtual Environment - CRITICAL REQUIREMENT

**⚠️ ALWAYS ACTIVATE THE VIRTUAL ENVIRONMENT BEFORE RUNNING PYTHON TOOLS**

```bash
# Activate venv - do this FIRST in every session
. venv/bin/activate

# Verify activation (should show venv/bin/python)
which python
```

**Common Issue:** If a Python module appears to not be installed, this is usually because the venv has not been activated. Always activate the venv first!

### Initial Setup

```bash
# Create virtual environment (first time only)
python3 -m venv venv

# Activate it
. venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -e '.[dev]'

# Set up pre-commit hooks (optional but recommended)
pre-commit install
```

## 📁 FILE ORGANIZATION

**CRITICAL: Follow these conventions when creating files:**

### Temporary/Debug Files → `agent-tmp/`
- Debugging scripts
- Temporary analysis files
- Work-in-progress experiments
- Test data samples
- **Note:** This directory is gitignored

### Project Documentation → `agent-projects/`
- Active project folders (e.g., `agent-projects/feature-name/`)
- Refactoring plans
- Code analysis reports
- Work item tracking
- Each project should have its own subdirectory with a README.md

### Permanent Documentation → `docs/`
- API documentation
- Architecture guides
- Deployment guides
- Testing guides
- Decision records (ADRs)

### Configuration Files → Root Directory
- README.md
- This file (AGENTS.md)
- pyproject.toml
- Other project-level configuration

**DO NOT** create analysis reports, planning documents, or temporary files in the project root.

## 🧪 TESTING WORKFLOW

### Pre-Testing Checklist
1. ✅ Activate virtual environment (`. venv/bin/activate`)
2. ✅ Ensure dependencies are installed
3. ✅ Understand the code being tested

### Testing Sequence
1. **Run existing tests first** to establish baseline
   ```bash
   pytest
   ```

2. **Write tests for new functionality**
   - Follow naming convention: `test_function_when_condition_then_expected`
   - Cover normal, edge, and error cases
   - Ensure tests are unconditional (no `if` statements in test bodies)

3. **Run tests during development**
   ```bash
   pytest tests/test_module.py  # Test specific file
   pytest -k "test_pattern"      # Test matching pattern
   pytest -v                     # Verbose output
   ```

4. **Before completing work, run full test suite**
   ```bash
   pytest --cov=src --cov-report=term-missing
   ```

### Testing Anti-Patterns to Avoid
- ❌ Conditional assertions (if statements in test bodies)
- ❌ Testing types instead of behavior
- ❌ Over-mocking (mocking business logic)
- ❌ Accepting multiple outcomes in one test
- ❌ Tests that don't fail when production code breaks

See `.github/agents/test.md` for comprehensive testing guidance.

## 📋 CODE QUALITY REQUIREMENTS

**All code must pass quality checks before commit:**

```bash
# Run all checks at once
make check-all

# Or run individually:
ruff format .        # Format code
ruff check .         # Lint code
mypy src/           # Type check
bandit -r src/      # Security scan
pytest              # Run tests
```

### Quality Standards
1. **Formatting**: Code must be formatted with ruff
2. **Linting**: All ruff warnings must be fixed or explicitly ignored with justification
3. **Type Checking**: All functions must have type annotations
4. **Security**: No unaddressed bandit warnings
5. **Testing**: All tests must pass with >80% coverage

### Handling Unavoidable Warnings
- Add `# noqa: <code>` for linting false positives with justification comment
- Add `# type: ignore[<error>]` for typing false positives with justification
- Add `# nosec` for security false positives with explanation

## 🎯 TYPE ANNOTATIONS

**Required for all code:**
- ALL function parameters must be typed
- ALL function returns must be typed
- Use proper typing syntax: `list[str]`, `dict[str, int]`, `Optional[T]`, etc.
- In classes: `self` is untyped, all other parameters must be typed

Example:
```python
from typing import Optional

def process_data(
    items: list[str],
    max_count: Optional[int] = None
) -> dict[str, int]:
    """Process items and return count mapping.
    
    Args:
        items: List of items to process
        max_count: Optional maximum number of items to process
        
    Returns:
        Dictionary mapping items to their counts
    """
    # implementation
    pass
```

## 🤖 CUSTOM AGENT PROFILES

This project includes specialized agent profiles in `.github/agents/`:

- **Architecture Agent** (`architecture.md`): System design and architectural decisions
- **Test Agent** (`test.md`): Test writing and testing strategies  
- **Debug Agent** (`debug.md`): Debugging and troubleshooting
- **Documentation Agent** (`documentation.md`): Technical writing and documentation

### Using Custom Agents
```
@workspace /agent test.md Write tests for the authentication module
@workspace /agent architecture.md Design a plugin system
@workspace /agent debug.md Help debug the API timeout issue
```

See `.github/agents/README.md` for detailed usage instructions.

## 🚀 DEVELOPMENT WORKFLOW

### Starting a New Feature
1. Activate venv: `. venv/bin/activate`
2. Create feature branch: `git checkout -b feature/name`
3. Run existing tests to ensure baseline: `pytest`
4. Implement feature with TDD approach
5. Run quality checks: `make check-all`
6. Commit with descriptive message

### Before Committing
```bash
# Activate venv
. venv/bin/activate

# Run all quality checks
make check-all

# Verify all checks pass before committing
git status
git add .
git commit -m "Descriptive commit message"
```

### Pull Request Checklist
- [ ] Virtual environment activated during development
- [ ] All tests pass
- [ ] Code coverage maintained/improved (>80%)
- [ ] All quality checks pass (format, lint, type, security)
- [ ] Documentation updated if needed
- [ ] No temporary files in commit

## 🔍 COMMON ISSUES AND SOLUTIONS

### "Module not found" Error
**Cause:** Virtual environment not activated  
**Solution:** Run `. venv/bin/activate`

### Tests Failing on Import
**Cause:** Package not installed in development mode  
**Solution:** 
```bash
. venv/bin/activate
pip install -e '.[dev]'
```

### Type Checking Errors
**Cause:** Missing type annotations  
**Solution:** Add type hints to all function parameters and returns

### Pre-commit Hooks Failing
**Cause:** Code doesn't meet quality standards  
**Solution:** Run `make fix` to auto-fix issues, then manually fix remaining

## 📋 DOCUMENTATION SYSTEM

This project uses an automated documentation system to keep agent context up-to-date.

### Folder Structure and Rules

| Folder | Purpose | Persistence | Committed to Git |
|--------|---------|-------------|------------------|
| `agent-tmp/` | Scratch / debug / intermediates | Ephemeral (auto-cleaned) | ❌ No (gitignored) |
| `agent-projects/<project>/` | Ephemeral plan docs for refactors, experiments | Short-lived | ✅ Yes |
| `docs/` | Permanent, canonical documentation | Persistent | ✅ Yes |
| `docs/_generated/` | Auto-generated documentation | Auto-updated | ✅ Yes (auto-committed) |

### Documentation Folder Rules

#### `agent-tmp/` - Temporary Workspace
- **Purpose**: Scratch files, debugging scripts, intermediate outputs
- **Rules**:
  - Agents may freely create or delete files here
  - Nothing in this folder is committed to git (gitignored)
  - Files older than 7 days are automatically pruned by automation
- **Examples**: Debug logs, temporary analysis scripts, work-in-progress calculations

#### `agent-projects/<project>/` - Ephemeral Plans
- **Purpose**: Short-lived planning documents for specific refactors, experiments, or migrations
- **Rules**:
  - Each plan has its own subfolder (e.g., `agent-projects/feature-xyz/`)
  - Each plan must have a `plan.md` file with required metadata
  - Only "active" plans less than 21 days old are summarized in generated docs
  - Completed or old plans remain in history but are ignored by automation
- **Required Metadata** in `plan.md`:
  ```yaml
  status: active|paused|done
  owner: <name>
  created: YYYY-MM-DD
  summary:
    - short bullet
    - another bullet
  ```

#### `docs/` - Permanent Documentation
- **Purpose**: Single source of truth for all permanent project documentation
- **Rules**:
  - This is the canonical location for all long-term documentation
  - Agents should prefer this folder when writing permanent docs
  - All documentation here is version-controlled
  - Files should be well-organized and clearly named
- **Examples**: Architecture guides, API docs, user guides, decision records

#### `docs/_generated/` - Auto-Generated Documentation
- **Purpose**: Documentation automatically generated from code, schemas, and active plans
- **Rules**:
  - Files here are automatically generated by `tools/build_context.py`
  - Do not manually edit files in this directory
  - Generated on every relevant code/doc change and nightly
  - Auto-committed by GitHub Actions
- **Contents**:
  - API documentation (from Python docstrings via pdoc3)
  - Schema documentation
  - Active plans summary (`plans_index.md`)

### Primary Documentation Files for Agents

- **`docs/CONTEXT.md`** - Single canonical context file; main entry point for agents
- **`docs/SUMMARY.md`** - Quick index of all documentation components
- **`docs/facts.json`** - Stable, hand-maintained truths about the project
- **`docs/_generated/`** - Auto-generated API docs, schemas, and active plans

### Trust Hierarchy (when information conflicts)
1. `docs/facts.json` (highest authority)
2. Permanent content in `docs/`
3. Active plans summaries (hints only)

### Automation

The `tools/build_context.py` script:
1. Regenerates API docs from Python docstrings (using pdoc3)
2. Summarizes active plans (status=active, created within 21 days)
3. Merges everything into `docs/CONTEXT.md` (capped at ~150 KB)
4. Updates `docs/SUMMARY.md` with component list and timestamp
5. Appends an entry to `docs/CHANGELOG.md`
6. Prunes `agent-tmp/` files older than 7 days

GitHub Action (`.github/workflows/docs.yml`):
- **Triggers**: Push events changing source/schema/docs files, nightly at 2 AM UTC
- **Actions**: Runs `tools/build_context.py`, auto-commits updated documentation

### Agent Documentation Guidelines

**When Reading Documentation:**
1. Start with `docs/CONTEXT.md` for comprehensive context
2. Check `docs/SUMMARY.md` for quick navigation
3. Consult `docs/facts.json` for stable project truths
4. Review `docs/_generated/plans_index.md` for active work
5. Trust the hierarchy: facts.json > permanent docs > active plans

**When Writing Documentation:**

For permanent knowledge:
- Write to or update files under `docs/`
- Use clear, descriptive filenames
- Keep documentation synchronized with code
- Update existing docs rather than duplicating information

For ephemeral plans/tasks:
- Create a new subfolder: `agent-projects/<project-name>/`
- Write `plan.md` with required metadata fields
- Include detailed planning, research, and progress notes
- Update status when work is complete or paused

For temporary work:
- Use `agent-tmp/` for all scratch work
- Never commit files from `agent-tmp/`
- Don't rely on these files persisting long-term

**When Updating Documentation:**
- The nightly automation will refresh generated docs automatically
- To manually regenerate: `python tools/build_context.py`
- Each refresh updates `CHANGELOG.md` with timestamp and source SHA

## 📚 ADDITIONAL RESOURCES

- [Project README](README.md) - Project overview and quick start
- [Contributing Guide](CONTRIBUTING.md) - Contribution guidelines
- [Custom Agents](.github/agents/README.md) - Specialized agent profiles
- [Testing Guide](.github/agents/test.md) - Comprehensive testing guidance

## 🎓 PROJECT PHILOSOPHY

- **Quality over Speed**: Take time to write good tests and clean code
- **Type Safety**: Leverage Python's type system for better code
- **Test-Driven Development**: Write tests first when practical
- **Clear Communication**: Use descriptive names and comprehensive docstrings
- **Continuous Improvement**: Refactor as you go, don't let technical debt accumulate

---

**Remember:** Always activate the virtual environment first! It's the most common source of issues.
