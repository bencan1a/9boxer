# Windows Developer Quick Setup Guide

Quick reference for developing 9Boxer from Windows on a remote Ubuntu server.

## One-Time Setup

### 1. Install VS Code Remote-SSH Extension

1. Open VS Code on Windows
2. Install extension: "Remote - SSH" (ms-vscode-remote.remote-ssh)
3. Install extension: "Dev Containers" (ms-vscode-remote.remote-containers)

### 2. Install VNC Viewer on Windows

Choose one:
- **TightVNC Viewer**: https://www.tightvnc.com/download.php
- **RealVNC Viewer**: https://www.realvnc.com/en/connect/download/viewer/
- **TigerVNC Viewer**: https://tigervnc.org/

OR use the web-based option (no installation needed).

### 3. Configure SSH Connection

In VS Code:
1. Press `F1`
2. Type "Remote-SSH: Add New SSH Host"
3. Enter: `ssh username@your-remote-host`
4. Select SSH config file to update (usually `C:\Users\YourName\.ssh\config`)

## Daily Workflow

### Connect and Start Development

1. **Open VS Code**
2. **Press `F1`** → "Remote-SSH: Connect to Host" → Select your remote host
3. **Open folder**: `/path/to/9boxer`
4. **Reopen in container**: Click "Reopen in Container" when prompted
5. **Wait for container to start** (~30 seconds after first build)

### Running Headless Playwright Tests

No VNC needed! Tests run headlessly:

```bash
cd frontend
npm run test:e2e:pw        # E2E tests
npm run test:visual        # Visual regression tests
```

### Running Electron App with GUI

#### In the VS Code Terminal (remote container):

```bash
# Start VNC server (only needed once per container session)
start-vnc

# Launch Electron app
cd frontend
npm run electron:dev
```

#### On Your Windows Machine:

**Option A: VNC Client (Better Performance)**

1. Open VNC viewer
2. Connect to: `localhost:5900`
3. Password: `9boxer`
4. You should see the Electron app!

**Option B: Web Browser (No Install Required)**

1. In the container terminal:
   ```bash
   websockify -D --web=/usr/share/novnc/ 6080 localhost:5900
   ```
2. On Windows, open browser: http://localhost:6080/vnc.html
3. Click "Connect", enter password: `9boxer`

## Port Forwarding

VS Code automatically forwards these ports:
- **5900**: VNC server (for VNC clients)
- **6080**: noVNC web interface (for browser access)

Check the "**PORTS**" tab in VS Code (bottom panel) to verify ports are forwarded.

## Common Commands

```bash
# Check Python environment (matches CI)
which python                     # Should show /usr/local/bin/python (not a venv!)
pip list                         # Shows system-installed packages

# Check if display is working
echo $DISPLAY                    # Should show :99
xdpyinfo -display :99            # Should show display info

# Restart virtual display if needed
start-display

# Start VNC server
start-vnc

# Check what's running
ps aux | grep -E "Xvfb|x11vnc"

# Test X11 with a simple app
xeyes                            # Should show eyes in VNC viewer
```

## Quick Troubleshooting

### "Cannot connect to VNC"

1. Check VS Code PORTS tab - is port 5900 forwarded?
2. In container: `ps aux | grep x11vnc` - is VNC running?
3. Run `start-vnc` again

### "Electron shows blank screen"

1. Check display: `xdpyinfo -display :99`
2. Restart display: `start-display`
3. Try simple app first: `xeyes`

### "Playwright tests fail"

```bash
# Restart display
start-display

# Re-run tests
cd frontend
npm run test:e2e:pw
```

### "Container won't rebuild"

1. Press `F1`
2. "Dev Containers: Rebuild Container Without Cache"
3. Wait ~10 minutes for full rebuild

## Performance Tips

- Use VNC client (TightVNC) instead of web browser for better performance
- Close VNC when not needed (tests don't need it)
- Only run `start-vnc` when you need to see the Electron GUI

## Security Reminder

⚠️ **Change the default VNC password** before using on untrusted networks!

Edit `.devcontainer/Dockerfile`:
```dockerfile
RUN x11vnc -storepasswd YOUR_PASSWORD_HERE /home/vscode/.vnc/passwd
```

Then rebuild container: `F1` → "Dev Containers: Rebuild Container"
