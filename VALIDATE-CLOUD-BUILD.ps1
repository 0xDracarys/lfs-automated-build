# VALIDATE-CLOUD-BUILD.ps1
# Automated Pre-Flight Checklist for LFS Cloud Build Deployments

$ErrorActionPreference = "Continue"

Write-Host "`n=== CLOUD BUILD PRE-FLIGHT VALIDATION ===`n" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
$Dockerfiles = @("Dockerfile", "Dockerfile.cloudrun")
$MainScript = "lfs-build.sh"
$HasErrors = $false

function Log-Error ($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
    $global:HasErrors = $true
}

function Log-Success ($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Log-Warn ($message) {
    Write-Host "[WARN] $message" -ForegroundColor Yellow
}

# 1. Parse invoked scripts in lfs-build.sh
Write-Host "1. Checking script invocations in $MainScript..." -ForegroundColor Yellow

if (-not (Test-Path (Join-Path $WorkspaceRoot $MainScript))) {
    Log-Error "$MainScript not found in workspace root."
} else {
    $MainScriptContent = Get-Content (Join-Path $WorkspaceRoot $MainScript)
    # Find patterns like: bash "${SCRIPT_DIR}/script.sh" or source "${SCRIPT_DIR}/script.sh"
    $InvokedScripts = $MainScriptContent | Select-String -Pattern '(?:bash|source|\.)\s+"?\$\{?SCRIPT_DIR\}?\/([^"]+\.sh)"?' | ForEach-Object { $_.Matches.Groups[1].Value }
    
    # Remove duplicates
    $InvokedScripts = $InvokedScripts | Select-Object -Unique
    
    Write-Host "Found invoked scripts: $($InvokedScripts -join ', ')" -ForegroundColor Gray

    # Check if they exist locally
    foreach ($script in $InvokedScripts) {
        if (-not (Test-Path (Join-Path $WorkspaceRoot $script))) {
            Log-Error "Invoked script '$script' does not exist in the workspace!"
        }
    }

    # 2. Check Dockerfiles for COPY commands
    foreach ($df in $Dockerfiles) {
        Write-Host "`n2. Verifying $df..." -ForegroundColor Yellow
        if (-not (Test-Path (Join-Path $WorkspaceRoot $df))) {
            Log-Error "$df not found!"
            continue
        }

        $DfContent = Get-Content (Join-Path $WorkspaceRoot $df)

        # Check each invoked script is copied
        foreach ($script in $InvokedScripts) {
            $isCopied = $DfContent | Select-String -Pattern "COPY\s+$script" -Quiet
            if ($isCopied) {
                Log-Success "$script is copied in $df"
            } else {
                Log-Error "Missing 'COPY $script' in $df!"
            }
        }

        # Check chmod +x
        $hasChmod = $DfContent | Select-String -Pattern "RUN\s+.*chmod\s+\+x" -Quiet
        if ($hasChmod) {
            Log-Success "$df has chmod +x instruction"
        } else {
            Log-Error "$df is missing 'RUN chmod +x' for shell scripts!"
        }
    }
}

# 3. Check Helper Dependencies
Write-Host "`n3. Checking Node.js Helpers..." -ForegroundColor Yellow
$HelperPkg = Join-Path $WorkspaceRoot "helpers/package.json"
if (Test-Path $HelperPkg) {
    Log-Success "helpers/package.json exists"
    $pkgContent = Get-Content $HelperPkg | ConvertFrom-Json
    if ($pkgContent.dependencies."firebase-admin") {
        Log-Success "firebase-admin dependency found"
    } else {
        Log-Error "firebase-admin dependency missing in helpers/package.json"
    }
} else {
    Log-Error "helpers/package.json not found!"
}

# 4. Check Bash Syntax
Write-Host "`n4. Checking Bash Syntax..." -ForegroundColor Yellow
if (Get-Command bash -ErrorAction SilentlyContinue) {
    $ShellScripts = Get-ChildItem -Path $WorkspaceRoot -Filter "*.sh" -File
    foreach ($script in $ShellScripts) {
        # Convert path to WSL format if needed or just use relative path
        $relPath = Resolve-Path -Relative $script.FullName
        $relPath = $relPath -replace '\\', '/'
        
        $result = wsl bash -n $relPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Quiet success
        } else {
            Log-Error "Syntax error in $($script.Name): $result"
        }
    }
    Log-Success "Checked $($ShellScripts.Count) bash scripts for syntax errors"
} else {
    Log-Warn "bash command not found in Windows PATH, skipping syntax check."
}

Write-Host "`n=== VALIDATION RESULTS ===`n" -ForegroundColor Cyan
if ($HasErrors) {
    Write-Host "❌ PRE-FLIGHT CHECK FAILED. Please fix the errors above before deploying." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ ALL CHECKS PASSED. Ready for deployment." -ForegroundColor Green
    exit 0
}
