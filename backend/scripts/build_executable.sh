#!/bin/bash
# Build script for Linux/macOS

set -e  # Exit on error

echo "Building 9-Box Backend Executable..."

cd "$(dirname "$0")/.."  # Go to backend directory

# Activate venv
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Run: python3 -m venv venv"
    exit 1
fi

echo "Activating virtual environment..."
. venv/bin/activate

# Install PyInstaller if needed
echo "Installing PyInstaller..."
pip install pyinstaller

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
