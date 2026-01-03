#!/bin/bash
# Wrapper for running lint checks with clearer error messages
# Calls make lint (which runs ruff check .)

# Change to repo root
cd "$(dirname "$0")/../.."

echo ""
echo "================================================================"
echo "  Running Lint Checks (ruff)"
echo "================================================================"
echo ""

make lint 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  COMMIT BLOCKED: Lint check failed!"
    echo "================================================================"
    echo ""
    echo "  To auto-fix issues:"
    echo "    make fix"
    echo ""
    echo "  To see full lint output:"
    echo "    make lint"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git commit --no-verify"
    echo ""
    echo "================================================================"
    exit $EXIT_CODE
fi

echo ""
echo "All lint checks passed!"
echo ""
exit 0
