@echo off
setlocal enabledelayedexpansion

cd "c:\Users\Chintu\Documents\Dev Zone\Dev work web\lfs-automated"

REM Get access token
for /f "delims=" %%A in ('gcloud auth print-access-token 2^>nul') do set TOKEN=%%A

if "%TOKEN%"=="" (
    echo Error: Could not get access token
    exit /b 1
)

echo Token acquired: %TOKEN:~0,20%...

REM Read rules file
setlocal enabledelayedexpansion
for /f "delims=" %%i in (firestore.rules) do set "RULES=!RULES!%%i"

REM Create JSON payload
setlocal enabledelayedexpansion
set PAYLOAD={
set PAYLOAD=!PAYLOAD!"source":{"files":[{"name":"firestore.rules","content":"
set PAYLOAD=!PAYLOAD!!RULES!
set PAYLOAD=!PAYLOAD!"}]}
set PAYLOAD=!PAYLOAD!}

echo Deploying Firestore rules...
echo Payload: !PAYLOAD!

REM Deploy using curl
curl -X POST ^
  "https://firebaserules.googleapis.com/v1/projects/alfs-bd1e0/releases" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "!PAYLOAD!" ^
  2>nul

echo.
echo Done!
