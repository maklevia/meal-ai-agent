import express from 'express';
import { env } from 'src/config/env.js';

export function createApp() {
  const app = express();

  return app;
}
