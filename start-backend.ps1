# start-backend.ps1
# Stops any existing running instance to prevent DLL file-locking errors, then starts the WebApi.

$existing = Get-Process -Name "LivelihoodMonitoring.WebApi" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Stopping existing backend process (PID: $($existing.Id))..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Milliseconds 500
}

Write-Host "Starting LivelihoodMonitoring.WebApi on http://localhost:5016..." -ForegroundColor Green
dotnet run --project src/LivelihoodMonitoring.WebApi/LivelihoodMonitoring.WebApi.csproj --launch-profile http
