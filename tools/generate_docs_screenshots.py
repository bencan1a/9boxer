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

        # Start Vite dev server - controlled subprocess call with validated inputs
        self.frontend_process = subprocess.Popen(  # nosec B603 B607
            ["npm", "run", "dev"],
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

    def stop_servers(self) -> None:
        """Stop both servers"""
        if self.backend_process:
            print(f"{Colors.YELLOW}[Backend]{Colors.RESET} Stopping server...")
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()

        if self.frontend_process:
            print(f"{Colors.YELLOW}[Frontend]{Colors.RESET} Stopping server...")
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()


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

        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def setup_browser(self) -> None:
        """Initialize Playwright browser"""
        print(f"{Colors.BLUE}[Browser]{Colors.RESET} Launching Chromium...")

        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        self.page = await self.browser.new_page(
            viewport={"width": self.viewport_width, "height": self.viewport_height}
        )

        print(f"{Colors.GREEN}[Browser]{Colors.RESET} Ready")

    async def close_browser(self) -> None:
        """Close Playwright browser"""
        if self.browser:
            await self.browser.close()

    async def upload_sample_data(self) -> None:
        """Upload sample employee data"""
        print(f"{Colors.BLUE}[Data]{Colors.RESET} Uploading sample data...")

        # Navigate to homepage
        await self.page.goto("http://localhost:5173")

        # Click upload button
        await self.page.locator('[data-testid="upload-button"]').click()

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
        employee = self.page.locator('[data-testid^="employee-card-"]').first()
        if await employee.count() > 0:
            return await self.capture_screenshot(
                "employee-tile-normal",
                element_selector='[data-testid^="employee-card-"]',
            )
        return None


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
        default=PROJECT_ROOT / "docs" / "images" / "screenshots",
        help="Output directory (default: docs/images/screenshots/)",
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
        "grid-normal": "capture_grid_normal",
        "employee-tile-normal": "capture_employee_tile_normal",
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

        for screenshot_name in screenshots_to_generate:
            method_name = all_screenshots[screenshot_name]
            try:
                method = getattr(generator, method_name)
                result = await method()
                if result:
                    successful += 1
                else:
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
        print(f"Total: {successful + failed}\n")

        return 0 if failed == 0 else 1

    except Exception as e:
        print(f"\n{Colors.RED}Fatal error:{Colors.RESET} {e}")
        traceback.print_exc()
        return 1

    finally:
        # Cleanup
        await generator.close_browser()
        server_manager.stop_servers()


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Interrupted by user{Colors.RESET}")
        sys.exit(130)
