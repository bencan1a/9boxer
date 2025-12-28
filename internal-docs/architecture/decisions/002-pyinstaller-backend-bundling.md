# ADR-002: PyInstaller Backend Bundling

**Status:** ✅ Accepted
**Date:** 2024-Q4 (Initial implementation)
**Tags:** #backend #deployment #bundling #pyinstaller

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Bundle Python backend as standalone executable using PyInstaller | Need to distribute backend without requiring Python installation | ~225MB backend bundle, single executable, no runtime dependencies |

## When to Reference This ADR

- Before changing backend deployment strategy (Docker, web server, etc.)
- When debugging PyInstaller build issues (missing modules, import errors)
- When adding new Python dependencies (need to update spec file)
- When considering alternative Python bundling tools (Nuitka, cx_Freeze)
- When experiencing startup performance issues

## Alternatives Comparison

| Option | Bundle Size | Build Time | Runtime Performance | Dependencies | User Experience | Decision |
|--------|-------------|------------|---------------------|--------------|-----------------|----------|
| **PyInstaller** | ~225MB | ~2-3 min | ⭐⭐⭐⭐ (Fast) | None (all bundled) | ✅ Zero setup | ✅ Chosen |
| Docker Container | ~500MB | ~5-10 min | ⭐⭐⭐ (Overhead) | Docker Desktop required | ❌ Technical users only | ❌ Rejected |
| Require Python Install | ~100MB | N/A | ⭐⭐⭐⭐⭐ (Native) | Python 3.10+ required | ❌ Setup friction | ❌ Rejected |
| Web Server (SaaS) | N/A | N/A | ⭐⭐⭐ (Network dependent) | Cloud infrastructure | ✅ No install, but online-only | ❌ Rejected |
| Nuitka | ~150MB | ~15-30 min | ⭐⭐⭐⭐⭐ (Compiled) | None | ✅ Zero setup | ⚠️ Too slow to build |
| cx_Freeze | ~200MB | ~3-5 min | ⭐⭐⭐⭐ (Fast) | None | ✅ Zero setup | ⚠️ Less mature |

## Decision Criteria Matrix

| Criterion | Weight | Winner | Rationale |
|-----------|--------|--------|-----------|
| **User Experience** | High | PyInstaller | No Python installation required, single executable |
| **Build Maturity** | High | PyInstaller | 15+ years, extensive community, many edge cases solved |
| **Build Speed** | Medium | PyInstaller | 2-3 min acceptable (Nuitka 15-30 min too slow) |
| **Bundle Size** | Low | Nuitka | But 225MB vs 150MB not significant for desktop app |
| **Debugging** | Medium | PyInstaller | Well-documented, large community, Stack Overflow answers |
| **Cross-Platform** | High | Tie | All options support Windows/macOS/Linux |

**Final Score:** PyInstaller wins 4/5 high-weighted criteria

## Implementation Details

### Key Constraints

- **Single executable**: Backend must be one file (or one directory with dependencies)
- **No Python runtime required**: Users should not need to install Python
- **Import discovery**: PyInstaller must find all hidden imports (scipy, numpy, fastapi, etc.)
- **Data files bundled**: SQL schema, migrations must be included
- **Console window**: Backend runs with console (for logging in dev, hidden in production)

### PyInstaller Configuration

**Spec File:** `backend/build_config/ninebox.spec`
```python
# Collect all scipy/numpy binaries (large but necessary)
scipy_datas, scipy_binaries, scipy_hiddenimports = collect_all('scipy')
numpy_datas, numpy_binaries, numpy_hiddenimports = collect_all('numpy')

# Collect ninebox data files (SQL schema)
ninebox_datas = collect_data_files('ninebox', includes=['**/*.sql'])

a = Analysis(
    [str(main_script)],
    pathex=[str(src_dir)],
    binaries=scipy_binaries + numpy_binaries,
    datas=scipy_datas + numpy_datas + ninebox_datas,
    hiddenimports=[
        # FastAPI ecosystem
        'fastapi', 'uvicorn', 'starlette', 'pydantic', 'pydantic_core',

        # Data processing
        'pandas', 'openpyxl', 'scipy', 'numpy',

        # All ninebox modules
        'ninebox', 'ninebox.api', 'ninebox.services', ...
    ] + scipy_hiddenimports + numpy_hiddenimports,
    excludes=[
        # Reduce bundle size
        'tkinter', 'matplotlib', 'IPython', 'jupyter', 'pytest',
    ],
)
```

**Build Script:** `backend/scripts/build_executable.bat` (Windows)
```batch
@echo off
echo Building backend executable with PyInstaller...
cd /d "%~dp0\.."
pyinstaller build_config/ninebox.spec --clean --noconfirm
```

**Output:** `backend/dist/ninebox/`
```
ninebox/
  ninebox.exe              # Main executable (Windows)
  _internal/               # Dependencies folder
    *.pyd                  # Python extension modules
    *.dll                  # Windows DLLs
    numpy/                 # NumPy package
    scipy/                 # SciPy package
    pandas/                # Pandas package
    fastapi/               # FastAPI package
    ...
```

### Backend Startup Flow

1. **Electron main process spawns backend:**
   ```typescript
   const backendPath = app.isPackaged
     ? path.join(process.resourcesPath, 'backend', 'ninebox.exe')
     : path.join(__dirname, '../../../backend/dist/ninebox', 'ninebox.exe');

   backendProcess = spawn(backendPath, [], {
     env: { APP_DATA_DIR: app.getPath('userData') },
   });
   ```

2. **Backend discovers port and reports back:**
   ```python
   # Backend finds available port (38000 or next available)
   port = find_available_port(start=38000)

   # Print JSON message for Electron to parse
   print(json.dumps({"port": port, "status": "ready"}))
   ```

3. **Electron waits for health check:**
   ```typescript
   const ready = await waitForBackend(BACKEND_URL + '/health', timeout=30s);
   if (ready) { showMainWindow(); }
   ```

### Related Files

- `backend/build_config/ninebox.spec` - PyInstaller configuration
- `backend/scripts/build_executable.bat` - Windows build script
- `backend/scripts/build_executable.sh` - macOS/Linux build script
- `frontend/electron/main/index.ts` - Backend subprocess management
- `backend/src/ninebox/main.py` - Backend entry point

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Large bundle (~225MB)** | No Python installation required | Acceptable for desktop app, one-time download |
| **Slower build time (~2-3 min)** | Mature tooling, fewer edge cases | Cache builds in CI, only rebuild when backend changes |
| **Import discovery complexity** | Single executable simplicity | Document hiddenimports in spec file, test thoroughly |
| **Harder debugging** | Production-ready packaging | Use console=True in dev, extensive logging |
| **Version pinning required** | Deterministic builds | Use exact versions in pyproject.toml |

## Common Issues and Solutions

### Issue: "Module not found" at runtime

**Symptom:** Backend crashes with `ModuleNotFoundError: No module named 'X'`

**Cause:** PyInstaller didn't detect hidden import

**Solution:** Add module to `hiddenimports` in `ninebox.spec`:
```python
hiddenimports=[
    # ... existing imports
    'new.module.name',  # Add missing module
]
```

### Issue: "File not found" for SQL schema

**Symptom:** Backend crashes with `FileNotFoundError: schema.sql`

**Cause:** Data files not bundled correctly

**Solution:** Add to `datas` in `ninebox.spec`:
```python
ninebox_datas = collect_data_files('ninebox', includes=['**/*.sql', '**/*.json'])
```

### Issue: Slow backend startup (>10s)

**Symptom:** Backend takes >10 seconds to start

**Cause:** PyInstaller unpacks large dependencies on every startup

**Solution:**
1. Exclude unnecessary packages in `excludes`
2. Use `--onedir` mode (current approach, faster than `--onefile`)
3. Profile startup with `cProfile` to find bottlenecks

## Migration Considerations

**If we ever need to migrate away from PyInstaller:**

1. **Nuitka** (most likely successor):
   - Pros: Smaller bundle (~150MB), compiled Python (faster runtime)
   - Cons: Very slow builds (15-30 min), less mature
   - Effort: Low (1-2 days, similar spec file format)

2. **Docker/Web Server**:
   - Pros: No bundling complexity, easier updates
   - Cons: Requires Docker Desktop or cloud hosting, online dependency
   - Effort: Medium (2-3 weeks, rewrite deployment)

3. **Require Python Installation**:
   - Pros: No bundling, easier debugging
   - Cons: User setup friction, version conflicts
   - Effort: Low (1 day, remove build step)

**Migration triggers:**
- Build time becomes unacceptable (>10 min)
- Bundle size becomes critical (<100MB required)
- PyInstaller no longer maintained (unlikely)
- Startup time becomes unacceptable (>10s)

## Related Decisions

- See [ADR-001](001-electron-desktop-architecture.md) for desktop framework choice
- See [ADR-003](003-http-ipc-communication.md) for backend-frontend communication
- See [ADR-005](005-sqlite-embedded-database.md) for database bundling

## References

- [PyInstaller Documentation](https://pyinstaller.org/en/stable/)
- [PyInstaller Spec Files](https://pyinstaller.org/en/stable/spec-files.html)
- [Nuitka Documentation](https://nuitka.net/doc/user-manual.html)
- [Python Packaging Guide](https://packaging.python.org/en/latest/)
