<#
.SYNOPSIS
    Deploy the LFS Learning Platform to Vercel (CLI path).

.DESCRIPTION
    This repository supports two ways of shipping the site. Both are real and
    both are documented in README.md.

      1. From the repo  ->  git push origin main
         Vercel's Git integration builds the push. The project's Root Directory
         is `lfs-learning-platform`, so the build starts in that folder and
         finds package.json.

      2. From the CLI    ->  .\deploy-vercel.ps1   (this script)
         Uploads a clean copy of the app with no .git directory, so the
         deployment is attributed to the authenticated Vercel account rather
         than to the commit author (a non-team author is what causes BLOCKED /
         TEAM_ACCESS_REQUIRED). Vercel still applies the project's Root
         Directory, so the staged tree keeps the nested `lfs-learning-platform/`
         path, otherwise the build fails with NEXT_NO_VERSION.

    Never uploaded: node_modules, .next, .git, .netlify, .vercel, and any
    .env*.local file (those hold local secrets; Vercel injects its own env).

.EXAMPLE
    .\deploy-vercel.ps1

.EXAMPLE
    .\deploy-vercel.ps1 -KeepStaging      # keep the staged copy for inspection
#>
[CmdletBinding()]
param(
    # Folder inside this repo that holds the Next.js app (the Vercel Root Directory).
    [string]$AppDir = 'lfs-learning-platform',

    # Keep the temporary staging tree instead of deleting it afterwards.
    [switch]$KeepStaging
)

$ErrorActionPreference = 'Stop'

function Stop-WithError([string]$Message) {
    Write-Host "error: $Message" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------- preflight ---
$repo = $PSScriptRoot
if (-not $repo) { $repo = (Get-Location).Path }

$app = if ([System.IO.Path]::IsPathRooted($AppDir)) { $AppDir } else { Join-Path $repo $AppDir }
if (-not (Test-Path $app)) { Stop-WithError "app directory not found: $app" }

$pkgPath = Join-Path $app 'package.json'
if (-not (Test-Path $pkgPath)) { Stop-WithError "no package.json in $app" }
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
if (-not ($pkg.dependencies.next -or $pkg.devDependencies.next)) {
    Stop-WithError "package.json in $app has no 'next' dependency; is this the app folder?"
}

$linkPath = Join-Path $app '.vercel\project.json'
if (-not (Test-Path $linkPath)) {
    Stop-WithError "missing $linkPath - run 'vercel link' inside $app first"
}
$link = Get-Content $linkPath -Raw | ConvertFrom-Json

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Stop-WithError "Vercel CLI not found on PATH - run: npm install -g vercel"
}

# The nested folder name must match the project's Root Directory setting.
$rootDirName = Split-Path $app -Leaf

Write-Host "project : $($link.projectName) ($($link.projectId))" -ForegroundColor Cyan
Write-Host "root dir: $rootDirName" -ForegroundColor Cyan
Write-Host "source  : $app" -ForegroundColor Cyan

# ----------------------------------------------------------------- staging ---
$stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'
$stage   = Join-Path $env:LOCALAPPDATA "Temp\lfs-vercel-deploy-$stamp"
$stageApp = Join-Path $stage $rootDirName

New-Item -ItemType Directory -Path $stageApp -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage '.vercel') -Force | Out-Null

Write-Host "`nstaging clean copy (no .git) ..." -ForegroundColor Cyan
$roboArgs = @(
    $app, $stageApp,
    '/E',
    '/XD', 'node_modules', '.next', '.git', '.netlify', '.vercel',
    '/XF', '.env*.local',
    '/NFL', '/NDL', '/NJH', '/NJS', '/NP'
)
& robocopy @roboArgs | Out-Null
# robocopy: 0-7 are success codes (1 = files copied, 3 = files + dirs copied).
if ($LASTEXITCODE -ge 8) { Stop-WithError "robocopy failed with code $LASTEXITCODE" }

# Link the staged copy to the same Vercel project (verbatim copy keeps settings).
Copy-Item $linkPath (Join-Path $stage '.vercel\project.json') -Force

if (-not (Test-Path (Join-Path $stageApp 'package.json'))) {
    Stop-WithError "staging produced no package.json at $stageApp"
}
$stageMB = [math]::Round(((Get-ChildItem $stage -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 1)
Write-Host "staged  : $stage ($stageMB MB)" -ForegroundColor DarkGray

# ------------------------------------------------------------------ deploy ---
Write-Host "`ndeploying to production ..." -ForegroundColor Cyan
Push-Location $stage
try {
    # cmd /c keeps Vercel's stderr progress out of PowerShell error records.
    $output = & cmd /c "vercel --prod --yes 2>&1"
    $code   = $LASTEXITCODE
}
finally {
    Pop-Location
}

$output | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }

if ($code -ne 0) {
    if ($output -match 'TEAM_ACCESS_REQUIRED|BLOCKED') {
        Stop-WithError "deployment was BLOCKED. That happens when the deployment carries git metadata whose commit author is not a Vercel team member. This script strips .git, so if you see it here the staged tree still contains git metadata."
    }
    Stop-WithError "vercel exited with code $code"
}

$deploymentUrl = ($output | Select-String -Pattern '^https://\S+$' | Select-Object -Last 1)
if ($deploymentUrl) { $deploymentUrl = $deploymentUrl.Line.Trim() }
if (-not $deploymentUrl) {
    $m = $output | Select-String -Pattern 'Production:\s*(\S+)' | Select-Object -Last 1
    if ($m) { $deploymentUrl = $m.Matches[0].Groups[1].Value }
}

if (-not $KeepStaging) {
    Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`ndone." -ForegroundColor Green
if ($deploymentUrl) { Write-Host "deployment : $deploymentUrl" -ForegroundColor Green }
Write-Host "production : https://lfs-learning-platform.vercel.app" -ForegroundColor Green
Write-Host "`nCheck the alias, not the raw deployment URL: the alias serves the app's own" -ForegroundColor DarkGray
Write-Host "Content-Security-Policy, while Vercel injects a different one on *.vercel.app" -ForegroundColor DarkGray
Write-Host "deployment hostnames." -ForegroundColor DarkGray
