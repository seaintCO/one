$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Created .env.local from .env.example. Fill in your real keys before production testing." -ForegroundColor Yellow
}

npm install --registry=https://registry.npmjs.org
npm run dev
