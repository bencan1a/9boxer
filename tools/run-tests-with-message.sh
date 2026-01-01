#!/bin/bash
# Wrapper for running tests with clearer error messages

echo ""
echo "================================================================"
echo "  Running Frontend Tests (this may take ~5 seconds)"
echo "================================================================"
echo ""

cd frontend
npm run test:fast

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  ❌ PUSH BLOCKED: Frontend tests failed!"
    echo "================================================================"
    echo ""
    echo "  Fix the failing tests before pushing:"
    echo "    cd frontend && npm run test:fast"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git push --no-verify"
    echo ""
    echo "================================================================"
    exit $TEST_EXIT_CODE
fi

echo ""
echo "✅ All tests passed!"
echo ""
exit 0
