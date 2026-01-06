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

---

## What's New in v[VERSION]

### New Features

- [Feature 1 description]
- [Feature 2 description]
- [Feature 3 description]

### Improvements

- [Improvement 1]
- [Improvement 2]
- [Improvement 3]

### Bug Fixes

- [Bug fix 1]
- [Bug fix 2]
- [Bug fix 3]

### Breaking Changes

- [Breaking change 1, if any]
- [Breaking change 2, if any]

---

## Upgrading from Previous Versions

### Your Data is Safe

9Boxer stores data in your user folder, separate from the application. Upgrading preserves:
- Employee database (SQLite)
- Application settings
- Backend logs

**Data locations:**
- Windows: `C:\Users\[YourUsername]\AppData\Roaming\9Boxer`
- macOS: `~/Library/Application Support/9Boxer`
- Linux: `~/.config/9Boxer`

### How to Upgrade

**Windows:**
1. Download the new installer
2. Run `9Boxer-Setup-[VERSION].exe`
3. It replaces the old version automatically
4. Your data is preserved

**macOS:**
1. Download the new ZIP
2. Quit the current version of 9Boxer (⌘+Q)
3. Replace `9Boxer.app` in Applications with the new version
4. Right-click → Open (first launch of new version)
5. Your data is preserved

**Linux:**
1. Download the new AppImage
2. Delete the old AppImage
3. Make new one executable and run
4. Your data is preserved

**Rollback:** If you encounter issues, download a previous release and install it the same way.

---

## Documentation

**New to 9Boxer?** Start here:
- [2-Minute Quickstart](resources/user-guide/docs/quickstart.md) - Try with sample data
- [Installation Guide](resources/user-guide/docs/installation.md) - Complete installation help

**Ready to calibrate?**
- [Your First Calibration](resources/user-guide/docs/getting-started.md) - Full workflow guide
- [Employee Data Requirements](resources/user-guide/docs/employee-data.md) - Prepare your Excel file

**Need help?**
- [Troubleshooting Guide](resources/user-guide/docs/troubleshooting.md)
- [Frequently Asked Questions](resources/user-guide/docs/faq.md)
- [Complete User Guide](resources/user-guide/docs/index.md)

---

## System Requirements

### Minimum Requirements

**Windows:**
- Windows 10 or later (64-bit)
- 4GB RAM
- 500MB free disk space
- .NET Framework 4.7.2 or later (usually pre-installed)

**macOS:**
- macOS 10.15 (Catalina) or later
- 4GB RAM
- 500MB free disk space

**Linux:**
- Modern distribution (Ubuntu 18.04+, Fedora 30+, etc.)
- 4GB RAM
- 500MB free disk space
- FUSE library installed

### Recommended Requirements

- 8GB RAM (for large datasets >500 employees)
- 1GB free disk space
- Display: 1920x1080 or higher resolution

---

## Known Issues

### All Platforms

- [Known issue 1 if any]
- [Known issue 2 if any]

### Windows-Specific

- [Windows-specific issue if any]

### macOS-Specific

- [macOS-specific issue if any]

### Linux-Specific

- [Linux-specific issue if any]

**Workarounds and fixes:** See [Troubleshooting Guide](resources/user-guide/docs/troubleshooting.md)

---

## Security & Privacy

### Why Am I Seeing Security Warnings?

9Boxer is an internal development tool distributed without commercial code signing:
- **Windows**: Not signed with Microsoft Authenticode certificate ($400+/year)
- **macOS**: Not signed or notarized with Apple Developer ID ($100/year)

**Is this safe?** Yes. 9Boxer is:
- Built by your organization
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

## Checksums

Verify download integrity with these checksums:

**Windows:**
```
SHA256: [hash]
MD5: [hash]
```

**macOS (arm64):**
```
SHA256: [hash]
MD5: [hash]
```

**macOS (x64):**
```
SHA256: [hash]
MD5: [hash]
```

**Linux:**
```
SHA256: [hash]
MD5: [hash]
```

**Verify on Windows:**
```cmd
certutil -hashfile 9Boxer-Setup-[VERSION].exe SHA256
```

**Verify on macOS/Linux:**
```bash
shasum -a 256 9Boxer-[VERSION]-macOS-arm64.zip
```

---

## Support

**Having installation issues?**
1. Check platform-specific installation guides:
   - [Windows Installation Guide](resources/user-guide/docs/INSTALL_WINDOWS.md)
   - [macOS Installation Guide](resources/user-guide/docs/INSTALL_MACOS.md)
2. Review [Troubleshooting](resources/user-guide/docs/troubleshooting.md)
3. Search [existing issues](https://github.com/bencan1a/9boxer/issues)
4. [Open a new issue](https://github.com/bencan1a/9boxer/issues/new) with:
   - Your operating system and version
   - Error messages or screenshots
   - Steps to reproduce the problem

**Need help using 9Boxer?**
- Read the [User Guide](resources/user-guide/docs/index.md)
- Try the [2-Minute Quickstart](resources/user-guide/docs/quickstart.md)
- Review [Best Practices](resources/user-guide/docs/best-practices.md)

---

## For Developers

**Want to contribute or build from source?**
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [BUILD.md](BUILD.md) - Build instructions
- [GITHUB_AGENT.md](GITHUB_AGENT.md) - Development workflow

**Running the development version:**
```bash
git clone https://github.com/bencan1a/9boxer.git
cd 9boxer
# Follow setup in BUILD.md
```

---

## License

9Boxer is released under the MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built with:
- **Electron** - Cross-platform desktop framework
- **React** - UI library
- **FastAPI** - High-performance Python web framework
- **PyInstaller** - Python executable bundler
- **Material-UI** - React component library

Special thanks to all contributors and users providing feedback to make 9Boxer better.

---

**Ready to get started?** Download the installer above and follow the installation guide for your platform!
