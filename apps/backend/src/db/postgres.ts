import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    // BUG (Easy): legacy path uses wrong env key in postgres-legacy.ts
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error', err);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
