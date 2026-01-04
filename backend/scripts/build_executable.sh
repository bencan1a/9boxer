#!/bin/bash
# Build script for Linux/macOS

set -e  # Exit on error

echo "Building 9-Box Backend Executable..."

cd "$(dirname "$0")/.."  # Go to backend directory

# Check for venv and activate if present, otherwise use system Python
VENV_PATH="../.venv"
if [ -d "$VENV_PATH" ]; then
    echo "Activating virtual environment from root..."
    . "$VENV_PATH/bin/activate"

    # Install dependencies from root (where pyproject.toml is)
    echo "Installing dependencies..."
    pip install uv
    cd ..  # Go to project root
    uv pip install -e .
    cd backend  # Back to backend directory
else
    echo "No virtual environment found - using system Python (CI mode)"
    # Assume dependencies are already installed in CI
    # Just verify PyInstaller is available
    if ! command -v pyinstaller &> /dev/null; then
        echo "PyInstaller not found. Installing..."
        pip install uv
        cd ..  # Go to project root
        uv pip install --system -e .
        cd backend  # Back to backend directory
    fi
fi

# Install PyInstaller if needed
echo "Installing PyInstaller..."
if [ -d "$VENV_PATH" ]; then
    uv pip install pyinstaller
else
    uv pip install --system pyinstaller
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf build dist

# Build with spec
echo "Building with PyInstaller..."
pyinstaller build_config/ninebox.spec

# Test the executable
echo "Testing executable..."
if [ -f "dist/ninebox/ninebox" ]; then
    echo "Build complete: dist/ninebox/ninebox"
    echo "Size: $(du -sh dist/ninebox | cut -f1)"
    ls -lh dist/ninebox/ninebox
else
    echo "Build failed - executable not found"
    exit 1
fi

echo ""
echo "Build successful!"
echo "   Executable: $(pwd)/dist/ninebox/ninebox"
echo "   To run: cd dist/ninebox && ./ninebox"
