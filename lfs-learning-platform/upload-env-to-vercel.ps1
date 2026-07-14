# Upload Firebase env vars to Vercel production
# Reads from .env.local and pushes to Vercel

$envFile = ".env.local"
$envVars = @{}

# Parse .env.local (handle key=value, ignore comments and empty lines)
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $idx = $line.IndexOf("=")
        if ($idx -gt 0) {
            $key = $line.Substring(0, $idx).Trim()
            $val = $line.Substring($idx + 1).Trim()
            # Strip surrounding quotes if present
            if ($val.StartsWith('"') -and $val.EndsWith('"')) {
                $val = $val.Substring(1, $val.Length - 2)
            }
            if ($val.StartsWith("'") -and $val.EndsWith("'")) {
                $val = $val.Substring(1, $val.Length - 2)
            }
            $envVars[$key] = $val
        }
    }
}

Write-Host "Found $($envVars.Count) env vars to upload..."

foreach ($key in $envVars.Keys) {
    $val = $envVars[$key]
    if ($val -and $val.Length -gt 0) {
        Write-Host "Uploading: $key"
        # Remove existing and re-add with correct value
        vercel env rm $key production --yes 2>$null
        $val | vercel env add $key production
    }
}

Write-Host "`nDone! Run: vercel --prod --yes to redeploy"
