#!/bin/bash
# Enable Anonymous Authentication for Firebase Project

PROJECT_ID="alfs-bd1e0"
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

# Get the project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

echo "Project ID: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"

# Enable Anonymous provider via Identity Toolkit API
# We need to update the project config to enable anonymous sign-in

curl -X PATCH \
  "https://www.googleapis.com/identitytoolkit/v3/relyingparty/setProjectConfig?key=AIzaSyBr07hf8bXibq0R1UplRQz_RJ8dmOyNuLk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "allowPasswordUserSignUp": false,
    "enableAnonymousUser": true,
    "signIn": {
      "anonymous": true
    }
  }' 2>&1

echo ""
echo "Anonymous Authentication Enabled"
