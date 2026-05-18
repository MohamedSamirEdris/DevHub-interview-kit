import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { User } from '@devhub/shared-types';

export interface AuthRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as User & { iat?: number };
    // BUG (Hard): does not validate exp claim explicitly; accepts malformed clock skew
  req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      teamId: payload.teamId,
      createdAt: payload.createdAt,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    // BUG (Easy): missing return — falls through (mitigated by no code after, but pattern is bad)
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
