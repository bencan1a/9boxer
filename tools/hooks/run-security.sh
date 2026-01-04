#!/bin/bash
# Wrapper for running security checks with clearer error messages
# Calls make security (which runs bandit -c pyproject.toml -r backend/src/ .github/scripts/)

# Change to repo root
cd "$(dirname "$0")/../.."

echo ""
echo "================================================================"
echo "  Running Security Checks (bandit)"
echo "================================================================"
echo ""

make security 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  COMMIT BLOCKED: Security check failed!"
    echo "================================================================"
    echo ""
    echo "  To see full security report:"
    echo "    make security"
    echo ""
    echo "  To generate JSON report:"
    echo "    make security-report"
    echo ""
    echo "  If this is a false positive, add a skip comment:"
    echo "    # nosec B101"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git commit --no-verify"
    echo ""
    echo "================================================================"
    exit $EXIT_CODE
fi

echo ""
echo "All security checks passed!"
echo ""
exit 0
