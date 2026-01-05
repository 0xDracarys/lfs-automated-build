#!/bin/bash
# Minimal test script to verify container startup
echo "=========================================="
echo "TEST ENTRYPOINT - Container Started"
echo "=========================================="
echo "Hostname: $(hostname)"
echo "User: $(whoami)"
echo "PWD: $(pwd)"
echo "Date: $(date)"
echo ""
echo "Environment Variables:"
env | sort
echo ""
echo "Directory /app contents:"
ls -lah /app
echo ""
echo "Directory /app/helpers contents:"
ls -lah /app/helpers
echo ""
echo "Testing bash script:"
bash --version
echo ""
echo "=========================================="
echo "TEST COMPLETED SUCCESSFULLY"
echo "=========================================="
exit 0
