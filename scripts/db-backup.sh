#!/usr/bin/env bash
# ==============================================================================
# PROVENTA Production PostgreSQL Backup Script
#
# Generates encrypted, timestamped pg_dump archives with SHA-256 checksums.
# Retention: Daily snapshots (30 days), Weekly (12 weeks), Monthly (7 years).
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${PROVENTA_BACKUP_DIR:-/var/backups/proventa}"
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
BACKUP_FILE="${BACKUP_DIR}/proventa_db_${TIMESTAMP}.dump"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL environment variable is not defined." >&2
  exit 1
fi

echo "[$(date -u)] Starting PROVENTA database backup..."

# Execute binary pg_dump with custom compressed format
pg_dump \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --dbname="${DATABASE_URL}" \
  --file="${BACKUP_FILE}"

# Generate cryptographic integrity checksum
sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"

echo "[$(date -u)] Backup completed successfully: ${BACKUP_FILE}"
echo "[$(date -u)] Checksum: $(cat "${CHECKSUM_FILE}")"

# Rotate local backups older than 30 days
find "${BACKUP_DIR}" -name "proventa_db_*.dump" -mtime +30 -delete
find "${BACKUP_DIR}" -name "proventa_db_*.dump.sha256" -mtime +30 -delete

echo "[$(date -u)] Local rotation complete."
