#!/bin/bash
################################################################################
# Cleanup Script for Cloud Build Artifacts
# Removes old build sources to save storage space
################################################################################

set -e

PROJECT_ID="alfs-bd1e0"
CLOUDBUILD_BUCKET="gs://alfs-bd1e0_cloudbuild"
BUILDS_BUCKET="gs://alfs-bd1e0-builds"

echo "🧹 LFS Build Cleanup Script"
echo "============================"
echo ""

# Check current storage usage
echo "📊 Current Storage Usage:"
echo "   Cloud Build sources:"
gsutil du -sh $CLOUDBUILD_BUCKET
echo "   Build outputs:"
gsutil du -sh $BUILDS_BUCKET
echo ""

# List all build sources
echo "📂 Cloud Build Sources:"
gsutil ls -l $CLOUDBUILD_BUCKET/source/ | tail -20
echo ""

# Cleanup old build sources (keep last 10)
echo "🗑️  Cleanup Options:"
echo "1. Keep last 10 build sources, delete older (recommended)"
echo "2. Keep last 20 build sources, delete older"
echo "3. Delete all build sources (dangerous!)"
echo "4. Skip cleanup"
echo ""
read -p "Select option (1-4): " option

case $option in
    1)
        KEEP_COUNT=10
        ;;
    2)
        KEEP_COUNT=20
        ;;
    3)
        echo "⚠️  WARNING: This will delete ALL build sources!"
        read -p "Type 'DELETE ALL' to confirm: " confirm
        if [ "$confirm" != "DELETE ALL" ]; then
            echo "Cancelled."
            exit 0
        fi
        KEEP_COUNT=0
        ;;
    4)
        echo "Skipping cleanup."
        exit 0
        ;;
    *)
        echo "Invalid option."
        exit 1
        ;;
esac

if [ $KEEP_COUNT -gt 0 ]; then
    echo ""
    echo "🧹 Cleaning up Cloud Build sources (keeping last $KEEP_COUNT)..."
    
    # Get list of files, sort by timestamp, skip the latest $KEEP_COUNT
    gsutil ls -l $CLOUDBUILD_BUCKET/source/ | \
        grep -v "TOTAL" | \
        sort -k2 | \
        head -n -$KEEP_COUNT | \
        awk '{print $3}' | \
        while read file; do
            if [ ! -z "$file" ]; then
                echo "  Deleting: $file"
                gsutil rm "$file" 2>/dev/null || true
            fi
        done
else
    echo ""
    echo "🧹 Deleting ALL Cloud Build sources..."
    gsutil -m rm -r $CLOUDBUILD_BUCKET/source/* 2>/dev/null || true
fi

# Cleanup old failed build outputs (keep successful ones)
echo ""
echo "🧹 Checking build outputs..."
gsutil ls $BUILDS_BUCKET/ | while read build_dir; do
    # Check if build dir has a valid output file
    if ! gsutil ls ${build_dir}lfs-system*.tar.gz >/dev/null 2>&1; then
        echo "  Removing failed/incomplete build: $build_dir"
        gsutil -m rm -r "$build_dir" 2>/dev/null || true
    fi
done

echo ""
echo "📊 Storage Usage After Cleanup:"
echo "   Cloud Build sources:"
gsutil du -sh $CLOUDBUILD_BUCKET
echo "   Build outputs:"
gsutil du -sh $BUILDS_BUCKET
echo ""
echo "✅ Cleanup complete!"
