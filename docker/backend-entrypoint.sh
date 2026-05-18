#!/bin/sh
set -e

cd /app

echo "==> Waiting for databases..."
until node -e "
  const { Client } = require('pg');
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  c.connect().then(() => c.end()).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 1
done

until node -e "
  const { MongoClient } = require('mongodb');
  MongoClient.connect(process.env.MONGODB_URI)
    .then((c) => c.close())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 1
done

echo "==> Running migrations and seed..."
npm run db:migrate -w @devhub/backend
npm run seed -w @devhub/backend

echo "==> Starting API..."
exec npm run dev -w @devhub/backend
