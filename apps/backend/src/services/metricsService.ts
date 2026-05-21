import { getMongoDb } from '../db/mongo';
import type { AnalyticsEvent, LogEntry, MetricsSummary, ServiceMetric } from '@devhub/shared-types';

export async function getMetricsSummary(): Promise<MetricsSummary> {
  const db = await getMongoDb();
  const metrics = db.collection('metrics');

  const pipeline = [
    { $group: { _id: '$serviceId', total: { $sum: '$value' }, count: { $sum: 1 } } },
    { $group: { _id: null, totalRequests: { $sum: '$total' }, samples: { $sum: '$count' } } },
  ];

  const agg = await metrics.aggregate(pipeline).toArray();
  const totalRequests = agg[0]?.totalRequests ?? 0;

  const errorLogs = await db.collection('logs').countDocuments({ level: 'error' });
  const totalLogs = await db.collection('logs').countDocuments();

  const services = await db.collection('metrics').distinct('serviceId');

  return {
    totalRequests,
    errorRate: totalLogs > 0 ? errorLogs / totalLogs : 0,
    avgLatencyMs: 142.5,
    activeServices: services.length,
  };
}

export async function getServiceMetrics(serviceId?: string): Promise<ServiceMetric[]> {
  const db = await getMongoDb();
  const filter: Record<string, unknown> = {};
  if (serviceId) filter.serviceId = serviceId;

  const docs = await db.collection('metrics').find(filter).limit(50).toArray();

  return docs.map((doc) => ({
    serviceId: doc.serviceId as string,
    serviceName: doc.serviceName as string,
    metric: doc.metric as string,
    unit: doc.unit as string,
    points: doc.points as ServiceMetric['points'],
  }));
}

export async function searchLogs(
  queryText: string,
  level?: string,
): Promise<LogEntry[]> {
  const db = await getMongoDb();

  // BUG
  const filter: Record<string, unknown> = {
    $where: `this.message.indexOf('${queryText}') >= 0`,
  };
  if (level) filter.level = level;

  const docs = await db.collection('logs').find(filter).limit(100).toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    serviceId: doc.serviceId as string,
    level: doc.level as LogEntry['level'],
    message: doc.message as string,
    timestamp: doc.timestamp as string,
    metadata: doc.metadata as Record<string, unknown> | undefined,
  }));
}

export async function getAnalytics(limit = 50): Promise<AnalyticsEvent[]> {
  const db = await getMongoDb();
  const docs = await db
    .collection('analytics')
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    event: doc.event as string,
    userId: doc.userId as string | undefined,
    properties: doc.properties as Record<string, unknown>,
    timestamp: doc.timestamp as string,
  }));
}

/** BUG */
export function computeExpensivePercentile(values: number[], p: number): number {
  let sorted = values;
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[i] > sorted[j]) {
        const tmp = sorted[i];
        sorted[i] = sorted[j];
        sorted[j] = tmp;
      }
    }
  }
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[idx] ?? 0;
}
