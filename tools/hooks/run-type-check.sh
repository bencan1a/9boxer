#!/bin/bash
# Wrapper for running type checks with clearer error messages
# Calls make type-check (which runs mypy backend/src/ .github/scripts/)

# Change to repo root
cd "$(dirname "$0")/../.."

echo ""
echo "================================================================"
echo "  Running Type Checks (mypy)"
echo "================================================================"
echo ""

make type-check 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  COMMIT BLOCKED: Type check failed!"
    echo "================================================================"
    echo ""
    echo "  To see full type check output:"
    echo "    make type-check"
    echo ""
    echo "  Common fixes:"
    echo "    - Add type annotations to function parameters"
    echo "    - Fix type mismatches (check error messages above)"
    echo "    - Add # type: ignore comments for false positives"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git commit --no-verify"
    echo ""
    echo "================================================================"
    exit $EXIT_CODE
fi

echo ""
echo "All type checks passed!"
echo ""
exit 0
