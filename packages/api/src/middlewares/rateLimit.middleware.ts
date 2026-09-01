import { rateLimit } from "express-rate-limit";
import { env } from "src/config/env";

/**
 * Rate limiting protects the API from abuse.
 *
 * Install notes for this stack (nginx -> api, single API container):
 *  - A single replica -> the default in-memory store is enough. If the API is
 *    ever scaled to multiple containers, swap in a shared store (e.g. Redis)
 *    or the limiter will reset per container.
 *  - Requires `app.set("trust proxy", 1)` (one trusted hop: nginx / Vite proxy)
 *    so the client IP is read from X-Forwarded-For. Express-rate-limit v8
 *    throws if trust proxy is `true` (spoofable) or unset while XFF is present.
 */

/** Coarse protection for the whole API — a single IP can't hog the server. */
export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: env.GLOBAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: true,
  skip: () => !env.RATE_LIMIT_ENABLED,
  message: { error: "Too many requests, please try again later." },
});

/**
 * Stricter limiter for /auth — blunts brute-force password guessing.
 * Failed attempts count against the limit; successful logins don't, so legit
 * users never lock themselves out.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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