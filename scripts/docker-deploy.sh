#!/usr/bin/env bash
# Build and run the admin production image (static dist + nginx).
#
# Usage:
#   cp .env.docker.example .env.docker
#   nano .env.docker
#   ./scripts/docker-deploy.sh
#
# Or pass API URL directly:
#   VITE_API_BASE_URL=http://1.2.3.4:3000/api ./scripts/docker-deploy.sh

set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env.docker"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

API_URL="${VITE_API_BASE_URL:-}"
if [ -z "$API_URL" ]; then
  echo "Set VITE_API_BASE_URL in .env.docker or pass it as an env var."
  echo "  cp .env.docker.example .env.docker"
  exit 1
fi

PORT="${ADMIN_PORT:-5137}"
IMAGE="caretracker-admin:latest"

echo "Building image (API: $API_URL)..."
docker build -t "$IMAGE" --build-arg "VITE_API_BASE_URL=$API_URL" .

docker stop caretracker-admin 2>/dev/null || true
docker rm caretracker-admin 2>/dev/null || true

echo "Starting container on port $PORT..."
docker run -d \
  --name caretracker-admin \
  --restart unless-stopped \
  -p "${PORT}:5137" \
  "$IMAGE"

echo ""
echo "Admin app running at http://localhost:${PORT}"
echo "Logs: docker logs -f caretracker-admin"
