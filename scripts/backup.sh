#!/usr/bin/env bash
#
# Lunar Gallery — Backup Script
# Creates a timestamped backup of the SQLite database and uploaded photos.
#
# Usage:
#   ./scripts/backup.sh                    # Backup to default ./backups/ directory
#   ./scripts/backup.sh /mnt/usb/backups   # Backup to custom directory
#   ./scripts/backup.sh --restore latest   # Restore the most recent backup
#
# Schedule with cron (e.g., daily at 2am):
#   0 2 * * * /path/to/lunar_gallery/scripts/backup.sh >> /var/log/lunar-backup.log 2>&1
#

set -euo pipefail

# --- Configuration ---
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${PROJECT_DIR}/prisma/dev.db"
UPLOADS_DIR="${PROJECT_DIR}/public/uploads"
BACKUP_DIR="${1:-${PROJECT_DIR}/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="lunar_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
MAX_BACKUPS=10  # Keep only the last N backups

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'  # No Color

echo -e "${CYAN}🔭 Lunar Gallery Backup${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# --- Restore Mode ---
if [[ "${1:-}" == "--restore" ]]; then
    RESTORE_TARGET="${2:-latest}"

    if [[ "$RESTORE_TARGET" == "latest" ]]; then
        LATEST=$(ls -td "${BACKUP_DIR}"/lunar_backup_* 2>/dev/null | head -1)
        if [[ -z "$LATEST" ]]; then
            echo -e "${RED}❌ No backups found in ${BACKUP_DIR}${NC}"
            exit 1
        fi
        RESTORE_TARGET="$LATEST"
    fi

    if [[ ! -d "$RESTORE_TARGET" ]]; then
        echo -e "${RED}❌ Backup not found: ${RESTORE_TARGET}${NC}"
        exit 1
    fi

    echo -e "${YELLOW}⚠️  Restoring from: $(basename "$RESTORE_TARGET")${NC}"
    echo -e "${YELLOW}   This will OVERWRITE the current database and uploads.${NC}"
    read -p "   Are you sure? (y/N): " CONFIRM
    if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
        echo "Cancelled."
        exit 0
    fi

    # Restore database
    if [[ -f "${RESTORE_TARGET}/dev.db" ]]; then
        cp "${RESTORE_TARGET}/dev.db" "$DB_PATH"
        echo -e "${GREEN}  ✅ Database restored${NC}"
    fi

    # Restore uploads
    if [[ -d "${RESTORE_TARGET}/uploads" ]]; then
        rsync -a --delete "${RESTORE_TARGET}/uploads/" "$UPLOADS_DIR/"
        echo -e "${GREEN}  ✅ Uploads restored ($(ls "${RESTORE_TARGET}/uploads" | wc -l) files)${NC}"
    fi

    echo -e "\n${GREEN}🎉 Restore complete!${NC}"
    exit 0
fi

# --- Backup Mode ---

# Create backup directory
mkdir -p "$BACKUP_PATH"

# 1. Backup SQLite database (using .backup for consistency)
echo -e "  📦 Backing up database..."
if [[ -f "$DB_PATH" ]]; then
    if command -v sqlite3 &>/dev/null; then
        sqlite3 "$DB_PATH" ".backup '${BACKUP_PATH}/dev.db'"
    else
        cp "$DB_PATH" "${BACKUP_PATH}/dev.db"
    fi
    DB_SIZE=$(du -sh "${BACKUP_PATH}/dev.db" | cut -f1)
    echo -e "  ${GREEN}✅ Database: ${DB_SIZE}${NC}"
else
    echo -e "  ${YELLOW}⚠️  No database found at ${DB_PATH}${NC}"
fi

# 2. Backup uploaded photos
echo -e "  📸 Backing up uploads..."
if [[ -d "$UPLOADS_DIR" ]]; then
    cp -r "$UPLOADS_DIR" "${BACKUP_PATH}/uploads"
    PHOTO_COUNT=$(find "${BACKUP_PATH}/uploads" -type f ! -name ".gitkeep" | wc -l)
    UPLOAD_SIZE=$(du -sh "${BACKUP_PATH}/uploads" | cut -f1)
    echo -e "  ${GREEN}✅ Uploads: ${PHOTO_COUNT} files (${UPLOAD_SIZE})${NC}"
else
    echo -e "  ${YELLOW}⚠️  No uploads directory found${NC}"
fi

# 3. Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
echo ""
echo -e "  ${GREEN}📁 Backup saved: ${BACKUP_PATH}${NC}"
echo -e "  ${GREEN}📏 Total size: ${TOTAL_SIZE}${NC}"

# 4. Cleanup old backups (keep only MAX_BACKUPS)
BACKUP_COUNT=$(ls -d "${BACKUP_DIR}"/lunar_backup_* 2>/dev/null | wc -l)
if [[ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]]; then
    REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    echo ""
    echo -e "  ${YELLOW}🧹 Cleaning up ${REMOVE_COUNT} old backup(s) (keeping last ${MAX_BACKUPS})...${NC}"
    ls -td "${BACKUP_DIR}"/lunar_backup_* | tail -n "$REMOVE_COUNT" | xargs rm -rf
    echo -e "  ${GREEN}✅ Cleanup complete${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Backup complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━${NC}"
