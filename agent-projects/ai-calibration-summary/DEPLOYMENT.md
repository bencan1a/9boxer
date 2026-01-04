# Deployment Guide: 9Boxer Desktop Application

**Document Version:** 1.0
**Last Updated:** 2026-01-03
**Target Audience:** Developers (Building) & End Users (Using)

---

## Table of Contents

1. [Overview](#overview)
2. [For Developers: Building the Application](#for-developers-building-the-application)
3. [For End Users: Using the Application](#for-end-users-using-the-application)
4. [Troubleshooting](#troubleshooting)
5. [Cost Management](#cost-management)

---

## Overview

9Boxer is an internal desktop application for talent calibration and employee performance management. It is packaged as an Electron application for Windows, macOS, and Linux.

**Key Architecture Points:**
- **Frontend:** React application wrapped in Electron
- **Backend:** Python FastAPI service bundled with PyInstaller
- **AI Integration:** Claude API (Anthropic) for calibration summaries
- **Data Format:** Excel files with director-level employee data
- **Deployment Model:** Single company (~2000 employees), internal use only
- **API Key:** Bundled with the application (not user-provided)

---

## For Developers: Building the Application

### Prerequisites

**Required Tools:**
- **Node.js:** 20.0.0 or higher
- **npm:** 9.0.0 or higher
- **Python:** 3.11 or higher (for backend)
- **Git:** For cloning the repository

**Windows-Specific:**
- Windows 10/11 (64-bit)
- PowerShell 5.1 or higher

### 1. Clone the Repository

```powershell
git clone https://github.com/yourcompany/9boxer.git
cd 9boxer
```

### 2. Configure API Key for Bundling

The Anthropic API key must be bundled with the application during the build process.

#### 2.1. Create Backend .env File

Create `backend/.env` with your API key:

```env
# Anthropic API Key (Claude)
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key-here

# Optional: Specify LLM model (defaults to claude-sonnet-4-5-20250929)
LLM_MODEL=claude-sonnet-4-5-20250929

# Optional: Use Haiku for 3-5x faster responses (lower quality)
# LLM_MODEL=claude-haiku-3-5-20250110
```

**IMPORTANT:** The `.env` file will be bundled into the PyInstaller executable during the build process. The API key will be embedded in the packaged application.

#### 2.2. Security Considerations for Bundled API Keys

**Threat Model:**
- **Internal deployment:** Application is distributed only to company employees
- **Risk:** Reverse engineering the executable could extract the API key
- **Mitigation:** Acceptable for internal use, but consider these best practices:

**Best Practices:**

1. **Use a Dedicated API Key:**
   - Create a separate Anthropic API key specifically for the desktop app
   - Set usage limits and monitoring in the Anthropic Console
   - Rotate the key periodically (quarterly recommended)

2. **Monitor Usage:**
   - Enable logging in Anthropic Console
   - Track per-session costs (see Cost Management section)
   - Set up alerts for unusual usage patterns

3. **Obfuscation (Optional):**
   - PyInstaller bundles the `.env` file as-is (plaintext in executable)
   - For additional obfuscation, consider encrypting the API key at build time:
     ```python
     # Not implemented - future enhancement
     # Use cryptography.fernet to encrypt API key during build
     # Decrypt at runtime in llm_service.py
     ```

4. **Access Control:**
   - Distribute the installer only through internal channels
   - Do not publish to public app stores
   - Use internal file sharing (SharePoint, network drive, etc.)

**Trade-offs:**
- **Current approach (plaintext .env):** Simple, works for internal use
- **Encryption:** Adds complexity, key management overhead, marginal security gain
- **Cloud-based key service:** Requires network dependency, infrastructure overhead

**Recommendation:** For 2000-employee internal deployment, the current plaintext bundling is acceptable. Monitor usage and rotate keys regularly.

### 3. Build the Backend

The backend is bundled using PyInstaller:

```powershell
cd backend

# Install dependencies
pip install -r requirements.txt

# Build the backend executable (Windows)
python build.py

# Output: backend/dist/ninebox/ninebox.exe
```

**Note:** The `.env` file is automatically included in the PyInstaller bundle (configured in `build.py` or `.spec` file).

### 4. Build the Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Build for production
npm run electron:build:win  # Windows
# OR
npm run electron:build:mac  # macOS
# OR
npm run electron:build:linux  # Linux
```

**Build Output (Windows):**
```
frontend/release/9Boxer-1.0.0-Windows-x64.exe  (~300MB installer)
```

**Build Configuration:**
- Installer type: NSIS (Windows), DMG (macOS), AppImage (Linux)
- Bundled resources:
  - Backend executable (`backend/dist/ninebox/ninebox.exe`)
  - Frontend assets (React app)
  - User guide (MkDocs HTML)
  - Sample Excel file (`Sample_People_List.xlsx`)

### 5. Verify the Build

Before distribution, verify the bundled API key:

```powershell
# Test the packaged application
.\frontend\release\win-unpacked\9Boxer.exe

# Verify LLM availability
# 1. Launch the app
# 2. Load an Excel file
# 3. Navigate to Intelligence tab
# 4. Click "Generate AI Summary"
# 5. Verify summary generates successfully (30-40 seconds)
```

### 6. Distribution

**Internal Distribution Channels:**
- **Option 1:** Network share (recommended)
  ```powershell
  # Copy installer to network drive
  copy "frontend\release\9Boxer-1.0.0-Windows-x64.exe" "\\fileserver\apps\9boxer\"
  ```

- **Option 2:** SharePoint/OneDrive
  - Upload to internal SharePoint site
  - Share link with installation instructions

- **Option 3:** Email (for small teams)
  - Compress installer (optional)
  - Send to IT department for deployment

**Installation Instructions (for IT/End Users):**
1. Download `9Boxer-1.0.0-Windows-x64.exe` from [internal location]
2. Double-click the installer
3. Follow the setup wizard (default settings recommended)
4. Launch 9Boxer from Start Menu or Desktop shortcut

---

## For End Users: Using the Application

### 1. Launch the Application

**Windows:**
- **Start Menu:** `9Boxer` (in alphabetical order)
- **Desktop Shortcut:** `9Boxer` icon (if created during installation)
- **Installation Folder:** `C:\Users\<username>\AppData\Local\Programs\9boxer\9Boxer.exe`

**Startup Time:** 3-5 seconds (includes backend initialization)

**What You'll See:**
1. Splash screen: "Starting 9Boxer..." (2-3 seconds)
2. Main application window opens
3. Welcome screen with "Load Excel File" button

### 2. Loading Excel Files

**Step-by-Step:**
1. Click **"Load Excel File"** button (or **File → Open**)
2. Select your Excel file (must contain employee data)
3. Wait for file validation (1-2 seconds)
4. Application displays employee grid

**Supported File Format:**
- **File type:** `.xlsx` (Excel 2007 or later)
- **Required columns:**
  - `Employee ID` (unique identifier)
  - `Name` (employee name)
  - `Performance` (High/Medium/Low)
  - `Potential` (High/Medium/Low)
  - `Job Level` (e.g., MT1, MT2, MT3)
  - `Job Function` (e.g., Engineering, Sales)
  - `Location` (e.g., New York, London)
  - `Manager` (manager's name)
- **Sample file:** Included in installation folder (`Sample_People_List.xlsx`)

**Common File Issues:**
- **"Invalid file format"** → Use `.xlsx` format (not `.xls` or `.csv`)
- **"Missing required columns"** → Verify all required columns are present
- **"No employees found"** → Ensure data starts in row 2 (row 1 is headers)

### 3. Generating AI Summaries

**Purpose:** Get AI-powered insights about calibration patterns and anomalies.

**Step-by-Step:**
1. Load an Excel file (see above)
2. Navigate to **Intelligence** tab
3. Click **"Generate AI Summary"** button
4. Wait for summary generation (30-40 seconds)
5. Review summary and recommendations

**What to Expect:**
- **Processing time:** 30-40 seconds for typical datasets (50-200 employees)
- **Internet required:** Yes (connects to Claude API)
- **Output:** Executive summary + specific issues/recommendations

**Performance Expectations:**
- **Small datasets (<50 employees):** ~20 seconds
- **Medium datasets (50-200 employees):** ~30-40 seconds
- **Large datasets (200-500 employees):** ~45-60 seconds
- **Very large datasets (>500 employees):** ~60-90 seconds

**Progress Indicators:**
- Loading spinner: "Generating AI summary..."
- Success: Summary appears in panel
- Failure: Error message with troubleshooting steps

### 4. If AI Summary Fails

**Common Scenarios:**

1. **"AI summary generation failed: Network error"**
   - **Cause:** No internet connection or firewall blocking API requests
   - **Fix:** Check internet connection, retry after connecting

2. **"LLM service unavailable"**
   - **Cause:** Anthropic API is down or rate-limited
   - **Fix:** Wait 1-2 minutes and retry. If persistent, contact IT support.

3. **"API key not configured"**
   - **Cause:** Application was built without API key (developer error)
   - **Fix:** Contact IT support for updated installer

**Retry Process:**
- Click **"Generate AI Summary"** again (no need to reload file)
- If retry fails 3 times, check logs (see Troubleshooting section)

---

## Troubleshooting

### AI Summary Not Generating

**Symptom:** "Generate AI Summary" button shows error or spinner indefinitely.

**Diagnosis:**
1. **Check internet connectivity:**
   ```powershell
   ping api.anthropic.com
   ```
   - If ping fails → Network issue (firewall, proxy, or no internet)

2. **Check backend logs:**
   - **Location (Windows):** `%APPDATA%\9boxer\logs\backend.log`
   - **Look for:** Lines containing `[LLM]` or `[ERROR]`
   - **Example error:** `"ANTHROPIC_API_KEY not set"` → Contact IT support

3. **Check frontend logs:**
   - **Developer Console:** Press `F12` in the app window
   - **Look for:** Network errors (red text) or API failures

**Solutions:**
- **Network error:** Check firewall settings, connect to VPN if required
- **API key error:** Re-install application (contact IT support)
- **Rate limit error:** Wait 5 minutes and retry (API quota exhausted)

### LLM Service Unavailable

**Symptom:** Error message: "LLM service is not available"

**Possible Causes:**
1. **Anthropic API is down:**
   - Check status: https://status.anthropic.com
   - Wait for service restoration (usually < 30 minutes)

2. **API key invalid or expired:**
   - Verify with IT: API key may need rotation
   - Re-install application with updated key

3. **Network firewall blocking API:**
   - Ensure `api.anthropic.com` is whitelisted
   - Check corporate firewall/proxy settings

**Workaround:**
- Use the application without AI summaries (all other features work offline)
- Manual statistical analysis available in Intelligence tab

### Excel File Errors

**Symptom:** "Failed to load Excel file" or "Invalid data format"

**Common Issues:**

1. **Missing required columns:**
   - **Fix:** Add missing columns to Excel file
   - **Required:** Employee ID, Name, Performance, Potential, Job Level, Function, Location, Manager

2. **Invalid performance/potential values:**
   - **Valid values:** `High`, `Medium`, `Low` (case-insensitive)
   - **Fix:** Correct any typos or non-standard values

3. **Empty employee data:**
   - **Fix:** Ensure at least one employee row exists (row 2 or later)

4. **Circular manager references:**
   - **Example:** Employee A reports to Employee B, who reports to Employee A
   - **Fix:** Correct org structure in Excel file

**Data Format Requirements:**
- See sample file: `Sample_People_List.xlsx` (in installation folder)
- Or refer to User Guide: **Help → User Guide** in the app menu

### Performance Issues

**Symptom:** Application is slow or unresponsive

**Dataset Size Expectations:**
- **< 100 employees:** Instant grid rendering, <1s for statistics
- **100-500 employees:** <2s for grid rendering, <3s for statistics
- **500-1000 employees:** <5s for grid rendering, <10s for statistics
- **> 1000 employees:** May experience slowness (consider filtering dataset)

**Solutions:**
1. **Filter data:** Split large datasets into smaller calibration sessions
2. **Close other applications:** Free up system memory
3. **Check system resources:** Task Manager → Performance tab
   - **Recommended:** 8GB RAM, 2+ CPU cores
   - **Minimum:** 4GB RAM, 1 CPU core

### Application Won't Start

**Symptom:** Double-clicking `9Boxer.exe` does nothing or shows error

**Solutions:**

1. **Check antivirus/firewall:**
   - Application may be blocked by security software
   - Whitelist `9Boxer.exe` in antivirus settings

2. **Check Windows Event Viewer:**
   - **Path:** Event Viewer → Windows Logs → Application
   - **Look for:** Errors related to `9Boxer.exe` or `ninebox.exe`

3. **Re-install application:**
   - Uninstall via Control Panel → Programs
   - Download fresh installer from internal share
   - Re-install with administrator privileges

4. **Check Windows version:**
   - **Minimum:** Windows 10 (64-bit)
   - **Recommended:** Windows 11

---

## Cost Management

### Overview

The AI summary feature uses the Claude API (Anthropic), which incurs costs based on usage. Since the API key is bundled with the application, all usage costs are billed to the company account.

### Estimated Costs

**Per Calibration Session:**
- **Model:** `claude-sonnet-4-5-20250929` (default)
- **Input tokens:** ~10,000-20,000 tokens (depends on dataset size)
- **Output tokens:** ~2,000-4,000 tokens (summary + recommendations)
- **Total cost:** ~$0.30-$0.60 per session

**Monthly Estimates (2000 employees, quarterly calibrations):**
- **Sessions per quarter:** ~50-100 sessions (managers + directors)
- **Cost per quarter:** $15-$60
- **Annual cost:** $60-$240

**Notes:**
- Costs assume typical usage (1 AI summary per calibration session)
- Re-generating summaries (retries) incurs additional costs
- Haiku model (`claude-haiku-3-5-20250110`) is 3-5x cheaper but lower quality

### Monitoring LLM Usage

**Backend Logging (Issue #179):**
The application logs all LLM API calls for cost tracking and troubleshooting.

**Log Location (Windows):**
```
%APPDATA%\9boxer\logs\backend.log
```

**Log Format:**
```
2026-01-03 10:30:15 - ninebox.services.llm_service - INFO - [LLM] Request started: session_id=abc123
2026-01-03 10:30:45 - ninebox.services.llm_service - INFO - [LLM] Response received: input_tokens=15234, output_tokens=3421, cost=$0.42
```

**What's Logged:**
- **Session ID:** Unique identifier for each calibration session
- **Input tokens:** Number of tokens sent to the API (affects cost)
- **Output tokens:** Number of tokens in the response (affects cost)
- **Estimated cost:** Calculated using current Anthropic pricing
- **Model used:** `claude-sonnet-4-5` or `claude-haiku-3-5`
- **Timestamp:** When the request was made

**Analyzing Logs (PowerShell):**
```powershell
# Extract LLM usage from logs
Select-String -Path "$env:APPDATA\9boxer\logs\backend.log" -Pattern "\[LLM\]" | Out-File llm_usage.txt

# Count total sessions
(Select-String -Path "$env:APPDATA\9boxer\logs\backend.log" -Pattern "Request started").Count

# Sum estimated costs (requires manual parsing)
# Example: "cost=$0.42" → extract and sum
```

### Cost Optimization

**Strategies to Reduce Costs:**

1. **Use Haiku model for development/testing:**
   - Edit `backend/.env` before building:
     ```env
     LLM_MODEL=claude-haiku-3-5-20250110
     ```
   - **Savings:** 3-5x cheaper (~$0.10-$0.20 per session)
   - **Trade-off:** Slightly lower summary quality

2. **Avoid unnecessary re-generations:**
   - Train users to review statistical insights before generating AI summary
   - Use "Generate AI Summary" only for final calibration review

3. **Filter datasets before calibration:**
   - Smaller datasets → fewer tokens → lower costs
   - Focus on specific departments or levels

4. **Set API rate limits (Anthropic Console):**
   - Log into Anthropic Console (https://console.anthropic.com)
   - Set monthly spending limit (e.g., $100/month)
   - Receive alerts at 80% usage

### Cost Visibility

**Anthropic Console (for IT/Finance):**
1. Log in: https://console.anthropic.com
2. Navigate to **Usage** tab
3. View:
   - Daily/monthly token usage
   - Cost breakdown by model
   - Historical trends

**Reporting:**
- Export usage data (CSV) from Anthropic Console
- Cross-reference with backend logs for per-session attribution
- Generate monthly cost reports for finance team

**Budget Planning:**
- **Conservative estimate:** $300/year (2000 employees, quarterly calibrations)
- **Recommended budget:** $500/year (includes buffer for increased usage)

---

## Additional Resources

### Documentation

- **User Guide:** `Help → User Guide` (in-app) or `resources/user-guide/site/index.html`
- **Developer Guide:** `agent-projects/ai-calibration-summary/DEVELOPER_GUIDE.md`
- **Architecture:** `internal-docs/architecture/decisions/001-electron-desktop-architecture.md`

### Support

**For End Users:**
- **IT Support:** Contact your IT helpdesk for installation/troubleshooting
- **User Guide:** In-app help menu

**For Developers:**
- **GitHub Issues:** https://github.com/yourcompany/9boxer/issues
- **Internal Docs:** `internal-docs/README.md`
- **Architecture Decisions:** `internal-docs/architecture/decisions/`

### Version History

**Current Version:** 1.0.0
- Initial release with AI-powered calibration summaries
- Bundled API key for internal deployment
- Support for Windows, macOS, Linux

**Planned Updates:**
- Auto-update mechanism (Issue #TBD)
- Enhanced cost monitoring dashboard (Issue #TBD)
- API key rotation automation (Issue #TBD)

---

## Appendix: Security Checklist

**Before Distributing the Application:**

- [ ] Verify `.env` file contains valid `ANTHROPIC_API_KEY`
- [ ] Test AI summary generation in packaged app (not dev mode)
- [ ] Confirm API key has usage limits set in Anthropic Console
- [ ] Document API key location (password manager, secure wiki)
- [ ] Set up quarterly key rotation reminder
- [ ] Restrict installer distribution to internal channels only
- [ ] Enable logging in Anthropic Console for usage monitoring
- [ ] Brief IT support on troubleshooting LLM errors

**Quarterly Maintenance:**

- [ ] Review Anthropic Console usage reports
- [ ] Check for unusual usage spikes
- [ ] Rotate API key (create new key, rebuild app, distribute)
- [ ] Update cost estimates based on actual usage
- [ ] Review user feedback on AI summary quality

---

## Changelog

**2026-01-03 - v1.0**
- Initial deployment guide created
- Documented API key bundling process
- Added cost management section
- Windows-specific paths and commands
