import type { Team } from '@devhub/shared-types';

interface TeamCardProps {
  team: Team;
  selected: boolean;
  onSelect: () => void;
}

export function TeamCard({ team, selected, onSelect }: TeamCardProps) {
  return (
    <button
      type="button"
      className={`card team-card ${selected ? 'team-card--selected' : ''}`}
      onClick={onSelect}
    >
      <h3>{team.name}</h3>
      <p className="team-card__slug">/{team.slug}</p>
      {team.description && <p className="team-card__desc">{team.description}</p>}
      <span className="team-card__count">{team.memberCount} members</span>

      <style>{`
        .team-card {
          text-align: left;
          width: 100%;
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
        }
        .team-card--selected {
          border-color: var(--accent);
        }
        .team-card__slug {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .team-card__desc {
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }
        .team-card__count {
          font-size: 0.8rem;
          color: var(--accent);
        }
      `}</style>
    </button>
  );
}
