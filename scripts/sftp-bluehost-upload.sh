#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${BLUEHOST_HOST:?Set BLUEHOST_HOST, for example: export BLUEHOST_HOST=ftp.example.com}"
: "${BLUEHOST_USER:?Set BLUEHOST_USER, for example: export BLUEHOST_USER=username@example.com}"

BLUEHOST_PORT="${BLUEHOST_PORT:-22}"
BLUEHOST_REMOTE_DIR="${BLUEHOST_REMOTE_DIR:-/home2/baybasiu/public_html/demosite}"
BLUEHOST_CLEAN_OLD="${BLUEHOST_CLEAN_OLD:-0}"

BATCH_FILE="$(mktemp)"
trap 'rm -f "$BATCH_FILE"' EXIT

cat > "$BATCH_FILE" <<EOF
cd $BLUEHOST_REMOTE_DIR
-mkdir css
-mkdir js
-mkdir images
put index.html
put about.html
put impacts.html
put events.html
put sponsors.html
put join-us.html
put membership.html
put event-pass.html
put volunteer.html
put sponsorship.html
put admin.html
put 404.html
put .htaccess
put -r css/* css/
put -r js/* js/
put -r images/* images/
EOF

if [ "$BLUEHOST_CLEAN_OLD" = "1" ]; then
  cat >> "$BATCH_FILE" <<EOF
-rm expense-management.html
-rm giving-back.html
-rm next-generation.html
-rm subscription.html
-rm llms.txt
EOF
fi

cat >> "$BATCH_FILE" <<EOF
bye
EOF

cd "$ROOT_DIR"

echo "Uploading Baybasi static site to ${BLUEHOST_USER}@${BLUEHOST_HOST}:${BLUEHOST_REMOTE_DIR}"
echo "Using SFTP port ${BLUEHOST_PORT}"
if [ "$BLUEHOST_CLEAN_OLD" = "1" ]; then
  echo "Cleanup mode enabled: removing old non-WordPress demo HTML files after upload."
else
  echo "Cleanup mode disabled: existing WordPress and legacy files will be left in place."
fi

sftp -P "$BLUEHOST_PORT" -b "$BATCH_FILE" "${BLUEHOST_USER}@${BLUEHOST_HOST}"

#cat $BATCH_FILE

echo "Upload complete."
