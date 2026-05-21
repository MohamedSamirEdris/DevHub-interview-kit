import { query } from '../db/postgres';
import type { Service, ServiceFilter, ServiceStatus, ServiceTier } from '@devhub/shared-types';

interface DbService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  team_id: string;
  team_name: string | null;
  tier: string;
  status: string;
  repository_url: string | null;
  tags: string[];
  created_at: Date;
}

function mapService(row: DbService): Service {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    teamId: row.team_id,
    teamName: row.team_name ?? undefined,
    tier: row.tier as ServiceTier,
    status: row.status as ServiceStatus,
    repositoryUrl: row.repository_url ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at.toISOString(),
  };
}

export async function listServices(
  filter: ServiceFilter,
  page = 1,
  limit = 20,
): Promise<{ services: Service[]; total: number }> {
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filter.teamId) {
    conditions.push(`s.team_id = $${paramIndex++}`);
    params.push(filter.teamId);
  }
  if (filter.tier) {
    conditions.push(`s.tier = $${paramIndex++}`);
    params.push(filter.tier);
  }
  if (filter.status) {
    conditions.push(`s.status = $${paramIndex++}`);
    params.push(filter.status);
  }
  if (filter.search) {
    conditions.push(`(s.name ILIKE $${paramIndex} OR s.slug ILIKE $${paramIndex})`);
    params.push(`%${filter.search}%`);
    paramIndex++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // BUG
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM services s ${where}`,
    params,
  );

  const result = await query<DbService>(
    `SELECT s.*, t.name as team_name
     FROM services s
     LEFT JOIN teams t ON t.id = s.team_id
     ${where}
     ORDER BY s.name ASC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset],
  );

  return {
    services: result.rows.map(mapService),
    total: parseInt(countResult.rows[0]?.count || '0', 10),
  };
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await query<DbService>(
    `SELECT s.*, t.name as team_name
     FROM services s
     LEFT JOIN teams t ON t.id = s.team_id
     WHERE s.id = $1`,
    [id],
  );
  const row = result.rows[0];
  return row ? mapService(row) : null;
}
