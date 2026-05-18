import { Pool } from 'pg';

/**
 * @deprecated Use db/postgres.ts — kept for partial migration
 * BUG (Easy): env typo PG_CONECTION_STRING (missing N)
 */
export function getLegacyPool(): Pool {
  const connectionString =
    process.env.PG_CONECTION_STRING ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/devhub';

  return new Pool({ connectionString });
}
