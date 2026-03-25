#!/bin/bash
# Syncs astrophotography photos from Google Drive directly into the local Dropzone

DROPZONE_DIR="/home/ub25ai/concepts/lunar_gallery/dropzone"

echo "☁️  Checking Google Drive for new photos..."

# Use rclone to copy files (preserves them on Google Drive and your tablet)
rclone copy "GoogleDrive:DriveSyncFiles" "$DROPZONE_DIR" \
  --include "*.{jpg,jpeg,png,webp}" \
  --transfers 4 \
  --verbose

echo "✅ Sync complete. The File Watcher should now be processing any new photos."
