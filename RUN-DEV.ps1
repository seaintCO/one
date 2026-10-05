$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "ONE — clean local install" -ForegroundColor Cyan

if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

npm cache verify
npm install --registry=https://registry.npmjs.org
npm run dev
