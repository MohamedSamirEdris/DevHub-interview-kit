import { Router, Response } from 'express';
import * as metricsService from '../services/metricsService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/summary', async (_req: AuthRequest, res: Response) => {
  const summary = await metricsService.getMetricsSummary();
  res.json({ data: summary });
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const serviceId = req.query.serviceId as string | undefined;
  const metrics = await metricsService.getServiceMetrics(serviceId);
  res.json({ data: metrics });
});

router.get('/logs', async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string) || '';
  const level = req.query.level as string | undefined;
  const logs = await metricsService.searchLogs(q, level);
  res.json({ data: logs });
});

router.get('/analytics', async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const events = await metricsService.getAnalytics(limit);
  res.json({ data: events });
});

router.get('/percentile', async (req: AuthRequest, res: Response) => {
  const raw = (req.query.values as string) || '120,98,200,45,300,150,80,220,190,110';
  const values = raw.split(',').map(Number);
  const p = parseInt(req.query.p as string, 10) || 95;

  // BUG (Hard): blocks event loop on large arrays
  const result = metricsService.computeExpensivePercentile(values, p);
  res.json({ data: { percentile: p, value: result } });
});

export default router;
