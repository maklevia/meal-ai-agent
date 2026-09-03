import { createApp } from 'src/app';
import { env } from 'src/config/env';
import { AppDataSource } from 'src/db/data-source';

async function bootstrap() {
  await AppDataSource.initialize();
  console.log('API: Database connected');

  const app = createApp();

  app.listen(env.API_PORT, () => {
    console.log(`API running on http://localhost:${env.API_PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
