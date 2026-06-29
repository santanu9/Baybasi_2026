#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${BLUEHOST_HOST:?Set BLUEHOST_HOST, for example: export BLUEHOST_HOST=ftp.example.com}"
: "${BLUEHOST_USER:?Set BLUEHOST_USER, for example: export BLUEHOST_USER=username@example.com}"

BLUEHOST_PORT="${BLUEHOST_PORT:-22}"
BLUEHOST_REMOTE_DIR="${BLUEHOST_REMOTE_DIR:-/home2/baybasiu/public_html/demosite}"
BLUEHOST_CLEAN_OLD="${BLUEHOST_CLEAN_OLD:-0}"
BLUEHOST_CLEAN_LEGACY_MEDIA="${BLUEHOST_CLEAN_LEGACY_MEDIA:-1}"
BLUEHOST_CLEAN_DOCS="${BLUEHOST_CLEAN_DOCS:-1}"

STAGE_DIR="$(mktemp -d)"
BATCH_FILE="$(mktemp)"
trap 'rm -rf "$STAGE_DIR" "$BATCH_FILE"' EXIT

cd "$ROOT_DIR"

RSYNC_EXCLUDES=(
  --exclude-from=".bluehostignore"
  --exclude=".bluehostignore"
  --exclude="docs/"
)

rsync -a "${RSYNC_EXCLUDES[@]}" "$ROOT_DIR"/ "$STAGE_DIR"/

sftp_quote() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "$value"
}

emit_docs_cleanup() {
  local docs_dir="$ROOT_DIR/docs"
  [ -d "$docs_dir" ] || return 0

  while IFS= read -r file; do
    printf -- '-rm %s\n' "$(sftp_quote "docs/${file#"$docs_dir"/}")"
  done < <(find "$docs_dir" -type f -print | LC_ALL=C sort -r)

  while IFS= read -r dir; do
    printf -- '-rmdir %s\n' "$(sftp_quote "docs/${dir#"$docs_dir"/}")"
  done < <(find "$docs_dir" -mindepth 1 -type d -print | LC_ALL=C sort -r)

  printf -- '-rmdir %s\n' "$(sftp_quote "docs")"
}

emit_legacy_media_cleanup() {
  local paths=(
    "images/home/durga-puja-bg.mp4"
    "images/home/hero-video.mp4"
    "images/heroes/volunteer-hero.svg"
    "images/heroes/join-us-photo.png"
    "images/heroes/membership-hero.svg"
    "images/heroes/volunteer-photo.png"
    "images/heroes/event-pass-hero.svg"
    "images/heroes/sponsorship-photo.png"
    "images/heroes/sponsorship-hero.svg"
    "images/heroes/event-pass-photo.png"
    "images/heroes/membership-photo.png"
    "images/heroes/events-photo.png"
    "images/impacts/impact-hero-community.png"
    "images/about/director-prithwiraj-mitra.jpg"
    "images/about/director-raj-tiwari.jpg"
    "images/about/director-sukalyan-chakraborty.jpg"
    "images/about/director-swati-chakraborty.jpg"
    "images/about/director-manjira-datta.png"
    "images/about/director-suman-debnath.jpg"
    "images/about/about-hero-community.png"
    "images/about/director-nilanjan-debroy.jpg"
    "images/sponsors/ebiw-768x122.png"
    "images/sponsors/BMO_Updated-768x440.png"
    "images/sponsors/indian_grocery_image001.png"
    "images/sponsors/kw_PHOTO-2022-09-12-21-14-21.jpg"
    "images/sponsors/gama_ride_working-1.png"
    "images/sponsors/WhatsApp-Image-2023-10-20-at-2.22.33-PM-1024x1018.jpeg"
    "images/sponsors/zaman-1024x571.jpeg"
    "images/sponsors/future_right_v2-768x644.png"
    "images/sponsors/Jaspreet-768x621.png"
    "images/sponsors/ravi_jagtiani_new-1024x512.jpg"
    "images/sponsors/Andrew_Klink_2-scaled-1-768x432.jpeg"
    "images/sponsors/I-693_New-1024x683.jpeg"
    "images/sponsors/Mamta_logo_new-scaled-1-768x512.jpg"
    "images/sponsors/ramez_tabri_updated.jpg"
    "images/sponsors/first_bank.png"
    "images/sponsors/rosalind_chin.png"
    "images/common/baybasi-logo.png"
    "images/events/cards/boishakhi.svg"
    "images/events/cards/town-hall.svg"
    "images/events/cards/dandiya-night-2026.png"
    "images/events/cards/iman-chakraborty-concert-2026.png"
    "images/events/cards/dandiya-night-2026-hero.png"
    "images/events/cards/durga-puja-2026-hero.png"
    "images/events/cards/iman-chakraborty-concert-2026-hero.png"
    "images/events/cards/soccer-world-cup-final-watch-party-2026-hero.png"
    "images/events/cards/picnic.svg"
    "images/events/cards/picnic-2026-hero.png"
    "images/events/cards/durga-puja-2026.png"
    "images/events/cards/picnic-2026-banner.png"
    "images/events/flyers/autumn-fest.jpg"
    "images/events/flyers/spring-fest.jpg"
    "images/events/flyers/ultimate-final-watch-party-2026.jpeg"
    "images/events/flyers/holi.jpg"
    "images/events/flyers/picnic-2026.png"
    "assets/images/event-spring.svg"
    "assets/images/hero-festival.svg"
    "assets/images/event-diwali.svg"
    "assets/images/baybasi-logo-placeholder.svg"
    "assets/images/hero-culture.svg"
    "assets/images/volunteer-placeholder.svg"
    "assets/images/event-autumn.svg"
    "assets/images/event-holi.svg"
    "assets/images/charity-placeholder.svg"
    "assets/images/hero-impact.svg"
    "ebiw-768x122.png"
    "kw_PHOTO-2022-09-12-21-14-21.jpg"
    "gama_ride_working-1.png"
    "WhatsApp-Image-2023-10-20-at-2.22.33-PM-1024x1018.jpeg"
    "zaman-1024x571.jpeg"
    "future_right_v2-768x644.png"
    "Jaspreet-768x621.png"
    "ravi_jagtiani_new-1024x512.jpg"
    "Andrew_Klink_2-scaled-1-768x432.jpeg"
    "I-693_New-1024x683.jpeg"
    "Mamta_logo_new-scaled-1-768x512.jpg"
    "ramez_tabri_updated.jpg"
    "first_bank.png"
    "rosalind_chin.png"
    "resources/admin/images/Andrew_Klink_2-scaled-1-768x432.jpeg"
    "resources/admin/images/BMO_Updated-768x440.png"
    "resources/admin/images/I-693_New-1024x683.jpeg"
    "resources/admin/images/Jaspreet-768x621.png"
    "resources/admin/images/Mamta_logo_new-scaled-1-768x512.jpg"
    "resources/admin/images/WhatsApp-Image-2023-10-20-at-2.22.33-PM-1024x1018.jpeg"
    "resources/admin/images/about-hero-community.png"
    "resources/admin/images/boishakhi.svg"
    "resources/admin/images/director-manjira-datta.png"
    "resources/admin/images/director-nilanjan-debroy.jpg"
    "resources/admin/images/director-prithwiraj-mitra.jpg"
    "resources/admin/images/director-raj-tiwari.jpg"
    "resources/admin/images/director-sukalyan-chakraborty.jpg"
    "resources/admin/images/director-suman-debnath.jpg"
    "resources/admin/images/director-swati-chakraborty.jpg"
    "resources/admin/images/durga-puja-2026.png"
    "resources/admin/images/ebiw-768x122.png"
    "resources/admin/images/first_bank.png"
    "resources/admin/images/future_right_v2-768x644.png"
    "resources/admin/images/gama_ride_working-1.png"
    "resources/admin/images/holi.jpg"
    "resources/admin/images/iman-chakraborty-concert-2026.png"
    "resources/admin/images/impact-hero-community.png"
    "resources/admin/images/indian_grocery_image001.png"
    "resources/admin/images/kw_PHOTO-2022-09-12-21-14-21.jpg"
    "resources/admin/images/picnic-2026-hero.png"
    "resources/admin/images/ramez_tabri_updated.jpg"
    "resources/admin/images/ravi_jagtiani_new-1024x512.jpg"
    "resources/admin/images/rosalind_chin.png"
    "resources/admin/images/spring-fest.jpg"
    "resources/admin/images/town-hall.svg"
    "resources/admin/images/zaman-1024x571.jpeg"
  )
  local dirs=(
    "images/events/flyers"
    "images/events/cards"
    "images/events"
    "images/common"
    "images/sponsors"
    "images/about"
    "images/impacts"
    "images/heroes"
    "images/home"
    "images"
    "assets/images"
    "assets"
    "resources/admin/images"
    "resources/admin"
  )

  for path in "${paths[@]}"; do
    printf -- '-rm %s\n' "$(sftp_quote "$path")"
  done
  for dir in "${dirs[@]}"; do
    printf -- '-rmdir %s\n' "$(sftp_quote "$dir")"
  done
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

if [ "$BLUEHOST_CLEAN_LEGACY_MEDIA" = "1" ]; then
  emit_legacy_media_cleanup >> "$BATCH_FILE"
fi

if [ "$BLUEHOST_CLEAN_DOCS" = "1" ]; then
  emit_docs_cleanup >> "$BATCH_FILE"
fi

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
if [ "$BLUEHOST_CLEAN_LEGACY_MEDIA" = "1" ]; then
  echo "Legacy media cleanup enabled: removing old remote images/, assets/, and loose media files after resources/ uploads."
else
  echo "Legacy media cleanup disabled: old remote images/, assets/, and loose media files will be left in place."
fi
if [ "$BLUEHOST_CLEAN_DOCS" = "1" ]; then
  echo "Docs cleanup enabled: removing any old remote docs/ GitHub Pages copy after upload."
else
  echo "Docs cleanup disabled: old remote docs/ folder will be left in place."
fi
if [ "$BLUEHOST_CLEAN_OLD" = "1" ]; then
  echo "Cleanup mode enabled: removing old non-WordPress demo HTML files after upload."
else
  echo "Cleanup mode disabled: existing WordPress and legacy files will be left in place."
fi

sftp -P "$BLUEHOST_PORT" -b "$BATCH_FILE" "${BLUEHOST_USER}@${BLUEHOST_HOST}"

echo "Upload complete."
