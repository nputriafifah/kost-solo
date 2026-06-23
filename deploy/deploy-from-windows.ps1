# Deploy frontend kost-solo ke server kampus
# Prasyarat: terhubung WiFi D3TIGuest, SSH root@<IP-VM> bisa diakses
#
# Usage:
#   .\deploy\deploy-from-windows.ps1
#   .\deploy\deploy-from-windows.ps1 -ServerIp 192.168.1.50
#   .\deploy\deploy-from-windows.ps1 -ServerIp 100.x.x.x   # IP Tailscale

param(
    [string]$ServerIp = "10.109.0.177",
    [string]$SshUser = "root",
    [string]$RemotePath = "/var/www/kost-solo"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==> Build production..." -ForegroundColor Cyan
Push-Location $ProjectRoot
npm ci
npm run build
Pop-Location

if (-not (Test-Path "$ProjectRoot\dist\index.html")) {
    throw "Build gagal — dist/index.html tidak ditemukan"
}

Write-Host "==> Upload ke ${SshUser}@${ServerIp}:${RemotePath} ..." -ForegroundColor Cyan
scp -r "$ProjectRoot\dist\*" "${SshUser}@${ServerIp}:${RemotePath}/"

Write-Host "==> Upload skrip deploy (sekali saja)..." -ForegroundColor Cyan
scp -r "$ProjectRoot\deploy" "${SshUser}@${ServerIp}:/root/kost-solo-deploy/"

Write-Host ""
Write-Host "Deploy frontend selesai!" -ForegroundColor Green
Write-Host "Buka: http://${ServerIp}" -ForegroundColor Yellow
Write-Host ""
Write-Host "Jika belum setup server, SSH lalu jalankan:" -ForegroundColor Yellow
Write-Host "  bash /root/kost-solo-deploy/setup-server.sh" -ForegroundColor White
Write-Host "  tailscale up" -ForegroundColor White
