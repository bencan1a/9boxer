# Windows Installation Guide

This guide helps you install 9Boxer on Windows. Since this is an internal development tool without Microsoft code signing, you'll need to follow these steps to bypass Windows SmartScreen security.

---

## Quick Install

**Time:** 5 minutes

1. Download `9Boxer-Setup-[version].exe`
2. Double-click to run
3. Click "More info" → "Run anyway" on SmartScreen warning
4. Follow installer wizard
5. Launch 9Boxer

---

## Detailed Installation Steps

### Step 1: Download the Installer

Download the latest `9Boxer-Setup-[version].exe` from:
- Your organization's internal file share, or
- [GitHub Releases](https://github.com/bencan1a/9boxer/releases) page

**File size:** Approximately 300MB (includes Python runtime, Node.js, and all dependencies)

**System requirements:**
- Windows 10 or later (64-bit)
- 500MB free disk space
- 4GB RAM recommended

### Step 2: Run the Installer

1. Locate the downloaded `9Boxer-Setup-[version].exe` in your Downloads folder
2. Double-click the installer to run it

### Step 3: Bypass Windows SmartScreen Warning

**You will see this blue screen:**

```
Windows protected your PC

Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

[Don't run]
```

This warning appears because 9Boxer is not signed with a Microsoft Authenticode certificate ($400+/year for commercial apps).

**To proceed safely:**

1. Click the **"More info"** link on the left side of the dialog
2. The screen expands to show additional information
3. A new button appears: **"Run anyway"**
4. Click **"Run anyway"**

**What this does:** You're telling Windows "I know this app isn't commercially signed, but I trust it because it's from my organization."

### Step 4: User Account Control (UAC) Prompt

Windows may show a User Account Control dialog asking:

```
Do you want to allow this app to make changes to your device?

[Yes] [No]
```

**Click "Yes"** to allow the installer to proceed.

This is standard for any Windows installer that needs to write to Program Files.

### Step 5: Complete the Installation Wizard

The 9Boxer installer wizard walks you through several screens:

#### Welcome Screen
- Click **"Next"** to continue

#### Choose Install Location
- **Default location:** `C:\Program Files\9Boxer`
- Click **"Next"** (default is fine for most users)

You can change the location if your organization requires software in a different directory.

#### Select Additional Tasks
- Check **"Create a desktop icon"** if you want quick access
- Check **"Create a Start Menu folder"** (recommended)
- Click **"Next"**

#### Ready to Install
- Review your choices
- Click **"Install"**
- Wait 30-60 seconds while files are copied

#### Completing Setup
- Check **"Launch 9Boxer"** if you want to start immediately
- Click **"Finish"**

### Step 6: First Launch (One-Time Setup)

When 9Boxer launches for the first time, you might see a **Windows Defender Firewall** prompt:

```
Windows Defender Firewall has blocked some features of this app.

Name: ninebox.exe
Publisher: Unknown

[Allow access]  [Cancel]
```

**Click "Allow access"** to let 9Boxer's backend server communicate with the frontend.

**Why this happens:** 9Boxer uses a local HTTP server (localhost:38000) for backend communication. This network request triggers the firewall prompt even though all traffic stays on your computer.

**Is this safe?** Yes. 9Boxer only communicates with `localhost` (127.0.0.1) and never accesses the internet. Your employee data stays entirely on your machine.

---

## ✅ Installation Complete

You should now see:

- 9Boxer window open with the welcome screen
- Desktop shortcut (if you selected it during install)
- Start Menu entry: **Start → All Apps → 9Boxer**
- Installed to: `C:\Program Files\9Boxer` (or your chosen location)

**From now on:** Just double-click the 9Boxer icon to launch. You won't see security warnings again.

---

## Troubleshooting

### SmartScreen Warning Doesn't Show "More info" Link

**Symptom:** The SmartScreen warning shows only a "Don't run" button with no "More info" option.

**Cause:** Your organization's Group Policy may have disabled the "Run anyway" option for unsigned apps.

**Solutions:**

1. **Contact your IT department** - They may need to whitelist 9Boxer or provide a code-signed version
2. **Ask your IT admin to add 9Boxer to SmartScreen exemptions**
3. **Request elevated permissions** to install unsigned apps

### "App can't run on your PC" Error

**Symptom:** Message says "This app can't run on your PC" or "Not a valid Win32 application"

**Causes:**
- You downloaded the wrong architecture (ARM vs x64)
- File download was corrupted
- You're running 32-bit Windows (9Boxer requires 64-bit)

**Solutions:**

1. **Check your Windows version:**
   - Right-click **This PC** → **Properties**
   - Look for "System type"
   - Must say "64-bit operating system"

2. **Re-download the installer** (file may be corrupted)

3. **Verify file size:**
   - Installer should be ~300MB
   - If much smaller, download was incomplete

### "Missing DLL" or "VCRUNTIME140.dll not found" Error

**Symptom:** Error about missing DLL files when launching 9Boxer

**Cause:** Missing Microsoft Visual C++ Redistributable

**Solution:**

1. Download [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)
2. Run the installer
3. Restart your computer
4. Launch 9Boxer again

### Installation Fails or Hangs

**Symptom:** Installer freezes, shows error, or quits unexpectedly

**Solutions:**

1. **Close antivirus software temporarily**
   - Some antivirus programs block unsigned installers
   - Try installing with antivirus disabled
   - Re-enable after installation completes

2. **Run installer as Administrator:**
   - Right-click `9Boxer-Setup-[version].exe`
   - Select **"Run as administrator"**
   - Approve UAC prompt
   - Complete installation

3. **Check disk space:**
   - You need ~500MB free on C: drive
   - Clean up temporary files if needed

4. **Check Event Viewer for errors:**
   - Press **Windows + X** → **Event Viewer**
   - Navigate to **Windows Logs → Application**
   - Look for recent errors related to installation
   - Share error details with your IT team

### Firewall Blocks 9Boxer Backend

**Symptom:** 9Boxer UI loads but shows "Unable to connect to backend" error

**Cause:** Windows Firewall or corporate firewall is blocking localhost communication

**Solutions:**

1. **Add firewall exception manually:**
   - Open **Windows Defender Firewall with Advanced Security**
   - Click **Inbound Rules** → **New Rule**
   - Select **Program** → Browse to `C:\Program Files\9Boxer\resources\backend\ninebox.exe`
   - Allow the connection
   - Apply to all profiles (Domain, Private, Public)

2. **Check corporate firewall settings:**
   - Your organization's firewall might block localhost apps
   - Contact IT to whitelist 9Boxer

3. **Verify backend is running:**
   - Open Task Manager (Ctrl+Shift+Esc)
   - Look for `ninebox.exe` process
   - If missing, backend failed to start - check logs

### Antivirus Flags 9Boxer as Threat

**Symptom:** Antivirus software quarantines or deletes 9Boxer.exe or ninebox.exe

**Cause:** Unsigned executables sometimes trigger false positives in antivirus software

**Solution:**

1. **Add 9Boxer to antivirus exclusions:**
   - Open your antivirus software (e.g., Windows Defender, Norton, McAfee)
   - Navigate to **Exclusions** or **Whitelist**
   - Add folder: `C:\Program Files\9Boxer`
   - Add processes: `9Boxer.exe` and `ninebox.exe`

2. **Restore quarantined files:**
   - Open antivirus quarantine/vault
   - Restore any 9Boxer files
   - Re-install if files were deleted

3. **Contact IT:**
   - If using corporate antivirus, IT can whitelist 9Boxer company-wide

---

## Understanding the Security Warnings

### Why Am I Seeing These Warnings?

9Boxer is an **internal development tool** distributed without commercial code signing:

- **Code signing certificates cost $400+/year** from Microsoft
- **Internal tools don't typically purchase them** - it's not cost-effective
- **The warning is about identity, not safety** - Windows can't verify who built the app

Commercial applications (Microsoft Office, Adobe, etc.) pay for code signing to avoid these warnings. Internal corporate tools like 9Boxer typically don't.

### Is This Safe?

**Yes.** The security warnings don't mean 9Boxer is dangerous. They mean:

- Microsoft can't verify the publisher's identity
- The app hasn't been submitted to Microsoft for review
- You should only run it if you trust the source

**9Boxer is safe because:**
- Built by your organization's development team
- Source code is available for review
- Runs entirely on your computer (no cloud dependencies)
- Your data never leaves your machine

### Will I See Warnings Every Time?

**No.** After bypassing SmartScreen the first time, Windows remembers your decision. Future launches work normally by double-clicking the icon.

The only time you'll see warnings again is if:
- You install a new version (different file)
- You move the executable to a different location
- Windows updates change security policy

---

## Uninstalling 9Boxer

### Method 1: Settings App (Windows 10/11)

1. Press **Windows + I** to open Settings
2. Click **Apps** → **Apps & features**
3. Search for "9Boxer"
4. Click **9Boxer** → **Uninstall**
5. Click **Uninstall** again to confirm
6. Follow the uninstaller wizard

### Method 2: Control Panel (All Windows Versions)

1. Press **Windows + R** → type `appwiz.cpl` → **Enter**
2. Find "9Boxer" in the list
3. Click **Uninstall**
4. Follow the uninstaller wizard

### Remove Leftover Data

The uninstaller removes 9Boxer but leaves your data files:

**To delete all 9Boxer data:**

1. Press **Windows + R**
2. Type `%APPDATA%` → **Enter**
3. Delete the **9Boxer** folder

**Location:** `C:\Users\[YourUsername]\AppData\Roaming\9Boxer`

**What's stored here:**
- SQLite database with employee data
- Backend logs
- Application settings
- Temporary uploaded Excel files

Delete this folder if you want a completely clean uninstall.

---

## Advanced Configuration

### Installing for All Users

By default, 9Boxer installs to Program Files and is available to all users on the computer.

**Per-user vs. All-users:**
- **All users (default):** Installed to `C:\Program Files\9Boxer`, requires admin rights
- **Current user only:** Install to `C:\Users\[YourUsername]\AppData\Local\9Boxer`, no admin needed

To install for current user only:
1. Run installer
2. At "Choose Install Location" step
3. Change path to `%LOCALAPPDATA%\9Boxer`

### Silent Installation (IT Administrators)

For automated deployment, use silent install mode:

```cmd
9Boxer-Setup-1.0.0.exe /S /D=C:\Program Files\9Boxer
```

**Flags:**
- `/S` - Silent mode (no UI)
- `/D=` - Install directory (must be last parameter)

**Example deployment script:**

```batch
@echo off
echo Installing 9Boxer silently...
9Boxer-Setup-1.0.0.exe /S /D=C:\Program Files\9Boxer
echo Installation complete.
```

### Bypassing SmartScreen via Group Policy (IT Admins)

IT administrators can whitelist 9Boxer company-wide:

1. **Open Group Policy Editor:** `gpedit.msc`
2. Navigate to: **Computer Configuration → Administrative Templates → Windows Components → File Explorer**
3. Enable: **"Configure Windows Defender SmartScreen"**
4. Set to: **"Warn and allow bypass"**

Or whitelist the specific executable:
1. Get file hash: `Get-FileHash .\9Boxer-Setup-1.0.0.exe | Select-Object Hash`
2. Add hash to SmartScreen allow list in Group Policy

---

## Data Storage Locations

9Boxer stores data in standard Windows directories:

| Type | Location |
|------|----------|
| **Application files** | `C:\Program Files\9Boxer` |
| **User data (database, logs)** | `C:\Users\[YourUsername]\AppData\Roaming\9Boxer` |
| **Temporary files** | `C:\Users\[YourUsername]\AppData\Roaming\9Boxer\temp` |

**Database file:** `ninebox.db` (SQLite)
**Backend logs:** `backend.log`
**Frontend logs:** Electron DevTools console (Ctrl+Shift+I in dev mode)

---

## Need Help?

**Installation issues:**
1. Check [Troubleshooting](#troubleshooting) section above
2. Review [README.md](README.md) for system requirements
3. Contact your IT support team
4. Open an issue on [GitHub](https://github.com/bencan1a/9boxer/issues)

**Usage questions:**
- See [User Guide](resources/user-guide/docs/index.md) for complete documentation
- Quick start: [2-Minute Quickstart](resources/user-guide/docs/quickstart.md)

---

## What's Next?

Now that 9Boxer is installed:

1. **Try the sample data** → [2-Minute Quickstart](resources/user-guide/docs/quickstart.md)
2. **Run your first calibration** → [Your First Calibration](resources/user-guide/docs/getting-started.md)
3. **Prepare your employee data** → [Employee Data Requirements](resources/user-guide/docs/employee-data.md)
