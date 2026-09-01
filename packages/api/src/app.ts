import express from "express";
import cookieParser from "cookie-parser";
import { env } from "src/config/env";
import { errorMiddleware } from "src/middlewares/error.middleware";
import { authLimiter, globalLimiter } from "src/middlewares/rateLimit.middleware";
import { authRouter } from "src/modules/auth/Auth.routes";
import { invitationRouter } from "src/modules/invitation/Invitation.routes";
import { healthRouter } from "src/routes/Health.routes";

export function createApp() {
  const app = express();

  // One trusted proxy hop (nginx in prod, Vite in dev). Required by
  // express-rate-limit so client IPs come from X-Forwarded-For. Must be a
  // specific hop count (not `true`) or anyone could spoof the header and
  // bypass rate limiting.
  app.set("trust proxy", 1);

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

  // Stricter limiter on auth endpoints (brute-force protection).
  app.use("/auth", authLimiter, authRouter);

  // Everything else gets the coarse global limit.
  app.use(globalLimiter);
  app.use("/invitation", invitationRouter);

  app.use(errorMiddleware);

  return app;
}
