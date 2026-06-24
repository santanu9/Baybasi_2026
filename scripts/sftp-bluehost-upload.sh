#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${BLUEHOST_HOST:?Set BLUEHOST_HOST, for example: export BLUEHOST_HOST=ftp.example.com}"
: "${BLUEHOST_USER:?Set BLUEHOST_USER, for example: export BLUEHOST_USER=username@example.com}"

BLUEHOST_PORT="${BLUEHOST_PORT:-22}"
BLUEHOST_REMOTE_DIR="${BLUEHOST_REMOTE_DIR:-/home2/baybasiu/public_html/demosite}"
BLUEHOST_CLEAN_OLD="${BLUEHOST_CLEAN_OLD:-0}"

STAGE_DIR="$(mktemp -d)"
BATCH_FILE="$(mktemp)"
trap 'rm -rf "$STAGE_DIR" "$BATCH_FILE"' EXIT

cd "$ROOT_DIR"

RSYNC_EXCLUDES=(
  --exclude-from=".bluehostignore"
  --exclude=".bluehostignore"
)

rsync -a "${RSYNC_EXCLUDES[@]}" "$ROOT_DIR"/ "$STAGE_DIR"/

sftp_quote() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

{
  printf 'cd %s\n' "$(sftp_quote "$BLUEHOST_REMOTE_DIR")"

  while IFS= read -r dir; do
    printf -- '-mkdir %s\n' "$(sftp_quote "$dir")"
  done < <(find "$STAGE_DIR" -mindepth 1 -type d -print | sed "s#^$STAGE_DIR/##" | LC_ALL=C sort)

  while IFS= read -r file; do
    relative_path="${file#"$STAGE_DIR"/}"
    printf -- '-rm %s\n' "$(sftp_quote "$relative_path")"
    printf 'put %s %s\n' "$(sftp_quote "$file")" "$(sftp_quote "$relative_path")"
  done < <(find "$STAGE_DIR" -mindepth 1 -type f -print | LC_ALL=C sort)
} > "$BATCH_FILE"

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

echo "Uploading Baybasi static site to ${BLUEHOST_USER}@${BLUEHOST_HOST}:${BLUEHOST_REMOTE_DIR}"
echo "Using SFTP port ${BLUEHOST_PORT}"
echo "Staged $(find "$STAGE_DIR" -type f | wc -l | tr -d ' ') files for upload."
echo "Existing matching remote files will be removed before upload so fresh copies replace them."
if [ "$BLUEHOST_CLEAN_OLD" = "1" ]; then
  echo "Cleanup mode enabled: removing old non-WordPress demo HTML files after upload."
else
  echo "Cleanup mode disabled: existing WordPress and legacy files will be left in place."
fi

sftp -P "$BLUEHOST_PORT" -b "$BATCH_FILE" "${BLUEHOST_USER}@${BLUEHOST_HOST}"

echo "Upload complete."
