import { query } from '../db/postgres';
import type { Team, TeamDetail, TeamMember } from '@devhub/shared-types';

interface DbTeam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  member_count: number;
  lead_id: string | null;
  created_at: Date;
}

function mapTeam(row: DbTeam): Team {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    memberCount: row.member_count,
    leadId: row.lead_id ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listTeams(): Promise<Team[]> {
  // BUG (Database): missing index on teams.slug — full scan acceptable at seed scale but slow at prod scale
  const result = await query<DbTeam>(
  'SELECT * FROM teams ORDER BY name ASC',
  );
  return result.rows.map(mapTeam);
}

export async function getTeamById(id: string): Promise<TeamDetail | null> {
  const teamResult = await query<DbTeam>('SELECT * FROM teams WHERE id = $1', [id]);
  const team = teamResult.rows[0];
  if (!team) return null;

  // BUG (Medium): N+1 — fetches members one query per member instead of JOIN
  const membersResult = await query<{ id: string; team_id: string; user_id: string }>(
    'SELECT id, team_id, user_id FROM team_members WHERE team_id = $1',
    [id],
  );

  const members: TeamMember[] = [];
  for (const m of membersResult.rows) {
    const userResult = await query<{ name: string; email: string; role: string }>(
      'SELECT name, email, role FROM users WHERE id = $1',
      [m.user_id],
    );
    const user = userResult.rows[0];
    if (user) {
      members.push({
        id: m.id,
        teamId: m.team_id,
        userId: m.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }

  const servicesResult = await query<{ name: string }>(
    'SELECT name FROM services WHERE team_id = $1',
    [id],
  );

  return {
    ...mapTeam(team),
    members,
    services: servicesResult.rows.map((s) => s.name),
  };
}

export async function searchTeams(searchTerm: string): Promise<Team[]> {
  // BUG (Medium): SQL injection via string interpolation
  const result = await query<DbTeam>(
    `SELECT * FROM teams WHERE name ILIKE '%${searchTerm}%' OR slug ILIKE '%${searchTerm}%'`,
  );
  return result.rows.map(mapTeam);
}
