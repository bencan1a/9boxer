import { app, BrowserWindow, dialog, Menu, ipcMain } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import axios from 'axios';

// Global references
let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let splashWindow: BrowserWindow | null = null;

// Mode detection
const isDev = !app.isPackaged;

// Backend configuration
const BACKEND_PORT = 8000;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const BACKEND_STARTUP_TIMEOUT = 30; // seconds

/**
 * Get the path to the backend executable.
 * In development: Use the built backend from Phase 1
 * In production: Backend will be in Electron's resources folder
 */
function getBackendPath(): string {
  if (app.isPackaged) {
    // Production: backend is in resources
    const platform = process.platform;
    const backendName = platform === 'win32' ? 'ninebox.exe' : 'ninebox';
    return path.join(process.resourcesPath, 'backend', backendName);
  } else {
    // Development: use built backend from Phase 1
    const platform = process.platform;
    const backendName = platform === 'win32' ? 'ninebox.exe' : 'ninebox';
    return path.join(__dirname, '../../../backend/dist/ninebox', backendName);
  }
}

/**
 * Create and display the splash screen while the backend loads.
 * Splash screen is frameless, transparent, and always on top.
 */
function createSplashScreen(): void {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, '../renderer/splash.html'));
  splashWindow.center();
  console.log('🎨 Splash screen created');
}

/**
 * Close and clean up the splash screen.
 */
function closeSplashScreen(): void {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
    console.log('🎨 Splash screen closed');
  }
}

/**
 * Set up logging configuration based on environment mode.
 * Logs mode information and app paths.
 */
function setupLogging(): void {
  if (isDev) {
    console.log('🔧 Running in DEVELOPMENT mode');
    console.log('📁 App path:', app.getAppPath());
    console.log('📁 User data path:', app.getPath('userData'));
  } else {
    console.log('🚀 Running in PRODUCTION mode');
    console.log('📁 App path:', app.getAppPath());
    console.log('📁 User data path:', app.getPath('userData'));
  }
}

/**
 * Log detailed environment information for debugging.
 * Includes Node, Electron, Chrome versions and platform details.
 */
function logEnvironmentInfo(): void {
  console.log('📊 Environment Information:');
  console.log('  Node:', process.versions.node);
  console.log('  Electron:', process.versions.electron);
  console.log('  Chrome:', process.versions.chrome);
  console.log('  Platform:', process.platform);
  console.log('  Architecture:', process.arch);
  console.log('  Development:', isDev);
  console.log('  Packaged:', app.isPackaged);
}

/**
 * Wait for backend to be ready by polling the health endpoint.
 * Returns true if backend responds within timeout, false otherwise.
 */
async function waitForBackend(maxAttempts = BACKEND_STARTUP_TIMEOUT): Promise<boolean> {
  console.log('⏳ Waiting for backend to be ready...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 1000
      });
      if (response.status === 200) {
        console.log('✅ Backend ready');
        return true;
      }
    } catch (error) {
      console.log(`⏳ Waiting for backend... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error('❌ Backend failed to start within timeout');
  return false;
}

/**
 * Start the backend executable as a subprocess.
 * Waits for backend to be ready before resolving.
 */
async function startBackend(): Promise<void> {
  const backendPath = getBackendPath();
  const appDataPath = app.getPath('userData');

  console.log(`🚀 Starting backend from: ${backendPath}`);
  console.log(`📁 App data: ${appDataPath}`);
  console.log(`🔍 Backend executable exists: ${require('fs').existsSync(backendPath)}`);

  if (!require('fs').existsSync(backendPath)) {
    throw new Error(`Backend executable not found at: ${backendPath}`);
  }

  backendProcess = spawn(backendPath, [], {
    env: {
      ...process.env,
      APP_DATA_DIR: appDataPath,
      PORT: BACKEND_PORT.toString(),
    },
    stdio: isDev ? 'inherit' : ['ignore', 'pipe', 'pipe'], // Pipe output in production
    windowsHide: true, // Hide console window on Windows
  });

  // Create log file for backend output (production mode only)
  if (!isDev && backendProcess.stdout && backendProcess.stderr) {
    const fs = require('fs');
    const logPath = path.join(appDataPath, 'backend.log');
    const logStream = fs.createWriteStream(logPath, { flags: 'a' });

    console.log(`📝 Backend logs will be written to: ${logPath}`);
    logStream.write(`\n\n=== Backend started at ${new Date().toISOString()} ===\n`);

    // Pipe stdout and stderr to log file
    backendProcess.stdout.pipe(logStream);
    backendProcess.stderr.pipe(logStream);
  }

  backendProcess.on('error', (error) => {
    console.error('❌ Backend process error:', error);
    closeSplashScreen();
    dialog.showErrorBox(
      'Backend Failed to Start',
      `The backend process could not be started.\n\nError: ${error.message}\n\nPlease check that the backend executable exists and has proper permissions.`
    );
  });

  backendProcess.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
    if (code !== 0 && code !== null) {
      // Backend crashed
      closeSplashScreen();
      dialog.showErrorBox(
        'Backend Crashed',
        `The backend process crashed with exit code ${code}.\n\nThe application will now close.\n\nPlease check the logs for more information.`
      );
      app.quit();
    }
  });

  // Wait for backend to be ready
  const ready = await waitForBackend();
  if (!ready) {
    throw new Error('Backend failed to start within timeout');
  }
}

/**
 * Get the URL to load in the main window.
 * Development: Loads from Vite dev server for hot reload
 * Production: Loads from bundled files via file:// protocol
 */
function getWindowUrl(): string {
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    // Development mode: use Vite dev server for hot reload
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    console.log('🔥 Using Vite dev server:', devServerUrl);
    return devServerUrl;
  } else if (app.isPackaged) {
    // Production mode: load from app bundle
    const prodPath = path.join(process.resourcesPath, 'app', 'dist', 'index.html');
    console.log('📦 Using production bundle:', prodPath);
    return prodPath;
  } else {
    // Development without Vite server: use built files
    const devBuildPath = path.join(__dirname, '../../dist/index.html');
    console.log('📦 Using development build:', devBuildPath);
    return devBuildPath;
  }
}

/**
 * Set up IPC handlers for file dialogs and other main process features.
 * These handlers are invoked from the renderer process via ipcRenderer.invoke().
 */
function setupIpcHandlers(): void {
  // Handle file open dialog for importing Excel files
  ipcMain.handle('dialog:openFile', async () => {
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // Handle file save dialog for exporting Excel files
  ipcMain.handle('dialog:saveFile', async (event, defaultName: string) => {
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName || 'export.xlsx',
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  });

  // Handle opening logs folder
  ipcMain.handle('app:openLogsFolder', async () => {
    const { shell } = require('electron');
    const appDataPath = app.getPath('userData');
    await shell.openPath(appDataPath);
  });

  // Handle getting app paths for debugging
  ipcMain.handle('app:getPaths', async () => {
    return {
      userData: app.getPath('userData'),
      logs: path.join(app.getPath('userData'), 'backend.log'),
      database: path.join(app.getPath('userData'), 'ninebox.db'),
    };
  });

  // Handle reading a file from disk (for auto-reload functionality)
  ipcMain.handle('file:readFile', async (event, filePath: string) => {
    try {
      const fs = require('fs').promises;
      const buffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      return {
        buffer: Array.from(buffer), // Convert buffer to array for IPC transfer
        fileName,
        success: true,
      };
    } catch (error) {
      console.error('Failed to read file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Handle opening user guide in default browser
  ipcMain.handle('app:openUserGuide', async () => {
    try {
      const { shell } = require('electron');
      const userGuidePath = app.isPackaged
        ? path.join(process.resourcesPath, 'USER_GUIDE.html')
        : path.join(__dirname, '../../../USER_GUIDE.html');

      console.log('📖 Opening user guide from:', userGuidePath);

      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(userGuidePath)) {
        console.error('❌ User guide not found at:', userGuidePath);
        return { success: false, error: 'User guide file not found' };
      }

      // Open in default browser
      await shell.openExternal(`file://${userGuidePath}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to open user guide:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

/**
 * Create the main application window.
 * Loads the frontend via file:// protocol (production) or Vite dev server (development).
 */
function createWindow(): void {
  // Get icon path based on environment
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../../build/icon.png');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: '9Boxer',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
    show: false, // Don't show until ready
  });

  // Load from file system or Vite dev server
  const url = getWindowUrl();
  console.log(`📄 Loading frontend from: ${url}`);

  if (url.startsWith('http')) {
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(url);
  }

  // Open DevTools in development mode only
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window ready to show
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Main window finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Main window failed to load:', errorCode, errorDescription);
  });

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.on('ready', async () => {
  try {
    console.log('🚀 Starting 9Boxer...');

    // Setup logging and environment info
    setupLogging();
    logEnvironmentInfo();

    // Show splash screen first
    createSplashScreen();

    // Start backend while splash is visible
    await startBackend();

    // Create main window
    createWindow();
    setupIpcHandlers();

    // Remove the application menu for a cleaner interface
    Menu.setApplicationMenu(null);

    // Close splash when main window is ready to show
    mainWindow?.once('ready-to-show', () => {
      console.log('🎉 Main window ready to show');
      closeSplashScreen();
      mainWindow?.show();
      mainWindow?.focus();
      mainWindow?.moveTop();
      console.log('✅ Main window shown and focused');
    });
  } catch (error) {
    console.error('❌ Failed to start app:', error);
    closeSplashScreen();

    const errorMessage = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start the application:\n\n${errorMessage}\n\nPlease check the logs and try again.`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Kill backend before quitting
  if (backendProcess) {
    console.log('🛑 Stopping backend...');
    backendProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app quit - ensure backend is killed
app.on('before-quit', () => {
  if (backendProcess) {
    console.log('🛑 Cleaning up backend process...');
    backendProcess.kill();
  }
});
