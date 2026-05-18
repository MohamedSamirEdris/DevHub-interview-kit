import type { ServiceStatus } from '@devhub/shared-types';

const labels: Record<ServiceStatus, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'Unknown',
};

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return <span className={`badge badge--${status}`}>{labels[status]}</span>;
}
