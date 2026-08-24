import { createApp } from 'src/app.js';
import { env } from 'src/config/env.js';
import { AppDataSource } from 'src/db/data-source.js';

async function bootstrap() {
  await AppDataSource.initialize();
  console.log('📦 Database connected');

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`🚀 API running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
