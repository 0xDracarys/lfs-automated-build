#!/bin/bash
# VALIDATE-LFS-ENV.sh - Validates LFS environment before build
# Run this before any LFS build to ensure proper setup

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "  LFS Environment Validation"
echo "============================================"
echo ""

# Check 1: LFS variable set
if [ -z "$LFS" ]; then
    echo -e "${RED}❌ ERROR: LFS variable not set${NC}"
    echo "   Fix: export LFS=/mnt/lfs"
    exit 1
else
    echo -e "${GREEN}✓ LFS=${LFS}${NC}"
fi

# Check 2: LFS directory exists
if [ ! -d "$LFS" ]; then
    echo -e "${RED}❌ ERROR: LFS directory does not exist: $LFS${NC}"
    echo "   Fix: sudo mkdir -p $LFS && sudo chown -R \$(whoami):\$(whoami) $LFS"
    exit 1
else
    echo -e "${GREEN}✓ LFS directory exists${NC}"
fi

# Check 3: LFS is writable
if [ ! -w "$LFS" ]; then
    echo -e "${RED}❌ ERROR: LFS directory not writable: $LFS${NC}"
    echo "   Fix: sudo chown -R \$(whoami):\$(whoami) $LFS"
    exit 1
else
    echo -e "${GREEN}✓ LFS directory writable${NC}"
fi

# Check 4: LFS_TGT set
if [ -z "$LFS_TGT" ]; then
    echo -e "${YELLOW}⚠ WARNING: LFS_TGT not set, using default${NC}"
    export LFS_TGT=x86_64-lfs-linux-gnu
fi
echo -e "${GREEN}✓ LFS_TGT=${LFS_TGT}${NC}"

# Check 5: Required directories
for dir in sources tools logs; do
    if [ ! -d "$LFS/$dir" ]; then
        echo -e "${YELLOW}⚠ Creating $LFS/$dir${NC}"
        mkdir -p "$LFS/$dir"
    fi
done
echo -e "${GREEN}✓ Required directories present${NC}"

# Check 6: Disk space (need at least 10GB)
AVAILABLE=$(df -BG "$LFS" | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE" -lt 10 ]; then
    echo -e "${RED}❌ ERROR: Insufficient disk space. Need 10GB, have ${AVAILABLE}GB${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Disk space: ${AVAILABLE}GB available${NC}"
fi

# Check 7: Build tools present
MISSING_TOOLS=""
for tool in bash gcc g++ make tar gzip wget; do
    if ! command -v $tool &> /dev/null; then
        MISSING_TOOLS="$MISSING_TOOLS $tool"
    fi
done

if [ -n "$MISSING_TOOLS" ]; then
    echo -e "${RED}❌ ERROR: Missing build tools:$MISSING_TOOLS${NC}"
    echo "   Fix: sudo apt-get install build-essential wget tar gzip"
    exit 1
else
    echo -e "${GREEN}✓ Build tools present${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  All checks passed! Ready to build LFS${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Environment:"
echo "  LFS=$LFS"
echo "  LFS_TGT=$LFS_TGT"
echo "  MAKEFLAGS=${MAKEFLAGS:--j$(nproc)}"
echo "  PATH=$PATH"
echo ""
