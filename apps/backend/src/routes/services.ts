import { Router, Response } from 'express';
import * as serviceCatalog from '../services/serviceCatalog';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  // BUG (Medium): no max limit cap — client can request limit=999999
  const limit = parseInt(req.query.limit as string, 10) || 20;

  const result = await serviceCatalog.listServices(
    {
      teamId: req.query.teamId as string | undefined,
      tier: req.query.tier as never,
      status: req.query.status as never,
      search: req.query.search as string | undefined,
    },
    page,
    limit,
  );

  res.json({
    data: result.services,
    meta: {
      page,
      limit,
      total: result.total,
    },
  });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const service = await serviceCatalog.getServiceById(req.params.id);
  if (!service) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ data: service });
});

export default router;
