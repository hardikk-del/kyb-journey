#!/usr/bin/env bash
# Build the web app for static hosting (Netlify, etc.).
#
# Expo exports its bundled font/router assets under `dist/assets/node_modules/…`,
# and Netlify silently drops anything under a `node_modules/` path on deploy —
# which 404s every font (they come back as the SPA index.html, hence the
# "invalid sfntVersion / failed to decode font" console errors). This script
# exports, then relocates those assets to `dist/assets/vendor/…` and rewrites the
# references so nothing lives under a `node_modules/` path.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "› Exporting web build…"
rm -rf dist
npx expo export -p web

# SPA fallback so deep links / refreshes resolve to index.html on static hosts.
printf '/*    /index.html   200\n' > dist/_redirects

# Move Expo's bundled assets out of the node_modules/ path (Netlify strips it).
if [ -d dist/assets/node_modules ]; then
  echo "› Patching asset paths (node_modules → vendor) for Netlify…"
  mv dist/assets/node_modules dist/assets/vendor
  grep -rl "assets/node_modules" dist 2>/dev/null | while read -r f; do
    sed -i '' 's#assets/node_modules#assets/vendor#g' "$f"
  done
fi

echo "✓ Web build ready in ./dist (fonts patched). Deploy this folder."
