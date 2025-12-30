#!/bin/bash
# Start Xvfb (X Virtual Frame Buffer) for headless GUI applications
# This creates a virtual display that applications can render to without a physical monitor

set -e

# Default values
DISPLAY_NUM=${DISPLAY_NUM:-99}
DISPLAY_WIDTH=${DISPLAY_WIDTH:-1920}
DISPLAY_HEIGHT=${DISPLAY_HEIGHT:-1080}
DISPLAY_DEPTH=${DISPLAY_DEPTH:-24}

echo "Starting Xvfb on display :${DISPLAY_NUM} (${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x${DISPLAY_DEPTH})..."

# Kill any existing Xvfb on this display
pkill -f "Xvfb :${DISPLAY_NUM}" 2>/dev/null || true

# Start Xvfb
Xvfb :${DISPLAY_NUM} -screen 0 ${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x${DISPLAY_DEPTH} -ac -nolisten tcp -dpi 96 +extension RANDR &

# Wait for Xvfb to start
sleep 2

# Verify Xvfb is running
if xdpyinfo -display :${DISPLAY_NUM} >/dev/null 2>&1; then
    echo "✓ Xvfb started successfully on display :${DISPLAY_NUM}"
    export DISPLAY=:${DISPLAY_NUM}
    echo "  Set DISPLAY=:${DISPLAY_NUM} in your environment"
else
    echo "✗ Failed to start Xvfb"
    exit 1
fi
