#!/usr/bin/env python3
"""
Documentation Screenshot Generator for 9Boxer Application

This script uses Playwright to automatically generate screenshots for documentation.
It starts both backend and frontend servers, loads sample data, and captures
screenshots showing various UI states and features.

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

    async def close_dialogs(self) -> None:
        """Close all dialogs, menus, popovers, and modals using multiple strategies"""
        try:
            # Strategy 1: Close file menu specifically by clicking outside
            file_menu = self.page.locator('[data-testid="file-menu"]')
            if await file_menu.count() > 0:
                try:
                    is_visible = await file_menu.is_visible()
                    if is_visible:
                        # Click far outside the menu to close it
                        await self.page.mouse.click(10, 10)
                        await asyncio.sleep(0.5)
                except Exception:
                    pass

            # Strategy 2: Force remove all MUI backdrops via JavaScript
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
            await asyncio.sleep(0.3)

            # Strategy 3: Force close all MUI menus via JavaScript
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
            await asyncio.sleep(0.3)

            # Strategy 4: Press Escape as fallback for other dialogs
            await self.page.keyboard.press("Escape")
            await asyncio.sleep(0.2)

            # Strategy 5: Close any remaining dialogs with close buttons
            close_buttons = self.page.locator('[aria-label="close"]')
            count = await close_buttons.count()
            for i in range(count):
                try:
                    await close_buttons.nth(i).click(timeout=1000)
                    await asyncio.sleep(0.2)
                except Exception:
                    pass

            # Final wait for DOM to settle
            await asyncio.sleep(0.5)

            # Verify no backdrops remain
            remaining_backdrops = await self.page.locator(".MuiBackdrop-root").count()
            if remaining_backdrops > 0:
                print(
                    f"[Debug] Warning: {remaining_backdrops} backdrop(s) still present after cleanup"
                )

        except Exception as e:
            # Don't fail if cleanup fails
            print(f"[Debug] Dialog cleanup warning: {e}")

    async def upload_sample_data(self) -> None:
        """Upload sample employee data"""
        print(f"{Colors.BLUE}[Data]{Colors.RESET} Uploading sample data...")

        # Navigate to homepage
        await self.page.goto("http://localhost:5173")

        # Wait for page to load
        await asyncio.sleep(2)

        # Click empty state import button or file menu
        empty_state_button = self.page.locator('[data-testid="empty-state-import-button"]')
        file_menu_button = self.page.locator('[data-testid="file-menu-button"]')

        # Try empty state button first
        try:
            is_empty = await empty_state_button.is_visible()
            if is_empty:
                await empty_state_button.click()
            else:
                # Use file menu instead
                await file_menu_button.click()
                await asyncio.sleep(0.3)
                await self.page.locator('[data-testid="import-data-menu-item"]').click()
        except Exception:
            # Fallback to file menu
            await file_menu_button.click()
            await asyncio.sleep(0.3)
            await self.page.locator('[data-testid="import-data-menu-item"]').click()

        # Wait for dialog
        await self.page.locator('[data-testid="file-upload-dialog"]').wait_for()

        # Upload sample file
        fixture_path = (
            PROJECT_ROOT / "frontend" / "playwright" / "fixtures" / "sample-employees.xlsx"
        )
        await self.page.locator("#file-upload-input").set_input_files(str(fixture_path))

        # Click submit
        await self.page.locator('[data-testid="upload-submit-button"]').click()

        # Wait for upload to complete
        await self.page.locator('[data-testid="file-upload-dialog"]').wait_for(
            state="hidden", timeout=10000
        )

        # Wait for grid to be visible
        await self.page.locator('[data-testid="nine-box-grid"]').wait_for()

        print(f"{Colors.GREEN}[Data]{Colors.RESET} Sample data loaded")

    async def capture_screenshot(
        self,
        name: str,
        element_selector: str | None = None,
        wait_time: float = 0.5,
    ) -> Path | None:
        """
        Capture a screenshot

        Args:
            name: Screenshot filename (without extension)
            element_selector: CSS selector for element to screenshot (None for full page)
            wait_time: Time to wait before capture (for animations)

        Returns:
            Path to saved screenshot or None if failed
        """
        try:
            # Wait for any animations to complete
            await asyncio.sleep(wait_time)

            # Determine output path
            output_path = self.output_dir / f"{name}.{self.image_format}"

            # Capture screenshot
            screenshot_options: dict[str, Any] = {
                "path": str(output_path),
                "type": self.image_format,
            }

            if self.image_format in ("jpeg", "webp"):
                screenshot_options["quality"] = self.quality

            if element_selector:
                element = self.page.locator(element_selector).first
                await element.screenshot(**screenshot_options)
            else:
                await self.page.screenshot(**screenshot_options, full_page=True)

            # Get file size
            file_size = output_path.stat().st_size / 1024  # KB

            print(
                f"{Colors.GREEN}[Screenshot]{Colors.RESET} {name}.{self.image_format} ({file_size:.1f} KB)"
            )

            return output_path

        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Failed to capture {name}: {e}")
            return None

    # ========================================
    # Screenshot Capture Functions
    # ========================================

    async def capture_grid_normal(self) -> Path | None:
        """Capture main grid in normal mode with employees"""
        return await self.capture_screenshot(
            "grid-normal",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_employee_tile_normal(self) -> Path | None:
        """Capture normal employee tile (close-up)"""
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
        """Capture File menu button in empty state (before upload)"""
        # Navigate to empty app state
        await self.page.goto("http://localhost:5173")
        await asyncio.sleep(1)  # Wait for app to load

        # Wait for app bar to be present with fallback
        try:
            app_bar = self.page.locator('[data-testid="app-bar"]')
            await app_bar.wait_for(state="attached", timeout=10000)
        except Exception:
            # Fallback to MUI AppBar class selector
            print("[Debug] app-bar data-testid not found, using fallback selector")
            app_bar = self.page.locator('header[class*="MuiAppBar"]')
            await app_bar.wait_for(state="attached", timeout=10000)

        # Capture the toolbar/app bar area with file menu
        return await self.capture_screenshot(
            "quickstart/quickstart-file-menu-button",
            element_selector='[data-testid="app-bar"]',
        )

    async def capture_quickstart_upload_dialog(self) -> Path | None:
        """Capture file upload dialog"""
        # Navigate to homepage
        await self.page.goto("http://localhost:5173")
        await asyncio.sleep(1)

        # Click empty state import button to open dialog
        empty_state_button = self.page.locator('[data-testid="empty-state-import-button"]')
        if await empty_state_button.is_visible():
            await empty_state_button.click()
        else:
            # Use file menu if no empty state
            await self.page.locator('[data-testid="file-menu-button"]').click()
            await asyncio.sleep(0.3)
            await self.page.locator('[data-testid="import-data-menu-item"]').click()

        # Wait for dialog to appear
        await self.page.locator('[data-testid="file-upload-dialog"]').wait_for()

        # Capture the dialog
        return await self.capture_screenshot(
            "quickstart/quickstart-upload-dialog",
            element_selector='[data-testid="file-upload-dialog"]',
        )

    async def capture_quickstart_grid_populated(self) -> Path | None:
        """Capture grid after successful data upload"""
        # Grid should already be populated from upload_sample_data
        # Capture the full grid
        return await self.capture_screenshot(
            "quickstart/quickstart-grid-populated",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_quickstart_success_annotated(self) -> Path | None:
        """Capture success state showing grid with employee count"""
        # Capture full page view showing grid and employee count
        return await self.capture_screenshot(
            "quickstart/quickstart-success-annotated",
            element_selector=None,  # Full page
        )

    # ========================================
    # Getting Started Screenshots
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
        try:
            stats_tab = self.page.locator('[data-testid="statistics-tab"]')
            if await stats_tab.count() > 0:
                await stats_tab.click()
                await asyncio.sleep(0.5)

                # Capture the right panel with statistics
                return await self.capture_screenshot(
                    "workflow/workflow-statistics-tab",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Statistics tab not found: {e}")
        return None

    async def capture_workflow_drag_drop_sequence_1(self) -> Path | None:
        """Capture drag-drop step 1: Click and hold employee"""
        # Close any open dialogs first
        await self.close_dialogs()

        # Find an employee tile to highlight
        employee = self.page.locator('[data-testid^="employee-card-"]')
        if await employee.count() > 0:
            # Hover to show it's ready to drag
            await employee.first.hover()

            return await self.capture_screenshot(
                "workflow/workflow-drag-drop-sequence-1",
                element_selector='[data-testid="nine-box-grid"]',
            )
        return None

    async def capture_workflow_drag_drop_sequence_2(self) -> Path | None:
        """Capture drag-drop step 2: Dragging to target (manual capture needed)"""
        # This requires actual drag action - capture grid state
        # Manual annotation will be needed to show dragging state
        return await self.capture_screenshot(
            "workflow/workflow-drag-drop-sequence-2",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_workflow_drag_drop_sequence_3(self) -> Path | None:
        """Capture drag-drop step 3: Employee in new position with yellow highlight"""
        # Perform actual drag to get yellow highlight
        try:
            # Get first employee card
            source = self.page.locator('[data-testid^="employee-card-"]')

            if await source.count() > 0:
                # Get the grid boxes (exclude Badge count elements with -count suffix)
                boxes = self.page.locator('[data-testid^="grid-box-"]:not([data-testid$="-count"])')
                box_count = await boxes.count()

                if box_count > 1:
                    # Drag to a different box
                    target_box = boxes.nth(1)

                    # Perform drag and drop
                    await source.first.drag_to(target_box)
                    await asyncio.sleep(1)  # Wait for yellow highlight to appear

                    return await self.capture_screenshot(
                        "workflow/workflow-drag-drop-sequence-3",
                        element_selector='[data-testid="nine-box-grid"]',
                    )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Drag-drop failed: {e}")
        return None

    async def capture_workflow_employee_modified(self) -> Path | None:
        """Capture close-up of employee tile with yellow highlight"""
        # Find a modified employee (should have yellow highlight after drag)
        try:
            # Look for employee card with modified styling
            modified = self.page.locator('[data-testid^="employee-card-"]')
            if await modified.count() > 0:
                return await self.capture_screenshot(
                    "workflow/workflow-employee-modified",
                    element_selector='[data-testid^="employee-card-"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Modified employee not found: {e}")
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

        try:
            # Click Changes tab
            changes_tab = self.page.locator('[data-testid="changes-tab"]')
            if await changes_tab.count() > 0:
                await changes_tab.click()
                await asyncio.sleep(0.5)

                # Capture the right panel with changes
                return await self.capture_screenshot(
                    "workflow/workflow-changes-tab",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Changes tab not found: {e}")
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

        try:
            # Click Statistics tab if not already selected
            stats_tab = self.page.locator('[data-testid="statistics-tab"]')
            if await stats_tab.count() > 0:
                await stats_tab.click()
                await asyncio.sleep(0.5)

                # Capture the statistics panel with distribution table
                return await self.capture_screenshot(
                    "workflow/calibration-statistics-red-flags",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Statistics tab capture failed: {e}")
        return None

    async def capture_calibration_intelligence_anomalies(self) -> Path | None:
        """Capture Intelligence tab showing anomaly detection"""
        # Close any dialogs
        await self.close_dialogs()

        try:
            # Click Intelligence tab
            intelligence_tab = self.page.locator('[data-testid="intelligence-tab"]')
            if await intelligence_tab.count() > 0:
                await intelligence_tab.click()
                await asyncio.sleep(0.5)

                # Wait for content to load
                await asyncio.sleep(1)

                # Capture the intelligence panel
                return await self.capture_screenshot(
                    "workflow/calibration-intelligence-anomalies",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Intelligence tab capture failed: {e}")
        return None

    async def capture_calibration_filters_panel(self) -> Path | None:
        """Capture Filters panel with Performance filter set to High only"""
        # Close any dialogs
        await self.close_dialogs()

        try:
            # Open filters drawer
            filters_button = self.page.locator('[data-testid="filter-button"]')
            if await filters_button.count() > 0:
                await filters_button.click()
                await asyncio.sleep(0.5)

                # Capture the filter drawer
                return await self.capture_screenshot(
                    "workflow/calibration-filters-panel",
                    element_selector='[data-testid="filter-drawer"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Filters panel capture failed: {e}")
        return None

    async def capture_calibration_donut_mode_toggle(self) -> Path | None:
        """Capture View Mode Toggle with Donut mode activated"""
        # Close any dialogs
        await self.close_dialogs()

        try:
            # Find and click the donut view button
            donut_toggle = self.page.locator('[data-testid="donut-view-button"]')
            if await donut_toggle.count() > 0:
                await donut_toggle.click()
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
        """Capture grid in Donut Mode showing ghostly placements"""
        try:
            # Donut mode should already be active from previous capture
            # If not, activate it
            donut_toggle = self.page.locator('[data-testid="donut-mode-toggle"]')
            if await donut_toggle.count() > 0:
                # Check if already active, if not click it
                toggle_state = await donut_toggle.get_attribute("aria-pressed")
                if toggle_state != "true":
                    await donut_toggle.click()
                    await asyncio.sleep(0.5)

            # Wait for grid to update
            await asyncio.sleep(1)

            # Optionally drag an employee to another position to show ghostly effect
            # This would require finding a position-5 employee and dragging
            # For now, capture current state
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
        """Capture 3-panel drag sequence composite (or individual panels)"""
        # This is complex - capture base grid state
        # Manual composition of 3 panels will be needed
        self.mark_manual("changes-drag-sequence", "requires manual 3-panel composition")

        # Capture base grid as starting point
        await self.close_dialogs()
        return await self.capture_screenshot(
            "workflow/making-changes-drag-sequence-base",
            element_selector='[data-testid="nine-box-grid"]',
        )

    async def capture_changes_orange_border(self) -> Path | None:
        """Capture close-up of employee tile with orange modified border"""
        # Close any dialogs
        await self.close_dialogs()

        try:
            # First, make a change by dragging an employee
            source = self.page.locator('[data-testid^="employee-card-"]')
            if await source.count() > 0:
                # Get the grid boxes (exclude Badge count elements with -count suffix)
                boxes = self.page.locator('[data-testid^="grid-box-"]:not([data-testid$="-count"])')
                if await boxes.count() > 1:
                    # Drag first employee to different box
                    await source.first.drag_to(boxes.nth(1))
                    await asyncio.sleep(1)

                    # Now capture the modified employee tile
                    return await self.capture_screenshot(
                        "workflow/making-changes-orange-border",
                        element_selector='[data-testid^="employee-card-"]',
                    )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Orange border capture failed: {e}")
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
        """Capture Changes tab showing movement tracker"""
        # Close any dialogs
        await self.close_dialogs()

        try:
            # Click Changes tab
            changes_tab = self.page.locator('[data-testid="changes-tab"]')
            if await changes_tab.count() > 0:
                await changes_tab.click()
                await asyncio.sleep(0.5)

                # Capture the right panel with changes
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
        """Capture Changes tab with note field highlighted"""
        # Close any dialogs
        await self.close_dialogs()

        try:
            # Click Changes tab
            changes_tab = self.page.locator('[data-testid="changes-tab"]')
            if await changes_tab.count() > 0:
                await changes_tab.click()
                await asyncio.sleep(0.5)

                # Capture the right panel showing note field
                return await self.capture_screenshot(
                    "workflow/workflow-changes-add-note",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Notes field capture failed: {e}")
        return None

    async def capture_notes_good_example(self) -> Path | None:
        """Capture Changes tab with well-written note example"""
        # Close any dialogs
        await self.close_dialogs()

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
        """Capture Donut Changes tab with notes (optional)"""
        # Close any dialogs
        await self.close_dialogs()

        try:
            # Activate donut mode first
            donut_toggle = self.page.locator('[data-testid="donut-mode-toggle"]')
            if await donut_toggle.count() > 0:
                toggle_state = await donut_toggle.get_attribute("aria-pressed")
                if toggle_state != "true":
                    await donut_toggle.click()
                    await asyncio.sleep(0.5)

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
        """Capture grid view with active filter chips displayed"""
        await self.close_dialogs()

        try:
            # Open filters drawer
            filters_button = self.page.locator('[data-testid="filter-button"]')
            if await filters_button.count() > 0:
                await filters_button.click()
                await asyncio.sleep(0.5)

                # Apply a filter (e.g., check High performance)
                high_perf = self.page.locator('text="High"').first
                if await high_perf.count() > 0:
                    await high_perf.click()
                    await asyncio.sleep(0.3)

                # Close drawer to show chips
                await self.page.keyboard.press("Escape")
                await asyncio.sleep(0.5)

                # Capture full page showing active filter chips
                return await self.capture_screenshot(
                    "filters/filters-active-chips",
                    element_selector=None,  # Full page
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
                high_perf = self.page.locator('text="High"').first
                if await high_perf.count() > 0:
                    await high_perf.click()
                    await asyncio.sleep(0.3)

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

        try:
            # Click Statistics tab
            stats_tab = self.page.locator('[data-testid="statistics-tab"]')
            if await stats_tab.count() > 0:
                await stats_tab.click()
                await asyncio.sleep(0.5)

                # Capture the statistics panel using tab-panel test ID
                await asyncio.sleep(1)  # Wait for tab content to load
                return await self.capture_screenshot(
                    "statistics/statistics-panel-distribution",
                    element_selector='[data-testid="tab-panel-2"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Statistics panel capture failed: {e}")
        return None

    async def capture_statistics_ideal_actual_comparison(self) -> Path | None:
        """Capture ideal vs actual comparison chart in Statistics"""
        await self.close_dialogs()

        try:
            # Click Statistics tab
            stats_tab = self.page.locator('[data-testid="statistics-tab"]')
            if await stats_tab.count() > 0:
                await stats_tab.click()
                await asyncio.sleep(0.5)

                # Capture the chart area (may need manual annotation)
                return await self.capture_screenshot(
                    "statistics/statistics-ideal-actual-comparison",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Ideal vs actual capture failed: {e}")
        return None

    async def capture_statistics_trend_indicators(self) -> Path | None:
        """Capture statistics with trend indicators and arrows (may need manual annotation)"""
        await self.close_dialogs()

        try:
            # Click Statistics tab
            stats_tab = self.page.locator('[data-testid="statistics-tab"]')
            if await stats_tab.count() > 0:
                await stats_tab.click()
                await asyncio.sleep(0.5)

                # Capture statistics panel - manual annotation will add arrows
                return await self.capture_screenshot(
                    "statistics/statistics-trend-indicators",
                    element_selector='[data-testid="right-panel"]',
                )
        except Exception as e:
            print(f"{Colors.YELLOW}[Warning]{Colors.RESET} Trend indicators capture failed: {e}")
        return None

    # Donut-mode.md screenshots (2)
    async def capture_donut_mode_active_layout(self) -> Path | None:
        """Capture grid in Donut Mode showing circular layout"""
        await self.close_dialogs()

        try:
            # Activate donut mode
            donut_toggle = self.page.locator('[data-testid="donut-view-button"]')
            if await donut_toggle.count() > 0:
                toggle_state = await donut_toggle.get_attribute("aria-pressed")
                if toggle_state != "true":
                    await donut_toggle.click()
                    await asyncio.sleep(0.5)

                # Wait for grid to update
                await asyncio.sleep(1)

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
        """Capture File menu with Apply Changes option highlighted"""
        await self.close_dialogs()

        try:
            # First make a change to enable Apply button
            source = self.page.locator('[data-testid^="employee-card-"]')
            if await source.count() > 0:
                # Get the grid boxes (exclude Badge count elements with -count suffix)
                boxes = self.page.locator('[data-testid^="grid-box-"]:not([data-testid$="-count"])')
                if await boxes.count() > 1:
                    await source.first.drag_to(boxes.nth(1))
                    await asyncio.sleep(1)

            # Click on the Apply/Export button or File menu
            export_btn = self.page.locator('[data-testid="export-button"]')
            apply_btn = self.page.locator('[data-testid="apply-button"]')

            # Try to find and hover over the button
            if await export_btn.count() > 0:
                await export_btn.hover()
                await asyncio.sleep(0.3)
            elif await apply_btn.count() > 0:
                await apply_btn.hover()
                await asyncio.sleep(0.3)

            # Capture the toolbar area
            return await self.capture_screenshot(
                "exporting/file-menu-apply-changes",
                element_selector='[data-testid="app-bar"]',
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
    """Main entry point"""
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

    # Define all available screenshots
    all_screenshots = {
        # Original screenshots
        "grid-normal": "capture_grid_normal",
        "employee-tile-normal": "capture_employee_tile_normal",
        # Quickstart screenshots (5)
        "quickstart-file-menu-button": "capture_quickstart_file_menu_button",
        "quickstart-upload-dialog": "capture_quickstart_upload_dialog",
        "quickstart-grid-populated": "capture_quickstart_grid_populated",
        "quickstart-success-annotated": "capture_quickstart_success_annotated",
        # Getting Started / Workflow screenshots (11)
        "workflow-grid-axes-labeled": "capture_workflow_grid_axes_labeled",
        "workflow-statistics-tab": "capture_workflow_statistics_tab",
        "workflow-drag-drop-sequence-1": "capture_workflow_drag_drop_sequence_1",
        "workflow-drag-drop-sequence-2": "capture_workflow_drag_drop_sequence_2",
        "workflow-drag-drop-sequence-3": "capture_workflow_drag_drop_sequence_3",
        "workflow-employee-modified": "capture_workflow_employee_modified",
        "workflow-employee-timeline": "capture_workflow_employee_timeline",
        "workflow-changes-tab": "capture_workflow_changes_tab",
        "workflow-apply-button": "capture_workflow_apply_button",
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

        # Setup browser
        await generator.setup_browser()

        # Upload sample data
        await generator.upload_sample_data()

        # Generate screenshots
        print(f"\n{Colors.BOLD}Generating screenshots...{Colors.RESET}\n")

        successful = 0
        failed = 0

        for i, screenshot_name in enumerate(screenshots_to_generate, 1):
            method_name = all_screenshots[screenshot_name]
            print(f"[{i}/{len(screenshots_to_generate)}] {screenshot_name}...")
            try:
                method = getattr(generator, method_name)
                result = await method()

                # Check if this was marked as manual or skipped first
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
                    print(f"{Colors.RED}[Failed]{Colors.RESET} {screenshot_name} returned None")
                    failed += 1
            except Exception as e:
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
