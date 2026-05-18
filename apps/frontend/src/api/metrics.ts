import type { AnalyticsEvent, LogEntry, MetricsSummary, ServiceMetric } from '@devhub/shared-types';
import { apiFetch } from './client';

export async function fetchMetricsSummary(): Promise<MetricsSummary> {
  const res = await apiFetch<{ data: MetricsSummary }>('/metrics/summary');
  return res.data;
}

export async function fetchServiceMetrics(): Promise<ServiceMetric[]> {
  const res = await apiFetch<{ data: ServiceMetric[] }>('/metrics');
  return res.data;
}

export async function fetchLogs(q: string, level?: string): Promise<LogEntry[]> {
  const params = new URLSearchParams({ q });
  if (level) params.set('level', level);
  const res = await apiFetch<{ data: LogEntry[] }>(`/metrics/logs?${params}`);
  return res.data;
}

export async function fetchAnalytics(): Promise<AnalyticsEvent[]> {
  const res = await apiFetch<{ data: AnalyticsEvent[] }>('/metrics/analytics');
  return res.data;
}
