#!/bin/bash
# Wrapper script to run TypeScript type checking from frontend directory
# This is needed for ARM64 compatibility - avoids nodeenv issues
# Uses tsconfig.typecheck.json which excludes test files (tests are validated when run)

# Navigate to project root directory (parent of tools/)
cd "$(dirname "$0")/.." || exit 1

# Run TypeScript type checking from frontend directory
cd frontend || exit 1

# Run tsc with --noEmit to check types without generating output files
# Use tsconfig.typecheck.json to exclude test files
npx tsc --noEmit --project tsconfig.typecheck.json
