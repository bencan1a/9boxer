# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for 9-Box Backend Application.

This spec file configures PyInstaller to build a standalone executable
for the FastAPI backend application.
"""

import sys
from pathlib import Path
from PyInstaller.utils.hooks import collect_all, collect_data_files

block_cipher = None

# Get the backend directory (parent of build_config)
# SPECPATH is a PyInstaller predefined variable pointing to the spec file directory
spec_dir = Path(SPECPATH)
backend_dir = spec_dir.parent
src_dir = backend_dir / 'src'
main_script = backend_dir / 'src' / 'ninebox' / 'main.py'

# Collect scipy and numpy with all their binaries and data files
scipy_datas, scipy_binaries, scipy_hiddenimports = collect_all('scipy')
numpy_datas, numpy_binaries, numpy_hiddenimports = collect_all('numpy')

# Collect ninebox data files (schema.sql and any other data files)
# Manually specify data files since ninebox is installed in editable mode
# In frozen mode, these will be available at ninebox/models/schema.sql relative to _MEIPASS
ninebox_datas = [
    (str(src_dir / 'ninebox' / 'models' / 'schema.sql'), 'ninebox/models'),
]

# Note: setuptools and pkg_resources are build-time dependencies only,
# not needed at runtime. Excluding them avoids the jaraco.text Lorem ipsum.txt error.

# Analysis: Collect all Python modules and dependencies
a = Analysis(
    [str(main_script)],  # Main entry point
    pathex=[str(src_dir)],  # Add src to path for module resolution
    binaries=scipy_binaries + numpy_binaries,
    datas=scipy_datas + numpy_datas + ninebox_datas,
    hiddenimports=[
        # FastAPI and dependencies
        'fastapi',
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'starlette',
        'pydantic',
        'pydantic_core',
        'pydantic_settings',

        # Data processing
        'pandas',
        'openpyxl',
        'scipy',
        'numpy',

        # All ninebox modules
        'ninebox',
        'ninebox.api',
        'ninebox.api.employees',
        'ninebox.api.intelligence',
        'ninebox.api.session',
        'ninebox.api.statistics',
        'ninebox.core',
        'ninebox.core.config',
        'ninebox.core.database',
        'ninebox.core.dependencies',
        'ninebox.models',
        'ninebox.models.employee',
        'ninebox.models.filters',
        'ninebox.models.grid_positions',
        'ninebox.models.session',
        'ninebox.services',
        'ninebox.services.employee_service',
        'ninebox.services.excel_exporter',
        'ninebox.services.excel_parser',
        'ninebox.services.intelligence_service',
        'ninebox.services.session_manager',
        'ninebox.services.statistics_service',
        'ninebox.utils',
        'ninebox.utils.paths',
    ] + scipy_hiddenimports + numpy_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude unnecessary modules to reduce size
        'tkinter',
        'matplotlib',
        'IPython',
        'jupyter',
        'notebook',
        'pytest',
        # Note: unittest is needed by numpy.testing (used by scipy), so don't exclude it
        # Exclude pkg_resources to avoid setuptools vendored jaraco.text Lorem ipsum.txt error
        'pkg_resources',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# PYZ: Create Python archive
pyz = PYZ(
    a.pure,
    a.zipped_data,
    cipher=block_cipher
)

# EXE: Create executable
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ninebox',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Keep console window for server logs
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon path if you have one: 'path/to/icon.ico'
)

# COLLECT: Gather all files into distribution folder
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ninebox',
)
