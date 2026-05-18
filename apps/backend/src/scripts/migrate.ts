import { getPool, closePool } from '../db/postgres';

const migrations = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'engineer',
  team_id UUID,
  password_hash VARCHAR(255) NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  lead_id UUID,
  team_name_dup VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BUG (Database): slug should be UNIQUE but only plain index — allows duplicates
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(team_id, user_id)
);

-- BUG (Database): missing index on team_members.team_id for N+1 lookups
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  team_id UUID NOT NULL REFERENCES teams(id),
  team_name VARCHAR(255),
  tier VARCHAR(50) NOT NULL DEFAULT 'tier-2',
  status VARCHAR(50) NOT NULL DEFAULT 'healthy',
  repository_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_team_id ON services(team_id);
`;

async function migrate() {
  const pool = getPool();
  console.log('Running PostgreSQL migrations...');
  await pool.query(migrations);
  console.log('Migrations complete.');
  await closePool();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
