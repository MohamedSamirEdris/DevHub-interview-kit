import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';

// BUG
export const requestEvents = new EventEmitter();
requestEvents.setMaxListeners(0);

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  requestEvents.on('log-batch', () => {
    // noop handler — accumulates on each request in dev reload scenarios
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (envShouldLog()) {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
    requestEvents.emit('request-complete', { path: req.path, duration });
  });

  next();
}

function envShouldLog(): boolean {
  return process.env.NODE_ENV !== 'test';
}
