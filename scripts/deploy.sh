#!/usr/bin/env bash
# Build locally and upload dist/ to the server (no Docker).
#
# Usage:
#   ./scripts/deploy.sh root@YOUR_SERVER_IP
#
# Optional env:
#   REMOTE_PATH=/var/www/CareTracker-frontend/dist

set -euo pipefail

SERVER="${1:-}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/CareTracker-frontend/dist}"

if [ -z "$SERVER" ]; then
  echo "Usage: ./scripts/deploy.sh user@server"
  echo "Example: ./scripts/deploy.sh root@123.45.67.89"
  exit 1
fi

SCRIPT_DIR="$(dirname "$0")"
"$SCRIPT_DIR/build-prod.sh"

echo "Uploading dist/ → $SERVER:$REMOTE_PATH"
ssh "$SERVER" "mkdir -p $REMOTE_PATH"
rsync -avz --delete dist/ "$SERVER:$REMOTE_PATH/"

echo ""
echo "Deployed. Ensure nginx root points to: $REMOTE_PATH"
echo "  sudo nginx -t && sudo systemctl reload nginx"
