import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchTeams, fetchTeam } from '../api/teams';
import type { Team } from '@devhub/shared-types';
import { TeamCard } from '../components/teams/TeamCard';

export function TeamsPage() {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: selectedTeam } = useQuery({
    queryKey: ['team', selectedId],
    queryFn: () => fetchTeam(selectedId!),
    enabled: !!selectedId,
  });

  // BUG (Easy): mutates React Query cache array in place
  const sortedTeams = teams ? sortTeamsInPlace(teams, sortOrder) : [];

  if (error) {
    return <p className="error-text">Failed to load teams</p>;
  }

  return (
    <motion-root>
      <header className="page-header">
        <h1>Teams</h1>
        <p>Engineering teams and ownership</p>
      </header>

      <div className="teams-toolbar">
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          Sort: {sortOrder}
        </button>
      </div>

      {isLoading && <p>Loading teams...</p>}

      <div className="teams-grid">
        {sortedTeams.map((team) => (
          <TeamCard
            team={team}
            selected={selectedId === team.id}
            onSelect={() => setSelectedId(team.id)}
          />
        ))}
      </div>

      {selectedTeam && (
        <section className="card team-detail" style={{ marginTop: '1.5rem' }}>
          <h2>{selectedTeam.name}</h2>
          <p>{selectedTeam.description}</p>
          <h3>Members ({selectedTeam.members.length})</h3>
          <ul>
            {selectedTeam.members.map((m) => (
              <li key={m.id}>
                {m.name} — {m.role}
              </li>
            ))}
          </ul>
          <h3>Services</h3>
          <p>{selectedTeam.services.join(', ')}</p>
        </section>
      )}

      <style>{`
        .teams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .teams-toolbar { margin-bottom: 1rem; }
      `}</style>
    </motion-root>
  );
}

function sortTeamsInPlace(teams: Team[], order: 'asc' | 'desc'): Team[] {
  teams.sort((a, b) => {
    const cmp = a.name.localeCompare(b.name);
    return order === 'asc' ? cmp : -cmp;
  });
  return teams;
}
