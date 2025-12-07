#!/usr/bin/env python3
"""Deploy Firestore rules to a Firebase project."""

import json
import subprocess
import sys

def deploy_firestore_rules(project_id, rules_file):
    """Deploy Firestore rules using the Firebase REST API."""
    
    # Read rules file
    with open(rules_file, 'r') as f:
        rules_content = f.read()
    
    # Parse rules JSON to validate
    try:
        rules_json = json.loads(rules_content)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {rules_file}: {e}")
        return False
    
    # Get access token
    try:
        result = subprocess.run(
            ['gcloud', 'auth', 'application-default', 'print-access-token'],
            capture_output=True,
            text=True,
            check=True
        )
        access_token = result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error getting access token: {e}")
        return False
    
    # Deploy using firebase REST API
    import urllib.request
    import urllib.error
    
    url = f"https://firebaserules.googleapis.com/v1/projects/{project_id}/releases"
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    
    # Prepare payload
    payload = {
        "source": {
            "files": [
                {
                    "name": "firestore.rules",
                    "content": rules_content
                }
            ]
        },
        "testSuite": {}
    }
    
    data = json.dumps(payload).encode('utf-8')
    
    try:
        request = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode())
            print(f"✅ Firestore rules deployed successfully!")
            print(f"Release: {result.get('name')}")
            return True
    except urllib.error.HTTPError as e:
        print(f"Error deploying rules: {e.code}")
        print(f"Response: {e.read().decode()}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    project_id = 'alfs-bd1e0'
    rules_file = 'firestore.rules'
    
    if deploy_firestore_rules(project_id, rules_file):
        sys.exit(0)
    else:
        sys.exit(1)
