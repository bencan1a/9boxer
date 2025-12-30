# Platform-Specific Constraints

**Purpose:** Platform-specific rules and constraints (Windows, Linux, macOS). Load this when you detect platform-specific issues or need platform-specific guidance.

**Last Updated:** 2025-12-29

---

## Quick Platform Detection

```bash
# Detect platform
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  PLATFORM="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  PLATFORM="macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  PLATFORM="Windows"
else
  PLATFORM="Unknown ($OSTYPE)"
fi

echo "Platform: $PLATFORM"
```

---

## Windows-Specific Constraints

**When to use:** When `$OSTYPE` is `msys` or `win32`, or when you detect Windows via other means.

### Critical Windows Rules

#### 1. Bash Tool - Absolute Path Handling

**❌ NEVER use absolute Windows paths in Bash commands:**

```bash
# ❌ WRONG - Path gets mangled by Git Bash
cat C:\Git_Repos\9boxer\backend\src\file.py
echo "content" > C:\Users\name\file.txt

# What happens:
# - Colon (:) gets encoded as UTF-8 (\357\200\272)
# - Backslashes disappear
# - Result: File created as "cGit_Repos9boxerbackendsrcfile.py" in wrong location
```

**✅ CORRECT - Use relative paths or Read/Write/Edit tools:**

```bash
# ✅ Use relative paths
cat backend/src/file.py
echo "content" > agent-tmp/file.txt

# ✅ Better: Use Read/Write/Edit tools (platform-agnostic)
# Use Read tool: Read(backend/src/file.py)
# Use Write tool: Write(agent-tmp/file.txt, "content")
```

**Why this happens:**
- Git Bash on Windows runs in Unix emulation mode
- It tries to convert Windows paths to Unix-style
- Absolute Windows paths (`C:\...`) confuse the path conversion
- Relative paths work fine because they don't trigger conversion

#### 2. File Operations - Use Tools Not Bash Commands

**❌ NEVER use these bash commands for file operations on Windows:**

```bash
# ❌ WRONG - Creates phantom files or fails
rm file.txt         # May fail or create issues
touch newfile.txt   # Creates in wrong location
cp file1.txt file2.txt   # Path issues
mv oldfile.txt newfile.txt   # Path issues
```

**✅ CORRECT - Use Claude Code tools or git commands:**

```bash
# ✅ For tracked files - use git
git rm file.txt
git mv oldfile.txt newfile.txt

# ✅ For new/untracked files - use Write/Edit tools
# Use Write tool to create files
# Use Edit tool to modify files
# Use Read tool to read files

# ✅ For temporary files - use Python
python -c "import os; os.remove('file.txt')"
```

#### 3. Reserved Device Names (Critical!)

**Windows reserves these names** (case-insensitive, with or without extensions):

```
CON, PRN, AUX, NUL
COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9
LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8, LPT9
```

**❌ NEVER use these as filenames:**

```bash
# ❌ WRONG - Creates phantom "nul" file that cannot be deleted
echo "data" > "nul"
command > "nul"

# ❌ WRONG - All of these create permanent phantom files
touch nul
touch con
touch prn
echo "test" > aux
```

**What happens:**
- Windows treats these as device names, not files
- Using them as filenames creates phantom files that:
  - Cannot be deleted via normal methods
  - Cannot be moved or renamed
  - Permanently appear in `git status`
  - Require administrator PowerShell to remove

**✅ CORRECT - Use proper null device syntax:**

```bash
# ✅ For Windows null device (no quotes!)
command >nul 2>&1
command 2>nul

# ✅ For cross-platform null device in Python
import os
import subprocess

with open(os.devnull, 'w') as devnull:
    subprocess.run(['command'], stdout=devnull, stderr=devnull)

# ✅ For cross-platform null device in bash
command 2>/dev/null   # Works in Git Bash too
```

#### 4. Fixing Phantom "nul" Files

**If you accidentally created a `nul` file:**

```powershell
# From PowerShell (run as Administrator if needed)
# Navigate to directory containing the phantom file

# Method 1: Device path syntax
Remove-Item -Path "\\?\C:\full\path\to\directory\nul" -Force

# Method 2: Alternative device syntax
del "\\.\C:\full\path\to\directory\nul"

# Replace C:\full\path\to\directory with actual path
```

**Prevention:**
- Always use `>nul` (no quotes) for Windows redirects
- Use `os.devnull` in Python for cross-platform code
- Use `2>/dev/null` for Unix-style redirects (works in Git Bash)

#### 5. Virtual Environment Activation

**Windows uses different activation script:**

```bash
# ❌ WRONG - Won't work on Windows
. .venv/bin/activate

# ✅ CORRECT - Windows paths
.venv\Scripts\activate      # PowerShell/cmd
.venv/Scripts/activate      # Git Bash (forward slashes work)

# ✅ Cross-platform approach
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  .venv/Scripts/activate
else
  . .venv/bin/activate
fi
```

---

## Linux-Specific Constraints

**When to use:** When `$OSTYPE` is `linux-gnu*`

### Linux Characteristics

**Bash commands work as expected:**
- `rm`, `touch`, `cp`, `mv` work normally
- Absolute paths work: `/home/user/file.txt`
- Null device: `/dev/null`
- Venv activation: `. .venv/bin/activate`

**No special constraints** - standard Unix/Linux behavior.

**Best practices:**
- Still prefer Read/Write/Edit tools for agent portability
- Use relative paths when possible (more portable)
- Use `os.devnull` in Python for cross-platform code

---

## macOS-Specific Constraints

**When to use:** When `$OSTYPE` is `darwin*`

### macOS Characteristics

**Similar to Linux with minor differences:**
- Bash commands work as expected
- Absolute paths work: `/Users/name/file.txt`
- Null device: `/dev/null`
- Venv activation: `. .venv/bin/activate`

**macOS-specific notes:**
- Case-insensitive file system by default (HFS+, APFS)
  - `file.txt` and `File.txt` are the same file
  - Git may detect case-only renames as changes
- `/tmp/` is cleaned on reboot
- User data location: `~/Library/Application Support/9Boxer/`

---

## Cross-Platform Best Practices

**For maximum portability across all platforms:**

### 1. File Operations

```python
# ✅ Use Python for file operations (works everywhere)
import os
import shutil

# Create file
with open("file.txt", "w") as f:
    f.write("content")

# Delete file
os.remove("file.txt")

# Copy file
shutil.copy("src.txt", "dst.txt")

# Move file
shutil.move("old.txt", "new.txt")
```

### 2. Path Handling

```python
# ✅ Use pathlib for cross-platform paths
from pathlib import Path

# Construct paths (works on Windows, Linux, macOS)
path = Path("backend") / "src" / "file.py"

# Read file
content = path.read_text()

# Write file
path.write_text("content")

# Check if exists
if path.exists():
    print(f"Found: {path}")
```

### 3. Null Device

```python
# ✅ Use os.devnull for cross-platform null device
import os
import subprocess

with open(os.devnull, 'w') as devnull:
    subprocess.run(['command'], stdout=devnull, stderr=devnull)

# os.devnull automatically resolves to:
# - Windows: "nul"
# - Linux/macOS: "/dev/null"
```

### 4. Environment Variables

```bash
# ✅ Use environment variables for paths
export PROJECT_ROOT=$(pwd)
cd "$PROJECT_ROOT/backend"

# ✅ Python
import os
project_root = os.environ.get('PROJECT_ROOT', os.getcwd())
```

### 5. Temporary Files

```python
# ✅ Use tempfile module (cross-platform)
import tempfile

# Create temp file
with tempfile.NamedTemporaryFile(mode='w', delete=False) as f:
    f.write("content")
    temp_path = f.name

# Create temp directory
with tempfile.TemporaryDirectory() as tmpdir:
    # Use tmpdir
    pass
```

---

## Platform-Specific File Paths

### User Data Directories

**9Boxer stores user data in platform-specific locations:**

| Platform | Path |
|----------|------|
| **Windows** | `C:\Users\{user}\AppData\Roaming\9Boxer\` |
| **macOS** | `~/Library/Application Support/9Boxer/` |
| **Linux** | `~/.config/9Boxer/` |

**Access in code:**

```python
from pathlib import Path
import sys

def get_user_data_dir() -> Path:
    """Get platform-specific user data directory."""
    if sys.platform == "win32":
        base = Path(os.environ["APPDATA"])
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    else:  # Linux
        base = Path.home() / ".config"

    return base / "9Boxer"
```

### Temporary Directories

| Platform | Default Temp Path |
|----------|-------------------|
| **Windows** | `C:\Users\{user}\AppData\Local\Temp\` |
| **macOS** | `/tmp/` (cleared on reboot) |
| **Linux** | `/tmp/` (may be cleared) |

**Use `tempfile.gettempdir()` for platform-agnostic access.**

---

## Platform Detection in Code

### Python

```python
import sys
import platform

# Basic detection
if sys.platform == "win32":
    print("Windows")
elif sys.platform == "darwin":
    print("macOS")
elif sys.platform.startswith("linux"):
    print("Linux")

# Detailed info
print(f"System: {platform.system()}")
print(f"Release: {platform.release()}")
print(f"Version: {platform.version()}")
```

### Bash

```bash
# Using $OSTYPE
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  echo "Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  echo "macOS"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  echo "Windows"
fi

# Using uname (not available on Windows cmd/PowerShell)
case "$(uname -s)" in
  Linux*)     echo "Linux";;
  Darwin*)    echo "macOS";;
  MINGW*|MSYS*) echo "Windows";;
  *)          echo "Unknown";;
esac
```

---

## Common Pitfalls by Platform

### Windows Pitfalls

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| Absolute paths in Bash | Path mangling, files in wrong location | Use relative paths or Read/Write/Edit tools |
| Reserved device names | Phantom files that can't be deleted | Never use CON, NUL, PRN, etc. as filenames |
| `> "nul"` with quotes | Creates permanent `nul` file | Use `>nul` (no quotes) or `os.devnull` |
| Wrong venv activation | `command not found` | Use `.venv\Scripts\activate` not `.venv/bin/activate` |
| Case-sensitivity assumptions | Files work locally but fail in CI | Windows is case-insensitive, Linux/macOS are case-sensitive |

### Linux Pitfalls

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| Hardcoded `/usr/bin/python` | Script fails if Python elsewhere | Use `#!/usr/bin/env python3` |
| Assuming bash in `/bin/bash` | Script fails on some distros | Use `#!/usr/bin/env bash` |
| Permissions issues | `Permission denied` | Check file permissions: `ls -la` |

### macOS Pitfalls

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| Case-only file renames | Git sees as unchanged | Use `git mv` with case changes |
| `/tmp/` cleared on reboot | Lost data after restart | Use user-specific temp or persistent storage |
| BSD vs GNU tools | Different command options | Use Python equivalents for portability |

---

## Quick Reference: Tool Recommendations by Platform

| Task | Windows | Linux/macOS | Best (All Platforms) |
|------|---------|-------------|----------------------|
| **Read file** | Read tool | `cat` or Read tool | **Read tool** |
| **Write file** | Write tool | `echo >` or Write tool | **Write tool** |
| **Delete file** | `git rm` or Write tool | `rm` | **`git rm` (tracked), Python `os.remove` (untracked)** |
| **Copy file** | Python `shutil.copy` | `cp` | **Python `shutil.copy`** |
| **Move file** | `git mv` or Python | `mv` or `git mv` | **`git mv` (tracked), Python `shutil.move` (untracked)** |
| **Null device** | `>nul` (no quotes!) | `>/dev/null` | **Python `os.devnull`** |
| **Temp file** | Python `tempfile` | Python `tempfile` | **Python `tempfile`** |
| **Paths** | Python `pathlib` | Python `pathlib` | **Python `pathlib`** |

---

## Related Documentation

- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - Environment detection and setup
- **[facts.json](facts.json)** - Platform considerations in structured format
- **[OBSERVABILITY.md](architecture/OBSERVABILITY.md)** - Platform-specific log locations

---

**Remember:** When in doubt, use cross-platform Python code instead of platform-specific bash commands!
