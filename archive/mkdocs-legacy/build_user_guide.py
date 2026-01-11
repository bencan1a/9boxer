#!/usr/bin/env python3
"""
Build the user guide documentation using MkDocs Material.

This script replaces the old convert_user_guide.py script.
It builds the MkDocs documentation to resources/user-guide/
for bundling with the Electron application.

The documentation is built as a static site with:
- Dark theme matching the 9Boxer app aesthetic
- Offline search functionality
- Navigation and table of contents
- Syntax highlighting for code blocks
- Material Design styling

Usage:
    python tools/build_user_guide.py

Requirements:
    - mkdocs-material package must be installed
    - mkdocs.yml configuration must exist in project root
    - Documentation source files must exist in docs/ directory

Exit Codes:
    0 - Success
    1 - Error (mkdocs not found, config missing, or build failed)
"""

import subprocess  # nosec B404 - controlled subprocess call
import sys
from pathlib import Path

# Set UTF-8 encoding for Windows console output
if sys.platform == "win32":
    import io

    if sys.stdout.encoding != "utf-8":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    if sys.stderr.encoding != "utf-8":
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

# Color codes for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def main() -> int:
    """Build the user guide documentation using MkDocs."""
    # Get project root (parent of tools/)
    project_root = Path(__file__).parent.parent.resolve()
    output_dir = project_root / "resources" / "user-guide" / "site"

    # Verify mkdocs.yml exists
    mkdocs_config = project_root / "mkdocs.yml"
    if not mkdocs_config.exists():
        print(f"{RED}ERROR: mkdocs.yml not found at {mkdocs_config}{RESET}")
        print(f"{YELLOW}Please ensure the MkDocs configuration file exists.{RESET}")
        return 1

    # Verify docs directory exists
    docs_dir = project_root / "resources" / "user-guide" / "docs"
    if not docs_dir.exists():
        print(f"{RED}ERROR: User guide source directory not found at {docs_dir}{RESET}")
        print(f"{YELLOW}Please ensure the documentation source directory exists.{RESET}")
        return 1

    # Build MkDocs documentation
    print(f"{BLUE}Building user guide documentation...{RESET}")
    print(f"{BLUE}Config: {mkdocs_config}{RESET}")
    print(f"{BLUE}Source: {docs_dir}{RESET}")
    print(f"{BLUE}Output: {output_dir}{RESET}")
    print()

    try:
        # Run mkdocs build - controlled subprocess call with validated inputs
        result = subprocess.run(  # nosec B603 B607
            ["mkdocs", "build", "--site-dir", str(output_dir)],
            cwd=project_root,
            check=True,
            capture_output=True,
            text=True,
        )

        # Print MkDocs output
        if result.stdout:
            print(result.stdout)

        print()
        print(f"{GREEN}✓ User guide built successfully!{RESET}")
        print(f"{GREEN}Documentation ready at: {output_dir}{RESET}")

        # Print summary of generated files
        if output_dir.exists():
            index_html = output_dir / "index.html"
            if index_html.exists():
                size_kb = index_html.stat().st_size / 1024
                print(f"{GREEN}Main page: index.html ({size_kb:.1f} KB){RESET}")

        return 0

    except FileNotFoundError:
        print(f"{RED}ERROR: mkdocs command not found{RESET}")
        print()
        print(f"{YELLOW}Please install MkDocs Material:{RESET}")
        print(f"  {BLUE}pip install mkdocs-material{RESET}")
        print()
        print(f"{YELLOW}Or if using the project virtual environment:{RESET}")
        print(f"  {BLUE}. .venv/bin/activate{RESET}  # Linux/macOS")
        print(f"  {BLUE}.venv\\Scripts\\activate{RESET}  # Windows")
        print(f"  {BLUE}pip install -e .[dev]{RESET}")
        return 1

    except subprocess.CalledProcessError as e:
        print(f"{RED}ERROR: MkDocs build failed{RESET}")
        print()
        if e.stdout:
            print(f"{YELLOW}Output:{RESET}")
            print(e.stdout)
        if e.stderr:
            print(f"{RED}Error details:{RESET}")
            print(e.stderr)
        print()
        print(f"{YELLOW}Please check the error messages above and fix any issues.{RESET}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
