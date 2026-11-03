#!/usr/bin/env bash
# ==============================================================================
# PROVENTA Production PostgreSQL Disaster Recovery Restore Script
#
# Verifies SHA-256 integrity checksum before executing pg_restore.
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path_to_backup_file.dump>" >&2
  exit 1
fi

BACKUP_FILE="$1"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' does not exist." >&2
  exit 1
fi

if [ -f "${CHECKSUM_FILE}" ]; then
  echo "[$(date -u)] Verifying cryptographic SHA-256 integrity checksum..."
  sha256sum -c "${CHECKSUM_FILE}" || {
    echo "CRITICAL: Checksum verification failed! Corrupted or tampered archive." >&2
    exit 2
  }
  echo "[$(date -u)] Checksum verified successfully."
else
  echo "Warning: Checksum file not found. Proceeding with caution..."
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: Target DATABASE_URL is not defined." >&2
  exit 1
fi

read -p "WARNING: This will restore database from ${BACKUP_FILE}. Proceed? (type YES): " CONFIRM
if [ "${CONFIRM}" != "YES" ]; then
  echo "Restore aborted by user."
  exit 0
fi

echo "[$(date -u)] Initiating pg_restore into target database..."
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="${DATABASE_URL}" \
  "${BACKUP_FILE}"

echo "[$(date -u)] Restore completed successfully."
