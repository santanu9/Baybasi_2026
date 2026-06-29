#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist"
ZIP_NAME="baybasi-bluehost.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR/$ZIP_NAME"

cd "$ROOT_DIR"

zip -r "$OUT_DIR/$ZIP_NAME" \
  index.html about.html impacts.html events.html sponsors.html \
  join-us.html membership.html event-pass.html volunteer.html sponsorship.html \
  admin.html 404.html .htaccess \
  css js resources \
  -x "*.DS_Store" \
  -x "docs/*" \
  -x "reports/*" \
  -x "scripts/*" \
  -x ".git/*" \
  -x ".claude/*" \
  -x ".codex/*" \
  -x ".agents/*"

echo "$OUT_DIR/$ZIP_NAME"
