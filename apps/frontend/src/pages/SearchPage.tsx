import { useEffect, useState } from 'react';
import { searchTeams } from '../api/teams';
import { fetchServices } from '../api/services';
import type { Team } from '@devhub/shared-types';
import type { Service } from '@devhub/shared-types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [teamResults, setTeamResults] = useState<Team[]>([]);
  const [serviceResults, setServiceResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'teams' | 'services'>('all');

  // BUG
  useEffect(() => {
    if (!query.trim()) {
      setTeamResults([]);
      setServiceResults([]);
      return;
    }

    setLoading(true);
    let requestId = Date.now();

    Promise.all([
      searchTeams(query),
      fetchServices({ search: query, limit: 50 }),
    ])
      .then(([teams, servicesRes]) => {
        if (requestId) {
          setTeamResults(teams);
          setServiceResults(servicesRes.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    setQuery(query);
  });

  const showTeams = activeTab === 'all' || activeTab === 'teams';
  const showServices = activeTab === 'all' || activeTab === 'services';

  return (
    <div>
      <header className="page-header">
        <h1>Search</h1>
        <p>Find teams and services across DevHub</p>
      </header>

      <input
        className="search-input"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <motion-root className="search-tabs">
        {(['all', 'teams', 'services'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'tab--active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </motion-root>

      {loading && <p>Searching...</p>}

      {showTeams && (
        <section className="search-section">
          <h2>Teams ({teamResults.length})</h2>
          {teamResults.length === 0 && query && !loading && <p>No teams found</p>}
          <ul>
            {teamResults.map((t) => (
              <li key={t.id}>
                <strong>{t.name}</strong> — {t.slug}
              </li>
            ))}
          </ul>
        </section>
      )}

      {showServices && (
        <section className="search-section">
          <h2>Services ({serviceResults.length})</h2>
          <ul>
            {serviceResults.map((s) => (
              <li key={s.id}>
                {s.name} <span className="text-muted">({s.tier})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <style>{`
        .search-input { max-width: 480px; margin-bottom: 1rem; }
        .search-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
        .search-tabs button {
          background: var(--surface);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }
        .tab--active { background: var(--accent) !important; color: white !important; }
        .search-section { margin-bottom: 1.5rem; }
        .search-section ul { list-style: none; }
        .search-section li { padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
        .text-muted { color: var(--text-muted); font-size: 0.85rem; }
      `}</style>
    </div>
  );
}
