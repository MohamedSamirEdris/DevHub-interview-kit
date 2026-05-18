export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'engineer' | 'viewer';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthSession {
  user: User;
  token: string;
}
