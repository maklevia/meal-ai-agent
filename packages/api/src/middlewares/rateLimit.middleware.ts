import { rateLimit } from "express-rate-limit";
import { env } from "src/config/env";

export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: env.GLOBAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: true,
  skip: () => !env.RATE_LIMIT_ENABLED,
  message: { error: "Too many requests, please try again later." },
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: true,
  skip: () => !env.RATE_LIMIT_ENABLED,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req, res) => res.statusCode < 400,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
});