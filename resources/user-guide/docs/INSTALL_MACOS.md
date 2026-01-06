# macOS Installation Guide

This guide helps you install 9Boxer on macOS. Since this is an internal development tool without Apple code signing, you'll need to follow these steps to bypass macOS Gatekeeper security.

---

## Quick Install

**Time:** 5 minutes

1. Download `9Boxer-[version]-macOS-[arch].zip`
2. Extract the ZIP file
3. Move `9Boxer.app` to Applications folder
4. Right-click → "Open" (first time only)
5. Click "Open" in the security dialog
6. Launch 9Boxer

---

## Detailed Installation Steps

### Step 1: Download the App

Download the latest release from:
- Your organization's internal file share, or
- [GitHub Releases](https://github.com/bencan1a/9boxer/releases) page

**Choose the correct architecture:**

| Your Mac | File to Download |
|----------|------------------|
| **Apple Silicon** (M1, M2, M3 chips) | `9Boxer-[version]-macOS-arm64.zip` |
| **Intel Mac** (older models) | `9Boxer-[version]-macOS-x64.zip` |

**Not sure which you have?**
1. Click the **Apple menu** () → **About This Mac**
2. Look at the **Chip** or **Processor** line:
   - "Apple M1" or "Apple M2" = Apple Silicon (arm64)
   - "Intel Core i5/i7/i9" = Intel (x64)

**File size:** Approximately 300MB compressed

**System requirements:**
- macOS 10.15 (Catalina) or later
- 500MB free disk space
- 4GB RAM recommended

### Step 2: Extract the ZIP File

1. Locate the downloaded `.zip` file in your Downloads folder
2. **Double-click** the `.zip` file to extract it
3. You'll see **9Boxer.app** appear in the same folder

macOS automatically extracts ZIP files when you double-click them.

### Step 3: Move to Applications Folder (Recommended)

1. Open a new Finder window (⌘+N)
2. Click **Applications** in the sidebar
3. Drag **9Boxer.app** from Downloads to the Applications window

**Why move it?**
- Prevents accidental deletion
- Makes it easier to find (Spotlight search, Launchpad)
- Gatekeeper security settings work better from Applications folder

You can skip this step and run from Downloads, but it's not recommended.

### Step 4: First Launch - Bypass macOS Gatekeeper

**CRITICAL:** You MUST use the right-click method to open 9Boxer the first time.

#### What Happens If You Double-Click

If you try to double-click `9Boxer.app` without preparing, macOS blocks it:

**macOS Ventura and later:**
```
"9Boxer" cannot be opened because the developer cannot be verified.

macOS cannot verify that this app is free from malware.

[OK]
```

**macOS Monterey and earlier:**
```
"9Boxer" can't be opened because it is from an unidentified developer.

[Move to Trash] [Cancel]
```

This is **macOS Gatekeeper** protecting you from unsigned apps. Let's bypass it properly.

#### Method 1: Right-Click to Open (Easiest - Apple's Official Method)

This is the official Apple-approved way to open unsigned apps:

1. **Right-click** on `9Boxer.app` (or Control+click if you don't have a two-button mouse)
2. Select **"Open"** from the context menu
3. A security dialog appears:
   ```
   "9Boxer" is from an unidentified developer. Are you sure you want to open it?

   [Cancel] [Open]
   ```
4. Click **"Open"**

9Boxer launches and macOS remembers your decision.

**From now on:** You can double-click 9Boxer normally. The security warning won't appear again.

**Why this works:** Right-clicking and selecting "Open" gives you an explicit override option that double-clicking doesn't provide. This is Apple's intended bypass mechanism for trusted-but-unsigned apps.

#### Method 2: System Settings (If You Already Double-Clicked)

If you already tried to double-click and got blocked, use System Settings:

**For macOS Ventura (13.0) and later:**

1. Click the **Apple menu** () → **System Settings**
2. Click **Privacy & Security** in the sidebar
3. Scroll down to the **Security** section
4. You'll see a message:
   ```
   "9Boxer" was blocked from use because it is not from an identified developer.
   ```
5. Click **"Open Anyway"** next to that message
6. Enter your password if prompted
7. A confirmation dialog appears - click **"Open"**

**For macOS Monterey (12.0) and earlier:**

1. Click the **Apple menu** () → **System Preferences**
2. Click **Security & Privacy**
3. Click the **General** tab
4. You'll see a message:
   ```
   "9Boxer" was blocked from use because it is not from an identified developer.
   ```
5. Click **"Open Anyway"**
6. Enter your password if prompted
7. A confirmation dialog appears - click **"Open"**

The app launches.

#### Method 3: Terminal Command (Advanced Users)

If the above methods don't work, remove macOS's quarantine flag using Terminal:

1. Open **Terminal** (Applications → Utilities → Terminal)
2. Run this command:
   ```bash
   xattr -d com.apple.quarantine /Applications/9Boxer.app
   ```
3. Press Enter
4. No output = success
5. Double-click `9Boxer.app` to launch

**What this does:** Removes the "downloaded from internet" flag that triggers Gatekeeper checks.

**Note:** Replace `/Applications/9Boxer.app` with the actual path if you installed elsewhere.

---

## ✅ Installation Complete

You should now see:

- 9Boxer window open with the welcome screen
- 9Boxer.app in your Applications folder
- No more security warnings when you launch

**From now on:** Just double-click `9Boxer.app` to launch. Gatekeeper won't block it again.

---

## Troubleshooting

### "9Boxer is damaged and can't be opened"

**Symptom:** Message says the app is damaged or can't be opened, even after using the right-click method.

**Cause:** macOS sometimes flags unsigned apps with this generic error message.

**Solution:** Remove all extended attributes using Terminal:

```bash
xattr -cr /Applications/9Boxer.app
```

Then try the right-click → Open method again.

**What this does:** The `-cr` flags recursively clear all extended attributes, including quarantine flags and other metadata that might be causing issues.

### App Won't Launch at All

**Symptom:** 9Boxer opens briefly then quits, or nothing happens when you try to launch.

**Solutions:**

1. **Make sure you extracted the ZIP first**
   - Don't try to run 9Boxer.app from inside the ZIP file
   - Extract it fully, then move to Applications

2. **Check for quarantine flag:**
   ```bash
   xattr -l /Applications/9Boxer.app
   ```
   If you see `com.apple.quarantine`, remove it:
   ```bash
   xattr -d com.apple.quarantine /Applications/9Boxer.app
   ```

3. **Check Console for crash logs:**
   - Open **Console.app** (Applications → Utilities → Console)
   - Search for "9Boxer"
   - Look for crash reports or error messages
   - Share these with your IT team

4. **Verify you downloaded the correct architecture:**
   - Apple Silicon Macs need the `arm64` version
   - Intel Macs need the `x64` version
   - Running the wrong version causes immediate crashes

### Security Warning Appears Every Time

**Symptom:** Gatekeeper blocks 9Boxer on every launch, even after you've approved it.

**Cause:** You're running 9Boxer from Downloads instead of Applications folder.

**Solution:**

1. Move `9Boxer.app` to Applications folder (if you haven't already)
2. Right-click → Open one more time from Applications folder
3. macOS will remember your preference permanently

### Wrong Architecture Downloaded

**Symptom:** Error like "The application cannot be opened" or immediate crash on launch.

**Cause:** You downloaded arm64 version on Intel Mac (or vice versa).

**Solution:**

1. Check your Mac's architecture:
   ```bash
   uname -m
   ```
   - Output `arm64` = Apple Silicon (M1/M2/M3)
   - Output `x86_64` = Intel

2. Download the correct version:
   - Apple Silicon: `9Boxer-[version]-macOS-arm64.zip`
   - Intel: `9Boxer-[version]-macOS-x64.zip`

### App Crashes on Launch

**Symptom:** 9Boxer window opens briefly then closes, or you see a crash dialog.

**Solutions:**

1. **Check macOS version:**
   - Minimum required: macOS 10.15 (Catalina)
   - If you're on Mojave or older, you need to upgrade macOS

2. **Check Console for errors:**
   - Open Console.app
   - Filter for "9Boxer"
   - Look for Python or Electron errors
   - Common issues:
     - Missing system libraries
     - Permissions problems
     - Corrupted download

3. **Re-download the installer:**
   - Original download might be corrupted
   - Verify file size (~300MB compressed)
   - Extract fresh copy

4. **Reset permissions:**
   ```bash
   chmod -R 755 /Applications/9Boxer.app
   ```

### Firewall Blocks Backend Connection

**Symptom:** 9Boxer UI loads but shows "Unable to connect to backend" error.

**Cause:** macOS Firewall is blocking the local backend server.

**Solution:**

1. Open **System Settings** → **Network** → **Firewall**
2. Click **Options**
3. Find `ninebox` in the list (or click **+** to add it)
4. Set to **Allow incoming connections**
5. Click **OK**

The backend is located at:
```
/Applications/9Boxer.app/Contents/Resources/backend/ninebox
```

### "App is not optimized for your Mac"

**Symptom:** On Apple Silicon Macs, you see "This app is not optimized for your Mac" warning.

**Cause:** You're running the x64 (Intel) version on an Apple Silicon Mac via Rosetta 2.

**Impact:** App will run but may be slower and use more battery.

**Solution:** Download the arm64 version for native Apple Silicon performance.

---

## Understanding the Security Warnings

### Why Am I Seeing These Warnings?

9Boxer is an **internal development tool** distributed without commercial code signing:

- **Apple Developer ID certificates cost $100/year**
- **Notarization requires Apple review** - adds development overhead
- **Internal tools don't typically purchase them** - not cost-effective for in-house apps

Commercial applications (Microsoft Office, Adobe, etc.) pay for signing and notarization to avoid these warnings. Internal corporate tools like 9Boxer typically don't.

### Is This Safe?

**Yes.** The security warnings don't mean 9Boxer is dangerous. They mean:

- Apple can't verify the developer's identity
- The app hasn't been submitted to Apple for review
- You should only run it if you trust the source

**9Boxer is safe because:**
- Built by your organization's development team
- Source code is available for review
- Runs entirely on your computer (no cloud dependencies)
- Your data never leaves your machine

### Will I See Warnings Every Time?

**No.** After using the right-click method the first time, macOS remembers your decision. Future launches work normally by double-clicking the icon.

The only time you'll see warnings again is if:
- You install a new version (different file)
- You move the app to a different location
- macOS updates change security policy
- You re-download the app (gets new quarantine flag)

### What Gatekeeper Actually Does

**Gatekeeper** is macOS's security system that checks apps before they run:

1. **Signed + Notarized:** Opens immediately (commercial apps)
2. **Signed but not Notarized:** Shows warning with "Open Anyway" option
3. **Unsigned (9Boxer):** Blocks double-click, requires right-click → Open

The right-click method is Apple's official bypass for trusted-but-unsigned apps.

---

## Uninstalling 9Boxer

### Remove the Application

1. Open **Applications** folder
2. Drag **9Boxer.app** to the **Trash**
3. Right-click Trash → **Empty Trash**

Or use Terminal:
```bash
rm -rf /Applications/9Boxer.app
```

### Remove Leftover Data

The uninstaller removes 9Boxer but leaves your data files:

**To delete all 9Boxer data:**

```bash
rm -rf ~/Library/Application\ Support/9Boxer
```

**Location:** `~/Library/Application Support/9Boxer`

**What's stored here:**
- SQLite database with employee data (`ninebox.db`)
- Backend logs (`backend.log`)
- Application settings
- Temporary uploaded Excel files

**To view this folder in Finder:**
1. Open Finder
2. Press **⌘+Shift+G** (Go to Folder)
3. Enter: `~/Library/Application Support/9Boxer`
4. Click **Go**

Delete this folder if you want a completely clean uninstall.

---

## Advanced Configuration

### Installing to Custom Location

By default, apps go in `/Applications`, but you can install elsewhere:

1. After extracting the ZIP, move `9Boxer.app` to your chosen location
2. Example: `~/Applications` (user-specific) or `~/Desktop` (quick access)
3. Use the right-click → Open method from the new location

**Note:** macOS expects apps in `/Applications` or `~/Applications`. Other locations may cause issues with:
- Spotlight search
- Launchpad
- Auto-updates (if implemented later)

### Bypass Gatekeeper Entirely (Not Recommended)

**For advanced users or IT admins only:**

You can disable Gatekeeper system-wide (not recommended for security):

```bash
sudo spctl --master-disable
```

This allows all unsigned apps to run without warnings.

**To re-enable Gatekeeper:**
```bash
sudo spctl --master-enable
```

**Warning:** This reduces your Mac's security. Only use if you understand the risks.

### Code Signing Verification

To verify 9Boxer's code signature status:

```bash
codesign -vv -d /Applications/9Boxer.app
```

You'll see:
```
/Applications/9Boxer.app: code object is not signed at all
```

This confirms 9Boxer is unsigned (expected for internal tools).

---

## Data Storage Locations

9Boxer stores data in standard macOS directories:

| Type | Location |
|------|----------|
| **Application bundle** | `/Applications/9Boxer.app` |
| **User data (database, logs)** | `~/Library/Application Support/9Boxer` |
| **Backend executable** | `/Applications/9Boxer.app/Contents/Resources/backend/ninebox` |
| **Temporary files** | `~/Library/Application Support/9Boxer/temp` |

**Database file:** `ninebox.db` (SQLite)
**Backend logs:** `backend.log`
**Frontend logs:** Can be viewed with **Developer Tools** (⌘+Option+I when app is running)

---

## For IT Administrators

### Mass Deployment

To deploy 9Boxer across multiple Macs:

1. **Extract the ZIP on one machine**
2. **Remove quarantine flag:**
   ```bash
   xattr -cr /Applications/9Boxer.app
   ```
3. **Create a disk image:**
   ```bash
   hdiutil create -volname "9Boxer" -srcfolder /Applications/9Boxer.app -ov -format UDZO 9Boxer.dmg
   ```
4. **Distribute the DMG** via MDM or file share
5. **Users mount DMG and drag to Applications** - no quarantine flag

### Whitelist 9Boxer in MDM

If you manage Macs via MDM (Jamf, Intune, etc.), you can whitelist 9Boxer:

1. Get the app's bundle identifier:
   ```bash
   /usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" /Applications/9Boxer.app/Contents/Info.plist
   ```
2. Add to MDM's Gatekeeper whitelist using the bundle ID
3. Deploy via MDM - users won't see Gatekeeper warnings

### Create Installer Package (.pkg)

For enterprise deployment, create a macOS package:

```bash
pkgbuild --root /Applications/9Boxer.app \
         --identifier com.yourorg.9boxer \
         --version 1.0.0 \
         --install-location /Applications \
         9Boxer.pkg
```

Distribute the `.pkg` via MDM for automated installation.

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

**For more information about macOS Gatekeeper:**
- [Apple's Gatekeeper support documentation](https://support.apple.com/en-us/HT202491)
- [Apple's code signing documentation](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/Introduction/Introduction.html)

---

## What's Next?

Now that 9Boxer is installed:

1. **Try the sample data** → [2-Minute Quickstart](resources/user-guide/docs/quickstart.md)
2. **Run your first calibration** → [Your First Calibration](resources/user-guide/docs/getting-started.md)
3. **Prepare your employee data** → [Employee Data Requirements](resources/user-guide/docs/employee-data.md)
