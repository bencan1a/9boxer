# 9Boxer Devcontainer Setup for Remote Development

This devcontainer is configured to support headless GUI application development, enabling you to:
1. Run Playwright tests headlessly on a remote Ubuntu server
2. Launch and interact with the Electron app remotely from your Windows laptop

## Architecture

The devcontainer includes:
- **Xvfb**: Virtual framebuffer for headless display (`:99`)
- **x11vnc**: VNC server for remote GUI viewing
- **noVNC**: Optional web-based VNC client
- All necessary X11 libraries for Electron and Chromium

## Quick Start

### 1. Connect to Remote Host

From your Windows machine, connect to the remote Ubuntu server using VS Code Remote-SSH:

```bash
# In VS Code, use Remote-SSH extension to connect to your remote host
# Press F1 > "Remote-SSH: Connect to Host..."
```

### 2. Open Folder in Devcontainer

Once connected to the remote host:
1. Open the 9boxer project folder
2. VS Code will detect the devcontainer
3. Click "Reopen in Container" when prompted
4. Wait for the container to build and start (first time takes ~5-10 minutes)

The Xvfb display will start automatically via `postStartCommand`.

### 3. Running Headless Playwright Tests

Playwright tests will run headlessly automatically:

```bash
cd frontend
npm run test:e2e:pw        # Run E2E tests
npm run test:visual        # Run visual regression tests
npm run test:all:pw        # Run all Playwright tests
```

The tests use the virtual display (`:99`) automatically via the `DISPLAY` environment variable.

## Remote Electron App Interaction

To interact with the Electron app from your Windows laptop, you have two options:

### Option 1: VNC with Port Forwarding (Recommended)

#### On the Remote Container:

```bash
# Start VNC server (Xvfb should already be running)
start-vnc
```

This will output connection instructions. The VNC server runs on port 5900.

#### On Your Windows Laptop:

1. **Install a VNC client** (choose one):
   - [TightVNC Viewer](https://www.tightvnc.com/download.php) (Free)
   - [RealVNC Viewer](https://www.realvnc.com/en/connect/download/viewer/) (Free)
   - [UltraVNC](https://uvnc.com/downloads/ultravnc.html) (Free)

2. **Port forwarding is automatic** if using VS Code Remote-SSH
   - The devcontainer forwards port 5900 automatically
   - Check the "Ports" tab in VS Code to verify

3. **Connect with VNC client**:
   - Address: `localhost:5900` (or `localhost::5900` depending on client)
   - Password: `9boxer` (default, change in [Dockerfile](.devcontainer/Dockerfile))

4. **Launch Electron app in the container**:
   ```bash
   cd frontend
   npm run electron:dev
   ```

You should now see the Electron app in your VNC viewer!

### Option 2: Web-based VNC (noVNC)

This option requires no VNC client installation.

#### On the Remote Container:

```bash
# Start VNC server first
start-vnc

# Start noVNC web server
websockify -D --web=/usr/share/novnc/ 6080 localhost:5900
```

#### On Your Windows Laptop:

1. Port 6080 is automatically forwarded by the devcontainer
2. Open your browser to: `http://localhost:6080/vnc.html`
3. Click "Connect"
4. Enter password: `9boxer`

## Manual Display Management

If you need to restart or check the display:

```bash
# Check if Xvfb is running
xdpyinfo -display :99

# Manually start Xvfb (if needed)
start-display

# Manually start VNC server
start-vnc

# Check VNC server status
ps aux | grep x11vnc

# View VNC server logs
tail -f /tmp/x11vnc.log
```

## Troubleshooting

### Playwright tests fail with "No display"

```bash
# Ensure DISPLAY is set
echo $DISPLAY  # Should output :99

# Restart Xvfb
start-display
```

### Cannot connect to VNC server

1. **Check port forwarding**:
   - Open VS Code "Ports" tab
   - Verify port 5900 is listed and forwarded
   - If not, manually forward: `ssh -L 5900:localhost:5900 user@remote-host`

2. **Check VNC server is running**:
   ```bash
   ps aux | grep x11vnc
   ```

3. **Check firewall on remote host**:
   ```bash
   # If using manual SSH tunnel, ensure SSH allows port forwarding
   # Check /etc/ssh/sshd_config for: AllowTcpForwarding yes
   ```

### Electron app shows blank screen

```bash
# Try disabling GPU acceleration (already set in devcontainer.json)
export ELECTRON_DISABLE_GPU=1

# Check Electron can access display
echo $DISPLAY
xdpyinfo -display :99

# Try running a simple X11 app first
xeyes  # Should show eyes in VNC viewer
```

### Performance is slow in VNC

1. **Reduce display resolution** (edit [Dockerfile](.devcontainer/Dockerfile)):
   ```dockerfile
   ENV DISPLAY_WIDTH=1280
   ENV DISPLAY_HEIGHT=720
   ```

2. **Use lower color depth** (edit [Dockerfile](.devcontainer/Dockerfile)):
   ```dockerfile
   ENV DISPLAY_DEPTH=16
   ```

3. **Rebuild container** after changes:
   - Press F1 > "Dev Containers: Rebuild Container"

## Environment Variables

Set in [devcontainer.json](devcontainer.json):

- `DISPLAY=:99` - Virtual display number
- `ELECTRON_DISABLE_GPU=1` - Disable GPU acceleration for stability
- `PLAYWRIGHT_BROWSERS_PATH=/home/vscode/.cache/ms-playwright` - Browser cache location

Set in [Dockerfile](Dockerfile):

- `DISPLAY_WIDTH=1920` - Virtual display width
- `DISPLAY_HEIGHT=1080` - Virtual display height
- `DISPLAY_DEPTH=24` - Color depth (bits per pixel)

## Security Notes

1. **Change the default VNC password** in [Dockerfile](Dockerfile):
   ```dockerfile
   RUN x11vnc -storepasswd YOUR_SECURE_PASSWORD /home/vscode/.vnc/passwd
   ```

2. **VNC is unencrypted** - Only use over SSH tunnel or trusted networks

3. **Port forwarding** via VS Code Remote-SSH is secure (uses SSH tunnel)

## Environment Parity with CI

The devcontainer is designed to **match the CI environment** exactly:
- Python packages installed system-wide (no venv) using `uv pip install --system`
- Same Python version (3.13), Node version (20), and package manager (uv)
- Identical dependency installation commands
- See [DEVCONTAINER_VS_CI.md](DEVCONTAINER_VS_CI.md) for detailed comparison

This ensures what works in the devcontainer will work in CI.

## Remote Host Requirements

Your Ubuntu server needs:
- Docker installed
- SSH server running
- Your user has Docker permissions (`sudo usermod -aG docker $USER`)
- **No desktop environment needed** - everything runs in the container!

## Alternative: X11 Forwarding (Not Recommended)

You could use X11 forwarding over SSH, but this requires:
- X server on Windows (VcXsrv, Xming, or X410)
- More complex setup
- Often slower than VNC
- Can have compatibility issues

The VNC approach is simpler and more reliable for remote development.

## References

- [Xvfb Documentation](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml)
- [x11vnc Documentation](https://github.com/LibVNC/x11vnc)
- [Playwright in Docker](https://playwright.dev/docs/docker)
- [Electron in CI/CD](https://www.electron.build/multi-platform-build)
