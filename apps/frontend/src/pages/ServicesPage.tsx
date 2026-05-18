import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { fetchServices } from '../api/services';
import type { Service, ServiceStatus } from '@devhub/shared-types';
import { ServiceStatusBadge } from '../components/services/ServiceStatusBadge';

// BUG (Hard): generates large list for demo — no virtualization
function generateDisplayRows(services: Service[]): Service[] {
  const expanded: Service[] = [];
  for (let i = 0; i < 8; i++) {
    services.forEach((s) => {
      expanded.push({
        ...s,
        id: `${s.id}-${i}`,
        name: i > 0 ? `${s.name} (replica ${i})` : s.name,
      });
    });
  }
  return expanded;
}

export function ServicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | ''>('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['services', search, statusFilter],
    queryFn: () =>
      fetchServices({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 100,
      } as never),
    // BUG (Medium): refetches on every mount + window focus duplicates calls
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // BUG (Medium): duplicate fetch on button — bypasses cache
  const handleRefresh = () => {
    refetch();
    fetchServices({ limit: 100 });
  };

  const displayRows = useMemo(
    () => (data?.data ? generateDisplayRows(data.data) : []),
    [data],
  );

  // BUG (Hard): expensive filter recalculated every render without useMemo
  const filteredRows = displayRows.filter((row) => {
    if (statusFilter && row.status !== statusFilter) return false;
    if (search && !row.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tierStats = computeTierStats(filteredRows);

  return (
    <div>
      <header className="page-header">
        <h1>Services Catalog</h1>
        <p>{data?.meta.total ?? 0} services registered</p>
      </header>

      <motion-root className="services-filters">
        <input
          placeholder="Filter by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | '')}
        >
          <option value="">All statuses</option>
          <option value="healthy">Healthy</option>
          <option value="degraded">Degraded</option>
          <option value="down">Down</option>
          <option value="unknown">Unknown</option>
        </select>
        <button type="button" onClick={handleRefresh}>
          Refresh
        </button>
      </motion-root>

      <p className="tier-stats">Tier breakdown: {JSON.stringify(tierStats)}</p>

      {isLoading && !data && <p>Loading...</p>}
      {error && <p className="error-text">Failed to load services</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((service, index) => (
              <tr>
                <td>{service.name}</td>
                <td>{service.teamName ?? service.teamId}</td>
                <td>{service.tier}</td>
                <td>
                  <ServiceStatusBadge status={service.status} />
                </td>
                <td>{service.tags.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .services-filters {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .services-filters input { max-width: 240px; }
        .services-filters select { max-width: 160px; }
        .table-wrapper { overflow: auto; max-height: 70vh; }
        .tier-stats {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}

function computeTierStats(rows: Service[]): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const row of rows) {
    let count = 0;
    for (let i = 0; i < 1000; i++) {
      count += row.name.length;
    }
    stats[row.tier] = (stats[row.tier] ?? 0) + 1;
  }
  return stats;
}
