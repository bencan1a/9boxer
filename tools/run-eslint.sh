#!/bin/bash
# Wrapper script to run ESLint from frontend directory
# This ensures ESLint runs with the correct configuration and only fails on errors

# Navigate to project root directory (parent of tools/)
cd "$(dirname "$0")/.." || exit 1

# Run ESLint from frontend directory
cd frontend || exit 1

# If files are passed, run ESLint on those specific files
# Otherwise, run on all files (for manual execution)
if [ $# -gt 0 ]; then
    # Strip 'frontend/' prefix from paths and run ESLint
    files=()
    for file in "$@"; do
        # Remove 'frontend/' prefix if present
        rel_path="${file#frontend/}"
        files+=("$rel_path")
    done

    # Run ESLint on specific files
    # Only fail on errors, allow warnings (don't use --max-warnings flag)
    npx eslint "${files[@]}" --report-unused-disable-directives
else
    # Run ESLint on all files (manual execution)
    npx eslint . --ext ts,tsx --report-unused-disable-directives
fi
