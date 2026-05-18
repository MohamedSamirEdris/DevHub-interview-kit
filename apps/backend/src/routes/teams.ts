import { Router, Response } from 'express';
import * as teamService from '../services/teamService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const teams = await teamService.listTeams();
  // BUG (Medium): inconsistent response — no data wrapper
  res.json(teams);
});

router.get('/search', async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string) || '';
  const teams = await teamService.searchTeams(q);
  res.json({ data: teams });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const team = await teamService.getTeamById(req.params.id);
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }
  res.json({ data: team });
});

export default router;
