import { createServer } from "node:http";
import { createApp } from "src/app";
import { env } from "src/config/env";
import { AppDataSource } from "src/db/data-source";
import { createSocketServer } from "src/sockets/server";

async function bootstrap() {
  await AppDataSource.initialize();
  console.log("API: Database connected");

  const app = createApp();
  const httpServer = createServer();
  const io = createSocketServer(httpServer);

  httpServer.listen(env.API_PORT, () => {
    console.log(
      `API running on http://localhost:${env.API_PORT} (${env.NODE_ENV})`,
    );
  });

}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
