# Base image: Python 3.13 on Debian Bullseye
FROM mcr.microsoft.com/devcontainers/python:1-3.13-bullseye

# Install system dependencies for headless GUI applications
# This includes X11, Xvfb (virtual framebuffer), and x11vnc for remote viewing
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    # X11 libraries and utilities
    xvfb \
    x11vnc \
    x11-utils \
    x11-xserver-utils \
    xauth \
    dbus-x11 \
    # Additional libraries needed by Electron and Chromium
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    # VNC viewer/server utilities
    fluxbox \
    novnc \
    websockify \
    # Screen/window manager for better VNC experience
    x11-apps \
    # Cleanup
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Set up VNC password (default: 9boxer)
# You should change this to something more secure
RUN mkdir -p /home/vscode/.vnc \
    && x11vnc -storepasswd 9boxer /home/vscode/.vnc/passwd \
    && chown -R vscode:vscode /home/vscode/.vnc

# Create directory for Xvfb lock files
RUN mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix

# Set environment variables for headless display
ENV DISPLAY=:99
ENV DISPLAY_WIDTH=1920
ENV DISPLAY_HEIGHT=1080
ENV DISPLAY_DEPTH=24

# Copy helper scripts
COPY scripts/start-display.sh /usr/local/bin/start-display
COPY scripts/start-vnc.sh /usr/local/bin/start-vnc
RUN chmod +x /usr/local/bin/start-display /usr/local/bin/start-vnc

# Switch back to vscode user
USER vscode
