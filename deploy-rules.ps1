param(
    [string]$ProjectId = "alfs-bd1e0",
    [string]$RulesFile = "firestore.rules"
)

# Read the rules file
$rulesContent = Get-Content -Path $RulesFile -Raw

# Get access token
Write-Host "Getting access token..."
$tokenResponse = gcloud auth application-default print-access-token
$accessToken = $tokenResponse.Trim()

# Prepare the rules JSON
$rulesJson = @{
    "rules" = $rulesContent
} | ConvertTo-Json

# Deploy rules using REST API
$url = "https://firebaserules.googleapis.com/v1/projects/$ProjectId/releases"

Write-Host "Deploying Firestore rules to project $ProjectId..."

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri $url -Method POST -Headers $headers -Body $rulesJson
    Write-Host "Rules deployed successfully!"
    Write-Host "Response: $($response.StatusCode)"
} catch {
    Write-Host "Error deploying rules: $($_.Exception.Message)"
    Write-Host $_.Exception.Response
}
