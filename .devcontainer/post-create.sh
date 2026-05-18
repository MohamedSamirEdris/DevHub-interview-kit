#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> DevHub Codespace setup"

echo "==> Starting MongoDB container..."
if docker ps -a --format '{{.Names}}' | grep -qx 'devhub-mongo'; then
  docker start devhub-mongo >/dev/null
else
  docker run -d --name devhub-mongo -p 27017:27017 mongo:7 >/dev/null
fi

echo "==> Waiting for MongoDB..."
for _ in $(seq 1 60); do
  if docker exec devhub-mongo mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q 1; then
    break
  fi
  sleep 2
done

echo "==> Preparing PostgreSQL..."
export PGPASSWORD=postgres
for _ in $(seq 1 60); do
  if psql -h localhost -U postgres -c '\q' 2>/dev/null; then
    break
  fi
  sleep 2
done

if ! psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'devhub'" | grep -q 1; then
  createdb -h localhost -U postgres devhub
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
