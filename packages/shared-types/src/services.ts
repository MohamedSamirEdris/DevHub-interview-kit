export type ServiceTier = 'tier-1' | 'tier-2' | 'tier-3';
export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  teamId: string;
  teamName?: string;
  tier: ServiceTier;
  status: ServiceStatus;
  repositoryUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface ServiceFilter {
  teamId?: string;
  tier?: ServiceTier;
  status?: ServiceStatus;
  search?: string;
}
