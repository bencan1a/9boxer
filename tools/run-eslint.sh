#!/bin/bash
# Wrapper script to run ESLint from frontend directory
# This ensures ESLint runs with the correct configuration and only fails on errors

# Navigate to project root directory (parent of tools/)
cd "$(dirname "$0")/.." || exit 1

# Run ESLint from frontend directory
cd frontend || exit 1

# Run ESLint on staged files
# Only fail on errors, allow warnings (don't use --max-warnings flag)
npx eslint . --ext ts,tsx --report-unused-disable-directives
