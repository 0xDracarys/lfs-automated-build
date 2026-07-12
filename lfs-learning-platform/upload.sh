#!/bin/bash
while IFS='=' read -r key value; do
  if [[ -n "$key" && "$key" != \#* ]]; then
    # Remove surrounding quotes and carriage returns
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//" -e 's/\r//')
    echo "Uploading $key..."
    npx vercel env rm "$key" production -y 2>/dev/null
    echo "$value" | npx vercel env add "$key" production
  fi
done < .env.local
