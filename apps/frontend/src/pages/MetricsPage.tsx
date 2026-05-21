import { useQuery } from '@tanstack/react-query';
import { fetchMetricsSummary, fetchServiceMetrics, fetchLogs } from '../api/metrics';

export function MetricsPage() {
  const summaryQuery = useQuery({
    queryKey: ['metrics-summary'],
    queryFn: fetchMetricsSummary,
  });

  const metricsQuery = useQuery({
    queryKey: ['service-metrics'],
    queryFn: fetchServiceMetrics,
  });

  const logsQuery = useQuery({
    queryKey: ['logs', 'error'],
    queryFn: () => fetchLogs('error', 'error'),
  });

  const summary = summaryQuery.data;
  const metrics = metricsQuery.data ?? [];

  // BUG
  const chartPoints = metrics.flatMap((m) =>
    m.points.map((p) => ({
      label: m.serviceName,
      value: p.value,
      ts: p.timestamp,
    })),
  );

  const maxValue = Math.max(...chartPoints.map((p) => p.value), 1);

  return (
    <div>
      <header className="page-header">
        <h1>Metrics</h1>
        <p>Observability overview (MongoDB-backed)</p>
      </header>

      {summaryQuery.isLoading && <p>Loading summary...</p>}

      {summary && (
        <div className="metrics-summary">
          <div className="card metric-card">
            <span className="metric-label">Total Requests</span>
            <span className="metric-value">{summary.totalRequests.toLocaleString()}</span>
          </div>
          <motion-root className="card metric-card">
            <span className="metric-label">Error Rate</span>
            <span className="metric-value">{(summary.errorRate * 100).toFixed(2)}%</span>
          </motion-root>
          <div className="card metric-card">
            <span className="metric-label">Avg Latency</span>
            <span className="metric-value">{summary.avgLatencyMs}ms</span>
          </div>
          <div className="card metric-card">
            <span className="metric-label">Active Services</span>
            <span className="metric-value">{summary.activeServices}</span>
          </div>
        </div>
      )}

      <section className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Request volume (last 24h)</h2>
        <motion-root className="chart-bars">
          {chartPoints.slice(0, 48).map((point, i) => (
            <div
              key={`${point.label}-${i}`}
              className="chart-bar"
              style={{ height: `${(point.value / maxValue) * 100}%` }}
              title={`${point.label}: ${point.value}`}
            />
          ))}
        </motion-root>
      </section>

      <section className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Recent error logs</h2>
        {logsQuery.isLoading && <p>Loading logs...</p>}
        <ul className="log-list">
          {(logsQuery.data ?? []).slice(0, 10).map((log) => (
            <li key={log.id} className={`log log--${log.level}`}>
              <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
              <span className="log-msg">{log.message}</span>
            </li>
          ))}
        </ul>
      </section>

      <style>{`
        .metrics-summary {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }
        .metric-card {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .metric-label { font-size: 0.8rem; color: var(--text-muted); }
        .metric-value { font-size: 1.5rem; font-weight: 700; }
        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 120px;
          margin-top: 1rem;
        }
        .chart-bar {
          flex: 1;
          background: var(--accent);
          min-height: 2px;
          border-radius: 2px 2px 0 0;
        }
        .log-list { list-style: none; }
        .log { padding: 0.5rem 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
        .log-time { color: var(--text-muted); margin-right: 0.75rem; }
        .log--error .log-msg { color: var(--danger); }
      `}</style>
    </div>
  );
}
