import type { Team, TeamDetail } from '@devhub/shared-types';
import { apiFetch } from './client';

export async function fetchTeams(): Promise<Team[]> {
  // BUG (Medium): teams endpoint returns raw array, not { data } — works but inconsistent
  return apiFetch<Team[]>('/teams');
}

export async function fetchTeam(id: string): Promise<TeamDetail> {
  const res = await apiFetch<{ data: TeamDetail }>(`/teams/${id}`);
  return res.data;
}

export async function searchTeams(q: string): Promise<Team[]> {
  const res = await apiFetch<{ data: Team[] }>(`/teams/search?q=${encodeURIComponent(q)}`);
  return res.data;
}
