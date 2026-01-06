# Installing 9Boxer

> **Time to complete:** 5 minutes
> **What you'll accomplish:** Install 9Boxer on your computer and launch it for the first time
> **You'll need:** Download link from your IT team or [GitHub Releases](https://github.com/bencan1a/9boxer/releases)

9Boxer runs entirely on your computer with no cloud dependencies. Your employee data never leaves your machine.

This guide walks you through installation and explains the security warnings you'll see.

---

## About Security Warnings

When you first run 9Boxer, both Windows and macOS will show security warnings. **This is expected and normal.**

### Why You're Seeing These Warnings

9Boxer is an internal development application distributed without commercial code signing:

- **Windows**: Not signed with a Microsoft Authenticode certificate ($400+/year)
- **macOS**: Not signed or notarized with an Apple Developer ID ($100/year)

Commercial apps pay for these certificates to skip security warnings. Internal tools like 9Boxer typically don't, so you'll need to bypass the warnings manually.

!!! note "This Is Safe"
    9Boxer is built and distributed by your organization. The security warnings don't mean the app is dangerous - they just mean it's not commercially code-signed. You'll follow simple steps below to tell your operating system you trust this app.

---

## Windows Installation

### Step 1: Download the Installer

Download `9Boxer-Setup-[version].exe` from:
- Your internal file share, or
- [GitHub Releases page](https://github.com/bencan1a/9boxer/releases)

**File size:** ~300MB (includes all dependencies)

### Step 2: Run the Installer

Double-click the downloaded `.exe` file to start installation.

### Step 3: Bypass Windows SmartScreen Warning

You'll see a blue **"Windows protected your PC"** screen:

![Windows SmartScreen warning with "Don't run" button visible](images/screenshots/installation/windows-smartscreen-warning.png)

**To proceed:**

1. Click **"More info"** (small link on the left side)
2. A new button appears: **"Run anyway"**
3. Click **"Run anyway"**
4. The installer launches

[Screenshot note: Windows SmartScreen expanded view showing "Run anyway" button]

!!! tip "Why This Works"
    Clicking "More info" and then "Run anyway" tells Windows: "I know this app isn't code-signed, but I trust it anyway." This is the standard process for unsigned Windows apps.

### Step 4: Complete Installation

The installer wizard guides you through:

1. **Welcome screen** - Click "Next"
2. **Choose install location** - Default is fine (C:\Program Files\9Boxer)
3. **Create shortcuts** - Check "Desktop shortcut" if you want one
4. **Install** - Click "Install" and wait ~30 seconds
5. **Finish** - Check "Launch 9Boxer" and click "Finish"

9Boxer launches automatically.

### Step 5: First Launch (One-Time Setup)

On first launch, you might see a **Windows Defender Firewall** dialog asking if you want to allow network access.

- **Click "Allow access"** - This lets the backend communicate with the frontend locally
- 9Boxer only communicates with `localhost` (your computer) - no internet required

The app is now ready to use.

### ✅ Success! Windows Installation Complete

You should see:
- 9Boxer window open with the welcome screen
- Desktop shortcut (if you selected it)
- Start menu entry: 9Boxer

**From now on:** Just double-click the 9Boxer icon to launch. You won't see security warnings again.

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

### Step 2: Extract the ZIP File

1. Double-click the downloaded `.zip` file to extract it
2. You'll see `9Boxer.app` appear in your Downloads folder

### Step 3: Move to Applications (Recommended)

Drag `9Boxer.app` from Downloads to your **Applications** folder.

This isn't required, but it makes 9Boxer easier to find and prevents accidental deletion.

### Step 4: First Launch - Bypass macOS Gatekeeper

**IMPORTANT:** You MUST use the right-click method to open 9Boxer the first time.

#### Don't Double-Click Yet!

If you double-click `9Boxer.app` without preparing, you'll see this:

![macOS Gatekeeper blocking 9Boxer with "cannot be opened" message](images/screenshots/installation/macos-gatekeeper-blocked.png)

**Message:** *"9Boxer can't be opened because it is from an unidentified developer."*

This is macOS Gatekeeper protecting you from unsigned apps. Let's bypass it properly.

#### Method 1: Right-Click to Open (Easiest)

This is the official Apple-approved way to open unsigned apps:

1. **Right-click** (or Control+click) on `9Boxer.app`
2. Select **"Open"** from the context menu
3. A dialog appears asking if you're sure you want to open it
4. Click **"Open"** in the dialog

![macOS right-click context menu with Open option highlighted](images/screenshots/installation/macos-right-click-open.png)

9Boxer launches and macOS remembers your choice.

**From now on:** You can double-click 9Boxer normally. The security warning won't appear again.

[Screenshot note: macOS Gatekeeper confirmation dialog with "Open" button]

#### Method 2: System Settings (If You Already Double-Clicked)

If you already tried to double-click and got blocked:

1. Go to **System Settings** (or System Preferences on older macOS)
2. Click **Privacy & Security**
3. Scroll down to the **Security** section
4. You'll see a message: *"9Boxer was blocked from use because it is not from an identified developer"*
5. Click **"Open Anyway"** next to that message
6. Click **"Open"** in the confirmation dialog

[Screenshot note: macOS System Settings Privacy & Security showing "Open Anyway" button]

The app launches.

#### Method 3: Terminal Command (Advanced)

If the above methods don't work, you can remove macOS's quarantine flag using Terminal:

```bash
xattr -d com.apple.quarantine /Applications/9Boxer.app
```

Then double-click `9Boxer.app` to launch normally.

### ✅ Success! macOS Installation Complete

You should see:
- 9Boxer window open with the welcome screen
- 9Boxer.app in your Applications folder
- No more security warnings on launch

**From now on:** Just double-click 9Boxer.app to launch.

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

This gives the file permission to run.

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

Example desktop entry:

```ini
[Desktop Entry]
Name=9Boxer
Exec=/path/to/9Boxer.AppImage
Type=Application
Icon=/path/to/icon.png
Categories=Office;
```

### ✅ Success! Linux Installation Complete

You should see:
- 9Boxer window open with the welcome screen

**From now on:** Run the AppImage to launch 9Boxer.

---

## Troubleshooting

### Windows: "App can't run on your PC" or "Missing DLL" error

**Cause:** Your Windows version is too old, or you're missing Visual C++ redistributables.

**Solution:**
1. Update Windows to the latest version
2. Download and install [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)
3. Restart your computer
4. Try running 9Boxer again

### macOS: "9Boxer is damaged and can't be opened"

**Cause:** macOS sometimes flags unsigned apps with this generic message.

**Solution:** Remove all extended attributes using Terminal:

```bash
xattr -cr /Applications/9Boxer.app
```

Then try the right-click → Open method again.

### macOS: Security warning appears every time I launch

**Cause:** You might be running 9Boxer from Downloads instead of Applications folder.

**Solution:**
1. Move `9Boxer.app` to your Applications folder
2. Right-click → Open one more time from Applications folder
3. macOS will remember your preference

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

Then make the AppImage executable and try again.

### App won't launch at all

1. **Check your operating system version:**
   - Windows: Must be Windows 10 or later (64-bit)
   - macOS: Must be macOS 10.15 (Catalina) or later
   - Linux: Modern distribution (Ubuntu 18.04+, etc.)

2. **Check antivirus/security software:**
   - Some antivirus programs block unsigned apps
   - Temporarily disable antivirus and try launching
   - Add 9Boxer to your antivirus whitelist if needed

3. **Check file integrity:**
   - Re-download the installer (might have been corrupted)
   - Verify file size matches what's listed on the download page

4. **Check system logs:**
   - Windows: Event Viewer → Windows Logs → Application
   - macOS: Console.app → search for "9Boxer"
   - Linux: `journalctl` or check `~/.xsession-errors`

---

## Uninstalling 9Boxer

### Windows

1. **Start menu → Settings → Apps**
2. Search for "9Boxer"
3. Click **Uninstall**
4. Follow the uninstaller wizard

Or use Control Panel:
1. **Control Panel → Programs → Uninstall a program**
2. Select "9Boxer"
3. Click **Uninstall**

**Data cleanup:**
Delete `C:\Users\[YourUsername]\AppData\Roaming\9Boxer` to remove all saved data.

### macOS

1. Open **Applications** folder
2. Drag **9Boxer.app** to Trash
3. Empty Trash

**Data cleanup:**
Delete `~/Library/Application Support/9Boxer` to remove all saved data.

### Linux

1. Delete the `.AppImage` file
2. Remove any desktop entry you created from `~/.local/share/applications/`

**Data cleanup:**
Delete `~/.config/9Boxer` to remove all saved data.

---

## What's Next?

Now that 9Boxer is installed, you're ready to start:

**First time using 9Boxer?** → [2-Minute Quickstart](quickstart.md) - Try it with sample data

**Ready to calibrate?** → [Your First Calibration](getting-started.md) - Complete workflow guide

**Need to prepare your data?** → [Employee Data Requirements](employee-data.md) - Excel file format

**Questions about the app?** → [Frequently Asked Questions](faq.md)

---

## Common Questions

**Is 9Boxer safe to install?**

Yes. 9Boxer is built by your organization and runs entirely on your computer. The security warnings just indicate it's not commercially code-signed, which is normal for internal tools.

**Will I see security warnings every time?**

No. After you bypass the warning the first time, your operating system remembers your choice. Future launches work normally.

**Does 9Boxer need internet access?**

No. 9Boxer works completely offline. The firewall permission on Windows is only for localhost communication between the frontend and backend (both on your computer).

**Can I install on multiple computers?**

Yes. Download and install on as many computers as needed. Your data is stored locally on each machine.

**How do I update to a new version?**

Download the new installer and run it. It will replace the old version. Your data is preserved in your user data folder.

---

**Need help?** Check [Troubleshooting](troubleshooting.md) or contact your IT support team.
