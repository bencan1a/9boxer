#!/bin/bash
# Wrapper for running bundle size check with clearer error messages

echo ""
echo "================================================================"
echo "  Checking Frontend Bundle Size"
echo "================================================================"
echo ""

cd frontend
npm run check:bundle

CHECK_EXIT_CODE=$?

if [ $CHECK_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  ❌ PUSH BLOCKED: Bundle size check failed!"
    echo "================================================================"
    echo ""
    echo "  Your changes may have increased the bundle size beyond limits."
    echo ""
    echo "  To review the bundle size:"
    echo "    cd frontend && npm run check:bundle"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git push --no-verify"
    echo ""
    echo "================================================================"
    exit $CHECK_EXIT_CODE
fi

echo ""
echo "✅ Bundle size check passed!"
echo ""
exit 0
