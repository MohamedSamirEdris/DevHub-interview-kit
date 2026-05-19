#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Ensure MongoDB is running after codespace sleep/resume
if docker ps -a --format '{{.Names}}' | awk '$0 == "devhub-mongo" { found = 1 } END { exit !found }'; then
  docker start devhub-mongo >/dev/null 2>&1 || true
fi

# Start dev servers once (postStart runs on every resume)
if pgrep -f "@devhub/frontend" >/dev/null 2>&1 || pgrep -f "vite" >/dev/null 2>&1; then
  exit 0
fi

echo "==> Starting DevHub (npm run dev)..."
nohup npm run dev > /tmp/devhub-dev.log 2>&1 &
disown || true

echo "    App: port 5173 (Ports tab → Open in Browser)"
echo "    Logs: /tmp/devhub-dev.log"
