# Development Process Cleanup Script for 9Boxer
# Kills all lingering dev processes (backend, frontend, servers)
# Safe to run anytime - only kills 9Boxer-related processes

Write-Host ""
Write-Host "========================================"
Write-Host "9Boxer Development Process Cleanup"
Write-Host "========================================"
Write-Host ""

# Kill ninebox.exe (backend executable)
Write-Host "[1/5] Checking for ninebox.exe processes..."
$nineboxProcesses = Get-Process -Name "ninebox" -ErrorAction SilentlyContinue
if ($nineboxProcesses) {
    Write-Host "  > Found ninebox.exe processes, killing..."
    $nineboxProcesses | Stop-Process -Force
    Write-Host "  > ninebox.exe processes terminated"
} else {
    Write-Host "  > No ninebox.exe processes found"
}

# Kill processes using port 38000 (backend port)
Write-Host ""
Write-Host "[2/5] Checking for processes on port 38000..."
$port38000 = Get-NetTCPConnection -LocalPort 38000 -ErrorAction SilentlyContinue
if ($port38000) {
    $port38000 | ForEach-Object {
        $pid = $_.OwningProcess
        Write-Host "  > Found process $pid using port 38000, killing..."
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  > Port 38000 cleanup complete"
} else {
    Write-Host "  > Port 38000 cleanup complete"
}

# Kill processes using port 5173 (Vite dev server)
Write-Host ""
Write-Host "[3/5] Checking for processes on port 5173..."
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    $port5173 | ForEach-Object {
        $pid = $_.OwningProcess
        Write-Host "  > Found process $pid using port 5173, killing..."
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  > Port 5173 cleanup complete"
} else {
    Write-Host "  > Port 5173 cleanup complete"
}

# Kill uvicorn processes (Python dev server)
Write-Host ""
Write-Host "[4/5] Checking for uvicorn processes..."
$uvicornProcesses = Get-WmiObject Win32_Process | Where-Object {
    $_.Name -eq "python.exe" -and $_.CommandLine -like "*uvicorn*"
}
if ($uvicornProcesses) {
    Write-Host "  > Found uvicorn processes, killing..."
    $uvicornProcesses | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  > Uvicorn processes terminated"
} else {
    Write-Host "  > No uvicorn processes found"
}

# Kill npm/Vite processes
Write-Host ""
Write-Host "[5/5] Checking for npm/Vite processes..."
$viteProcesses = Get-WmiObject Win32_Process | Where-Object {
    $_.Name -eq "node.exe" -and $_.CommandLine -like "*vite*"
}
if ($viteProcesses) {
    Write-Host "  > Found Vite processes, killing..."
    $viteProcesses | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  > Vite processes terminated"
} else {
    Write-Host "  > No Vite processes found"
}

Write-Host ""
Write-Host "========================================"
Write-Host "Cleanup Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "All 9Boxer development processes have been cleaned up."
Write-Host "You can now start a fresh debug session."
Write-Host ""

# Give user time to see results
Start-Sleep -Seconds 2

# Exit with success code
exit 0
