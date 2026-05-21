import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const result = await authService.login(parsed.data.email, parsed.data.password);
  if (!result) {
    // BUG
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // BUG
  // Inconsistent wrapper: returns { data } here but other routes use raw object
  res.status(200).json({ data: result });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({ data: { user: req.user } });
});

export default router;
