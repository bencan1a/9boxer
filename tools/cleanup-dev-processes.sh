#!/bin/bash
# Development Process Cleanup Script for 9Boxer
# Kills all lingering dev processes (backend, frontend, servers)
# Safe to run anytime - only kills 9Boxer-related processes

echo ""
echo "========================================"
echo "9Boxer Development Process Cleanup"
echo "========================================"
echo ""

# Kill ninebox processes (backend executable)
echo "[1/5] Checking for ninebox processes..."
if pgrep -x "ninebox" > /dev/null; then
    echo "  > Found ninebox processes, killing..."
    pkill -9 -x "ninebox"
    echo "  > ninebox processes terminated"
else
    echo "  > No ninebox processes found"
fi

# Kill processes using port 38000 (backend port)
echo ""
echo "[2/5] Checking for processes on port 38000..."
if lsof -ti:38000 > /dev/null 2>&1; then
    echo "  > Found processes using port 38000, killing..."
    lsof -ti:38000 | xargs kill -9 2>/dev/null
    echo "  > Port 38000 cleanup complete"
else
    echo "  > No processes found on port 38000"
fi

# Kill processes using port 5173 (Vite dev server)
echo ""
echo "[3/5] Checking for processes on port 5173..."
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "  > Found processes using port 5173, killing..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "  > Port 5173 cleanup complete"
else
    echo "  > No processes found on port 5173"
fi

# Kill uvicorn processes (Python dev server)
echo ""
echo "[4/5] Checking for uvicorn processes..."
if pgrep -f "uvicorn" > /dev/null; then
    echo "  > Found uvicorn processes, killing..."
    pkill -9 -f "uvicorn"
    echo "  > Uvicorn processes terminated"
else
    echo "  > No uvicorn processes found"
fi

# Kill npm/Vite processes
echo ""
echo "[5/5] Checking for npm/Vite processes..."
if pgrep -f "vite" > /dev/null; then
    echo "  > Found Vite processes, killing..."
    pkill -9 -f "vite"
    echo "  > Vite processes terminated"
else
    echo "  > No Vite processes found"
fi

echo ""
echo "========================================"
echo "Cleanup Complete!"
echo "========================================"
echo ""
echo "All 9Boxer development processes have been cleaned up."
echo "You can now start a fresh debug session."
echo ""

# Give user time to see results
sleep 2

# Exit with success code
exit 0
