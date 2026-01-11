# Debug Build Guide

This document explains how to create and use a debug build of 9Boxer that includes the dev console and shows backend errors in the console.

## What is a Debug Build?

A debug build is a production-style build that:
- Uses the production build system (electron-builder)
- Bundles all resources like a production release
- **Opens the DevTools console automatically**
- **Shows backend stdout/stderr in the console** (including LLM API key errors)
- Logs all backend activity for troubleshooting

This is perfect for debugging production-specific issues like the LLM key configuration.

## How to Build

### Prerequisites

1. Make sure your `ANTHROPIC_API_KEY` is set in the environment before building:
   ```bash
   # Windows (PowerShell)
   $env:ANTHROPIC_API_KEY="sk-ant-your-key-here"

   # Windows (CMD)
   set ANTHROPIC_API_KEY=sk-ant-your-key-here

   # Linux/Mac
   export ANTHROPIC_API_KEY="sk-ant-your-key-here"
   ```

2. Optionally set other LLM configuration:
   ```bash
   # Windows (PowerShell)
   $env:LLM_MODEL="claude-sonnet-4-5-20250929"
   $env:LLM_MAX_TOKENS="4096"
   ```

### Build Commands

Navigate to the `frontend` directory and run one of these commands:

```bash
cd frontend

# Windows debug build
npm run electron:build:win:debug

# macOS debug build
npm run electron:build:mac:debug

# Linux debug build
npm run electron:build:linux:debug

# All platforms
npm run electron:build:debug
```

## What Happens During Build

1. **Frontend build** - Vite bundles the React app
2. **User guide generation** - Creates the help documentation
3. **Runtime config generation** - Creates `runtime-config.json` with your API key and LLM settings
4. **Electron compilation** - Compiles the main process TypeScript
5. **Packaging** - electron-builder creates the installer with `debugBuild: true` flag

## Where to Find the Build

After building, you'll find the installer in:
```
frontend/release/
```

For example:
- Windows: `9Boxer-1.0.0-Windows-x64.exe`
- macOS: `9Boxer-1.0.0-macOS-x64.zip`
- Linux: `9Boxer-1.0.0-Linux-x64.AppImage`

## Running the Debug Build

1. Install the application from the `release` folder
2. Launch 9Boxer
3. **The DevTools console will open automatically**
4. Watch the console for:
   - `🐛 Running in DEBUG BUILD mode` message
   - Backend startup logs showing API key status
   - Any backend errors (stdout/stderr)

## What to Look For

### API Key Loading

When the app starts, you should see logs like:

```
📄 Loading backend config from build-time config: C:\...\runtime-config.json
✅ ANTHROPIC_API_KEY loaded from build-time config (built: 2026-01-06T...)
```

If the key is missing, you'll see:
```
⚠️ ANTHROPIC_API_KEY not found in config - AI features will be disabled
```

### Backend Errors

Any backend errors will appear in the console with the prefix:
```
Backend stderr: <error message>
```

This includes:
- LLM API authentication errors
- API key format errors
- Model availability errors
- Rate limiting messages

## Troubleshooting

### Key Not Loading

If you see "ANTHROPIC_API_KEY not found in config":

1. Check the environment variable was set BEFORE building:
   ```bash
   # Windows PowerShell
   echo $env:ANTHROPIC_API_KEY

   # Windows CMD
   echo %ANTHROPIC_API_KEY%

   # Linux/Mac
   echo $ANTHROPIC_API_KEY
   ```

2. Verify the runtime-config.json was generated:
   ```bash
   cat frontend/dist-electron/runtime-config.json
   ```

3. Rebuild with the environment variable properly set

### Console Not Opening

If the DevTools don't open automatically:

1. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) to open them manually
2. Check the console shows "Debug Build: true" in the environment info

### Backend Logs Not Showing

If you don't see backend logs in the console:

1. Verify you're running the debug build (check for 🐛 emoji in startup logs)
2. Backend logs are also written to: `%APPDATA%\9Boxer\backend.log` (Windows) or `~/Library/Application Support/9Boxer/backend.log` (macOS)
3. You can access logs from within the app: Help menu → Show Logs

## Switching Back to Production

To create a regular production build without debug features:

```bash
cd frontend
npm run electron:build:win    # or :mac or :linux
```

The production build will:
- NOT open DevTools automatically
- Only log backend errors to the log file (not console)
- Run in optimized production mode
