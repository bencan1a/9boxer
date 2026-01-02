#!/bin/bash
# Wrapper for running tests with clearer error messages

echo ""
echo "================================================================"
echo "  Running Frontend Tests (this may take ~5 seconds)"
echo "================================================================"
echo ""

cd frontend

# Capture test output to a temp file
TEMP_OUTPUT=$(mktemp)
npm run test:fast 2>&1 | tee "$TEMP_OUTPUT"

TEST_EXIT_CODE=${PIPESTATUS[0]}

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  ❌ PUSH BLOCKED: Frontend tests failed!"
    echo "================================================================"
    echo ""

    # Extract and display failing test information
    FAILED_TESTS=$(grep -A 2 "FAIL" "$TEMP_OUTPUT" | grep -E "✓|×" | head -10)
    FAILED_COUNT=$(grep "Test Files" "$TEMP_OUTPUT" | grep -oP '\d+(?= failed)' || echo "unknown")

    if [ ! -z "$FAILED_TESTS" ]; then
        echo "  Failed Tests ($FAILED_COUNT):"
        echo "$FAILED_TESTS" | sed 's/^/    /'
        echo ""
    fi

    # Show assertion errors for context
    ASSERTION_ERRORS=$(grep -B 3 "AssertionError" "$TEMP_OUTPUT" | grep -E "Expected|Received|toBe|toEqual|toBeLessThanOrEqual" | head -5)
    if [ ! -z "$ASSERTION_ERRORS" ]; then
        echo "  Error Details:"
        echo "$ASSERTION_ERRORS" | sed 's/^/    /'
        echo ""
    fi

    echo "  To see full test output:"
    echo "    cd frontend && npm run test:fast"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git push --no-verify"
    echo ""
    echo "================================================================"

    rm -f "$TEMP_OUTPUT"
    exit $TEST_EXIT_CODE
fi

rm -f "$TEMP_OUTPUT"
echo ""
echo "✅ All tests passed!"
echo ""
exit 0
