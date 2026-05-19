#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> DevHub Codespace setup"

echo "==> Starting PostgreSQL container..."
if docker ps -a --format '{{.Names}}' | awk '$0 == "devhub-postgres" { found = 1 } END { exit !found }'; then
  docker start devhub-postgres >/dev/null
else
  docker run -d --name devhub-postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=devhub \
    -p 5432:5432 \
    postgres:16-alpine >/dev/null
fi

echo "==> Starting MongoDB container..."
if docker ps -a --format '{{.Names}}' | awk '$0 == "devhub-mongo" { found = 1 } END { exit !found }'; then
  docker start devhub-mongo >/dev/null
else
  docker run -d --name devhub-mongo -p 27017:27017 mongo:7 >/dev/null
fi

echo "==> Waiting for PostgreSQL..."
postgres_ready=false
for _ in $(seq 1 60); do
  if docker exec devhub-postgres pg_isready -U postgres -d devhub >/dev/null 2>&1; then
    postgres_ready=true
    break
  fi
  sleep 2
done
if [ "$postgres_ready" != true ]; then
  echo "ERROR: PostgreSQL did not become ready. Re-run: bash .devcontainer/post-create.sh" >&2
  exit 1
fi

if [ "$(docker exec devhub-postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'devhub'" 2>/dev/null || true)" != "1" ]; then
  docker exec devhub-postgres createdb -U postgres devhub
fi

echo "==> Waiting for MongoDB..."
mongo_ready=false
for _ in $(seq 1 60); do
  if [ "$(docker exec devhub-mongo mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null || true)" = "1" ]; then
    mongo_ready=true
    break
  fi
  sleep 2
done
if [ "$mongo_ready" != true ]; then
  echo "ERROR: MongoDB did not become ready. Re-run: bash .devcontainer/post-create.sh" >&2
  exit 1
fi

echo "==> Writing apps/backend/.env..."
cat > apps/backend/.env <<'EOF'
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devhub
PG_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/devhub
MONGODB_URI=mongodb://127.0.0.1:27017/devhub
JWT_SECRET=devhub-interview-secret-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
EOF

if [ ! -f apps/frontend/.env ]; then
  cp apps/frontend/.env.example apps/frontend/.env
fi

echo "==> Installing npm dependencies..."
npm install

echo "==> Migrating and seeding..."
npm run db:migrate
npm run seed

echo ""
echo "✓ Codespace ready. After the editor opens, DevHub starts automatically."
echo "  Open port 5173 → login: engineer@devhub.local / devhub123"
