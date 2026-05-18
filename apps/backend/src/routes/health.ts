import { Router, Request, Response } from 'express';
import { query } from '../db/postgres';
import { getMongoDb } from '../db/mongo';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let postgres = 'ok';
  let mongo = 'ok';

  try {
    await query('SELECT 1');
  } catch {
    postgres = 'error';
  }

  try {
    const db = await getMongoDb();
    await db.command({ ping: 1 });
  } catch {
    mongo = 'error';
  }

  const healthy = postgres === 'ok' && mongo === 'ok';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    services: { postgres, mongo },
  });
});

export default router;
