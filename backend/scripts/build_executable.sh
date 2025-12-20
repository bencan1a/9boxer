#!/bin/bash
# Build script for Linux/macOS

set -e  # Exit on error

echo "Building 9-Box Backend Executable..."

cd "$(dirname "$0")/.."  # Go to backend directory

# Activate root venv (one level up from backend/)
VENV_PATH="../.venv"
if [ ! -d "$VENV_PATH" ]; then
    echo "Virtual environment not found at root."
    echo "Please create it first:"
    echo "  cd /path/to/9boxer"
    echo "  python3 -m venv .venv"
    echo "  . .venv/bin/activate"
    echo "  pip install -e '.[dev]'"
    exit 1
fi

echo "Activating virtual environment from root..."
. "$VENV_PATH/bin/activate"

# Install dependencies from root (where pyproject.toml is)
echo "Installing dependencies..."
pip install uv
cd ..  # Go to project root
uv pip install --system -e .
cd backend  # Back to backend directory

# Install PyInstaller if needed
echo "Installing PyInstaller..."
uv pip install --system pyinstaller

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
