import * as dotenv from "dotenv";
import { z } from "zod";

// Load order mirrors scripts/dev.sh priority: .env < .env.dev < .env.local.
// dotenv does not override existing vars by default, so highest priority loads first.
const rootFile = (name: string) =>
  new URL(`../../../../${name}`, import.meta.url).pathname;

dotenv.config({ path: rootFile(".env.local") });
dotenv.config({ path: rootFile(".env.dev") });
dotenv.config({ path: rootFile(".env") });
dotenv.config();

const stringBoolean = z.enum(["true", "false"]).transform((v) => v === "true");

const envSchema = z.object({
  API_PORT: z.coerce.number(),
  NODE_ENV: z
    .enum(["development", "test", "production"]),
  CLIENT_ORIGIN: z.string(),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  DB_SYNCHRONIZE: stringBoolean,
  DB_LOGGING: stringBoolean,


  ACCESS_SECRET: z.string(),
  REFRESH_SECRET: z.string(),

  RATE_LIMIT_ENABLED: stringBoolean,
  AUTH_RATE_LIMIT_MAX: z.coerce.number(),
  GLOBAL_RATE_LIMIT_MAX: z.coerce.number(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
