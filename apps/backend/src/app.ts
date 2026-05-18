import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import teamsRoutes from './routes/teams';
import servicesRoutes from './routes/services';
import metricsRoutes from './routes/metrics';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { env } from './config/env';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);

  // BUG (Medium): routes mounted before CORS — preflight on some paths may fail in strict browsers
  app.use('/api/auth', authRoutes);
  app.use('/api/teams', teamsRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/health', healthRoutes);

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );

  app.get('/api', (_req, res) => {
    res.json({
      name: 'DevHub API',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  app.use(errorHandler);

  return app;
}
