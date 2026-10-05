$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
if (-not (Test-Path ".\node_modules\.bin\next.cmd")) {
  npm install --registry=https://registry.npmjs.org
}
npm run dev
