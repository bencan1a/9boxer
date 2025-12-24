#!/usr/bin/env python3
"""
Documentation Screenshot Generator for 9Boxer Application

This script uses Playwright to automatically generate screenshots for documentation.
It starts both backend and frontend servers, loads sample data, and captures
screenshots showing various UI states and features.

ARCHITECTURE OVERVIEW:
----------------------
1. ServerManager: Manages backend (FastAPI) and frontend (Vite) server lifecycle
   - Starts servers in background processes
   - Waits for health checks before proceeding
   - Handles graceful shutdown

2. ScreenshotGenerator: Core screenshot capture logic
   - Initializes Playwright browser (headless Chromium)
   - Provides helper methods (close_dialogs, activate_donut_mode, upload_sample_data)
   - Contains 40+ screenshot capture methods organized by feature area
   - Tracks manual/skipped screenshots for reporting

3. Screenshot Capture Methods: Feature-specific screenshot logic
   - Each method sets up UI state (clicks, drags, selections)
   - Waits for animations/network to settle (critical for clean screenshots)
   - Captures screenshot of specific element or full page
   - Returns Path to saved file or None if failed

TIMING AND WAIT STRATEGIES:
----------------------------
- asyncio.sleep(0.2-0.5): Animation completion (Material-UI: ~300ms typical)
- asyncio.sleep(1.0): Complex multi-step operations (drag-drop with API calls)
- wait_for_load_state('networkidle'): All network requests completed
- expect().to_be_visible(): Element rendered and visible in viewport

PLAYWRIGHT BEST PRACTICES:
---------------------------
- Use data-testid selectors (more stable than text or CSS classes)
- Use :not() selectors to exclude unwanted elements (e.g., badge counts)
- Use .first for single elements when multiple matches possible
- Always verify element existence before interacting (await count() > 0)
- Close dialogs before screenshots to avoid overlay artifacts

MANUAL POST-PROCESSING:
------------------------
Some screenshots require manual annotation or creation:
- Excel file screenshots (requires opening actual Excel)
- Mid-drag animation states (Playwright can't capture while mouse held)
- Multi-panel compositions (before/after comparisons)
- Annotated callouts and arrows (added in image editor)

These are tracked via mark_manual() and reported at end.

Usage:
    python tools/generate_docs_screenshots.py [--screenshots NAMES] [--format FORMAT]

Options:
    --screenshots: Comma-separated list of screenshot names to generate (default: all)
    --format: Image format - 'png' or 'webp' (default: png)
    --quality: Compression quality 1-100 (default: 90)
    --viewport: Viewport size as WIDTHxHEIGHT (default: 1400x900)
    --output-dir: Output directory (default: docs/images/screenshots/)

Examples:
    # Generate all screenshots
    python tools/generate_docs_screenshots.py

    # Generate specific screenshots
    python tools/generate_docs_screenshots.py --screenshots grid-normal,donut-mode

    # Generate with WebP format for smaller files
    python tools/generate_docs_screenshots.py --format webp --quality 85
"""

import argparse
import asyncio
import os
import subprocess  # nosec B404 - controlled subprocess call
import sys
import time
import traceback
from pathlib import Path
from typing import Any

# Add project root to path for imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    import httpx
    from playwright.async_api import (  # type: ignore[import-not-found]
        Browser,
        Page,
        async_playwright,
        expect,
    )
except ImportError as e:
    print("ERROR: Required Python dependencies not found.")
    print(f"Missing module: {e}")
    print("")
    print("Please install dependencies:")
    print("  # Activate virtual environment first")
    print("  .venv\\Scripts\\activate  (Windows) or source .venv/bin/activate (Unix)")
    print("")
    print("  # Install playwright and httpx")
    print("  pip install uv")
    print("  uv pip install --system playwright httpx")
    print("")
    print("  # Install Playwright browsers")
    print("  playwright install chromium")
    sys.exit(1)


class Colors:
    """ANSI color codes for terminal output"""

    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    RESET = "\033[0m"
    BOLD = "\033[1m"


class ServerManager:
    """Manages backend and frontend server lifecycle"""

    def __init__(self) -> None:
        self.backend_process: subprocess.Popen | None = None
        self.frontend_process: subprocess.Popen | None = None
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:5173"

    async def start_backend(self) -> None:
        """Start the FastAPI backend server"""
        print(f"{Colors.BLUE}[Backend]{Colors.RESET} Starting server...")

        # Determine Python executable path
        if sys.platform == "win32":
            python_path = PROJECT_ROOT / ".venv" / "Scripts" / "python.exe"
        else:
            python_path = PROJECT_ROOT / ".venv" / "bin" / "python"

        if not python_path.exists():
            raise FileNotFoundError(
                f"Python executable not found at {python_path}\n"
                f"Please set up virtual environment:\n"
                f"  cd {PROJECT_ROOT}\n"
                f"  python -m venv .venv\n"
                f"  .venv/Scripts/activate (Windows) or source .venv/bin/activate (Unix)\n"
                f"  pip install uv\n"
                f"  uv pip install --system -e '.[dev]'"
            )

        backend_dir = PROJECT_ROOT / "backend"

        # Start uvicorn server - controlled subprocess call with validated inputs
        self.backend_process = subprocess.Popen(  # nosec B603
            [
                str(python_path),
                "-m",
                "uvicorn",
                "ninebox.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
            ],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={
                **os.environ,
                "PYTHONPATH": str(backend_dir / "src"),
            },
        )

        # Wait for backend to be ready
        await self._wait_for_health_check(self.backend_url)
        print(f"{Colors.GREEN}[Backend]{Colors.RESET} Server ready at {self.backend_url}")

    async def start_frontend(self) -> None:
        """Start the Vite frontend dev server"""
        print(f"{Colors.BLUE}[Frontend]{Colors.RESET} Starting server...")

        frontend_dir = PROJECT_ROOT / "frontend"

        # Determine npm command (Windows needs .cmd extension)
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

        # Start Vite dev server - controlled subprocess call with validated inputs
        self.frontend_process = subprocess.Popen(  # nosec B603 B607
            [npm_cmd, "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        # Wait for frontend to be ready
        await self._wait_for_url(self.frontend_url)
        print(f"{Colors.GREEN}[Frontend]{Colors.RESET} Server ready at {self.frontend_url}")

    async def _wait_for_health_check(self, url: str, timeout: int = 60) -> None:
        """Wait for backend health check to respond"""
        health_url = f"{url}/health"
        start_time = time.time()

        async with httpx.AsyncClient() as client:
            while time.time() - start_time < timeout:
                try:
                    response = await client.get(health_url, timeout=2.0)
                    if response.status_code == 200:
                        return
                except (httpx.ConnectError, httpx.TimeoutException):
                    pass
                await asyncio.sleep(1)

        raise TimeoutError(f"Backend failed to start within {timeout} seconds")

    async def _wait_for_url(self, url: str, timeout: int = 120) -> None:
        """Wait for URL to respond"""
        start_time = time.time()

        async with httpx.AsyncClient() as client:
            while time.time() - start_time < timeout:
                try:
                    response = await client.get(url, timeout=2.0)
                    if response.status_code == 200:
                        return
                except (httpx.ConnectError, httpx.TimeoutException):
                    pass
                await asyncio.sleep(1)

        raise TimeoutError(f"URL {url} failed to respond within {timeout} seconds")

    async def stop_servers(self) -> None:
        """Stop both servers with proper cleanup"""
        if self.backend_process:
            print(f"{Colors.YELLOW}[Backend]{Colors.RESET} Stopping server...")
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
                self.backend_process.wait()

            # Close all pipes explicitly to avoid ResourceWarning
            if self.backend_process.stdin:
                self.backend_process.stdin.close()
            if self.backend_process.stdout:
                self.backend_process.stdout.close()
            if self.backend_process.stderr:
                self.backend_process.stderr.close()

        if self.frontend_process:
            print(f"{Colors.YELLOW}[Frontend]{Colors.RESET} Stopping server...")
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
                self.frontend_process.wait()

            # Close all pipes explicitly to avoid ResourceWarning
            if self.frontend_process.stdin:
                self.frontend_process.stdin.close()
            if self.frontend_process.stdout:
                self.frontend_process.stdout.close()
            if self.frontend_process.stderr:
                self.frontend_process.stderr.close()

        # Give processes time to fully clean up
        await asyncio.sleep(1.0)


class ScreenshotGenerator:
    """Generates documentation screenshots using Playwright"""

    def __init__(
        self,
        output_dir: Path,
        viewport_width: int = 1400,
        viewport_height: int = 900,
        image_format: str = "png",
        quality: int = 90,
    ):
        self.output_dir = output_dir
        self.viewport_width = viewport_width
        self.viewport_height = viewport_height
        self.image_format = image_format
        self.quality = quality
        self.browser: Browser | None = None
        self.page: Page  # Will be initialized in setup_browser

        # Screenshot tracking
        self.manual_screenshots: list[dict[str, str]] = []
        self.skipped_screenshots: list[dict[str, str]] = []

        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def mark_manual(self, name: str, reason: str) -> None:
        """Mark a screenshot as requiring manual creation"""
        self.manual_screenshots.append({"name": name, "reason": reason})
        print(f"{Colors.YELLOW}[Manual]{Colors.RESET} {name}: {reason}")

    def mark_skipped(self, name: str, reason: str) -> None:
        """Mark a screenshot as skipped"""
        self.skipped_screenshots.append({"name": name, "reason": reason})
        print(f"{Colors.YELLOW}[Skipped]{Colors.RESET} {name}: {reason}")

    async def setup_browser(self) -> None:
        """Initialize Playwright browser"""
        print(f"{Colors.BLUE}[Browser]{Colors.RESET} Launching Chromium...")

        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)

        # Type narrowing and runtime safety check
        if self.browser is None:
            raise RuntimeError("Failed to launch browser")

        self.page = await self.browser.new_page(
            viewport={"width": self.viewport_width, "height": self.viewport_height}
        )

        print(f"{Colors.GREEN}[Browser]{Colors.RESET} Ready")

    async def close_browser(self) -> None:
        """Close Playwright browser"""
        if self.browser:
            await self.browser.close()

    # ========================================
    # Helper Methods for Screenshot Preparation
    # ========================================
    #
    # These methods handle common screenshot preparation tasks:
    # - close_dialogs(): Remove UI overlays (menus, modals, backdrops)
    # - activate_donut_mode(): Switch to donut view mode
    # - get_fixture_for_screenshot(): Select appropriate test data
    # - upload_sample_data(): Load employee data from Excel fixture
    # - load_calibration_data(): Load realistic distribution data
    # - reset_to_empty_state(): Return to clean empty app state
    # - capture_screenshot(): Core screenshot capture with timing
    # - wait_for_ui_settle(): Wait for network + animations to complete
    # - get_badge_count(): Get badge count with error handling
    # - ensure_changes_exist(): Verify changes exist, create if needed
    # - perform_employee_drag(): Standardized employee drag operation
    # - click_tab_and_wait(): Click tab and wait for content to load
    # - select_filter_by_text(): Select filter option by visible text
    #
    # ========================================

    async def close_dialogs(self) -> None:
        """Close all dialogs, menus, popovers, and modals using multiple strategies

        This method uses a layered approach to ensure ALL UI overlays are closed
        before capturing screenshots. Material-UI components can be persistent,
        so we need multiple strategies to catch all cases.
        """
        try:
            # Strategy 1: Close file menu specifically by clicking outside
            # File menu is a common overlay that needs explicit dismissal
            file_menu = self.page.locator('[data-testid="file-menu"]')
            if await file_menu.count() > 0:
                try:
                    is_visible = await file_menu.is_visible()
                    if is_visible:
                        # Click far outside the menu to close it (top-left corner)
                        await self.page.mouse.click(10, 10)
                        # Wait for menu close animation (Material-UI default: 300ms)
                        await asyncio.sleep(0.5)
                except Exception:
                    pass

            # Strategy 2: Force remove all MUI backdrops via JavaScript
            # Backdrops are semi-transparent overlays that Material-UI places behind dialogs
            # They can persist even after dialogs close, so we forcibly remove them from DOM
            await self.page.evaluate(
                """
                () => {
                    const backdrops = document.querySelectorAll('.MuiBackdrop-root');
                    backdrops.forEach(backdrop => {
                        backdrop.remove();
                    });
                }
            """
            )
            # Wait for DOM mutation and re-render
            await asyncio.sleep(0.3)

            # Strategy 3: Force close all MUI menus via JavaScript
            # Hide menus that might not respond to click-outside or Escape
            # Uses display: none to immediately hide without waiting for animation
            await self.page.evaluate(
                """
                () => {
                    const menus = document.querySelectorAll('[role="presentation"]');
                    menus.forEach(menu => {
                        if (menu.classList.contains('MuiPopover-root') ||
                            menu.classList.contains('MuiMenu-root')) {
                            menu.style.display = 'none';
                        }
                    });
                }
            """
            )
            # Wait for style changes to take effect
            await asyncio.sleep(0.3)

            # Strategy 4: Press Escape as fallback for other dialogs
            # Handles drawers, modals, and custom dialogs that respond to keyboard
            await self.page.keyboard.press("Escape")
            # Brief wait for Escape handler to execute
            await asyncio.sleep(0.2)

            # Strategy 5: Close any remaining dialogs with close buttons
            # Final cleanup for dialogs that need explicit close button clicks
            close_buttons = self.page.locator('[aria-label="close"]')
            count = await close_buttons.count()
            for i in range(count):
                try:
                    await close_buttons.nth(i).click(timeout=1000)
                    # Wait for close animation
                    await asyncio.sleep(0.2)
                except Exception:
                    # Ignore if button is already gone or not clickable
                    pass

            # Final wait for all DOM mutations and animations to complete
            # This ensures screenshots are taken with clean UI state
            await asyncio.sleep(0.5)

            # Verify no backdrops remain (debugging aid)
            remaining_backdrops = await self.page.locator(".MuiBackdrop-root").count()
            if remaining_backdrops > 0:
                print(
                    f"[Debug] Warning: {remaining_backdrops} backdrop(s) still present after cleanup"
                )

        except Exception as e:
            # Don't fail if cleanup fails - better to continue with screenshots
            # than to abort the entire run due to cleanup issues
            print(f"[Debug] Dialog cleanup warning: {e}")

    async def activate_donut_mode(self) -> None:
        """Activate donut mode and verify it's active

        Donut mode shows only position-5 (Core Talent) employees
        and allows validation exercises with purple borders.

        This is idempotent - safe to call even if donut mode is already active.
        """
        donut_toggle = self.page.locator('[data-testid="donut-view-button"]')
        if await donut_toggle.count() > 0:
            # Check if already active to avoid unnecessary toggle
            is_pressed = await donut_toggle.get_attribute("aria-pressed")
            if is_pressed != "true":
                await donut_toggle.click()
                # Wait for toggle animation (button state change)
                await asyncio.sleep(0.5)

            # Wait for all API calls to complete (employee filtering)
            # Additional wait for React to re-render grid with filtered employees
            await self.wait_for_ui_settle(0.5)

    def get_fixture_for_screenshot(self, screenshot_name: str) -> str:
        """Determine which test data fixture to use for a screenshot

        Different screenshots require different test data:
        - Statistics/Intelligence/Calibration: Need realistic distribution with anomalies
        - Basic grid views/Quickstart: Need simple employee data

        Args:
            screenshot_name: Name of the screenshot being generated

        Returns:
            Fixture filename (e.g., "calibration-sample.xlsx" or "sample-employees.xlsx")

        Examples:
            >>> get_fixture_for_screenshot("statistics-panel-distribution")
            "calibration-sample.xlsx"
            >>> get_fixture_for_screenshot("quickstart-grid-populated")
            "sample-employees.xlsx"
        """
        # Screenshots requiring realistic calibration data with proper distribution
        calibration_prefixes = ("statistics-", "intelligence-", "calibration-")

        if screenshot_name.startswith(calibration_prefixes):
            return "calibration-sample.xlsx"

        # All other screenshots use basic sample data
        return "sample-employees.xlsx"

    async def upload_sample_data(self, fixture_name: str = "sample-employees.xlsx") -> None:
        """Upload sample employee data

        This method handles the complete file upload workflow:
        1. Navigate to app
        2. Open upload dialog (via empty state button OR file menu)
        3. Select and upload fixture file
        4. Wait for processing to complete
        5. Verify grid populated successfully

        Args:
            fixture_name: Name of fixture file to upload (default: "sample-employees.xlsx")
                         Available fixtures:
                         - "sample-employees.xlsx": Basic employee data (12 employees)
                         - "calibration-sample.xlsx": Realistic calibration data with distribution

        Examples:
            >>> await upload_sample_data()  # Uses default sample-employees.xlsx
            >>> await upload_sample_data("calibration-sample.xlsx")  # Uses calibration data
        """
        print(f"{Colors.BLUE}[Data]{Colors.RESET} Uploading {fixture_name}...")

        # Navigate to homepage
        await self.page.goto("http://localhost:5173")

        # Wait for initial page load and all React components to mount
        await self.page.wait_for_load_state("networkidle")
        # Additional buffer for React hydration and initial state setup
        await asyncio.sleep(1)

        # Click empty state import button or file menu
        # Empty state shows when no file is loaded yet
        empty_state_button = self.page.locator('[data-testid="empty-state-import-button"]')
        file_menu_button = self.page.locator('[data-testid="file-menu-button"]')

        # Try empty state button first (simpler UX path)
        try:
            is_empty = await empty_state_button.is_visible()
            if is_empty:
                await empty_state_button.click()
            else:
                # Use file menu instead (when data already loaded)
                await file_menu_button.click()
                # Wait for menu animation to complete
                await asyncio.sleep(0.3)
                await self.page.locator('[data-testid="import-data-menu-item"]').click()
        except Exception:
            # Fallback to file menu if empty state button not found
            await file_menu_button.click()
            # Wait for menu animation
            await asyncio.sleep(0.3)
            await self.page.locator('[data-testid="import-data-menu-item"]').click()

        # Wait for upload dialog to appear and render fully
        upload_dialog = self.page.locator('[data-testid="file-upload-dialog"]')
        await expect(upload_dialog).to_be_visible(timeout=5000)

        # Upload fixture file using Playwright's file input handler
        fixture_path = PROJECT_ROOT / "frontend" / "playwright" / "fixtures" / fixture_name
        await self.page.locator("#file-upload-input").set_input_files(str(fixture_path))

        # Click submit button to trigger upload
        submit_button = self.page.locator('[data-testid="upload-submit-button"]')
        await submit_button.click()

        # Wait for upload to complete (dialog closes when done)
        await expect(upload_dialog).to_be_hidden(timeout=10000)

        # Wait for all backend API calls to complete
        # This includes: file parsing, employee creation, position calculations
        await self.wait_for_ui_settle(0.5)

        # Wait for grid to be visible with employee cards rendered
        grid = self.page.locator('[data-testid="nine-box-grid"]')
        await expect(grid).to_be_visible(timeout=5000)

        # Verify at least one employee card is present (confirms data loaded)
        employee_cards = self.page.locator('[data-testid^="employee-card-"]')
        await expect(employee_cards.first).to_be_visible(timeout=5000)

        print(f"{Colors.GREEN}[Data]{Colors.RESET} {fixture_name} loaded successfully")

    async def load_calibration_data(self) -> None:
        """Load calibration test data with realistic distribution and anomalies

        This method loads the calibration-sample.xlsx fixture which contains:
        - Proper 9-box distribution patterns
        - Potential anomalies for intelligence detection
        - Varied employee data across positions

        Ideal for screenshots showing:
        - Statistics tab with distribution analysis
        - Intelligence tab with anomaly detection
        - Calibration workflow features

        Examples:
            >>> await load_calibration_data()
            # Loads calibration-sample.xlsx and waits for grid to populate
        """
        await self.upload_sample_data(fixture_name="calibration-sample.xlsx")

    async def reset_to_empty_state(self) -> None:
        """Navigate to fresh empty app state with no loaded data

        This is critical for screenshots showing initial/empty state like
        'No file selected' button or empty grid views.

        The method performs a complete state reset by:
        1. Navigating to app
        2. Clearing all browser storage
        3. Reloading to ensure React rebuilds with clean state
        """
        # Navigate to app
        await self.page.goto("http://localhost:5173")
        # Wait for all initial network requests to complete (health checks, config loads)
        await self.wait_for_ui_settle(0.5)

        # Clear any existing session storage to remove cached employee data
        # This ensures we truly start from empty state
        await self.page.evaluate("localStorage.clear(); sessionStorage.clear();")

        # Reload to ensure fresh state (React will reinitialize without cached data)
        await self.page.reload()
        # Wait for reload to complete and all network requests to finish
        # Empty state uses fade-in animations (typically 200-300ms)
        await self.wait_for_ui_settle(0.5)

    async def capture_screenshot(
        self,
        name: str,
        element_selector: str | None = None,
        wait_time: float = 0.5,
    ) -> Path | None:
        """
        Capture a screenshot with configurable element targeting and wait time

        This is the core screenshot capture method used by all screenshot functions.
        It handles both full-page and element-specific captures.

        Args:
            name: Screenshot filename (without extension)
            element_selector: CSS selector for element to screenshot (None for full page)
            wait_time: Time to wait before capture for animations to complete (default: 0.5s)
                      Material-UI animations are typically 300ms, so 0.5s provides buffer

        Returns:
            Path to saved screenshot or None if capture failed

        Examples:
            >>> await capture_screenshot("grid-view", '[data-testid="nine-box-grid"]')
            >>> await capture_screenshot("full-page", None, wait_time=1.0)
        """
        try:
            # Wait for any animations to complete before capturing
            # This prevents capturing mid-animation frames that look glitchy
            await asyncio.sleep(wait_time)

            # Determine output path with configured format
            output_path = self.output_dir / f"{name}.{self.image_format}"

            # Build screenshot options for Playwright
            screenshot_options: dict[str, Any] = {
                "path": str(output_path),
                "type": self.image_format,
            }

            # Add quality setting for compressed formats (JPEG, WebP)
            if self.image_format in ("jpeg", "webp"):
                screenshot_options["quality"] = self.quality

            # Capture either specific element or full page
            if element_selector:
                # Element screenshot (e.g., grid, panel, dialog)
                element = self.page.locator(element_selector).first
                await element.screenshot(**screenshot_options)
            else:
                # Full page screenshot (includes scrolling if needed)
                await self.page.screenshot(**screenshot_options, full_page=True)

            # Get file size for logging
            file_size = output_path.stat().st_size / 1024  # Convert bytes to KB

            print(
                f"{Colors.GREEN}[Screenshot]{Colors.RESET} {name}.{self.image_format} ({file_size:.1f} KB)"
            )

            return output_path

        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Failed to capture {name}: {e}")
            return None

    async def wait_for_ui_settle(self, duration: float = 0.5) -> None:
        """Wait for network activity to complete and UI animations to settle

        This is a common pattern throughout the codebase that combines waiting
        for all network requests to complete (API calls) with an additional
        buffer for UI animations to finish rendering.

        Args:
            duration: Time in seconds to wait after network idle (default: 0.5)
                     - 0.2-0.3s: Fast animations (button states, simple transitions)
                     - 0.5s: Standard Material-UI animations (~300ms typical)
                     - 1.0s: Complex multi-step operations (drag-drop with API calls)

        Examples:
            >>> await self.wait_for_ui_settle()  # Default 0.5s wait
            >>> await self.wait_for_ui_settle(0.3)  # Fast animations
            >>> await self.wait_for_ui_settle(1.0)  # Complex operations
        """
        await self.page.wait_for_load_state("networkidle")
        await asyncio.sleep(duration)

    async def get_badge_count(self, badge_selector: str) -> int:
        """Get badge count with error handling

        Safely retrieves the numeric count from a badge element, returning 0
        if the badge doesn't exist or has no text content.

        Args:
            badge_selector: CSS selector or data-testid for the badge element

        Returns:
            Badge count as integer, or 0 if badge not found or invalid

        Examples:
            >>> count = await self.get_badge_count('[data-testid="changes-tab-badge"]')
            >>> if count > 0:
            ...     print(f"Found {count} changes")
        """
        try:
            badge = self.page.locator(badge_selector)
            if await badge.count() > 0:
                badge_text = await badge.text_content() or "0"
                # Handle potential non-numeric badges gracefully
                try:
                    return int(badge_text)
                except ValueError:
                    return 0
            return 0
        except Exception:
            return 0

    async def ensure_changes_exist(self, min_changes: int = 1) -> int:
        """Ensure at least minimum number of changes exist, creating if needed

        This method is critical for screenshots that need to show populated
        change data (not empty "No changes yet" state). It checks if changes
        exist and performs employee drags if needed to create realistic data.

        Args:
            min_changes: Minimum number of changes required (default: 1)

        Returns:
            Number of changes created (0 if sufficient changes already existed)

        Examples:
            >>> await self.ensure_changes_exist()  # Ensure at least 1 change
            >>> await self.ensure_changes_exist(3)  # Ensure at least 3 changes
        """
        # Check current change count
        current_count = await self.get_badge_count('[data-testid="changes-tab-badge"]')

        if current_count >= min_changes:
            return 0  # Already have enough changes

        changes_needed = min_changes - current_count
        print(f"{Colors.BLUE}[Info]{Colors.RESET} Creating {changes_needed} employee change(s)...")

        # Create changes by dragging employees
        for i in range(changes_needed):
            source = self.page.locator('[data-testid^="employee-card-"]').nth(i)
            if await source.count() == 0:
                break

            target_box = self.page.locator(
                '[data-testid^="grid-box-"]:not([data-testid$="-count"])'
            ).nth(i + 1)
            if await target_box.count() == 0:
                break

            await source.drag_to(target_box)
            await self.wait_for_ui_settle(0.5)

        return changes_needed

    async def perform_employee_drag(
        self,
        source_box_index: int | None = None,
        target_box_index: int = 1,
        wait_after: float = 0.5,
    ) -> bool:
        """Perform standardized employee drag-and-drop operation

        This encapsulates the common pattern of dragging an employee from one
        grid box to another, with proper waiting for visual feedback to appear.

        Args:
            source_box_index: Index of box to drag from (None = any employee card)
            target_box_index: Index of box to drag to (default: 1)
            wait_after: Time to wait after drag for visual feedback (default: 0.5s)

        Returns:
            True if drag succeeded, False if source/target not found

        Examples:
            >>> await self.perform_employee_drag()  # Drag any employee to box 1
            >>> await self.perform_employee_drag(source_box_index=5, target_box_index=9)
            >>> await self.perform_employee_drag(target_box_index=3, wait_after=1.0)
        """
        try:
            # Get source employee
            if source_box_index is not None:
                source = self.page.locator(
                    f'[data-testid="grid-box-{source_box_index}"] [data-testid^="employee-card-"]'
                ).first
            else:
                source = self.page.locator('[data-testid^="employee-card-"]').first

            if await source.count() == 0:
                return False

            # Get target box (exclude badge count elements)
            target_box = self.page.locator(f'[data-testid="grid-box-{target_box_index}"]')
            if await target_box.count() == 0:
                return False

            # Perform drag operation
            await source.drag_to(target_box)

            # Wait for visual feedback:
            # 1. API call to update position (~200ms)
            # 2. React state update and re-render (~100ms)
            # 3. CSS transitions (orange border, animations) (~300ms)
            await self.wait_for_ui_settle(wait_after)

            return True

        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Drag operation failed: {e}")
            return False

    async def click_tab_and_wait(
        self,
        tab_selector: str,
        wait_duration: float = 0.5,
    ) -> bool:
        """Click a tab and wait for content to load

        Common pattern for switching between tabs (Statistics, Changes, Details, etc.)
        with proper waiting for tab content to render.

        Args:
            tab_selector: CSS selector or data-testid for the tab
            wait_duration: Time to wait after click (default: 0.5s)

        Returns:
            True if tab was clicked successfully, False if not found

        Examples:
            >>> await self.click_tab_and_wait('[data-testid="statistics-tab"]')
            >>> await self.click_tab_and_wait('[data-testid="changes-tab"]', wait_duration=0.3)
        """
        try:
            tab = self.page.locator(tab_selector)
            if await tab.count() > 0:
                await tab.click()
                await asyncio.sleep(wait_duration)
                return True
            return False
        except Exception:
            return False

    async def select_filter_by_text(
        self,
        filter_text: str,
        wait_after: float = 0.3,
    ) -> bool:
        """Select a filter option by its visible text

        Common pattern for selecting filters in the filter drawer.
        Uses .first to handle multiple matches (e.g., "High" might appear
        in both Performance and Potential sections).

        Args:
            filter_text: Visible text of the filter option (e.g., "High", "Medium", "IC")
            wait_after: Time to wait after selection for filter to apply (default: 0.3s)

        Returns:
            True if filter was selected, False if not found

        Examples:
            >>> await self.select_filter_by_text("High")
            >>> await self.select_filter_by_text("Medium", wait_after=0.2)
        """
        try:
            filter_option = self.page.locator(f'text="{filter_text}"').first
            if await filter_option.count() > 0:
                await filter_option.click()
                await asyncio.sleep(wait_after)
                return True
            return False
        except Exception:
            return False

    # ========================================
    # Screenshot Capture Functions
    # ========================================
    #
    # This section contains all screenshot capture methods, organized by feature area.
    # Each method is responsible for:
    # 1. Setting up the UI state (navigating, clicking, selecting)
    # 2. Waiting for animations/network to settle
    # 3. Capturing the screenshot
    # 4. Returning the Path to the saved file (or None if failed)
    #
    # Common patterns:
    # - await self.close_dialogs() - Cleanup before screenshots
    # - await self.page.wait_for_load_state('networkidle') - Wait for API calls
    # - await asyncio.sleep(X) - Wait for animations (see inline comments for durations)
    # - element_selector=None - Full page screenshot
    # - element_selector='[data-testid="..."]' - Element-specific screenshot
    #
    # ========================================

    # ========================================
    # Basic Grid Screenshots
    # ========================================

    async def capture_grid_normal(self) -> Path | None:
        """Capture main grid in normal mode with employees

        Shows the standard 3x3 grid layout with all employees visible.
        Used as a baseline reference screenshot.
        """
        return await self.capture_screenshot(
            "grid-normal",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_employee_tile_normal(self) -> Path | None:
        """Capture normal employee tile (close-up)

        Shows detail of a single employee card including:
        - Employee name
        - Performance/Potential indicators
        - Any status badges
        """
        employee = self.page.locator('[data-testid^="employee-card-"]')
        if await employee.count() > 0:
            return await self.capture_screenshot(
                "employee-tile-normal",
                element_selector='[data-testid^="employee-card-"]',
            )
        return None

    # ========================================
    # Quickstart Screenshots
    # ========================================

    async def capture_quickstart_file_menu_button(self) -> Path | None:
        """Capture File menu button in EMPTY state (before any file upload)

        CRITICAL: Must show 'No file selected' state for quickstart guide.
        """
        # Reset to empty state FIRST (no file loaded)
        await self.reset_to_empty_state()

        # Wait for app bar to be present
        app_bar = self.page.locator('[data-testid="app-bar"]')
        await app_bar.wait_for(state="attached", timeout=10000)

        # Capture the toolbar/app bar area showing "No file selected"
        return await self.capture_screenshot(
            "quickstart/quickstart-file-menu-button",
            element_selector='[data-testid="app-bar"]',
        )

    async def capture_quickstart_upload_dialog(self) -> Path | None:
        """Capture file upload dialog

        Shows the upload dialog UI with:
        - File selection input
        - Upload button
        - Instructions/help text
        """
        # Navigate to homepage
        await self.page.goto("http://localhost:5173")
        # Wait for React app to fully mount and hydrate
        await asyncio.sleep(1)

        # Click empty state import button to open dialog
        empty_state_button = self.page.locator('[data-testid="empty-state-import-button"]')
        if await empty_state_button.is_visible():
            await empty_state_button.click()
        else:
            # Use file menu if no empty state (fallback path)
            await self.page.locator('[data-testid="file-menu-button"]').click()
            # Wait for menu animation (Material-UI Popover: ~300ms)
            await asyncio.sleep(0.3)
            await self.page.locator('[data-testid="import-data-menu-item"]').click()

        # Wait for dialog to appear and render fully
        await self.page.locator('[data-testid="file-upload-dialog"]').wait_for()

        # Capture the dialog element
        return await self.capture_screenshot(
            "quickstart/quickstart-upload-dialog",
            element_selector='[data-testid="file-upload-dialog"]',
        )

    async def capture_quickstart_grid_populated(self) -> Path | None:
        """Capture grid AFTER successful upload (no dialog overlay)

        Shows final populated state, not upload dialog.

        IMPORTANT: This screenshot follows quickstart-file-menu-button which calls
        reset_to_empty_state() and clears all data. We must reload data here.
        """
        # Reload sample data (previous screenshot may have cleared state)
        await self.upload_sample_data()

        # Ensure dialog is closed (if upload just happened)
        await self.close_dialogs()

        # Wait for all API calls to complete (employee data loaded)
        # Grid uses virtualization which may take extra time to stabilize
        await self.wait_for_ui_settle(0.5)

        # Verify grid has employees before capturing
        # This is a safety check to ensure we don't capture empty grid
        employee_cards = self.page.locator('[data-testid^="employee-card-"]')
        await expect(employee_cards.first).to_be_visible(timeout=5000)

        # Capture the populated grid (no dialog overlay)
        return await self.capture_screenshot(
            "quickstart/quickstart-grid-populated",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_quickstart_success_annotated(self) -> Path | None:
        """Capture success state showing grid with employee count

        NOTE: This screenshot requires manual annotation post-processing:
        1. Add callout arrow pointing to 3x3 grid structure
        2. Add callout arrow pointing to employee tiles (blue cards)
        3. Add callout arrow pointing to employee count in right panel

        Tools like Snagit, Skitch, or Photoshop can add these annotations.
        """
        # Capture full page view showing grid and employee count
        # Manual annotations will be added to highlight:
        # - The 3x3 grid structure
        # - Employee tile examples
        # - Employee count display
        return await self.capture_screenshot(
            "quickstart/quickstart-success-annotated",
            element_selector=None,  # Full page for annotation context
        )

    async def capture_quickstart_excel_sample(self) -> Path | None:
        """Placeholder for Excel sample screenshot (manual capture required)

        This screenshot must be created manually:
        1. Open Excel with sample-employees.xlsx
        2. Highlight the 4 required columns: Employee ID, Worker, Performance, Potential
        3. Use Excel's selection highlight or add colored borders
        4. Capture screenshot showing highlighted columns with sample data rows
        5. Save as: quickstart/quickstart-excel-sample.png
        """
        self.mark_manual(
            "quickstart-excel-sample", "requires manual Excel screenshot with column highlighting"
        )
        return Path()  # Sentinel value for manual screenshots

    # ========================================
    # Getting Started / Workflow Screenshots
    # ========================================
    #
    # These screenshots demonstrate the complete user workflow:
    # 1. Grid understanding (axes, positions)
    # 2. Viewing statistics and distribution
    # 3. Drag-and-drop employee repositioning (3-step sequence)
    # 4. Visual feedback (modified indicators, timeline)
    # 5. Tracking changes and adding notes
    # 6. Exporting results
    #
    # Key considerations:
    # - Drag-drop sequence requires actual operations to capture visual states
    # - Timeline requires employee selection + tab navigation
    # - Changes tab must show populated data (not empty state)
    # - Some screenshots need manual annotation post-processing
    #
    # ========================================

    async def capture_workflow_grid_axes_labeled(self) -> Path | None:
        """Capture grid with clear view for axes annotation"""
        # Capture grid for manual axes labeling
        return await self.capture_screenshot(
            "workflow/workflow-grid-axes-labeled",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_workflow_statistics_tab(self) -> Path | None:
        """Capture Statistics tab showing distribution"""
        # Close any open dialogs first
        await self.close_dialogs()

        # Click Statistics tab if not already selected
        if await self.click_tab_and_wait('[data-testid="statistics-tab"]'):
            # Capture the right panel with statistics
            return await self.capture_screenshot(
                "workflow/workflow-statistics-tab",
                element_selector='[data-testid="right-panel"]',
            )
        return None

    async def capture_workflow_drag_drop_sequence_1(self) -> Path | None:
        """Capture drag-drop step 1: Click and hold employee

        Shows the initial state with an employee card highlighted (hover state),
        indicating it's ready to be dragged.
        """
        # Close any open dialogs first to ensure clean screenshot
        await self.close_dialogs()

        # Find an employee tile to highlight
        employee = self.page.locator('[data-testid^="employee-card-"]')
        if await employee.count() > 0:
            # Hover to show it's ready to drag (CSS hover effects activate)
            await employee.first.hover()

            # Capture grid showing hovered employee card
            return await self.capture_screenshot(
                "workflow/workflow-drag-drop-sequence-1",
                element_selector='[data-testid="nine-box-grid"]',
            )
        return None

    async def capture_workflow_drag_drop_sequence_2(self) -> Path | None:
        """Capture drag-drop step 2: Dragging to target (manual capture needed)

        NOTE: Playwright cannot capture mid-drag state (while mouse button is held).
        This screenshot captures the static grid state. Manual annotation required to show:
        - Semi-transparent dragged employee card
        - Cursor position
        - Drop target highlighting
        """
        # This requires actual drag action - capture grid state
        # Manual annotation will be needed to show dragging state
        return await self.capture_screenshot(
            "workflow/workflow-drag-drop-sequence-2",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_workflow_drag_drop_sequence_3(self) -> Path | None:
        """Capture drag-drop step 3: Employee in new position with yellow highlight

        Shows the final state after drop with:
        - Employee in new grid position
        - Yellow/orange highlight border indicating modification
        - Updated grid layout

        This performs an actual drag-and-drop operation to capture the real visual feedback.
        """
        # Perform actual drag to get yellow highlight
        # Drag any employee to box 1 and wait for visual feedback
        if await self.perform_employee_drag(target_box_index=1, wait_after=1.0):
            # Capture grid showing employee in new position with highlight
            return await self.capture_screenshot(
                "workflow/workflow-drag-drop-sequence-3",
                element_selector='[data-testid="nine-box-grid"]',
            )
        return None

    async def capture_workflow_employee_modified(self) -> Path | None:
        """Capture close-up of employee tile with orange/yellow modified indicator

        Shows the visual feedback after an employee has been moved.
        """
        try:
            # Employee should already be modified from previous drag operation
            # Find modified employee card
            modified_card = self.page.locator('[data-testid^="employee-card-"]').first

            # Verify it's visible
            await expect(modified_card).to_be_visible(timeout=5000)

            return await self.capture_screenshot(
                "workflow/workflow-employee-modified",
                element_selector='[data-testid^="employee-card-"]',
            )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Modified employee capture failed: {e}")
        return None

    async def capture_workflow_employee_timeline(self) -> Path | None:
        """Capture employee details panel showing timeline"""
        try:
            # Click on an employee to open details
            employee = self.page.locator('[data-testid^="employee-card-"]')
            if await employee.count() > 0:
                await employee.first.click()
                await asyncio.sleep(0.5)

                # Make sure Details tab is active
                details_tab = self.page.locator('[data-testid="details-tab"]')
                if await details_tab.count() > 0:
                    await details_tab.click()
                    await asyncio.sleep(0.3)

                # Capture the right panel with employee details
                return await self.capture_screenshot(
                    "workflow/workflow-employee-timeline",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Timeline capture failed: {e}")
        return None

    async def capture_workflow_changes_tab(self) -> Path | None:
        """Capture Changes tab with note field"""
        # Close any open dialogs first
        await self.close_dialogs()

        # Click Changes tab and capture
        if await self.click_tab_and_wait('[data-testid="changes-tab"]'):
            return await self.capture_screenshot(
                "workflow/workflow-changes-tab",
                element_selector='[data-testid="right-panel"]',
            )
        return None

    async def capture_workflow_apply_button(self) -> Path | None:
        """Capture Apply/Export button with badge showing change count"""
        try:
            # Wait for app bar to be present with fallback
            try:
                app_bar = self.page.locator('[data-testid="app-bar"]')
                await app_bar.wait_for(state="attached", timeout=10000)
            except Exception:
                # Fallback to MUI AppBar class selector
                print("[Debug] app-bar data-testid not found, using fallback selector")
                app_bar = self.page.locator('header[class*="MuiAppBar"]')
                await app_bar.wait_for(state="attached", timeout=10000)

            # Capture the toolbar area with export button
            return await self.capture_screenshot(
                "workflow/workflow-apply-button",
                element_selector='[data-testid="app-bar"]',
            )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Apply button capture failed: {e}")
        return None

    async def capture_workflow_export_excel_1(self) -> Path | None:
        """Capture export dialog (if exists) or export action"""
        # No export dialog exists - export happens directly from File menu Apply button
        # This screenshot is covered by workflow-apply-button
        self.mark_skipped(
            "workflow-export-excel-1", "no export dialog - covered by apply button screenshot"
        )
        return Path()  # Sentinel value for skipped screenshots

    async def capture_workflow_export_excel_2(self) -> Path | None:
        """Placeholder for exported Excel file screenshot (manual capture needed)"""
        # This requires opening the actual Excel file - manual capture needed
        self.mark_manual("workflow-export-excel-2", "requires manual Excel screenshot")
        return Path()  # Sentinel value for manual screenshots

    # ========================================
    # Index/Home Page Screenshots
    # ========================================

    async def capture_hero_grid_sample(self) -> Path | None:
        """Capture clean hero image of populated grid (no annotations)"""
        # Capture full grid as hero image
        return await self.capture_screenshot(
            "index/hero-grid-sample",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_index_quick_win_preview(self) -> Path | None:
        """Capture grid for quick win preview (base for annotation)"""
        # Capture full page view for success annotation
        return await self.capture_screenshot(
            "index/index-quick-win-preview",
            element_selector=None,  # Full page
        )

    # ========================================
    # Calibration Workflow Screenshots (Task 2.1)
    # ========================================

    async def capture_calibration_file_import(self) -> Path | None:
        """Capture File menu open with Import Data highlighted"""
        # Navigate to a state where we can open file menu
        await self.page.goto("http://localhost:5173")
        await asyncio.sleep(1)

        # Close any dialogs
        await self.close_dialogs()

        # Click File menu button to open dropdown
        file_menu_button = self.page.locator('[data-testid="file-menu-button"]')
        if await file_menu_button.count() > 0:
            await file_menu_button.click()
            await asyncio.sleep(0.3)

            # Wait for menu to appear
            import_item = self.page.locator('[data-testid="import-data-menu-item"]')
            if await import_item.count() > 0:
                # Hover over Import Data item to highlight it
                await import_item.hover()
                await asyncio.sleep(0.2)

                # Capture full page showing menu open
                return await self.capture_screenshot(
                    "workflow/calibration-file-import",
                    element_selector=None,  # Full page to show menu context
                )
        return None

    async def capture_calibration_statistics_red_flags(self) -> Path | None:
        """Capture Statistics tab showing distribution table with problematic patterns"""
        # Close any dialogs
        await self.close_dialogs()

        # Click Statistics tab and capture
        if await self.click_tab_and_wait('[data-testid="statistics-tab"]'):
            return await self.capture_screenshot(
                "workflow/calibration-statistics-red-flags",
                element_selector='[data-testid="right-panel"]',
            )
        return None

    async def capture_calibration_intelligence_anomalies(self) -> Path | None:
        """Capture Intelligence tab showing anomaly detection

        NOTE: This screenshot requires test data with actual anomalies to show:
        - Red/yellow indicators for statistical anomalies
        - Location/function analysis with deviations
        - Manager rating patterns that differ from baseline

        Current sample data may show "No Issues" - consider using calibration-sample.xlsx
        with more varied distribution for realistic anomaly detection.
        """
        # Close any dialogs
        await self.close_dialogs()

        # Click Intelligence tab and wait for content to load
        if await self.click_tab_and_wait('[data-testid="intelligence-tab"]', wait_duration=1.5):
            return await self.capture_screenshot(
                "workflow/calibration-intelligence-anomalies",
                element_selector='[data-testid="right-panel"]',
            )
        return None

    async def capture_calibration_filters_panel(self) -> Path | None:
        """Capture Filters panel with filters ACTUALLY SELECTED

        Shows specific calibration filter selections active (not just empty panel).

        CRITICAL: This screenshot must show active filters to demonstrate the feature.
        Previous versions showed empty filter panel which was not useful for documentation.
        """
        # Ensure data is loaded (filter button is disabled without data)
        employee_cards = self.page.locator('[data-testid^="employee-card-"]')
        if await employee_cards.count() == 0:
            await self.upload_sample_data()

        await self.close_dialogs()

        try:
            # Open filters drawer
            filters_button = self.page.locator('[data-testid="filter-button"]')
            if await filters_button.count() > 0:
                # Wait for filter button to be enabled (requires data to be loaded)
                await expect(filters_button).to_be_enabled(timeout=5000)
                await filters_button.click()
                # Wait for drawer slide-in animation (Material-UI Drawer: ~300ms)
                await asyncio.sleep(0.5)

                # SELECT filters to show active state
                # This was the critical missing piece in earlier versions!

                # Select High performance filter
                await self.select_filter_by_text("High", wait_after=0.2)

                # Select Medium potential filter
                await self.select_filter_by_text("Medium", wait_after=0.2)

                # CRITICAL: Wait for UI to update and show selected filters
                # Checkboxes need time to render checked state
                await asyncio.sleep(0.3)

                # Verify at least one filter is visibly selected before capturing
                # This ensures we're not capturing mid-transition
                filter_drawer = self.page.locator('[data-testid="filter-drawer"]')
                checked_filters = filter_drawer.locator('input[type="checkbox"]:checked')
                if await checked_filters.count() == 0:
                    print(
                        f"{Colors.YELLOW}[Warning]{Colors.RESET} No filters appear checked - selections may not have applied"
                    )

                # Capture the filter drawer with selections visible
                # Should show checked checkboxes and active filter state
                return await self.capture_screenshot(
                    "workflow/calibration-filters-panel",
                    element_selector='[data-testid="filter-drawer"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Filters panel capture failed: {e}")
        return None

    async def capture_calibration_donut_mode_toggle(self) -> Path | None:
        """Capture View Mode Toggle with Donut mode activated

        Shows the donut mode toggle button in active state (pressed).
        The toggle should be visually distinct from inactive state.
        """
        # Close any dialogs to ensure clean screenshot
        await self.close_dialogs()

        try:
            # Find and click the donut view button to activate it
            donut_toggle = self.page.locator('[data-testid="donut-view-button"]')
            if await donut_toggle.count() > 0:
                await donut_toggle.click()
                # Wait for toggle animation and grid filtering to complete
                # Includes button state change + grid re-render
                await asyncio.sleep(0.5)

                # Capture the grid area showing active donut mode toggle
                return await self.capture_screenshot(
                    "workflow/calibration-donut-mode-toggle",
                    element_selector='[data-testid="nine-box-grid"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Donut toggle capture failed: {e}")
        return None

    async def capture_calibration_donut_mode_grid(self) -> Path | None:
        """Capture grid in Donut Mode showing ghostly purple-bordered employees

        Donut mode should show position-5 employees that have been moved,
        with ghostly appearance (70% opacity) and purple borders.

        This demonstrates the validation workflow where employees moved from
        position-5 (Core Talent) are shown with special visual treatment.
        """
        # Ensure data is loaded (donut mode requires employees)
        employee_cards = self.page.locator('[data-testid^="employee-card-"]')
        if await employee_cards.count() == 0:
            await self.upload_sample_data()

        await self.close_dialogs()

        try:
            # CRITICAL: Activate donut mode first
            # This filters the grid to show only position-5 related employees
            await self.activate_donut_mode()

            # Optional: Perform a donut drag to show ghostly effect
            # (Without this, grid just shows position-5 employees normally)
            # Dragging creates the "ghostly" visual state with purple borders
            pos5_employees = self.page.locator(
                '[data-testid="grid-box-5"] [data-testid^="employee-card-"]'
            )

            if await pos5_employees.count() > 0:
                # Drag one position-5 employee to another box to trigger donut placement
                first_pos5 = pos5_employees.first
                target_box = self.page.locator('[data-testid="grid-box-9"]')  # Star position

                # Perform the drag operation
                await first_pos5.drag_to(target_box)

                # Wait for drag operation to complete and visual effects to apply:
                # - API call to record donut change
                # - Ghostly opacity transition (~300ms)
                # - Purple border animation (~200ms)
                await self.wait_for_ui_settle(0.5)

            # Capture grid showing donut mode state
            # Should show ghostly employees with purple borders in their new positions
            return await self.capture_screenshot(
                "workflow/calibration-donut-mode-grid",
                element_selector='[data-testid="nine-box-grid"]',
            )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Donut grid capture failed: {e}")
        return None

    async def capture_calibration_export_results(self) -> Path | None:
        """Placeholder for Excel export screenshot (manual capture required)"""
        # This requires exporting and opening Excel - manual capture needed
        self.mark_manual("calibration-export-results", "requires manual Excel screenshot")
        return Path()  # Sentinel value for manual screenshots

    # ========================================
    # Making Changes Screenshots (Task 2.2)
    # ========================================

    async def capture_changes_drag_sequence(self) -> Path | None:
        """Capture base grid for 3-panel drag sequence (requires manual composition)

        This generates a base screenshot showing the grid. Manual post-processing required:
        1. Panel 1: Add arrow/highlight showing click on employee tile
        2. Panel 2: Show dragging state (semi-transparent tile being dragged)
        3. Panel 3: Show dropped state in new position

        Tools like Photoshop, Figma, or Snagit can create the 3-panel composite.
        The base grid provides a clean starting point for annotation.
        """
        self.mark_manual("changes-drag-sequence", "requires manual 3-panel composition")

        # Capture base grid as starting point for manual composition
        await self.close_dialogs()
        return await self.capture_screenshot(
            "workflow/making-changes-drag-sequence-base",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_changes_orange_border(self) -> Path | None:
        """Capture employee tile with VISIBLE orange modified border and badge

        CRITICAL: Must show the orange left border that indicates modification.

        This screenshot demonstrates the visual feedback system that shows users
        which employees have been modified. The orange border is a key UX element.

        The method performs an actual drag operation to trigger the modification
        state, then waits for all visual indicators to appear before capturing.
        """
        # Ensure data is loaded (may have been cleared by previous screenshots)
        employee_cards = self.page.locator('[data-testid^="employee-card-"]')
        if await employee_cards.count() == 0:
            await self.upload_sample_data()

        await self.close_dialogs()

        # Perform drag to trigger modification state with orange border
        if await self.perform_employee_drag(target_box_index=1, wait_after=0.5):
            # Capture close-up of the first employee card
            # Should show orange left border and modified badge
            return await self.capture_screenshot(
                "workflow/making-changes-orange-border",
                element_selector='[data-testid^="employee-card-"]',
            )
        return None

    async def capture_changes_employee_details(self) -> Path | None:
        """Capture employee details panel showing updated ratings"""
        try:
            # Click on an employee to open details
            employee = self.page.locator('[data-testid^="employee-card-"]')
            if await employee.count() > 0:
                await employee.first.click()
                await asyncio.sleep(0.5)

                # Make sure Details tab is active
                details_tab = self.page.locator('[data-testid="details-tab"]')
                if await details_tab.count() > 0:
                    await details_tab.click()
                    await asyncio.sleep(0.3)

                # Capture the right panel with details
                return await self.capture_screenshot(
                    "workflow/making-changes-employee-details",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Employee details capture failed: {e}")
        return None

    async def capture_changes_timeline_view(self) -> Path | None:
        """Capture Performance History timeline in employee details"""
        try:
            # Employee should already be selected from previous capture
            # Scroll to timeline section if needed
            timeline = self.page.locator('[data-testid="performance-timeline"]')

            # If timeline not found, try alternate selector
            if await timeline.count() == 0:
                timeline = self.page.locator('text="Performance History"')

            if await timeline.count() > 0:
                # Scroll into view
                await timeline.first.scroll_into_view_if_needed()
                await asyncio.sleep(0.3)

                # Capture the timeline section
                return await self.capture_screenshot(
                    "workflow/making-changes-timeline",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Timeline capture failed: {e}")
        return None

    async def capture_changes_tab(self) -> Path | None:
        """Capture Changes tab with ACTUAL employee movements (not empty state)

        CRITICAL: Must show populated table with employee movements, not "No changes yet".

        This screenshot demonstrates the tracking feature, so it requires actual
        change data to be meaningful. The method intelligently creates changes
        if none exist from prior operations.
        """
        # Ensure data is loaded (needed to create changes)
        employee_cards = self.page.locator('[data-testid^="employee-card-"]')
        if await employee_cards.count() == 0:
            await self.upload_sample_data()

        await self.close_dialogs()

        try:
            # CRITICAL: Ensure we have changes to display
            # Early versions captured empty state which was useless for documentation
            await self.ensure_changes_exist(min_changes=3)

            # Now click Changes tab to show populated table
            if await self.click_tab_and_wait('[data-testid="changes-tab"]', wait_duration=0.8):
                # CRITICAL: Verify changes are actually visible in the table
                # Ensure we're not capturing mid-render or empty state
                changes_badge = self.page.locator('[data-testid="changes-tab-badge"]')
                try:
                    await expect(changes_badge).to_be_visible(timeout=3000)

                    # Verify badge shows correct count
                    badge_text = await changes_badge.inner_text()
                    badge_count = int(badge_text) if badge_text.isdigit() else 0

                    if badge_count < 3:
                        print(
                            f"{Colors.YELLOW}[Warning]{Colors.RESET} Expected 3+ changes, badge shows {badge_count}"
                        )
                except Exception:
                    print(
                        f"{Colors.YELLOW}[Warning]{Colors.RESET} Could not verify changes badge visibility"
                    )

                # Verify table has rows before capturing (not empty "No changes yet" state)
                right_panel = self.page.locator('[data-testid="right-panel"]')
                table_rows = right_panel.locator("table tbody tr")
                try:
                    await expect(table_rows.first).to_be_visible(timeout=2000)
                except Exception:
                    row_count = await table_rows.count()
                    print(
                        f"{Colors.YELLOW}[Warning]{Colors.RESET} Changes table may be empty (found {row_count} rows)"
                    )

                # Capture the right panel with changes
                # Should show table with rows of employee movements
                return await self.capture_screenshot(
                    "workflow/making-changes-changes-tab",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Changes tab capture failed: {e}")
        return None

    # ========================================
    # Adding Notes Screenshots (Task 2.3)
    # ========================================

    async def capture_notes_changes_tab_field(self) -> Path | None:
        """Capture Changes tab with note field highlighted

        CRITICAL FIX: Must ensure changes exist before capturing Changes tab,
        otherwise we capture empty "No changes yet" state which doesn't demonstrate
        the notes feature at all.
        """
        # Close any dialogs
        await self.close_dialogs()

        # Ensure at least 1 change exists so we can show the Notes field
        # Without this, we capture empty state which is useless for documentation
        await self.ensure_changes_exist(min_changes=1)

        # Click Changes tab and capture
        if await self.click_tab_and_wait('[data-testid="changes-tab"]'):
            return await self.capture_screenshot(
                "workflow/workflow-changes-add-note",
                element_selector='[data-testid="right-panel"]',
            )
        return None

    async def capture_notes_good_example(self) -> Path | None:
        """Capture Changes tab with well-written note example

        CRITICAL FIX: Must ensure changes exist before trying to add notes.
        Note fields only appear when changes exist, so without this we capture
        empty state.
        """
        # Close any dialogs
        await self.close_dialogs()

        # Ensure at least 1 change exists so note field will be available
        await self.ensure_changes_exist(min_changes=1)

        try:
            # Navigate to Changes tab
            changes_tab = self.page.locator('[data-testid="changes-tab"]')
            if await changes_tab.count() > 0:
                await changes_tab.click()
                await asyncio.sleep(0.5)

                # Try to find and fill a note field
                note_field = self.page.locator('[data-testid^="change-notes-"]')
                if await note_field.count() > 0:
                    example_note = (
                        "Moved to High Potential based on Q4 2024 leadership demonstrated in "
                        "cross-functional API project. Successfully managed team of 5 engineers "
                        "and delivered ahead of schedule. Action: Enroll in leadership development "
                        "program Q1 2025."
                    )
                    await note_field.first.fill(example_note)
                    await asyncio.sleep(0.5)

                # Capture the panel with note
                return await self.capture_screenshot(
                    "workflow/workflow-note-good-example",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Good note example capture failed: {e}")
        return None

    async def capture_notes_export_excel(self) -> Path | None:
        """Placeholder for Excel export with notes column (manual capture required)"""
        # This requires exporting and opening Excel - manual capture needed
        self.mark_manual("export-excel-notes-column", "requires manual Excel screenshot")
        # Return empty Path to indicate success (manual screenshot)
        return Path()  # Sentinel value for manual screenshots

    async def capture_notes_donut_mode(self) -> Path | None:
        """Capture Donut Changes tab with notes (optional)

        CRITICAL FIX: Must create donut placements (employee moves in donut mode)
        before capturing Donut Changes tab. Without this, the tab exists but shows
        empty state.

        Donut changes are separate from regular changes - they track where employees
        would be placed if donut mode is validated.
        """
        # Close any dialogs
        await self.close_dialogs()

        # Ensure data is loaded (needed for donut mode operations)
        employee_cards = self.page.locator('[data-testid^="employee-card-"]')
        if await employee_cards.count() == 0:
            await self.upload_sample_data()

        try:
            # Activate donut mode first
            donut_toggle = self.page.locator('[data-testid="donut-mode-toggle"]')
            if await donut_toggle.count() > 0:
                toggle_state = await donut_toggle.get_attribute("aria-pressed")
                if toggle_state != "true":
                    await donut_toggle.click()
                    await asyncio.sleep(0.5)

            # CRITICAL: Create donut placements by dragging employees in donut mode
            # This creates entries in the "Donut Changes" tab
            # Drag 1-2 employees to create donut placement data
            await self.ensure_changes_exist(min_changes=2)

            # Click Changes tab
            changes_tab = self.page.locator('[data-testid="changes-tab"]')
            if await changes_tab.count() > 0:
                await changes_tab.click()
                await asyncio.sleep(0.5)

                # Look for Donut Changes sub-tab
                donut_changes_tab = self.page.locator('text="Donut Changes"')
                if await donut_changes_tab.count() > 0:
                    await donut_changes_tab.click()
                    await asyncio.sleep(0.3)

                # Capture the panel
                return await self.capture_screenshot(
                    "workflow/workflow-donut-notes-example",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Donut notes capture failed: {e}")
        return None

    # ========================================
    # Task 3.3: Feature Page Screenshots (15 new methods)
    # ========================================

    # Filters.md screenshots (4)
    async def capture_filters_active_chips(self) -> Path | None:
        """Capture grid view with ACTIVE filter chips and indicators visible

        CRITICAL: Filters must actually be selected to show orange dot and chips.

        This was a major fix - earlier versions captured empty filter state
        which didn't demonstrate the feature at all. Now we actively select
        filters before capturing to show the real UI state.

        Screenshot should show:
        - Orange dot indicator on Filters button (shows filters are active)
        - Active filter chips displayed above grid
        - Updated employee count showing filtered vs total ("5 of 12")
        - Grid showing only filtered employees
        """
        await self.close_dialogs()

        try:
            # Open filters drawer
            filters_button = self.page.locator('[data-testid="filter-button"]')
            if await filters_button.count() > 0:
                await filters_button.click()
                # Wait for drawer slide-in animation
                await asyncio.sleep(0.5)

                # ACTUALLY SELECT FILTERS (this was the critical missing piece!)
                # Previous versions showed empty filter panel which was useless

                # Select "High" performance filter
                await self.select_filter_by_text("High")

                # Select "IC" job level filter if available
                await self.select_filter_by_text("IC")

                # Close drawer to show filter chips and active state
                await self.page.keyboard.press("Escape")

                # Wait for drawer close animation, grid re-render, and filter chips to animate in
                await self.wait_for_ui_settle(0.5)

                # CRITICAL: Verify filter chips are actually visible before capturing
                # Without this check, we may capture before chips render
                filter_chips = self.page.locator('[data-testid^="filter-chip-"]')
                try:
                    # Wait up to 3 seconds for at least one filter chip to appear
                    await expect(filter_chips.first).to_be_visible(timeout=3000)
                except Exception:
                    # Chips didn't appear - log warning but continue
                    chip_count = await filter_chips.count()
                    print(
                        f"{Colors.YELLOW}[Warning]{Colors.RESET} Filter chips not visible (found {chip_count}) - filters may not have applied"
                    )

                # Capture full page showing all filter indicators:
                # - Orange dot on Filters button (top toolbar)
                # - Active filter chips (above grid)
                # - Employee count "X of Y" (showing filtered count)
                # - Filtered grid (only matching employees)
                return await self.capture_screenshot(
                    "filters/filters-active-chips",
                    element_selector=None,  # Full page to show all indicators
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Active filters capture failed: {e}")
        return None

    async def capture_filters_panel_expanded(self) -> Path | None:
        """Capture filter panel expanded showing all filter options"""
        await self.close_dialogs()

        try:
            # Open filters drawer
            filters_button = self.page.locator('[data-testid="filter-button"]')
            if await filters_button.count() > 0:
                await filters_button.click()
                await asyncio.sleep(0.5)

                # Capture the filter drawer
                return await self.capture_screenshot(
                    "filters/filters-panel-expanded",
                    element_selector='[data-testid="filter-drawer"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Filters panel capture failed: {e}")
        return None

    async def capture_filters_before_after(self) -> Path | None:
        """Capture before/after filtering comparison (requires manual 2-panel composition)"""
        # This requires manual composition - capture base state
        self.mark_manual("filters-before-after", "requires manual 2-panel composition")

        # Capture grid without filters (before state)
        await self.close_dialogs()
        return await self.capture_screenshot(
            "filters/filters-before-state",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_filters_clear_all_button(self) -> Path | None:
        """Capture filter drawer with Clear All button highlighted"""
        await self.close_dialogs()

        try:
            # Open filters drawer
            filters_button = self.page.locator('[data-testid="filter-button"]')
            if await filters_button.count() > 0:
                await filters_button.click()
                await asyncio.sleep(0.5)

                # Apply some filters first
                await self.select_filter_by_text("High")

                # Capture drawer showing Clear All button
                return await self.capture_screenshot(
                    "filters/filters-clear-all-button",
                    element_selector='[data-testid="filter-drawer"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Clear all button capture failed: {e}")
        return None

    # Statistics.md screenshots (3)
    async def capture_statistics_panel_distribution(self) -> Path | None:
        """Capture Statistics panel showing distribution table and chart"""
        await self.close_dialogs()

        # Click Statistics tab and wait for content to load
        if await self.click_tab_and_wait('[data-testid="statistics-tab"]', wait_duration=1.0):
            return await self.capture_screenshot(
                "statistics/statistics-panel-distribution",
                element_selector='[data-testid="tab-panel-2"]',
            )
        return None

    async def capture_statistics_ideal_actual_comparison(self) -> Path | None:
        """Capture ideal vs actual comparison chart in Statistics"""
        await self.close_dialogs()

        # Click Statistics tab and capture
        if await self.click_tab_and_wait('[data-testid="statistics-tab"]'):
            return await self.capture_screenshot(
                "statistics/statistics-ideal-actual-comparison",
                element_selector='[data-testid="right-panel"]',
            )
        return None

    async def capture_statistics_trend_indicators(self) -> Path | None:
        """Capture statistics with trend indicators and arrows (may need manual annotation)"""
        await self.close_dialogs()

        # Click Statistics tab and capture
        if await self.click_tab_and_wait('[data-testid="statistics-tab"]'):
            return await self.capture_screenshot(
                "statistics/statistics-trend-indicators",
                element_selector='[data-testid="right-panel"]',
            )
        return None

    # Donut-mode.md screenshots (2)
    async def capture_donut_mode_active_layout(self) -> Path | None:
        """Capture grid in Donut Mode showing active state

        Shows only position-5 employees with donut mode toggle active.
        """
        await self.close_dialogs()

        try:
            # Activate donut mode
            await self.activate_donut_mode()

            # Verify donut toggle is active (visual indicator)
            donut_toggle = self.page.locator('[data-testid="donut-view-button"]')
            await expect(donut_toggle).to_have_attribute("aria-pressed", "true", timeout=5000)

            # Wait for grid to show only position-5 employees
            await asyncio.sleep(0.5)

            # Capture grid in donut mode
            return await self.capture_screenshot(
                "donut-mode/donut-mode-active-layout",
                element_selector='[data-testid="nine-box-grid"]',
            )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Donut mode active capture failed: {e}")
        return None

    async def capture_donut_mode_toggle_comparison(self) -> Path | None:
        """Capture toggle between grid and donut views (requires manual 2-panel composition)"""
        # This requires manual composition - capture both states
        self.mark_manual("donut-mode-toggle-comparison", "requires manual 2-panel composition")

        await self.close_dialogs()

        # First deactivate donut mode for normal grid (click grid view button)
        try:
            grid_toggle = self.page.locator('[data-testid="grid-view-button"]')
            if await grid_toggle.count() > 0:
                toggle_state = await grid_toggle.get_attribute("aria-pressed")
                if toggle_state != "true":
                    await grid_toggle.click()
                    await asyncio.sleep(0.5)
        except Exception:
            pass

        # Capture normal grid state
        return await self.capture_screenshot(
            "donut-mode/donut-mode-grid-normal",
            element_selector='[data-testid="nine-box-grid"]',
        )

    # Tracking-changes.md screenshots (2)
    async def capture_changes_panel_entries(self) -> Path | None:
        """Capture Changes panel with multiple employee entries"""
        await self.close_dialogs()

        try:
            # Make sure we have changes (should exist from upload)
            # Click Changes tab
            changes_tab = self.page.locator('[data-testid="changes-tab"]')
            if await changes_tab.count() > 0:
                await changes_tab.click()
                await asyncio.sleep(0.5)

                # Capture the changes panel
                return await self.capture_screenshot(
                    "tracking-changes/changes-panel-entries",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Changes panel capture failed: {e}")
        return None

    async def capture_timeline_employee_history(self) -> Path | None:
        """Capture timeline view showing employee performance history"""
        await self.close_dialogs()

        try:
            # Click on an employee to open details
            employee = self.page.locator('[data-testid^="employee-card-"]')
            if await employee.count() > 0:
                await employee.first.click()
                await asyncio.sleep(0.5)

                # Make sure Details tab is active
                details_tab = self.page.locator('[data-testid="details-tab"]')
                if await details_tab.count() > 0:
                    await details_tab.click()
                    await asyncio.sleep(0.3)

                # Scroll to timeline if needed
                timeline = self.page.locator('[data-testid="performance-timeline"]')
                if await timeline.count() == 0:
                    timeline = self.page.locator('text="Performance History"')

                if await timeline.count() > 0:
                    await timeline.first.scroll_into_view_if_needed()
                    await asyncio.sleep(0.3)

                # Capture the details panel showing timeline
                return await self.capture_screenshot(
                    "tracking-changes/timeline-employee-history",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Timeline history capture failed: {e}")
        return None

    # Working-with-employees.md screenshots (2)
    async def capture_employee_details_panel_expanded(self) -> Path | None:
        """Capture employee details panel fully expanded"""
        await self.close_dialogs()

        try:
            # Click on an employee
            employee = self.page.locator('[data-testid^="employee-card-"]')
            if await employee.count() > 0:
                await employee.first.click()
                await asyncio.sleep(0.5)

                # Make sure Details tab is active
                details_tab = self.page.locator('[data-testid="details-tab"]')
                if await details_tab.count() > 0:
                    await details_tab.click()
                    await asyncio.sleep(0.3)

                # Capture the full right panel
                return await self.capture_screenshot(
                    "working-with-employees/employee-details-panel-expanded",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Employee details capture failed: {e}")
        return None

    # Exporting.md screenshots (2)
    async def capture_file_menu_apply_changes(self) -> Path | None:
        """Capture File menu DROPDOWN with Apply Changes option visible

        CRITICAL: Must show the dropdown menu open, not just the app bar header.
        The dropdown should show "Apply X Changes to Excel" option highlighted.

        This screenshot demonstrates the export workflow, showing how users
        can apply their changes back to the Excel file.

        Prerequisites:
        - At least one employee change must exist (to enable Apply button)
        - File menu must be opened to show dropdown
        """
        await self.close_dialogs()

        try:
            # First make at least one change to enable Apply button
            # The Apply button is disabled when no changes exist
            await self.ensure_changes_exist(min_changes=1)

            # CRITICAL: Click file menu button to OPEN dropdown
            # Early versions captured just the app bar, not the menu itself
            file_menu_btn = self.page.locator('[data-testid="file-menu-button"]')
            if await file_menu_btn.count() > 0:
                await file_menu_btn.click()
                # Wait for menu animation (Material-UI Popover: ~300ms)
                await asyncio.sleep(0.3)

                # Wait for menu to appear and render fully
                menu = self.page.locator('[data-testid="file-menu"]')
                await expect(menu).to_be_visible(timeout=5000)

                # Look for Apply Changes menu item
                apply_item = self.page.locator('[data-testid="apply-changes-menu-item"]')
                if await apply_item.count() > 0:
                    # CRITICAL: Verify menu item shows count > 0 (not "Apply 0 Changes")
                    # This ensures changes are actually reflected in the UI
                    item_text = await apply_item.inner_text()
                    if "0 Changes" in item_text or "Apply 0" in item_text:
                        print(
                            f"{Colors.YELLOW}[Warning]{Colors.RESET} Apply button shows 0 changes - may need more time for UI to update"
                        )
                        # Wait a bit longer for UI to update
                        await asyncio.sleep(0.5)
                        item_text = await apply_item.inner_text()

                    # Hover to highlight it (shows user where to click)
                    await apply_item.hover()
                    # Wait for hover effect to apply
                    await asyncio.sleep(0.2)

                # Capture FULL PAGE showing menu dropdown open
                # Full page needed to show context (menu position relative to button)
                return await self.capture_screenshot(
                    "exporting/file-menu-apply-changes",
                    element_selector=None,  # Full page to show menu context
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} File menu capture failed: {e}")
        return None

    async def capture_excel_file_new_columns(self) -> Path | None:
        """Placeholder for Excel file screenshot (manual capture required)"""
        # This requires exporting and opening Excel - manual capture needed
        self.mark_manual("excel-file-new-columns", "requires manual Excel screenshot")
        return Path()  # Sentinel value for manual screenshots


async def main() -> int:
    """Main entry point for screenshot generation

    This function orchestrates the entire screenshot generation workflow:
    1. Parse command-line arguments
    2. Start backend and frontend servers
    3. Initialize Playwright browser
    4. Load sample data
    5. Generate requested screenshots in sequence
    6. Clean up resources
    7. Report results

    Returns:
        0 if all requested screenshots succeeded, 1 if any failed
    """
    parser = argparse.ArgumentParser(description="Generate documentation screenshots")
    parser.add_argument(
        "--screenshots",
        help="Comma-separated list of screenshot names to generate (default: all)",
        default="all",
    )
    parser.add_argument(
        "--format",
        choices=["png", "webp", "jpeg"],
        default="png",
        help="Image format (default: png)",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=90,
        help="Compression quality 1-100 (default: 90)",
    )
    parser.add_argument(
        "--viewport",
        default="1400x900",
        help="Viewport size as WIDTHxHEIGHT (default: 1400x900)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=PROJECT_ROOT / "resources" / "user-guide" / "docs" / "images" / "screenshots",
        help="Output directory (default: resources/user-guide/docs/images/screenshots/)",
    )

    args = parser.parse_args()

    # Parse viewport size
    try:
        viewport_width, viewport_height = map(int, args.viewport.split("x"))
    except ValueError:
        print(
            f"{Colors.RED}Error:{Colors.RESET} Invalid viewport size. Use format WIDTHxHEIGHT (e.g., 1400x900)"
        )
        return 1

    # Define all available screenshots with their corresponding method names
    # This registry maps screenshot names (used in --screenshots arg) to method names
    # Format: "screenshot-name": "method_name"
    all_screenshots = {
        # Original screenshots
        "grid-normal": "capture_grid_normal",
        "employee-tile-normal": "capture_employee_tile_normal",
        # Quickstart screenshots (6)
        "quickstart-file-menu-button": "capture_quickstart_file_menu_button",
        "quickstart-upload-dialog": "capture_quickstart_upload_dialog",
        "quickstart-grid-populated": "capture_quickstart_grid_populated",
        "quickstart-success-annotated": "capture_quickstart_success_annotated",
        "quickstart-excel-sample": "capture_quickstart_excel_sample",
        # Getting Started / Workflow screenshots (2 remaining after deduplication)
        "workflow-export-excel-1": "capture_workflow_export_excel_1",
        "workflow-export-excel-2": "capture_workflow_export_excel_2",
        # Index/Home page screenshots (2)
        "hero-grid-sample": "capture_hero_grid_sample",
        "index-quick-win-preview": "capture_index_quick_win_preview",
        # Calibration Workflow screenshots (7) - Task 2.1
        "calibration-file-import": "capture_calibration_file_import",
        "calibration-statistics-red-flags": "capture_calibration_statistics_red_flags",
        "calibration-intelligence-anomalies": "capture_calibration_intelligence_anomalies",
        "calibration-filters-panel": "capture_calibration_filters_panel",
        "calibration-donut-mode-toggle": "capture_calibration_donut_mode_toggle",
        "calibration-donut-mode-grid": "capture_calibration_donut_mode_grid",
        "calibration-export-results": "capture_calibration_export_results",
        # Making Changes screenshots (5) - Task 2.2
        "changes-drag-sequence": "capture_changes_drag_sequence",
        "changes-orange-border": "capture_changes_orange_border",
        "changes-employee-details": "capture_changes_employee_details",
        "changes-timeline-view": "capture_changes_timeline_view",
        "changes-tab": "capture_changes_tab",
        # Adding Notes screenshots (4) - Task 2.3
        # NOTE: notes-good-example generates workflow-note-good-example.png (requires manual annotation)
        # NOTE: notes-donut-mode generates workflow-donut-notes-example.png (requires manual annotation)
        "notes-changes-tab-field": "capture_notes_changes_tab_field",
        "notes-good-example": "capture_notes_good_example",
        "notes-export-excel": "capture_notes_export_excel",
        "notes-donut-mode": "capture_notes_donut_mode",
        # Feature Page Screenshots (15) - Task 3.3
        # Filters.md (4)
        "filters-active-chips": "capture_filters_active_chips",
        "filters-panel-expanded": "capture_filters_panel_expanded",
        "filters-before-after": "capture_filters_before_after",
        "filters-clear-all-button": "capture_filters_clear_all_button",
        # Statistics.md (3)
        "statistics-panel-distribution": "capture_statistics_panel_distribution",
        "statistics-ideal-actual-comparison": "capture_statistics_ideal_actual_comparison",
        "statistics-trend-indicators": "capture_statistics_trend_indicators",
        # Donut-mode.md (2)
        "donut-mode-active-layout": "capture_donut_mode_active_layout",
        "donut-mode-toggle-comparison": "capture_donut_mode_toggle_comparison",
        # Tracking-changes.md (2)
        "changes-panel-entries": "capture_changes_panel_entries",
        "timeline-employee-history": "capture_timeline_employee_history",
        # Working-with-employees.md (1)
        "employee-details-panel-expanded": "capture_employee_details_panel_expanded",
        # Exporting.md (2)
        "file-menu-apply-changes": "capture_file_menu_apply_changes",
        "excel-file-new-columns": "capture_excel_file_new_columns",
    }

    # Determine which screenshots to generate
    if args.screenshots == "all":
        screenshots_to_generate = list(all_screenshots.keys())
    else:
        screenshots_to_generate = [s.strip() for s in args.screenshots.split(",")]
        # Validate screenshot names
        invalid = [s for s in screenshots_to_generate if s not in all_screenshots]
        if invalid:
            print(
                f"{Colors.RED}Error:{Colors.RESET} Invalid screenshot names: {', '.join(invalid)}"
            )
            print(f"Available screenshots: {', '.join(all_screenshots.keys())}")
            return 1

    # Print header
    print(f"\n{Colors.BOLD}{'=' * 60}{Colors.RESET}")
    print(f"{Colors.BOLD}9Boxer Documentation Screenshot Generator{Colors.RESET}")
    print(f"{Colors.BOLD}{'=' * 60}{Colors.RESET}\n")

    print(f"Output directory: {args.output_dir}")
    print(f"Format: {args.format}")
    print(f"Viewport: {viewport_width}x{viewport_height}")
    print(f"Screenshots to generate: {len(screenshots_to_generate)}\n")

    server_manager = ServerManager()
    generator = ScreenshotGenerator(
        output_dir=args.output_dir,
        viewport_width=viewport_width,
        viewport_height=viewport_height,
        image_format=args.format,
        quality=args.quality,
    )

    try:
        # Start servers
        await server_manager.start_backend()
        await server_manager.start_frontend()

        # Setup browser (launches Chromium in headless mode)
        await generator.setup_browser()

        # Upload sample data (default fixture for most screenshots)
        # Individual screenshot methods may load different fixtures as needed
        await generator.upload_sample_data()

        # Generate screenshots
        print(f"\n{Colors.BOLD}Generating screenshots...{Colors.RESET}\n")

        successful = 0
        failed = 0

        # Iterate through requested screenshots and generate each one
        for i, screenshot_name in enumerate(screenshots_to_generate, 1):
            method_name = all_screenshots[screenshot_name]
            print(f"[{i}/{len(screenshots_to_generate)}] {screenshot_name}...")
            try:
                # Get the screenshot method by name and invoke it
                method = getattr(generator, method_name)
                result = await method()

                # Check if this was marked as manual or skipped first
                # Manual screenshots require external tools (Excel, image editor, etc.)
                # Skipped screenshots are duplicates or no longer needed
                is_manual = any(
                    item["name"] == screenshot_name for item in generator.manual_screenshots
                )
                is_skipped = any(
                    item["name"] == screenshot_name for item in generator.skipped_screenshots
                )

                # Don't count manual/skipped in successful or failed
                if is_manual or is_skipped:
                    pass  # Already logged by mark_manual/mark_skipped
                elif result:
                    successful += 1
                else:
                    # None result means screenshot couldn't be captured (missing UI element, etc.)
                    print(f"{Colors.RED}[Failed]{Colors.RESET} {screenshot_name} returned None")
                    failed += 1
            except Exception as e:
                # Uncaught exception during screenshot generation
                print(f"{Colors.RED}[Error]{Colors.RESET} {screenshot_name}: {e}")
                failed += 1

        # Print summary
        print(f"\n{Colors.BOLD}{'=' * 60}{Colors.RESET}")
        print(f"{Colors.BOLD}Summary{Colors.RESET}")
        print(f"{Colors.BOLD}{'=' * 60}{Colors.RESET}\n")
        print(f"{Colors.GREEN}Successful:{Colors.RESET} {successful}")
        print(f"{Colors.RED}Failed:{Colors.RESET} {failed}")
        print(f"{Colors.YELLOW}Manual:{Colors.RESET} {len(generator.manual_screenshots)}")
        if len(generator.skipped_screenshots) > 0:
            print(f"{Colors.YELLOW}Skipped:{Colors.RESET} {len(generator.skipped_screenshots)}")
        print(
            f"Total: {successful + failed + len(generator.manual_screenshots) + len(generator.skipped_screenshots)}"
        )

        # List manual screenshots if any
        if generator.manual_screenshots:
            print(f"\n{Colors.YELLOW}Manual screenshots required:{Colors.RESET}")
            for item in generator.manual_screenshots:
                print(f"  - {item['name']}: {item['reason']}")

        print()  # Extra newline

        return 0 if failed == 0 else 1

    except Exception as e:
        print(f"\n{Colors.RED}Fatal error:{Colors.RESET} {e}")
        traceback.print_exc()
        return 1

    finally:
        # Cleanup
        await generator.close_browser()
        await server_manager.stop_servers()


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Interrupted by user{Colors.RESET}")
        sys.exit(130)
