#!/bin/bash
# Start VNC server for remote viewing of the virtual display
# This allows you to connect from your Windows machine to see/interact with GUI apps

set -e

# Default values
DISPLAY_NUM=${DISPLAY_NUM:-99}
VNC_PORT=${VNC_PORT:-5900}
VNC_PASSWORD_FILE=${VNC_PASSWORD_FILE:-/home/vscode/.vnc/passwd}

echo "Starting VNC server on port ${VNC_PORT} for display :${DISPLAY_NUM}..."

# Ensure Xvfb is running
if ! xdpyinfo -display :${DISPLAY_NUM} >/dev/null 2>&1; then
    echo "Error: Display :${DISPLAY_NUM} is not available. Start Xvfb first with 'start-display'"
    exit 1
fi

# Kill any existing VNC server
pkill -f "x11vnc.*:${DISPLAY_NUM}" 2>/dev/null || true

# Start x11vnc
if [ -f "${VNC_PASSWORD_FILE}" ]; then
    x11vnc -display :${DISPLAY_NUM} -rfbport ${VNC_PORT} -rfbauth ${VNC_PASSWORD_FILE} -forever -shared -bg -o /tmp/x11vnc.log
    echo "✓ VNC server started on port ${VNC_PORT} (password protected)"
else
    x11vnc -display :${DISPLAY_NUM} -rfbport ${VNC_PORT} -forever -shared -bg -o /tmp/x11vnc.log
    echo "✓ VNC server started on port ${VNC_PORT} (no password - INSECURE)"
fi

echo ""
echo "Connection Information:"
echo "  VNC Port: ${VNC_PORT}"
echo "  Display: :${DISPLAY_NUM}"
echo "  Password: 9boxer (change in Dockerfile)"
echo ""
echo "To connect from Windows:"
echo "  1. Forward port: ssh -L ${VNC_PORT}:localhost:${VNC_PORT} user@remote-host"
echo "  2. Install VNC viewer (e.g., TightVNC, RealVNC, or UltraVNC)"
echo "  3. Connect to: localhost:${VNC_PORT}"
echo ""
echo "Alternative - noVNC (web-based):"
echo "  Run: websockify -D --web=/usr/share/novnc/ 6080 localhost:${VNC_PORT}"
echo "  Then forward port 6080 and browse to: http://localhost:6080/vnc.html"
