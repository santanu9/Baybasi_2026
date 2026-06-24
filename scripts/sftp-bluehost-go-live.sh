#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${BLUEHOST_HOST:?Set BLUEHOST_HOST, for example: export BLUEHOST_HOST=ftp.example.com}"
: "${BLUEHOST_USER:?Set BLUEHOST_USER, for example: export BLUEHOST_USER=username@example.com}"

BLUEHOST_PORT="${BLUEHOST_PORT:-22}"
BLUEHOST_REMOTE_DIR="${BLUEHOST_REMOTE_DIR:-/home2/baybasiu/public_html}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/.bluehost-remote-backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"

BATCH_FILE="$(mktemp)"
trap 'rm -f "$BATCH_FILE"' EXIT

mkdir -p "$BACKUP_DIR"

sftp_quote() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

cat > "$BATCH_FILE" <<EOF
cd $(sftp_quote "$BLUEHOST_REMOTE_DIR")
-get .htaccess $(sftp_quote "$BACKUP_DIR/wordpress.htaccess.$STAMP")
-get index.php $(sftp_quote "$BACKUP_DIR/wordpress.index.php.$STAMP")
bye
EOF

echo "Backing up current WordPress entry files from ${BLUEHOST_USER}@${BLUEHOST_HOST}:${BLUEHOST_REMOTE_DIR}"
sftp -P "$BLUEHOST_PORT" -b "$BATCH_FILE" "${BLUEHOST_USER}@${BLUEHOST_HOST}"

if [ -f "$BACKUP_DIR/wordpress.htaccess.$STAMP" ]; then
  cp "$BACKUP_DIR/wordpress.htaccess.$STAMP" "$BACKUP_DIR/latest-wordpress.htaccess"
  echo "Saved WordPress .htaccess backup: $BACKUP_DIR/wordpress.htaccess.$STAMP"
else
  echo "Warning: no remote .htaccess backup was downloaded. Rollback will need an existing backup."
fi

if [ -f "$BACKUP_DIR/wordpress.index.php.$STAMP" ]; then
  cp "$BACKUP_DIR/wordpress.index.php.$STAMP" "$BACKUP_DIR/latest-wordpress.index.php"
  echo "Saved WordPress index.php backup: $BACKUP_DIR/wordpress.index.php.$STAMP"
fi

echo "Uploading static site to live public_html."
BLUEHOST_REMOTE_DIR="$BLUEHOST_REMOTE_DIR" BLUEHOST_PORT="$BLUEHOST_PORT" "$ROOT_DIR/scripts/sftp-bluehost-upload.sh"

echo "Go-live upload complete."
echo "Rollback command: BLUEHOST_HOST=$BLUEHOST_HOST BLUEHOST_USER=$BLUEHOST_USER ./scripts/sftp-bluehost-rollback-wordpress.sh"
