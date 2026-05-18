import type { LoginRequest, LoginResponse, User } from '@devhub/shared-types';
import { apiFetch } from './client';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch<{ data: LoginResponse }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiFetch<{ data: { user: User } }>('/auth/me');
  return res.data.user;
}
