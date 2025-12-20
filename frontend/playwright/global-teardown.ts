/**
 * Playwright Global Teardown
 *
 * Stops the backend server after all tests complete.
 */

import * as path from 'path';
import * as fs from 'fs';

const PID_FILE = path.join(__dirname, '.backend.pid');

/**
 * Kill process by PID (cross-platform)
 */
function killProcess(pid: number): void {
  try {
    if (process.platform === 'win32') {
      // Windows: Use taskkill
      require('child_process').execSync(`taskkill /pid ${pid} /f /t`, {
        stdio: 'ignore',
      });
    } else {
      // Unix: Use kill
      process.kill(pid, 'SIGTERM');

      // Give it 2 seconds to shut down gracefully
      setTimeout(() => {
        try {
          // Check if process still exists
          process.kill(pid, 0);
          // If we get here, process still exists, force kill
          process.kill(pid, 'SIGKILL');
        } catch {
          // Process already exited, good
        }
      }, 2000);
    }
  } catch (error) {
    // Process may have already exited
    console.log(`[Global Teardown] Process ${pid} already exited or not found`);
  }
}

/**
 * Global teardown - runs once after all tests
 */
export default async function globalTeardown(): Promise<void> {
  console.log('\n========================================');
  console.log('Playwright Global Teardown - Cleanup');
  console.log('========================================\n');

  // Check if PID file exists
  if (!fs.existsSync(PID_FILE)) {
    console.log('[Global Teardown] No PID file found, nothing to clean up');
    return;
  }

  // Read PID
  const pidString = fs.readFileSync(PID_FILE, 'utf-8').trim();
  const pid = parseInt(pidString, 10);

  // Remove PID file
  fs.unlinkSync(PID_FILE);

  // If PID is 0, we didn't start the backend (it was already running)
  if (pid === 0) {
    console.log('[Global Teardown] Backend was already running, not stopping it');
    return;
  }

  if (isNaN(pid)) {
    console.error('[Global Teardown] Invalid PID in file:', pidString);
    return;
  }

  console.log(`[Global Teardown] Stopping backend server (PID: ${pid})...`);

  // Kill the backend process
  killProcess(pid);

  console.log('[Global Teardown] ✓ Backend server stopped');
  console.log('\n========================================');
  console.log('Cleanup complete');
  console.log('========================================\n');
}
