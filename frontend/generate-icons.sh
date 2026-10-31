#!/bin/sh
[ -f prod.env ] && . ./prod.env

set -e
IMG="${1:-$IMG}"
: "${IMG:? Either set the IMG environment variable or pass it as a parameter}"
SVG=$IMG/icon.svg
PWA_ICON_BG="${PWA_ICON_BG:-#4f1848}"

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo rsvg-convert is required
  exit 127
fi

echo "Converting $SVG to PNG icons..."

rsvg-convert -w 192 -h 192 "$SVG" -o "$IMG/icon-192.png"
rsvg-convert -w 512 -h 512 "$SVG" -o "$IMG/icon-512.png"
rsvg-convert -w 96  -h 96  "$SVG" -o "$IMG/icon-96.png"

rsvg-convert -w 350 -h 350 --page-width 512 --page-height 512 --left 81 --top 81 \
  --background-color "$PWA_ICON_BG" "$SVG" -o "$IMG/icon-maskable-512.png"

rsvg-convert -w 144 -h 144 --page-width 180 --page-height 180 --left 18 --top 18 \
  --background-color "$PWA_ICON_BG" "$SVG" -o "$IMG/apple-touch-icon.png"

echo Conversion complete