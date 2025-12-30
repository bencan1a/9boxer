# When to Use Python Virtual Environments (venv)

## TL;DR

| Environment | Use venv? | Why |
|-------------|-----------|-----|
| **Local Windows/macOS** | ✅ **YES** | Isolates from system Python |
| **Devcontainer** | ❌ **NO** | Container already isolated |
| **CI/CD** | ❌ **NO** | Runner already isolated |

## Detailed Explanation

### Local Development (Laptop/Desktop)

**Setup**: Follow README.md instructions

```bash
# On your Windows/macOS/Linux machine (NOT in devcontainer)
python3 -m venv .venv
. .venv/bin/activate        # Linux/macOS
# or
.venv\Scripts\activate      # Windows

pip install uv
uv pip install -e '.[dev]'  # Note: NO --system flag
```

**Why venv is needed**:
- ✅ Your OS is a shared system (multiple users, projects)
- ✅ Prevents conflicts between different projects
- ✅ Doesn't require admin/sudo for package installation
- ✅ Can have different Python versions per project
- ✅ Safe to delete and recreate without affecting system

**Example scenario**:
- Project A needs `pandas==1.5.0`
- Project B needs `pandas==2.0.0`
- Without venv: CONFLICT! Only one version can be installed
- With venv: Each project has its own isolated packages

### Devcontainer Development (Remote Ubuntu in Docker)

**Setup**: Let devcontainer handle it automatically

```bash
# DO NOT create venv manually!
# The devcontainer.json does this:
pip install uv
uv pip install --system -e '.[dev]'  # Note: --system flag
```

**Why venv is NOT needed**:
- ✅ Container is single-purpose (only runs 9boxer)
- ✅ Complete isolation from host OS
- ✅ Container can be deleted and recreated easily
- ✅ Matches CI environment (for testing parity)
- ✅ Simpler setup, fewer moving parts

**Example scenario**:
- The container ONLY runs 9boxer - no other projects
- If you need different packages, rebuild the container
- Container is ephemeral - isolation is guaranteed

### CI/CD (GitHub Actions)

**Setup**: Workflow handles it automatically

```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: |
    pip install uv
    uv pip install --system -e '.[dev]'  # Note: --system flag
```

**Why venv is NOT needed**:
- ✅ Each job runs in a fresh runner
- ✅ Runner is destroyed after job completes
- ✅ No possibility of conflicts with other projects
- ✅ Faster (no venv creation overhead)

## Migration Scenarios

### Scenario 1: Local Dev → Devcontainer

```bash
# On local machine (your laptop)
# ✅ Keep using venv
python3 -m venv .venv
. .venv/bin/activate
uv pip install -e '.[dev]'

# When you open in devcontainer
# ❌ DON'T create venv
# Container uses system Python automatically
which python  # Shows /usr/local/bin/python, not .venv/bin/python
```

### Scenario 2: Devcontainer → Local Dev

```bash
# In devcontainer
# ❌ No venv
pip list  # Shows system packages

# When you exit container and work locally
# ✅ Create venv
python3 -m venv .venv
. .venv/bin/activate
uv pip install -e '.[dev]'
```

### Scenario 3: Switching Between Local and Remote

```bash
# You can use BOTH!
# .venv/ is gitignored, so it only exists locally

# On your laptop:
. .venv/bin/activate       # Use local venv
pytest backend/tests/

# In devcontainer (same project):
pytest backend/tests/       # Uses system Python
```

## Common Questions

### Q: Why does CI use `--system` but local dev doesn't?

**A**:
- **CI**: Runner is isolated → safe to install system-wide
- **Local**: Your laptop is shared → need venv isolation

### Q: Should I delete .venv when using devcontainer?

**A**: No! Keep it for local development. The devcontainer ignores it.

```bash
# .venv/ is in .gitignore
# Devcontainer sees it but doesn't use it
# Your local environment uses it when not in container
```

### Q: Can I use venv in the devcontainer anyway?

**A**: You *can*, but **don't**:
- ❌ Breaks parity with CI (tests may pass locally but fail in CI)
- ❌ Adds unnecessary complexity
- ❌ Slower container startup
- ❌ More disk usage

### Q: What if I want different Python packages for testing?

**Local dev**:
```bash
# Create a separate venv
python3 -m venv .venv-experiment
. .venv-experiment/bin/activate
pip install experimental-package
```

**Devcontainer**:
```bash
# Temporarily install (will reset on rebuild)
pip install experimental-package

# Permanently install: add to pyproject.toml and rebuild
```

### Q: How do I know if I'm in a devcontainer?

```bash
# Check the container environment variable
echo $REMOTE_CONTAINERS  # Set to "true" in devcontainer

# Or check the Python path
which python
# Devcontainer: /usr/local/bin/python
# Local with venv: /path/to/9boxer/.venv/bin/python
```

## Best Practices

### ✅ DO

- Use venv for local development on your laptop
- Use system Python in devcontainer
- Match your local venv Python version to container (3.13)
- Delete and recreate venv if dependencies get corrupted

### ❌ DON'T

- Create venv inside devcontainer
- Use `--system` flag for local development
- Commit `.venv/` to git (it's already in `.gitignore`)
- Mix venv and system pip commands

## Summary

**venv is a tool for isolation on shared systems**

- Shared system (laptop) → ✅ Use venv
- Isolated environment (container, CI) → ❌ Skip venv

The devcontainer eliminates the need for venv by providing a dedicated, isolated environment just for 9boxer development.
