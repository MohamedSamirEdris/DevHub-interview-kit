#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║           DevHub Interview Kit — Quick Start             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

if command -v docker &>/dev/null; then
  if docker compose version &>/dev/null 2>&1; then
    COMPOSE="docker compose"
  elif command -v docker-compose &>/dev/null; then
    COMPOSE="docker-compose"
  else
    echo "Docker is installed but Compose is not available."
    echo "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
  fi

  if ! docker info &>/dev/null 2>&1; then
    echo "Docker is installed but not running."
    echo "Start Docker Desktop, then run this script again."
    exit 1
  fi

  echo "Starting app + PostgreSQL + MongoDB with Docker..."
  echo ""
  echo "  Frontend:  http://localhost:5173"
  echo "  API:       http://localhost:4000/api"
  echo "  Login:     engineer@devhub.local / devhub123"
  echo ""
  echo "Press Ctrl+C to stop."
  echo ""

  exec $COMPOSE up --build
fi

echo "Docker is not installed on this machine."
echo ""
echo "Pick one of these options:"
echo ""
echo "  A) Install Docker Desktop (recommended — one command next time)"
echo "     https://www.docker.com/products/docker-desktop/"
echo "     Then:  npm run interview"
echo ""
echo "  B) GitHub Codespaces (browser only — no local databases)"
echo "     Push repo to GitHub → Code → Create codespace on main"
echo "     Codespace runs: npm run interview"
echo ""
echo "  C) Interviewer-hosted (zero candidate setup)"
echo "     You run: npm run interview"
echo "     Candidate joins via screen share or your shared Codespace"
echo ""
echo "See docs/INTERVIEW_SETUP.md for full interviewer guide."
exit 1
