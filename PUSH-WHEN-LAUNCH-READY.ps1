$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$Remote = "https://github.com/seaintCO/one.git"

if (-not (Test-Path ".git")) {
  git init
}

git branch -M main
$origin = git remote 2>$null | Select-String "^origin$"
if ($origin) { git remote set-url origin $Remote } else { git remote add origin $Remote }

git add .
$changes = git status --porcelain
if ($changes) {
  git commit -m "ONE V23 dark CTA production update"
}

git push -u origin main --force-with-lease
