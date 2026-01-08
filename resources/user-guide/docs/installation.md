# Installing 9Boxer

> **Time to complete:** 2 minutes
> **What you'll accomplish:** Install 9Boxer on your computer and launch it for the first time
> **You'll need:** Download link from your IT team or [GitHub Releases](https://github.com/bencan1a/9boxer/releases)

9Boxer runs entirely on your computer with no cloud dependencies. Your employee data never leaves your machine.

---

## Windows Installation

### Step 1: Download the Installer

Download `9Boxer-Setup-[version].exe` from:
- Your internal file share, or
- [GitHub Releases page](https://github.com/bencan1a/9boxer/releases)

**File size:** ~300MB (includes all dependencies)

### Step 2: Run the Installer

Double-click the downloaded `.exe` file to start installation.

### Step 3: Complete Installation

The installer wizard guides you through:

1. **Welcome screen** - Click "Next"
2. **Choose install location** - Default is fine (C:\Program Files\9Boxer)
3. **Create shortcuts** - Check "Desktop shortcut" if you want one
4. **Install** - Click "Install" and wait ~30 seconds
5. **Finish** - Check "Launch 9Boxer" and click "Finish"

9Boxer launches automatically.

### Step 4: First Launch

On first launch, you might see a **Windows Defender Firewall** dialog asking if you want to allow network access.

- **Click "Allow access"** - This lets the backend communicate with the frontend locally
- 9Boxer only communicates with `localhost` (your computer) - no internet required

The app is now ready to use.

### Success! Windows Installation Complete

You should see:
- 9Boxer window open with the welcome screen
- Desktop shortcut (if you selected it)
- Start menu entry: 9Boxer

---

## macOS Installation

### Step 1: Download the App

Download `9Boxer-[version]-macOS-[arch].zip` from:
- Your internal file share, or
- [GitHub Releases page](https://github.com/bencan1a/9boxer/releases)

**File size:** ~300MB compressed

**Architecture versions:**
- `arm64` for Apple Silicon (M1, M2, M3 chips)
- `x64` for Intel Macs (older models)

Not sure which you have? Click the Apple menu → About This Mac → check "Chip" or "Processor"

### Step 2: Extract and Install

1. Double-click the downloaded `.zip` file to extract it
2. Drag `9Boxer.app` to your **Applications** folder
3. Double-click to launch

**First launch:** macOS may briefly show "Verifying..." while checking the app's notarization. This is normal and only happens once.

### Success! macOS Installation Complete

You should see:
- 9Boxer window open with the welcome screen
- 9Boxer.app in your Applications folder

---

## Linux Installation

### Step 1: Download the AppImage

Download `9Boxer-[version].AppImage` from:
- Your internal file share, or
- [GitHub Releases page](https://github.com/bencan1a/9boxer/releases)

**File size:** ~300MB

### Step 2: Make Executable

Open Terminal in the download location and run:

```bash
chmod +x 9Boxer-[version].AppImage
```

### Step 3: Run the App

Double-click the `.AppImage` file, or run from Terminal:

```bash
./9Boxer-[version].AppImage
```

9Boxer launches.

### Optional: Add to Applications Menu

To add 9Boxer to your application launcher:

1. Move the `.AppImage` to `~/.local/bin/` or `~/Applications/`
2. Right-click the file → Properties → Permissions → Check "Allow executing as program"
3. Create a desktop entry (`.desktop` file) in `~/.local/share/applications/`

### Success! Linux Installation Complete

---

## Troubleshooting

### Windows: "Missing DLL" error

**Cause:** Missing Visual C++ redistributables.

**Solution:**
1. Download and install [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)
2. Restart your computer
3. Try running 9Boxer again

### Linux: AppImage won't run

**Cause:** Missing FUSE library.

**Solution:** Install FUSE:

```bash
# Ubuntu/Debian
sudo apt install libfuse2

# Fedora
sudo dnf install fuse-libs

# Arch
sudo pacman -S fuse2
```

### App won't launch at all

1. **Check your operating system version:**
   - Windows: Must be Windows 10 or later (64-bit)
   - macOS: Must be macOS 10.15 (Catalina) or later
   - Linux: Modern distribution (Ubuntu 18.04+, etc.)

2. **Check file integrity:**
   - Re-download the installer (might have been corrupted)
   - Verify file size matches what's listed on the download page

---

## Uninstalling 9Boxer

### Windows

1. **Start menu → Settings → Apps**
2. Search for "9Boxer"
3. Click **Uninstall**

**Data cleanup:**
Delete `C:\Users\[YourUsername]\AppData\Roaming\9Boxer` to remove all saved data.

### macOS

1. Drag **9Boxer.app** from Applications to Trash
2. Empty Trash

**Data cleanup:**
Delete `~/Library/Application Support/9Boxer` to remove all saved data.

### Linux

1. Delete the `.AppImage` file

**Data cleanup:**
Delete `~/.config/9Boxer` to remove all saved data.

---

## What's Next?

Now that 9Boxer is installed, you're ready to start:

**First time using 9Boxer?** → [2-Minute Quickstart](quickstart.md) - Try it with sample data

**Ready to calibrate?** → [Your First Calibration](getting-started.md) - Complete workflow guide

**Need to prepare your data?** → [Employee Data Requirements](employee-data.md) - Excel file format

---

## Common Questions

**Does 9Boxer need internet access?**

No. 9Boxer works completely offline. The firewall permission on Windows is only for localhost communication between the frontend and backend (both on your computer).

**Can I install on multiple computers?**

Yes. Download and install on as many computers as needed. Your data is stored locally on each machine.

**How do I update to a new version?**

Download the new installer and run it. It will replace the old version. Your data is preserved in your user data folder.

---

**Need help?** Check [Troubleshooting](troubleshooting.md) or contact your IT support team.
