# macOS Installation Guide

This guide helps you install 9Boxer on macOS. Since this is an internal tool without Apple notarization, you'll need to follow these steps to bypass macOS Gatekeeper security.

## Installation Steps

### 1. Download the App

Download the latest `9Boxer-[version]-macOS-[arch].zip` from the [GitHub Releases](../../releases) page.

### 2. Extract the ZIP

1. Double-click the downloaded `.zip` file to extract it
2. You should see `9Boxer.app` in your Downloads folder

### 3. Move to Applications (Optional)

Drag `9Boxer.app` to your **Applications** folder for easier access.

### 4. First Launch - Bypass Gatekeeper

**IMPORTANT**: On first launch, you MUST use the right-click method to open the app.

#### Method 1: Right-Click to Open (Easiest)

1. **Right-click** (or Control+click) on `9Boxer.app`
2. Select **"Open"** from the context menu
3. Click **"Open"** in the security dialog that appears
4. The app will launch

After the first launch, you can open the app normally by double-clicking.

#### Method 2: System Settings (Alternative)

If you accidentally double-clicked first and got blocked:

1. Go to **System Settings** → **Privacy & Security**
2. Scroll down to the **Security** section
3. You should see a message about "9Boxer" being blocked
4. Click **"Open Anyway"**
5. Click **"Open"** in the confirmation dialog

#### Method 3: Terminal Command (Advanced)

If the above methods don't work, use this terminal command to remove the quarantine flag:

```bash
xattr -d com.apple.quarantine /Applications/9Boxer.app
```

Then double-click the app to launch normally.

## Troubleshooting

### "9Boxer is damaged and can't be opened"

This message can appear on some macOS versions. Fix it with:

```bash
xattr -cr /Applications/9Boxer.app
```

Then try opening again using the right-click method.

### App won't launch at all

1. Make sure you extracted the ZIP file first (don't try to run from inside the ZIP)
2. Check that the file isn't in quarantine:
   ```bash
   xattr -l /Applications/9Boxer.app
   ```
3. If you see `com.apple.quarantine`, remove it:
   ```bash
   xattr -d com.apple.quarantine /Applications/9Boxer.app
   ```

### Security warning every time

This shouldn't happen after the first successful launch. If it does, make sure you're running the app from Applications folder and not from Downloads.

## Why This Happens

9Boxer is an **internal tool** distributed without Apple Developer ID signing or notarization. This is normal for internal corporate apps. The workarounds above are standard for unsigned macOS applications.

For more information about macOS Gatekeeper, see [Apple's support documentation](https://support.apple.com/en-us/HT202491).

## Support

If you continue to have issues:
1. Check the [README](README.md) for general documentation
2. Open an issue on GitHub
3. Contact your internal IT support
