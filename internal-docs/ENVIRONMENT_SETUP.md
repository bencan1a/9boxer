# Environment Setup & Detection

**Purpose:** Detect your environment and set up correctly to prevent 90% of common issues.

**Last Updated:** 2025-12-29

---

## 🔍 Quick Environment Check (Do This First!)

Before running any Python commands, detect your environment to avoid dependency errors, venv issues, and platform conflicts.

### Detection Commands

```bash
# Check if you're in a virtual environment
python -c "import sys; print('✓ VENV active' if sys.prefix != sys.base_prefix else '✗ System Python')"

# Check your operating system
uname -s 2>/dev/null || echo "Windows"

# Check if project dependencies are installed
python -c "import fastapi" 2>/dev/null && echo "✓ Dependencies installed" || echo "✗ Dependencies missing"
```

### Quick Detection Script

**One command to check everything:**

```bash
# Quick detection
python -c "
import sys
import os

# Check venv
in_venv = sys.prefix != sys.base_prefix
print('Environment:', 'VENV' if in_venv else 'SYSTEM')

# Check OS
import platform
print('OS:', platform.system())

# Check dependencies
try:
    import fastapi, pytest, ruff
    print('Dependencies: ✓ Installed')
except ImportError:
    print('Dependencies: ✗ Missing')
"
```

---

## Conditional Setup Paths

Based on your detection results, follow the appropriate path:

### Path A: Virtual Environment Active + Dependencies Installed ✅

**You're ready to work!**

```bash
# Run tests
pytest

# Run quality checks
make check-all

# Start development
cd frontend && npm run electron:dev
```

### Path B: Virtual Environment Active + Dependencies Missing

**Install dependencies:**

```bash
# Upgrade pip first (recommended)
pip install --upgrade pip

# Install project in development mode
pip install -e '.[dev]'

# Verify installation
python -c "import fastapi, pytest, ruff" && echo "✓ Ready"
```

### Path C: System Python (No Virtual Environment)

**Two scenarios:**

#### Scenario C1: .venv/ exists (activate it)

```bash
# Linux/macOS
. .venv/bin/activate

# Windows (Git Bash/PowerShell)
.venv\Scripts\activate

# Verify activation
python -c "import sys; print('✓ VENV active' if sys.prefix != sys.base_prefix else '✗ Still system')"

# Install dependencies if needed
pip install -e '.[dev]'
```

#### Scenario C2: .venv/ does NOT exist (create it)

```bash
# Create virtual environment
python3 -m venv .venv

# Activate it
. .venv/bin/activate      # Linux/macOS
.venv\Scripts\activate    # Windows

# Install dependencies
pip install --upgrade pip
pip install -e '.[dev]'
```

### Path D: Container/DevContainer/Codespace (No .venv/)

**In containerized environments, install directly to system Python:**

```bash
# Install dependencies directly
pip install -e '.[dev]'

# Or if using uv (faster)
pip install uv
uv pip install --system -e '.[dev]'

# Verify
python -c "import fastapi, pytest, ruff" && echo "✓ Ready"
```

**Note:** Containers have isolated Python environments, so no venv needed.

---

## Platform Detection

### Detect Your Platform

```bash
# Cross-platform detection
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  echo "Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  echo "macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  echo "Windows"
else
  echo "Unknown: $OSTYPE"
fi
```

### Platform-Specific Considerations

**When Windows is detected:**
- Use Read/Write/Edit tools for file operations (not `rm`, `touch`, `cp`, `mv`)
- Use relative paths only in Bash (no `C:\...` absolute paths)
- For null device: Use `os.devnull` in Python, avoid `> "nul"` in bash
- **Full Windows constraints:** [PLATFORM_CONSTRAINTS.md](PLATFORM_CONSTRAINTS.md)

**When Linux/macOS is detected:**
- Standard bash commands work as expected
- Venv activation: `. .venv/bin/activate`
- Null device: `/dev/null` works normally

---

## Common Environment Issues

### Issue: "Module not found" Error

**Symptom:**
```bash
$ python script.py
ModuleNotFoundError: No module named 'fastapi'
```

**Diagnosis:**
```bash
# Check if in venv
python -c "import sys; print(sys.prefix)"

# Check where packages are installed
pip list
```

**Solution:**
- If system Python → Activate venv: `. .venv/bin/activate`
- If in venv → Install deps: `pip install -e '.[dev]'`
- If container → Install directly: `pip install -e '.[dev]'`

### Issue: "No module named 'pytest'" (but it's installed)

**Symptom:**
```bash
$ pip install pytest
Requirement already satisfied: pytest

$ pytest
bash: pytest: command not found
```

**Cause:** Wrong venv activated or PATH issue

**Solution:**
```bash
# Deactivate current venv
deactivate

# Activate correct venv
. .venv/bin/activate

# Verify
which python
which pytest
```

### Issue: Agents Try to Install When They Should Activate

**Symptom:**
- Agent detects missing module
- Agent tries `pip install`
- Installation fails or installs to wrong location
- Agent spirals trying different approaches

**Root cause:** Agent didn't check environment first

**Solution:** Always run environment detection before any pip commands:

```bash
# FIRST: Detect environment
python -c "import sys; print('VENV' if sys.prefix != sys.base_prefix else 'SYSTEM')"

# THEN: Take appropriate action based on result
```

### Issue: Container Has No .venv/ but Works Fine

**Not an issue!** This is expected.

**Explanation:**
- Containers have isolated system Python
- No need for venv (container IS the virtual environment)
- Install directly with `pip install -e '.[dev]'`

---

## Environment-Aware Command Patterns

### Pattern: Check Before Installing

```bash
# ❌ WRONG (assumes environment)
pip install -e '.[dev]'

# ✅ CORRECT (detects then acts)
if python -c "import sys; sys.exit(0 if sys.prefix != sys.base_prefix else 1)" 2>/dev/null; then
  echo "VENV active, installing..."
  pip install -e '.[dev]'
else
  if [[ -d ".venv" ]]; then
    echo "Activating venv..."
    . .venv/bin/activate && pip install -e '.[dev]'
  else
    echo "Container detected, installing to system..."
    pip install -e '.[dev]'
  fi
fi
```

### Pattern: Cross-Platform Venv Activation

```bash
# Detect and activate
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  .venv/Scripts/activate
else
  # Linux/macOS
  . .venv/bin/activate
fi
```

### Pattern: Verify Environment Before Running Tests

```bash
# Check environment is ready
if ! python -c "import fastapi, pytest, ruff" 2>/dev/null; then
  echo "❌ Dependencies missing. Run setup first:"
  echo "  . .venv/bin/activate"
  echo "  pip install -e '.[dev]'"
  exit 1
fi

# Run tests
pytest
```

---

## Quick Reference

| Scenario | Detection | Action |
|----------|-----------|--------|
| **VENV + deps installed** | `sys.prefix != sys.base_prefix` + imports work | ✓ Ready to work |
| **VENV + missing deps** | `sys.prefix != sys.base_prefix` + import fails | `pip install -e '.[dev]'` |
| **System + .venv exists** | `sys.prefix == sys.base_prefix` + `.venv/` dir | `. .venv/bin/activate` |
| **System + no .venv** | `sys.prefix == sys.base_prefix` + no `.venv/` | `python3 -m venv .venv` then activate |
| **Container** | No `.venv/` dir + isolated env | `pip install -e '.[dev]'` directly |
| **Windows** | `$OSTYPE == msys/win32` | Use `.venv\Scripts\activate`, avoid bash file ops |
| **Linux/macOS** | `$OSTYPE == linux-gnu/darwin` | Use `. .venv/bin/activate`, bash works normally |

---

## Best Practices

### DO ✅

- **Always check environment before running commands**
- **Use detection commands to determine correct path**
- **Verify dependencies before assuming they're installed**
- **Use `python -c "import X"` to check imports**
- **Adapt behavior based on detected OS/environment**

### DON'T ❌

- **Don't assume you're in a venv** (check first!)
- **Don't assume Linux environment** (might be Windows or container)
- **Don't try to install if venv isn't activated** (activate first)
- **Don't create .venv in containers** (not needed)
- **Don't use absolute Windows paths in Bash** (use relative paths)

---

## Related Documentation

- **[PLATFORM_CONSTRAINTS.md](PLATFORM_CONSTRAINTS.md)** - Platform-specific constraints (Windows, Linux, macOS)
- **[facts.json](facts.json)** - Environment detection commands in structured format
- **[CLAUDE_INDEX.md](../CLAUDE_INDEX.md)** - Quick start with environment check
- **[AGENTS.md](../AGENTS.md)** - Development workflow guide

---

**Remember:** 90% of "module not found" and installation issues come from not checking your environment first. Always detect, then act!
