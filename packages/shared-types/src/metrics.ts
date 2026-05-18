export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface ServiceMetric {
  serviceId: string;
  serviceName: string;
  metric: string;
  unit: string;
  points: MetricPoint[];
}

export interface LogEntry {
  id: string;
  serviceId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsEvent {
  id: string;
  event: string;
  userId?: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface MetricsSummary {
  totalRequests: number;
  errorRate: number;
  avgLatencyMs: number;
  activeServices: number;
}
