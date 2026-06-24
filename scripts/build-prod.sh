#!/usr/bin/env bash
# Build the admin app for production.
# Output: admin/dist/  (upload this folder to your server)

set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.production ]; then
  echo "Create .env.production first:"
  echo "  cp .env.production.example .env.production"
  echo "  nano .env.production   # set VITE_API_BASE_URL to your backend"
  exit 1
fi

echo "Building with:"
grep VITE_API_BASE_URL .env.production || true
echo ""

npm ci
npm run build

echo ""
echo "Done. Upload the dist/ folder to your server:"
echo "  rsync -avz --delete dist/ root@YOUR_SERVER:/var/www/CareTracker-frontend/dist/"
echo ""
echo "Or build directly on the server (git pull + npm run build)."
