import express from 'express';
import { env } from 'src/config/env.js';
import { healthRouter } from 'src/routes/health.routes.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  // CORS — allows the web app origin configured via CORS_ORIGIN env var
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', env.CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Used by Docker HEALTHCHECK and monitoring
  app.use('/health', healthRouter);

  // Register domain routers here:
  // app.use('/api/meals', mealsRouter);

  return app;
}
