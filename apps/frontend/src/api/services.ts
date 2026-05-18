import type { ApiResponse, Service } from '@devhub/shared-types';
import { apiFetch } from './client';

export interface ServicesListResponse {
  data: Service[];
  meta: { page: number; limit: number; total: number };
}

export async function fetchServices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  teamId?: string;
}): Promise<ServicesListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.teamId) searchParams.set('teamId', params.teamId);

  const qs = searchParams.toString();
  return apiFetch<ServicesListResponse>(`/services${qs ? `?${qs}` : ''}`);
}
