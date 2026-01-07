# 9Boxer v[VERSION] Release

## Download

Choose the installer for your operating system:

| Platform | Download | Size | Notes |
|----------|----------|------|-------|
| **Windows** | [9Boxer-Setup-[VERSION].exe](#) | ~300MB | Windows 10+ (64-bit) |
| **macOS (Apple Silicon)** | [9Boxer-[VERSION]-macOS-arm64.zip](#) | ~300MB | M1, M2, M3 Macs |
| **macOS (Intel)** | [9Boxer-[VERSION]-macOS-x64.zip](#) | ~300MB | Intel-based Macs |
| **Linux** | [9Boxer-[VERSION].AppImage](#) | ~300MB | Ubuntu 18.04+, most distributions |

**Not sure which macOS version?** Click Apple menu () → About This Mac → check "Chip" or "Processor"

---

## Important: First-Time Installation

9Boxer is an internal development tool without commercial code signing. You'll see security warnings on first launch.

### Windows Installation

1. **Download** `9Boxer-Setup-[VERSION].exe`
2. **Double-click** to run the installer
3. **Bypass SmartScreen warning:**
   - Click **"More info"** (small link on left)
   - Click **"Run anyway"** button that appears
4. **Follow the installer wizard**
5. **Launch 9Boxer**

**Firewall prompt:** Click "Allow access" when Windows Firewall asks (this lets the backend communicate locally).

**After first launch:** The security warning won't appear again. Double-click normally to launch.

### macOS Installation

1. **Download** the correct ZIP for your Mac architecture
2. **Extract** the ZIP file (double-click)
3. **Move** `9Boxer.app` to your Applications folder
4. **Bypass Gatekeeper (critical first step):**
   - **Right-click** (not double-click!) on `9Boxer.app`
   - Select **"Open"** from the menu
   - Click **"Open"** in the security dialog
5. **9Boxer launches**

**After first launch:** The security warning won't appear again. Double-click normally to launch.

**Common issues:**
- "9Boxer is damaged" → Run `xattr -cr /Applications/9Boxer.app` in Terminal
- Still blocked → See [macOS Installation Guide](resources/user-guide/docs/INSTALL_MACOS.md)

### Linux Installation

1. **Download** `9Boxer-[VERSION].AppImage`
2. **Make executable:**
   ```bash
   chmod +x 9Boxer-[VERSION].AppImage
   ```
3. **Run:**
   ```bash
   ./9Boxer-[VERSION].AppImage
   ```

**If it won't run:** Install FUSE library:
```bash
# Ubuntu/Debian
sudo apt install libfuse2

# Fedora
sudo dnf install fuse-libs
```

**Is this safe?** Yes. 9Boxer is:
- Open source (source code available for review)
- Runs entirely on your computer (no cloud dependencies)
- Your data never leaves your machine

The security warnings just mean the app isn't commercially signed - they don't indicate danger.

### Data Privacy

9Boxer is **100% offline**:
- No internet connection required
- No data sent to external servers
- All employee data stays on your local machine
- SQLite database stored in your user folder

**Exception:** If you use the AI-powered Intelligence features, only anonymized statistical data (no names, IDs, or business titles) is sent to external AI APIs for analysis.

---

**Need help using 9Boxer?**
- Read the [User Guide](resources/user-guide/docs/index.md)
- Try the [2-Minute Quickstart](resources/user-guide/docs/quickstart.md)
- Review [Best Practices](resources/user-guide/docs/best-practices.md)

---
