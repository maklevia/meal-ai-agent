import express from 'express';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  return app;
}
