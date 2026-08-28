import express from "express";
import cookieParser from "cookie-parser";
import { env } from "src/config/env.js";
import { errorMiddleware } from "src/middlewares/errorMiddleware.js";
import { authRouter } from "src/modules/auth/Auth.routes.js";
import { invitationRoutes } from "src/modules/invitation/Invitation.routes.js";
import { healthRouter } from "src/routes/health.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", env.CORS_ORIGIN);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(cookieParser());

  app.use("/health", healthRouter);

  app.use("/auth", authRouter);
  app.use("/invitation", invitationRoutes);

  app.use(errorMiddleware);

  return app;
}
