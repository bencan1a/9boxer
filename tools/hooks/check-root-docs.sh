#!/bin/bash
# Pre-commit hook to prevent agents from creating documentation files in project root
# Only specific, project-essential markdown files are allowed in root

set -e

# Allowed markdown files in root (project-essential only)
ALLOWED_ROOT_DOCS=(
  "README.md"
  "CHANGELOG.md"
  "CONTRIBUTING.md"
  "AGENTS.md"
  "CLAUDE_INDEX.md"
  "GITHUB_AGENT.md"
  "LICENSE.md"
  "CODE_OF_CONDUCT.md"
)

# Get all .md files in root directory that are staged for commit
STAGED_ROOT_DOCS=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^[^/]+\.md$' || true)

if [ -z "$STAGED_ROOT_DOCS" ]; then
  # No root-level .md files staged, exit success
  exit 0
fi

# Check each staged root .md file
VIOLATIONS=()
while IFS= read -r file; do
  # Extract just the filename
  filename=$(basename "$file")

  # Check if it's in the allowed list
  allowed=false
  for allowed_file in "${ALLOWED_ROOT_DOCS[@]}"; do
    if [ "$filename" = "$allowed_file" ]; then
      allowed=true
      break
    fi
  done

  if [ "$allowed" = false ]; then
    VIOLATIONS+=("$filename")
  fi
done <<< "$STAGED_ROOT_DOCS"

# If there are violations, report them and exit with error
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  echo "❌ ERROR: Disallowed markdown files in project root"
  echo ""
  echo "The following files are not allowed in the root directory:"
  for violation in "${VIOLATIONS[@]}"; do
    echo "  - $violation"
  done
  echo ""
  echo "📁 Correct locations for documentation:"
  echo "  - agent-tmp/          → Temporary/debug files (auto-cleaned after 7 days)"
  echo "  - agent-projects/<name>/ → Active project plans"
  echo "  - internal-docs/      → Permanent internal documentation"
  echo ""
  echo "Only project-essential files are allowed in root:"
  for allowed_file in "${ALLOWED_ROOT_DOCS[@]}"; do
    echo "  ✓ $allowed_file"
  done
  echo ""
  echo "See AGENTS.md (lines 51-59) for file organization rules."
  exit 1
fi

exit 0
