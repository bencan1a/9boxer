#!/bin/bash
# Wrapper for running format checks with clearer error messages
# Calls make format-check (which runs ruff format --check .)

# Change to repo root
cd "$(dirname "$0")/../.."

echo ""
echo "================================================================"
echo "  Running Format Checks (ruff)"
echo "================================================================"
echo ""

make format-check 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  COMMIT BLOCKED: Format check failed!"
    echo "================================================================"
    echo ""
    echo "  To auto-fix formatting:"
    echo "    make format"
    echo ""
    echo "  To see what would change:"
    echo "    ruff format --diff ."
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git commit --no-verify"
    echo ""
    echo "================================================================"
    exit $EXIT_CODE
fi

echo ""
echo "All format checks passed!"
echo ""
exit 0
