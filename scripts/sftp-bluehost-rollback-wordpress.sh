#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${BLUEHOST_HOST:?Set BLUEHOST_HOST, for example: export BLUEHOST_HOST=ftp.example.com}"
: "${BLUEHOST_USER:?Set BLUEHOST_USER, for example: export BLUEHOST_USER=username@example.com}"

BLUEHOST_PORT="${BLUEHOST_PORT:-22}"
BLUEHOST_REMOTE_DIR="${BLUEHOST_REMOTE_DIR:-/home2/baybasiu/public_html}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/.bluehost-remote-backups}"
RESTORE_HTACCESS="${RESTORE_HTACCESS:-$BACKUP_DIR/latest-wordpress.htaccess}"
RESTORE_INDEX="${RESTORE_INDEX:-$BACKUP_DIR/latest-wordpress.index.php}"
STAMP="$(date +%Y%m%d-%H%M%S)"

BATCH_FILE="$(mktemp)"
trap 'rm -f "$BATCH_FILE"' EXIT

if [ ! -f "$RESTORE_HTACCESS" ]; then
  echo "Missing WordPress .htaccess backup: $RESTORE_HTACCESS" >&2
  echo "Run scripts/sftp-bluehost-go-live.sh first, or set RESTORE_HTACCESS=/path/to/wordpress.htaccess.backup" >&2
  exit 1
fi

sftp_quote() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

{
  printf 'cd %s\n' "$(sftp_quote "$BLUEHOST_REMOTE_DIR")"
  printf -- '-rename index.html %s\n' "$(sftp_quote "index.static-disabled-$STAMP.html")"
  printf -- '-rename .htaccess %s\n' "$(sftp_quote ".htaccess.static-disabled-$STAMP")"
  printf 'put %s .htaccess\n' "$(sftp_quote "$RESTORE_HTACCESS")"
  if [ -f "$RESTORE_INDEX" ]; then
    printf 'put %s index.php\n' "$(sftp_quote "$RESTORE_INDEX")"
  fi
  printf 'bye\n'
} > "$BATCH_FILE"

echo "Rolling back ${BLUEHOST_USER}@${BLUEHOST_HOST}:${BLUEHOST_REMOTE_DIR} to WordPress entry routing."
echo "Static index.html will be renamed to index.static-disabled-$STAMP.html."
echo "Static .htaccess will be renamed to .htaccess.static-disabled-$STAMP."
sftp -P "$BLUEHOST_PORT" -b "$BATCH_FILE" "${BLUEHOST_USER}@${BLUEHOST_HOST}"

echo "Rollback complete. WordPress should now answer through index.php."
