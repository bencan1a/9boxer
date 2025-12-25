#!/bin/bash
# Wrapper script to run prettier from frontend directory
# This is needed for ARM64 compatibility - avoids nodeenv issues

# Navigate to project root directory (parent of tools/)
cd "$(dirname "$0")/.." || exit 1

# Run prettier from project root with full paths
cd frontend || exit 1

# Strip 'frontend/' prefix from paths and run prettier
files=()
for file in "$@"; do
    # Remove 'frontend/' prefix if present
    rel_path="${file#frontend/}"
    files+=("$rel_path")
done

# Run prettier with the relative paths
npx prettier --write "${files[@]}"
