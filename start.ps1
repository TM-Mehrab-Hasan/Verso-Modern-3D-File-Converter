param()

$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  File Converter - Starting All Servers    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start backend in a new PowerShell window
$backendCmd = "Set-Location '$Root\backend'; if (-not (Test-Path 'venv')) { python -m venv venv }; & .\venv\Scripts\Activate.ps1; pip install -q -r requirements.txt; python main.py; pause"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Write-Host "[Backend]  Launching on http://localhost:8000" -ForegroundColor Green

# Give backend time to start up
Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window
$frontendCmd = "Set-Location '$Root\frontend'; npm run dev; pause"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host "[Frontend] Launching on http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "Both servers are running in their own windows." -ForegroundColor Yellow
Write-Host "Close those windows (or press Ctrl+C inside them) to stop each server." -ForegroundColor Yellow
Write-Host ""
