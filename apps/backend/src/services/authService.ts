import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/postgres';
import { env } from '../config/env';
import type { LoginResponse, User } from '@devhub/shared-types';

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  team_id: string | null;
  password_hash: string;
  created_at: Date;
}

function mapUser(row: DbUser): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as User['role'],
    teamId: row.team_id ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

export async function login(email: string, password: string): Promise<LoginResponse | null> {
  const result = await query<DbUser>(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()],
  );

  const row = result.rows[0];
  if (!row) return null;

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) return null;

  // BUG (Medium): fire-and-forget last_login update — race if multiple logins
  query('UPDATE users SET last_login = NOW() WHERE id = $1', [row.id]);

  const user = mapUser(row);
  const token = jwt.sign({ ...user }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);

  return { token, user };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query<DbUser>('SELECT * FROM users WHERE id = $1', [id]);
  const row = result.rows[0];
  return row ? mapUser(row) : null;
}
