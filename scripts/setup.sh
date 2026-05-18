#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> DevHub Interview Kit setup"

if ! command -v node &>/dev/null; then
  echo "Error: Node.js 18+ is required."
  exit 1
fi

echo "==> Installing dependencies..."
npm install

echo "==> Building shared types..."
npm run build -w @devhub/shared-types

if [ ! -f apps/backend/.env ]; then
  echo "==> Creating apps/backend/.env from example..."
  cp apps/backend/.env.example apps/backend/.env
fi

if [ ! -f apps/frontend/.env ]; then
  cp apps/frontend/.env.example apps/frontend/.env
fi

echo ""
echo "Setup complete."
echo ""
echo "  Interview / take-home (recommended):"
echo "    npm run interview"
echo ""
echo "  Local dev without Docker:"
echo "    1. Start PostgreSQL and MongoDB"
echo "    2. npm run db:migrate && npm run seed && npm run dev"
echo ""
echo "See docs/INTERVIEW_SETUP.md for interviewer options."
