# rebuild.ps1
# Stops any existing running instance, cleans, and builds cleanly with 0 errors.

$existing = Get-Process -Name "LivelihoodMonitoring.WebApi" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Releasing file locks: Stopping running backend (PID: $($existing.Id))..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Milliseconds 500
}

Write-Host "Building LivelihoodMonitoring solution..." -ForegroundColor Cyan
dotnet build
