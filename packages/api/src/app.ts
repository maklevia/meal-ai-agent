import express from "express";
import cookieParser from "cookie-parser";
import { env } from "src/config/env";
import { errorMiddleware } from "src/middlewares/error.middleware";
import { authLimiter, globalLimiter } from "src/middlewares/rateLimit.middleware";
import { authRouter } from "src/modules/auth/Auth.routes";
import { healthRouter } from "src/routes/Health.routes";
import { familyRouter } from "src/modules/family/Family.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", env.CLIENT_ORIGIN);
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
  app.use("/auth", authLimiter, authRouter);

  app.use(globalLimiter);
  app.use("/family", familyRouter);

  app.use(errorMiddleware);

  return app;
}
